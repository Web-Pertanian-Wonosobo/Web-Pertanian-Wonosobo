from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional, List
import logging
import hashlib
from app.db import get_db
from app.models.user_model import User
from pydantic import BaseModel, Field, validator

router = APIRouter(prefix="/users", tags=["User Management"])

# Schemas
class UserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., min_length=5, max_length=100)
    password: str = Field(..., min_length=6)
    role: str = Field(default="moderator")
    description: Optional[str] = None
    address: Optional[str] = None
    
    @validator('email')
    def validate_email(cls, v):
        if '@' not in v:
            raise ValueError('Invalid email format')
        return v.lower()
    
    @validator('role')
    def validate_role(cls, v):
        if v not in ['admin', 'moderator']:
            raise ValueError('Role must be admin or moderator')
        return v

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None
    password: Optional[str] = None
    description: Optional[str] = None
    address: Optional[str] = None
    
    @validator('email', pre=True, allow_reuse=True)
    def validate_email(cls, v):
        if v is not None and '@' not in v:
            raise ValueError('Invalid email format')
        return v.lower() if v else v
    
    @validator('role', pre=True, allow_reuse=True)
    def validate_role(cls, v):
        if v is not None and v not in ['admin', 'moderator']:
            raise ValueError('Role must be admin or moderator')
        return v

class UserResponse(BaseModel):
    user_id: int
    name: str
    email: str
    role: str
    description: Optional[str]
    address: Optional[str]
    created_at: Optional[datetime]
    last_login: Optional[datetime]
    
    class Config:
        from_attributes = True

# Helper function
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

@router.get("/", response_model=List[UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    search: Optional[str] = Query(None, description="Search by name or email"),
    role: Optional[str] = Query(None, description="Filter by role"),
    limit: Optional[int] = Query(None, description="Limit results")
):
    """
    Mengambil semua user dengan filter opsional
    """
    try:
        query = db.query(User)
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                (User.name.ilike(search_term)) | 
                (User.email.ilike(search_term))
            )
        
        if role:
            query = query.filter(User.role == role)
            
        query = query.order_by(User.created_at.desc())
        
        if limit:
            query = query.limit(limit)
            
        users = query.all()
        
        return [UserResponse.from_orm(user) for user in users]
        
    except Exception as e:
        logging.error(f"❌ Error getting users: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get users: {e}")

@router.post("/", response_model=UserResponse)
def create_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Membuat user baru
    """
    try:
        # Periksa email sudah ada atau belum
        existing = db.query(User).filter(User.email == user_data.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Hash password
        hashed_password = hash_password(user_data.password)
        
        # Buat user baru
        new_user = User(
            name=user_data.name,
            email=user_data.email,
            password=hashed_password,
            role=user_data.role,
            description=user_data.description,
            address=user_data.address,
            created_at=datetime.now()
        )
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        logging.info(f"✅ User created: {new_user.email}")
        return UserResponse.from_orm(new_user)
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"❌ Error creating user: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create user: {e}")

@router.put("/{user_id}", response_model=UserResponse)
def update_user(user_id: int, user_data: UserUpdate, db: Session = Depends(get_db)):
    """
    Update user berdasarkan ID
    """
    try:
        user = db.query(User).filter(User.user_id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Update fields yang diberikan
        update_data = user_data.dict(exclude_unset=True)
        
        if 'email' in update_data:
            # Periksa email conflict
            existing = db.query(User).filter(
                User.email == update_data['email'], 
                User.user_id != user_id
            ).first()
            if existing:
                raise HTTPException(status_code=400, detail="Email already exists")
        
        if 'password' in update_data:
            update_data['password'] = hash_password(update_data['password'])
        
        for field, value in update_data.items():
            setattr(user, field, value)
        
        db.commit()
        db.refresh(user)
        
        logging.info(f"✅ User updated: {user.email}")
        return UserResponse.from_orm(user)
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"❌ Error updating user: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to update user: {e}")

@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    """
    Hapus user berdasarkan ID
    """
    try:
        user = db.query(User).filter(User.user_id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Cegah delete admin utama
        if user.user_id == 1:
            raise HTTPException(status_code=403, detail="Cannot delete primary admin")
        
        db.delete(user)
        db.commit()
        
        logging.info(f"✅ User deleted: {user.email}")
        return {"status": "success", "message": f"User {user.email} has been deleted"}
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"❌ Error deleting user: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to delete user: {e}")

@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    """
    Ambil detail user berdasarkan ID
    """
    try:
        user = db.query(User).filter(User.user_id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return UserResponse.from_orm(user)
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"❌ Error getting user: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get user: {e}")