from sqlalchemy import Column, Integer, String, Float, Date, TIMESTAMP
from app.db import Base

class WeatherData(Base):
    __tablename__ = "weather_data"

    weather_id = Column(Integer, primary_key=True, index=True)
    station_name = Column(String(100))
    temperature = Column(Float)
    humidity = Column(Float)
    rainfall = Column(Float)
    date = Column(Date)
    created_at = Column(TIMESTAMP)
