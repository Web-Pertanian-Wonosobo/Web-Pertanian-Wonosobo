from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class User(BaseModel):
    name: str
    email: str
    status: str
    role  : str
    created_at: datetime

class UserCreate(BaseModel):
    name: str
    email: str
    password : str

class UserLogin(BaseModel):
    email: str
    password : str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    status: str
    role  : str
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
    
    class Config:
        orm_mode = True