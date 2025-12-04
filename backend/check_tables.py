from app.db import engine
from sqlalchemy import text

try:
    with engine.connect() as conn:
        result = conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"))
        print("=== TABLES IN DATABASE ===")
        tables = []
        for row in result:
            tables.append(row[0])
            print(f"📋 {row[0]}")
        
        if not tables:
            print("❌ No tables found in public schema")
        else:
            print(f"\n✅ Found {len(tables)} tables")
            
        # Check if market_prices table exists
        if 'market_prices' in tables:
            print("\n✅ market_prices table EXISTS")
            # Show table structure
            result = conn.execute(text("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'market_prices'"))
            print("\n=== MARKET_PRICES TABLE STRUCTURE ===")
            for row in result:
                print(f"  {row[0]}: {row[1]}")
        else:
            print("\n❌ market_prices table NOT FOUND")
            print("🔧 Need to create tables using SQLAlchemy Base.metadata.create_all()")
            
except Exception as e:
    print(f"❌ Database connection error: {e}")