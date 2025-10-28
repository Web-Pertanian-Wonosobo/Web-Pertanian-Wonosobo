from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app.models.user_model import User
from app.schemas.auth_schema import LoginRequest, LoginResponse, RegisterRequest, UserResponse
import hashlib
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["Authentication"])

def hash_password(password: str) -> str:
    """Hash password menggunakan SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()

@router.post("/login", response_model=LoginResponse)
async def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    """
    Login endpoint untuk admin
    Returns success=False jika credentials salah
    """
    try:
        # Cari user berdasarkan email
        user = db.query(User).filter(User.email == credentials.email.lower()).first()
        
        if not user:
            # User tidak ditemukan
            return LoginResponse(
                success=False,
                message="Email tidak terdaftar",
                user=None,
                role=""
            )
        
        # Hash password yang diinput
        hashed_password = hash_password(credentials.password)
        
        # Bandingkan password
        if user.password != hashed_password:
            # Password salah
            return LoginResponse(
                success=False,
                message="Password salah",
                user=None,
                role=""
            )
        
        # Login berhasil - update last_login
        user.last_login = datetime.now()
        db.commit()
        db.refresh(user)
        
        # Return success response
        return LoginResponse(
            success=True,
            message="Login berhasil",
            user=UserResponse.from_orm(user),
            role=user.role
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
            password=hash_password(data.password),
            role="admin",
            created_at=datetime.now()
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        return {
            "success": True,
            "message": f"Admin {data.name} berhasil dibuat",
            "user_id": new_user.user_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/me")
async def get_current_user(user_id: int, db: Session = Depends(get_db)):
    """
    Get user info by ID
    """
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")
    
    return UserResponse.from_orm(user)
