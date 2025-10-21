# app/routes/public.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Dict, Any
from app.utils.db import get_db
from app.models.weather_model import WeatherData
from app.models.market_model import MarketPrice, Commodity
from app.models.gis_model import SlopeData, VegetationData

router = APIRouter(prefix="/public", tags=["Public"])


# WEATHER:
@router.get("/weather")
async def get_weather_forecast(db: Session = Depends(get_db)):
    try:
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        weather_data = db.query(WeatherData)\
            .filter(WeatherData.recorded_at >= seven_days_ago)\
            .order_by(WeatherData.recorded_at.desc())\
            .limit(7)\
            .all()

        return {
            "status": "success",
            "data": weather_data,
            "count": len(weather_data)
        }
    except Exception as e:
        raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Weather error: {str(e)}")


# MARKET
@router.get("/market")
async def get_market_prices(db: Session = Depends(get_db)):
    try:
        subquery = db.query(
            MarketPrice.commodity_id,
            db.func.max(MarketPrice.price_date).label("max_date")
        ).group_by(MarketPrice.commodity_id).subquery()

        latest_prices = db.query(
            MarketPrice.price,
            MarketPrice.price_date,
            Commodity.name,
            Commodity.unit
        ).join(
            subquery,
            (MarketPrice.commodity_id == subquery.c.commodity_id) &
            (MarketPrice.price_date == subquery.c.max_date)
        ).join(
            Commodity, MarketPrice.commodity_id == Commodity.id
        ).order_by(MarketPrice.price_date.desc()).limit(10).all()

        result = [
            {
                "commodity": name or "Unknown",
                "price": float(price) if price else 0,
                "unit": unit or "kg",
                "date": price_date.strftime("%Y-%m-%d") if price_date else None
            }
            for price, price_date, name, unit in latest_prices
        ]

        return {
            "status": "success",
            "data": result,
            "count": len(result)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Market error: {str(e)}"
        )


# GIS: STATUS LERENG
@router.get("/gis/slope")
async def get_slope_risk(db: Session = Depends(get_db)):
    try:
        latest = db.query(SlopeData)\
            .order_by(SlopeData.analyzed_at.desc())\
            .first()

        if not latest:
            return {
                "status": "success",
                "data": {
                    "risk_level": "Tidak Tersedia",
                    "risk_score": 0,
                    "analyzed_at": None,
                    "message": "Belum ada data analisis lereng."
                }
            }
        
        risk_level = "Rendah"
        if latest and latest.risk_score > 70:
            risk_level = "Tinggi"
        elif latest and latest.risk_score > 40:
            risk_level = "Sedang"

        return {
            "status": "success",
            "data": {
                "risk_level": risk_level,
                "risk_score": float(latest.risk_score) if latest.risk_score else 0,
                "analyzed_at": latest.analyzed_at.strftime("%Y-%m-%d") if latest else None,
                "message": "Pantau kondisi lereng di area Anda."
            }
        }
    except Exception as e:
        raise HTTPException(500, detail=f"GIS error: {str(e)}")


# DASHBOARD 
@router.get("/dashboard")
async def get_public_dashboard(db: Session = Depends(get_db)):
    try:
        total_villages = db.query(SlopeData.desa).distinct().count()
        accuracy = 89
        active_farmers = 2400
        total_commodities = db.query(Commodity).count()
        accuracy = 89
        active_farmers = 2400
        alert = {
            "type": "warning",
            "title": "Peringatan",
            "message": "Curah hujan tinggi diprediksi besok. Pantau kondisi lereng di area Anda."
        }

        return {
            "status": "success",
            "data": {
                "alert": alert,
                "stats": {
                    "desa_terpantau": total_villages,
                    "akurasi_prediksi": accuracy,
                    "petani_aktif": active_farmers,
                    "komoditas": total_commodities
                },
                "features": [
                    "Analisis Lereng",
                    "Prediksi Cuaca",
                    "Prediksi Harga"
                ]
            }
        }
    except Exception as e:
        raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Dashboard error: {str(e)}")