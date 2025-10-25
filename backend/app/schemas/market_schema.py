from pydantic import BaseModel
from datetime import date
from typing import Optional

class MarketPriceCreate(BaseModel):
    user_id: int = 1
    commodity_name: str
    market_location: str
    unit: str
    price: float
    date: Optional[date] = None
