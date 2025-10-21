from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

Base = declarative_base()

class SlopeData(Base):
    __tablename__ = "slope_data"
    
    id = Column(Integer, primary_key=True, index=True)
    location_name = Column(String(100))
    latitude = Column(Float)
    longitude = Column(Float)
    slope_angle = Column(Float)
    risk_level = Column(String(20))
    analyzed_at = Column(DateTime, default=datetime.utcnow)

class VegetationData(Base):
    __tablename__ = "vegetation_data"
    
    id = Column(Integer, primary_key=True, index=True)
    location_name = Column(String(100))
    latitude = Column(Float)
    longitude = Column(Float)
    ndvi_index = Column(Float)
    vegetation_density = Column(String(20))
    health_status = Column(String(20))
    analyzed_at = Column(DateTime, default=datetime.utcnow)