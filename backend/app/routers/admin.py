from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.utils.db import get_db
from app.utils.auth import hash_password, verify_password, create_access_token, get_current_admin
from app.models.user_model import User, UserRole
from app.schemas.user_schema import UserCreate, UserLogin, UserResponse, TokenWithUser


router = APIRouter(prefix="/admin", tags=["Admin"])

# HANYA ADMIN yang bisa register admin baru
@router.post("/register", response_model=UserResponse)
def register_admin(
    login_data: UserCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email sudah terdaftar")
    
    hashed_password = hash_password(user_data.password)
    new_admin = User(
        name=user_data.name,
        email=user_data.email,
        password=hashed_password,
        phone=user_data.phone,
        role=UserRole.ADMIN  
    )
    
    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)
    return new_admin

# HANYA ADMIN yang bisa login
@router.post("/login", response_model=Token)
def login_admin(
    login_data: UserLogin,
    db: Session = Depends(get_db)
):
    admin = db.query(User).filter(
        User.email == login_data.email,
        User.role == UserRole.ADMIN  
    ).first()
    
    if not admin or not verify_password(login_data.password, admin.password):
        raise HTTPException(status_code=401, detail="Email atau password salah") 
    access_token = create_access_token(
        data={"sub": admin.email, "role": admin}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse.from_orm(admin)
    }

#HANYA ADMIN yang bisa akses panel admin
@router.get("/panel")
def admin_panel(current_admin: User = Depends(get_current_admin)):
    return {
        "message": "Admin Panel",
        "user": current_admin.email,
        "features": ["Dashboard", "Manajemen Pengguna", "Data Pertanian", "Analytics", "Pengaturan", "logout"]
    }