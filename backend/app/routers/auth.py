from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.orm import Session
from datetime import timedelta
from app.db import get_db
from app.models.user_model import User
from app.schemas.auth_schema import LoginRequest, LoginResponse, RegisterRequest, UserResponse
from app.utils.security import (
    get_password_hash,
    verify_password,
    create_token,
    authenticate_user,
)
from app.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

# ✅ REGISTER ADMIN
@router.post("/register-admin", response_model=UserResponse)
def register_admin(data: RegisterRequest, db: Session = Depends(get_db)):
    """Register admin baru"""
    existing = db.query(User).filter(User.email == data.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email sudah terdaftar")

    # Hash password pakai utilitas security
    hashed_pw = get_password_hash(data.password)

    new_user = User(
        name=data.name,
        email=data.email.lower(),
        phone=data.phone,
        hashed_password=hashed_pw,
        role="admin",
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# ✅ LOGIN
@router.post("/login", response_model=LoginResponse)
async def login(credentials: LoginRequest, db: Session = Depends(get_db)):
    """Login dan generate token JWT"""
    user = await authenticate_user(credentials.email.lower(), credentials.password, db)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Email atau password salah")

    token_data = create_token({}, user)

    return LoginResponse(
        success=True,
        message="Login berhasil",
        user=UserResponse.from_orm(user),
        role=user.role,
        access_token=token_data["access_token"],
    )


# GET CURRENT USER
@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends()):
    """Mengambil data user saat ini (dari token JWT)"""
    # `get_current_user` sudah di-handle di utils/security.py
    return UserResponse.from_orm(current_user)
