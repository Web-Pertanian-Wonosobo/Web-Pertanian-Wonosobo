from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from app.db import get_db
from app.models.commodity_model import Commodity
from app.schemas.commodity_schema import CommodityCreate, CommodityResponse
import logging

router = APIRouter(prefix="/commodities", tags=["Commodity Management"])

@router.get("/", response_model=List[CommodityResponse])
def get_commodities(db: Session = Depends(get_db)):
    """
    Mengambil semua daftar komoditas dari database.
    """
    return db.query(Commodity).order_by(Commodity.name).all()

@router.post("/add", response_model=CommodityResponse)
def add_commodity(commodity: CommodityCreate, db: Session = Depends(get_db)):
    """
    Menambah komoditas baru ke database.
    """
    # Cek apakah sudah ada
    existing = db.query(Commodity).filter(Commodity.name.ilike(commodity.name)).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Komoditas '{commodity.name}' sudah ada dalam daftar.")
    
    new_commodity = Commodity(
        name=commodity.name.strip(),
        category=commodity.category
    )
    
    try:
        db.add(new_commodity)
        db.commit()
        db.refresh(new_commodity)
        return new_commodity
    except Exception as e:
        db.rollback()
        logging.error(f"Error adding commodity: {e}")
        raise HTTPException(status_code=500, detail="Gagal menyimpan komoditas")

@router.delete("/{commodity_id}")
def delete_commodity(commodity_id: int, db: Session = Depends(get_db)):
    """
    Menghapus komoditas berdasarkan ID.
    """
    item = db.query(Commodity).filter(Commodity.commodity_id == commodity_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Komoditas tidak ditemukan")
    
    try:
        db.delete(item)
        db.commit()
        return {"message": "Komoditas berhasil dihapus"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Gagal menghapus komoditas")
