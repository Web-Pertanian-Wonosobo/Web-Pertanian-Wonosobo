from sqlalchemy import Column, Integer, String, Float, Date, TIMESTAMP, func
from app.db import Base

class WeatherData(Base):
    __tablename__ = "weather_data"

    id = Column(Integer, primary_key=True, index=True)
    station_name = Column(String(100))
    temperature = Column(Float)
    humidity = Column(Float)
    rainfall = Column(Float)
    date = Column(Date)
    created_at = Column(TIMESTAMP, server_default=func.now())

class WeatherPrediction(Base):
    __tablename__ = "weather_predictions"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date)
    predicted_temp = Column(Float)
    lower_bound = Column(Float)
    upper_bound = Column(Float)
    source = Column(String(100))
    created_at = Column(TIMESTAMP, server_default=func.now())
