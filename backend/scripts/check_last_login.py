"""
Script untuk cek last_login timestamp di tabel users
"""
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db import SessionLocal
from app.models.user_model import User

def check_last_login():
    db = SessionLocal()
    try:
        # Query semua user
        users = db.query(User).all()
        
        print("=" * 60)
        print("DATABASE CHECK: Users Table - Last Login")
        print("=" * 60)
        
        if not users:
            print("❌ Tidak ada user di database")
            return
        
        for user in users:
            print(f"\n👤 User ID: {user.user_id}")
            print(f"   Name: {user.name}")
            print(f"   Email: {user.email}")
            print(f"   Role: {user.role}")
            print(f"   Created At: {user.created_at}")
            print(f"   Last Login: {user.last_login if user.last_login else '❌ Belum pernah login'}")
            
            if user.last_login:
                print(f"   ✅ Login terakhir: {user.last_login.strftime('%Y-%m-%d %H:%M:%S')}")
            
        print("\n" + "=" * 60)
        print(f"Total users: {len(users)}")
        print("=" * 60)
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_last_login()
