from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CommodityBase(BaseModel):
    name: str
    category: Optional[str] = "Umum"

class CommodityCreate(CommodityBase):
    pass

class CommodityUpdate(CommodityBase):
    pass

class CommodityResponse(CommodityBase):
    commodity_id: int
    created_at: datetime

    class Config:
        from_attributes = True
