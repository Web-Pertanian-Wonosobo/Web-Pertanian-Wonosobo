<<<<<<< HEAD
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
=======
from sqlalchemy import Column, Integer, String, Text, TIMESTAMP, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class GISLayer(Base):
    __tablename__ = "gis_layers"

    layer_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    layer_name = Column(String(100))
    layer_type = Column(String(50))
    file_path = Column(Text)
    created_at = Column(TIMESTAMP)

    user = relationship("User", back_populates="gis_layers")
>>>>>>> 7b861554de84fb561009f1122eeb70601fa9de40
