from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.user_model import User
from app.schemas.auth_schema import LoginRequest, LoginResponse, RegisterRequest, UserResponse, BaseResponse
from datetime import datetime
from app.utils.security import (
    get_password_hash,
    verify_password, 
    authenticate_user,
    create_user_tokens,
    get_current_user,
    get_current_active_user,
    get_current_admin_user
)


router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=LoginResponse)
async def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    """
    Login endpoint untuk admin
    Returns success=False jika credentials salah
    """
    try:
        # Cari user berdasarkan email
        user = await authenticate_user(credentials.email, credentials.password, db)
        
        if not user:
            # User tidak ditemukan
            return LoginResponse(
                success=False,
                message="Email tidak terdaftar",
                user=None,
                role="",
                access_token=""
            )
        # buat JWT token
        tokens = create_user_tokens(user)

        # Update last_login
        user.last_login = datetime.now()
        db.commit()
        db.refresh(user)
        
        # return success response dengan token
        return LoginResponse(
            success=True,
            message="Login berhasil",
            user=UserResponse.from_orm(user),
            role=user.role,
            access_token=tokens["access_token"],
            token_type=tokens["token_type"]
        )
        
    except HTTPException as he:
        # muncul error jika bukan admin
        return LoginResponse(
            success=False,
            message=str(he.detail),
            user=None,
            role="",
            access_token=""
        )
    except Exception as e:
        print(f"❌ Login error: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/register-admin")
async def register_admin(data: RegisterRequest, db: Session = Depends(get_db)):
    """
    Register admin baru (untuk setup)
    """
    try:
        # Cek apakah email sudah ada
        existing = db.query(User).filter(User.email == data.email.lower()).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email sudah terdaftar")
        
        # Buat user baru
        new_user = User(
            name=data.name,
            email=data.email.lower(),
            phone=data.phone,
            password=get_password_hash(data.password),
            role="admin",
            created_at=datetime.now()
        )
        
        db.add(new_user)
        db.commit()
        
        return {
            "success": True,
            "message": f"Admin {data.name} berhasil dibuat"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error")
@router.get("/me", response_model=UserResponse)
async def get_current_user_endpoint(
    current_user: User = Depends(get_current_user)  #
):
    return UserResponse.from_orm(current_user)

@router.get("/me/admin", response_model=BaseResponse)
async def get_current_admin_user_endpoint(
    admin_user: User = Depends(get_current_admin_user)  
):
    """
    Get current admin
    """
    return UserResponse.from_orm(admin_user)

@router.post("/verify-token")
async def verify_token_endpoint(current_user: User = Depends(get_current_user)):
    """
    Verifikasi JWT token (endpoint untuk test token validity)
    """
    return {
        "success": True,
        "message": "Token valid",
    }

@router.post("/refresh-token")
async def refresh_token(current_user: User = Depends(get_current_user)):
    """
    Refresh JWT token
    """
    tokens = create_user_tokens(current_user)
    
    return {
        "success": True,
        "message": "Token refreshed",
        "user": UserResponse.from_orm(current_user),
        "access_token": tokens["access_token"],
        "role": current_user.role,
        "token_type": tokens["token_type"],
        "token_type": tokens["token_type"]  
    }

@router.post("/logout")
async def logout():
    """
    Logout endpoint
    """
    return {
        "success": True,
        "message": "Logout berhasil"
    }