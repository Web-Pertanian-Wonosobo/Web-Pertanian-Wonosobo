<<<<<<< HEAD
from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

Base = declarative_base()

class Commodity(Base):
    __tablename__ = "commodities"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    category = Column(String(50))
    unit = Column(String(20))

class MarketPrice(Base):
    __tablename__ = "market_prices"
    
    id = Column(Integer, primary_key=True, index=True)
    commodity_id = Column(Integer)
    market_name = Column(String(100))
    price = Column(Float)
    price_unit = Column(String(20))
    price_date = Column(DateTime)
    price_trend = Column(String(20))
    created_at = Column(DateTime, default=datetime.utcnow)
=======
from sqlalchemy import Column, Integer, String, Float, Date, TIMESTAMP, ForeignKey
from sqlalchemy.orm import relationship
from app.db import Base

class MarketPrice(Base):
    __tablename__ = "market_prices"

    price_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.user_id"))
    commodity_name = Column(String(100))
    unit = Column(String(20))
    price = Column(Float)
    market_location = Column(String(100))
    date = Column(Date)
    created_at = Column(TIMESTAMP)

    user = relationship("User", back_populates="market_prices")
>>>>>>> 7b861554de84fb561009f1122eeb70601fa9de40
