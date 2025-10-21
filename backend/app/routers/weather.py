from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.services.ai_weather import predict_weather, fetch_weather_data, save_weather_data
from app.db import get_db
from app.schemas.weather_schema import WeatherPredictionResponse, WeatherDataResponse
from app.models.weather_model import WeatherData

router = APIRouter(prefix="/weather", tags=["Weather"])

@router.get("/predict", response_model=WeatherPredictionResponse)
def get_weather_prediction(days: int = 3, db: Session = Depends(get_db)):
    """Get weather prediction for next N days using ML model"""
    try:
        preds = predict_weather(db, days)
        return {"status": "success", "predictions": preds}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/current")
def get_current_weather(db: Session = Depends(get_db)):
    """Get current weather data from database or fetch from BMKG if not available"""
    try:
        # Try to get recent data from database first
        recent_data = db.query(WeatherData).order_by(WeatherData.date.desc()).limit(7).all()
        
        # If no data or data is old, fetch new data from BMKG
        if not recent_data:
            df = fetch_weather_data()
            if not df.empty:
                save_weather_data(db, df)
                recent_data = db.query(WeatherData).order_by(WeatherData.date.desc()).limit(7).all()
        
        if not recent_data:
            raise HTTPException(status_code=404, detail="No weather data available")
        
        return {
            "status": "success",
            "data": [
                {
                    "date": item.date,
                    "temperature": item.temperature,
                    "humidity": item.humidity,
                    "rainfall": item.rainfall,
                    "wind_speed": item.wind_speed,
                    "location_name": item.location_name
                }
                for item in recent_data
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/sync")
def sync_weather_data(db: Session = Depends(get_db)):
    """Manually sync weather data from BMKG API"""
    try:
        df = fetch_weather_data()
        if df.empty:
            raise HTTPException(status_code=404, detail="No data from BMKG")
        
        save_weather_data(db, df)
        return {
            "status": "success",
            "message": f"Successfully synced {len(df)} weather records",
            "records": len(df)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
