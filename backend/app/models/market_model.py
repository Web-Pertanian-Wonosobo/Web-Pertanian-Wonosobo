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
