from fastapi import HTTPException, status
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from typing import Optional
from datetime import datetime, timedelta
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from app.config import settings
from app.db import get_db
from app.models.user_model import User

# untuk meverifikasi dan endpoint login ada di auth/login
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# Hasing password
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """Hash password menggunakan bcrypt"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifikasi password"""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Buat JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

async def authenticate_user(email: str, password: str, db: Session) -> Optional[User]:
    """Authenticate user dengan email dan password """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    
    if not verify_password(password, user.password):
        return None
    
    # Check Admin role
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Hanya admin yang diizinkan login"
        )
    
    return user

def create_user_tokens(user: User) -> dict:
    """Buat access token untuk user"""
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    access_token = create_access_token(
        data={
            "sub": user.email,  
            "user_id": user.user_id,
            "email": user.email, 
            "role": user.role
        },
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60 
    }

async def get_current_user(
    token: str = Depends(oauth2_scheme), 
    db: Session = Depends(get_db)
) -> User:
    credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Token tidak valid atau telah kadaluarsa",  
    headers={"WWW-Authenticate": "Bearer"},
)
    
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        
        email: str = payload.get("email")
        user_id: int = payload.get("user_id")
        
        if email is None and user_id is None:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception
    
    if email:
        user = db.query(User).filter(User.email == email).first()
    else:
        user = db.query(User).filter(User.user_id == user_id).first()
        
    if user is None:
        raise credentials_exception
    
    return user  

async def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    return current_user

async def get_current_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """Dependency untuk memastikan user adalah admin"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    return current_user

def verify_token(token: str) -> Optional[dict]:
    """Verify JWT token dan return payload"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None

# Bisa dipake di get_current_user()
payload = verify_token(token)
if not payload:
    raise credentials_exception