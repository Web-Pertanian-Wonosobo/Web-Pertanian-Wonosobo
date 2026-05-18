from sqlalchemy import Column, Integer, String, TIMESTAMP
from app.db import Base
from datetime import datetime

class Commodity(Base):
    __tablename__ = "commodities"

    commodity_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True)
    category = Column(String(50), nullable=True)
    created_at = Column(TIMESTAMP, default=datetime.now)
