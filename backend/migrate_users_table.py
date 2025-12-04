"""
Migration script to add description and address columns to users table
"""

import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    print("❌ DATABASE_URL not found in environment variables")
    sys.exit(1)

def migrate_users_table():
    """Add description and address columns to users table"""
    try:
        engine = create_engine(DATABASE_URL)
        
        with engine.connect() as conn:
            # Check if columns already exist
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'users' 
                AND table_schema = 'public'
                AND column_name IN ('description', 'address')
            """))
            
            existing_columns = [row[0] for row in result.fetchall()]
            
            # Add description column if it doesn't exist
            if 'description' not in existing_columns:
                conn.execute(text("ALTER TABLE users ADD COLUMN description TEXT"))
                print("✅ Added description column to users table")
            else:
                print("ℹ️ Description column already exists")
            
            # Add address column if it doesn't exist
            if 'address' not in existing_columns:
                conn.execute(text("ALTER TABLE users ADD COLUMN address TEXT"))
                print("✅ Added address column to users table")
            else:
                print("ℹ️ Address column already exists")
            
            conn.commit()
            print("🎉 Migration completed successfully!")
            
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    migrate_users_table()