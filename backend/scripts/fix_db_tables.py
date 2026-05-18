from sqlalchemy import create_engine
import os
from dotenv import load_dotenv
from pathlib import Path
from app.db import Base
# Import all models to ensure they are registered with Base
from app.models.weather_model import WeatherData, WeatherPrediction
from app.models.market_model import MarketPrice
from app.models.user_model import User

def fix_database():
    # Load environment variables
    BACKEND_DIR = Path(__file__).resolve().parents[1]
    load_dotenv(dotenv_path=BACKEND_DIR / ".env")
    
    DATABASE_URL = os.getenv("DATABASE_URL")
    if not DATABASE_URL:
        print("DATABASE_URL not found!")
        return
    
    print("Connecting to database...")
    engine = create_engine(DATABASE_URL)
    
    print("Creating missing tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    fix_database()
