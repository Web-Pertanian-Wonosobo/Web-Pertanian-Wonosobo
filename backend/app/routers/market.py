from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.db import get_db
from app.models.market_model import MarketPrice
from app.schemas.market_schema import MarketPriceCreate

router = APIRouter(prefix="/market", tags=["Market Data"])

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
