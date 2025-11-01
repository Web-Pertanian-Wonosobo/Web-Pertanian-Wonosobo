from fastapi import APIRouter, Request, Depends
from sqlalchemy.orm import Session
from app.db import get_db

router = APIRouter(prefix="/admin", tags=["Admin Panel"])

@router.get("/dashboard")
async def admin_dashboard(request: Request):
    """Admin dashboard - dilindungi middleware"""
    user_data = request.state.user  # Data dari middleware
    return {
        "message": "Welcome to Admin Dashboard",
        "user_id": user_data.get("user_id"),
        "email": user_data.get("email"),
        "role": user_data.get("role")
    }

@router.get("/kelola_harga")
async def manage_prices(request: Request):
    """Kelola harga - hanya admin"""
    return {
        "message": "Harga management panel",
        "user": request.state.user
    }

@router.get("/kelola_user") 
async def manage_users(request: Request):
    """Kelola user - hanya admin"""
    return {
        "message": "User management panel",
        "user": request.state.user
    }