from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str

class UserResponse(BaseModel):
    user_id: int
    name: str
    email: str
    role: str
    created_at: datetime
    last_login: Optional[datetime]

    class Config:
        from_attributes = True

class LoginResponse(BaseModel):
    success: bool
    message: str
    user: Optional[UserResponse] = None
    role: str = ""
