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