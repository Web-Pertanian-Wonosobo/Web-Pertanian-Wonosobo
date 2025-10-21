from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.services.ai_weather import predict_weather
from app.db import get_db
from app.schemas.weather_schema import WeatherPredictionResponse

router = APIRouter(prefix="/weather", tags=["Weather"])

@router.get("/predict", response_model=WeatherPredictionResponse)
def get_weather_prediction(days: int = 3, db: Session = Depends(get_db)):
    try:
        preds = predict_weather(db, days)
        return {"status": "success", "predictions": preds}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
