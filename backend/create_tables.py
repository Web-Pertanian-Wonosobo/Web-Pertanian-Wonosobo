import sys
import os
from pathlib import Path

# Add the project root to sys.path
sys.path.append(str(Path(__file__).resolve().parent))

from app.db import engine, Base
from app.models import (
    user_model, 
    market_model, 
    commodity_model, 
    gis_model, 
    weather_model, 
    notification_model, 
    log_model
)

def create_tables():
    print("Creating all tables in the database...")
    try:
        Base.metadata.create_all(bind=engine)
        print("Successfully created all tables!")
        
        # Seed initial commodities
        from sqlalchemy.orm import Session
        from app.models.commodity_model import Commodity
        
        with Session(engine) as session:
            if session.query(Commodity).count() == 0:
                print("Seeding initial commodities...")
                initial_commodities = [
                    'Kentang', 'Wortel', 'Kubis', 'Kopi', 'Strawberry', 'Bawang Daun',
                    'Jagung', 'Tembakau', 'Carica', 'Padi', 'Tomat', 'Lettuce'
                ]
                for name in initial_commodities:
                    session.add(Commodity(name=name, category="Umum"))
                session.commit()
                print(f"Successfully seeded {len(initial_commodities)} commodities!")
            else:
                print("Commodities table already contains data, skipping seed.")
                
    except Exception as e:
        print(f"Error during initialization: {e}")

if __name__ == "__main__":
    create_tables()