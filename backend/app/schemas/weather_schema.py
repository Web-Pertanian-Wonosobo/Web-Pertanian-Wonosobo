from pydantic import BaseModel
from datetime import date, datetime
from typing import List, Optional

class WeatherDataItem(BaseModel):
    weather_id: Optional[int]
    station_name: str
    temperature: float
    humidity: float
    rainfall: float
    date: date
    created_at: Optional[datetime]

    class Config:
        from_attributes = True  


class WeatherDataResponse(BaseModel):
    status: str
    region: str
    data: List[WeatherDataItem]


# Prediction schemas (used by ai_weather.predict_weather and routers/weather)
class WeatherPredictionItem(BaseModel):
    date: date
    predicted_temp: float
    lower_bound: float
    upper_bound: float
    source: str

    class Config:
        from_attributes = True  # pengganti orm_mode di Pydantic v2


class WeatherPredictionResponse(BaseModel):
    status: str
    predictions: List[WeatherPredictionItem]
from pydantic import BaseModel
from datetime import date
from typing import List

class WeatherPredictionItem(BaseModel):
    date: date
    predicted_temp: float
    lower_bound: float
    upper_bound: float
    source: str

    class Config:
        from_attributes = True  # pengganti orm_mode di Pydantic v2

class WeatherPredictionResponse(BaseModel):
    status: str
    predictions: List[WeatherPredictionItem]
