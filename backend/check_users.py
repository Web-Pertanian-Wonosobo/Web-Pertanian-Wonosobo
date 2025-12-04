from app.db import engine
from sqlalchemy import text

try:
    with engine.connect() as conn:
        result = conn.execute(text("SELECT user_id, name, email, role FROM users"))
        print("=== USERS IN DATABASE ===")
        users = []
        for row in result:
            users.append(row)
            print(f"👤 ID: {row[0]}, Name: {row[1]}, Email: {row[2]}, Role: {row[3]}")
        
        if not users:
            print("❌ No users found in database")
            print("🔧 Need to create admin user")
        else:
            print(f"\n✅ Found {len(users)} users")
            
except Exception as e:
    print(f"❌ Database connection error: {e}")