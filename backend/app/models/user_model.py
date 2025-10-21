from sqlalchemy import Column, Integer, String, Text, TIMESTAMP
from sqlalchemy.orm import relationship
from app.db import Base

class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    email = Column(String(100), unique=True)
    password = Column(Text)
    role = Column(String(20))
    created_at = Column(TIMESTAMP)
    last_login = Column(TIMESTAMP)

    market_prices = relationship("MarketPrice", back_populates="user")
    gis_layers = relationship("GISLayer", back_populates="user")
    logs = relationship("LogActivity", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
