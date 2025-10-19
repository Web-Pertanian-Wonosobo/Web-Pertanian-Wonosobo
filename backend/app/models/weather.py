from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from app.core.database import Base
import datetime

class WeatherData(Base):
    __tablename__ = "weather_data"

    id = Column(Integer, primary_key=True, index=True)
    # Lokasi
    location_name = Column(String(100), nullable=False)
    city = Column(String(50), nullable=False)
    province = Column(String(50), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    # Data Cuaca
    temperature = Column(Float, nullable=False)  # Suhu dalam Celsius
    humidity = Column(Float, nullable=False)     # Kelembaban %
    rainfall = Column(Float, nullable=True)      # Curah hujan (mm)
    wind_speed = Column(Float, nullable=True)    # Kecepatan angin (km/jam)
    wind_direction = Column(String(20), nullable=True)  # Arah angin
    weather_condition = Column(String(50), nullable=False)  # Cerah, Hujan, dll
    pressure = Column(Float, nullable=True)      # Tekanan udara (hPa)
    
    # Metadata
    source = Column(String(50), default="bmkg")  # Sumber data
    forecast_hours = Column(Integer, default=0)  # 0 = current, 3 = 3 jam ke depan
    timestamp = Column(DateTime, nullable=False) # Waktu data
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    def __repr__(self):
        return f"<WeatherData(location='{self.location_name}', temp={self.temperature}°C, condition='{self.weather_condition}')>"