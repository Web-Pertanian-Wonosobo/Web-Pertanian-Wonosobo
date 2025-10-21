from pydantic import BaseModel
from datetime import date
from typing import Optional

class MarketPriceCreate(BaseModel):
    user_id: int = 1
    commodity_name: str
    market_location: str
    unit: str
    price: float
<<<<<<< HEAD
    date: Optional[date] = None  
=======
    date: Optional[date] = None  
>>>>>>> 7b861554de84fb561009f1122eeb70601fa9de40
