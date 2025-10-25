from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime, date
from typing import Optional
from app.db import get_db
from app.services.market_sync import (
    fetch_and_save_market_data, 
    get_realtime_market_prices,
    fetch_realtime_komoditas,
    fetch_realtime_produk_komoditas,
    fetch_realtime_produk
)
from app.models.market_model import MarketPrice
from app.schemas.market_schema import MarketPriceCreate

router = APIRouter(prefix="/market", tags=["Market Data"])

@router.get("/realtime")
def get_realtime_prices():
    """
    Mengambil data harga pasar real-time langsung dari API Disdagkopukm.
    Data tidak disimpan ke database, langsung dari API.
    """
    try:
        result = get_realtime_market_prices()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal mengambil data real-time: {e}")

@router.get("/realtime/komoditas")
def get_komoditas_realtime():
    """
    Mengambil data komoditas real-time dari API.
    """
    try:
        data = fetch_realtime_komoditas()
        return {
            "success": True,
            "total": len(data),
            "data": data,
            "source": "https://disdagkopukm.wonosobokab.go.id/api/komoditas"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal mengambil data komoditas: {e}")

@router.get("/realtime/produk-komoditas")
def get_produk_komoditas_realtime():
    """
    Mengambil data produk komoditas real-time dari API.
    """
    try:
        data = fetch_realtime_produk_komoditas()
        return {
            "success": True,
            "total": len(data),
            "data": data,
            "source": "https://disdagkopukm.wonosobokab.go.id/api/produk-komoditas"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal mengambil data produk-komoditas: {e}")

@router.get("/realtime/produk")
def get_produk_realtime():
    """
    Mengambil data produk real-time dari API.
    """
    try:
        data = fetch_realtime_produk()
        return {
            "success": True,
            "total": len(data),
            "data": data,
            "source": "https://disdagkopukm.wonosobokab.go.id/api/produk"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal mengambil data produk: {e}")

@router.post("/sync")
def sync_market_data():
    """
    Mengambil data dari API Disdagkopukm dan menyimpannya ke database lokal.
    """
    result = fetch_and_save_market_data()
    return result

@router.get("/list")
def get_market_prices(
    db: Session = Depends(get_db),
    commodity: Optional[str] = Query(None, description="Filter berdasarkan nama komoditas"),
    location: Optional[str] = Query(None, description="Filter berdasarkan lokasi pasar"),
    start_date: Optional[date] = Query(None, description="Filter tanggal mulai"),
    end_date: Optional[date] = Query(None, description="Filter tanggal akhir"),
    limit: int = Query(100, description="Jumlah data maksimal")
):
    """
    Mengambil data harga dari database lokal dengan filter.
    """
    try:
        query = db.query(MarketPrice)
        
        if commodity:
            query = query.filter(MarketPrice.commodity_name.ilike(f"%{commodity}%"))
        
        if location:
            query = query.filter(MarketPrice.market_location.ilike(f"%{location}%"))
        
        if start_date:
            query = query.filter(MarketPrice.date >= start_date)
        
        if end_date:
            query = query.filter(MarketPrice.date <= end_date)
        
        query = query.order_by(MarketPrice.date.desc())
        prices = query.limit(limit).all()
        
        return {
            "success": True,
            "total": len(prices),
            "data": [
                {
                    "price_id": p.price_id,
                    "commodity_name": p.commodity_name,
                    "market_location": p.market_location,
                    "unit": p.unit,
                    "price": p.price,
                    "date": p.date.isoformat(),
                    "created_at": p.created_at.isoformat() if p.created_at else None
                }
                for p in prices
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal mengambil data: {e}")

@router.post("/add")
def add_market_price(price_data: MarketPriceCreate, db: Session = Depends(get_db)):
    """
    Menyimpan data harga pasar ke database (pakai JSON body).
    """
    try:
        new_price = MarketPrice(
            user_id=price_data.user_id,
            commodity_name=price_data.commodity_name,
            market_location=price_data.market_location,
            unit=price_data.unit,
            price=price_data.price,
            date=price_data.date or datetime.now().date(),
            created_at=datetime.now()
        )
        db.add(new_price)
        db.commit()
        db.refresh(new_price)
        return {"message": "Data harga berhasil disimpan", "data": new_price.price_id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Gagal menyimpan data: {e}")

@router.put("/update/{price_id}")
def update_market_price(
    price_id: int,
    price_data: MarketPriceCreate,
    db: Session = Depends(get_db)
):
    """
    Update data harga pasar berdasarkan ID.
    """
    try:
        existing = db.query(MarketPrice).filter(MarketPrice.price_id == price_id).first()
        if not existing:
            raise HTTPException(status_code=404, detail="Data tidak ditemukan")
        
        existing.commodity_name = price_data.commodity_name
        existing.market_location = price_data.market_location
        existing.unit = price_data.unit
        existing.price = price_data.price
        existing.date = price_data.date or existing.date
        
        db.commit()
        db.refresh(existing)
        return {"message": "Data berhasil diupdate", "data": existing.price_id}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Gagal update data: {e}")

@router.delete("/delete/{price_id}")
def delete_market_price(price_id: int, db: Session = Depends(get_db)):
    """
    Hapus data harga pasar berdasarkan ID.
    """
    try:
        existing = db.query(MarketPrice).filter(MarketPrice.price_id == price_id).first()
        if not existing:
            raise HTTPException(status_code=404, detail="Data tidak ditemukan")
        
        db.delete(existing)
        db.commit()
        return {"message": "Data berhasil dihapus"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Gagal hapus data: {e}")
