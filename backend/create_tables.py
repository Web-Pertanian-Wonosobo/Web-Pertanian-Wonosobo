"""
Script untuk membuat semua tables di database PostgreSQL
Jalankan script ini jika tables belum ada atau perlu di-recreate
"""

from app.db import engine, Base
from app.models import user_model, market_model, weather_model, gis_model, log_model, notification_model

def create_all_tables():
    """Create all tables defined in models"""
    try:
        print("🔧 Creating all database tables...")
        
        # Import all models to ensure they're registered with Base
        print("📚 Importing all models...")
        
        # Create all tables
        Base.metadata.create_all(bind=engine)
        
        print("✅ All tables created successfully!")
        print("\nTables created:")
        print("📋 users")
        print("📋 market_prices") 
        print("📋 weather_data")
        print("📋 weather_predictions")
        print("📋 gis_layers")
        print("📋 log_activity")
        print("📋 notifications")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating tables: {e}")
        return False

def drop_all_tables():
    """Drop all tables (use with caution!)"""
    try:
        print("⚠️ Dropping all database tables...")
        Base.metadata.drop_all(bind=engine)
        print("✅ All tables dropped successfully!")
        return True
    except Exception as e:
        print(f"❌ Error dropping tables: {e}")
        return False

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == "--drop":
        print("⚠️ WARNING: This will delete all data!")
        confirm = input("Type 'yes' to continue: ")
        if confirm.lower() == 'yes':
            drop_all_tables()
            create_all_tables()
        else:
            print("❌ Operation cancelled")
    else:
        create_all_tables()