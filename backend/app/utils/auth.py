from passlib.context import CryptContext
import jwt
from jwt import PyJWTError
from datetime import datetime, timedelta
from typing import Optional, Dict
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.utils.config import settings
from app.models.user_model import User, UserRole

#----PASSWORD HASING
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

#----JWT TOKEN
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))  
    to_encode.update({"exp": expire, "iat": datetime.utcnow()})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def create_refresh_token(data: dict) -> str:
    return create_access_token(data, expires_delta=timedelta(days=7))

def decode_token(token: str) -> Optional[Dict]:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except PyJWTError:
        return None

#----USER AUTHENTICATION
def get_current_user(token: str, db: Session) -> Optional[User]:
    payload = decode_token(token)
    if not payload:
        return None
    email: str = payload.get("sub")
    if not email:
        return None
    return db.query(User).filter(User.email == email).first()

def get_current_admin(token: str, db: Session) -> User:
    user = get_current_user(token, db)
    if not user or user.role != UserRole.ADMIN:
        raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Akses ditolak: hanya admin",
        headers={"WWW-Authenticate": "Bearer"}
        )
    
    user.last_login = datetime.utcnow()
    db.commit()
    return user
#-----PASSWORD RESET
def create_password_reset_token(email: str) -> str:
    expires_delta = timedelta(hours=1)
    return create_access_token(
        data={"sub": email, "type": "password_reset"}, 
        expires_delta=expires_delta
    )