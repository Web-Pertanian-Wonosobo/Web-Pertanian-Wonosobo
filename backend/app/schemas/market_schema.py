from pydantic import BaseModel, validator, Field
from typing import Optional, List, Union
from datetime import date, datetime

class MarketPriceCreate(BaseModel):
    user_id: Optional[int] = 1  # Default ke admin jika tidak ada
    commodity_name: str = Field(..., min_length=1, max_length=100)
    market_location: str = Field(..., min_length=1, max_length=100)
    unit: str = Field(..., min_length=1, max_length=20)
    price: Union[int, float] = Field(..., gt=0)  # Harus positif
    date: Optional[str] = None  # Change to string to avoid serialization issues
    
    @validator('price', pre=True)
    def parse_price(cls, v):
        if isinstance(v, str):
            try:
                return float(v)
            except ValueError:
                raise ValueError(f"Invalid price format: {v}")
        return float(v)
    
    @validator('date', pre=True)
    def parse_date(cls, v):
        if v is None:
            return None
        if isinstance(v, str):
            try:
                # Validate date format and return as string
                datetime.strptime(v, '%Y-%m-%d')
                return v
            except ValueError:
                try:
                    # Parse ISO format and return as YYYY-MM-DD string
                    dt = datetime.fromisoformat(v.replace('Z', '+00:00'))
                    return dt.strftime('%Y-%m-%d')
                except ValueError:
                    # Invalid date format
                    raise ValueError(f"Invalid date format: {v}. Expected YYYY-MM-DD")
        elif isinstance(v, date):
            return v.strftime('%Y-%m-%d')
        elif isinstance(v, datetime):
            return v.strftime('%Y-%m-%d')
        return v
    
    class Config:
        # Konfigurasi yang lebih permisif untuk Pydantic v2
        str_strip_whitespace = True
        validate_assignment = True
