from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

class MarketPriceCreate(BaseModel):
    user_id: Optional[int] = None  # Bisa null untuk data dari API atau manual
    commodity_name: str
    market_location: str
    unit: str
    price: float
    date: Optional[date] = None
