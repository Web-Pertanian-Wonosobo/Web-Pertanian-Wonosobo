from app.db import engine
from sqlalchemy import text
import hashlib

def hash_password(password: str) -> str:
    """Hash password menggunakan SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()

try:
    with engine.connect() as conn:
        result = conn.execute(text("SELECT email, password FROM users WHERE role = 'admin'"))
        print("=== ADMIN USERS ===")
        for row in result:
            email = row[0]
            stored_hash = row[1]
            print(f"📧 Email: {email}")
            print(f"🔐 Stored password hash: {stored_hash}")
            
            # Test common passwords
            test_passwords = ["admin123", "admin", "password", "123456"]
            for pwd in test_passwords:
                if hash_password(pwd) == stored_hash:
                    print(f"✅ Password is: {pwd}")
                    break
            else:
                print("❌ Password is not one of common passwords")
                print("🔧 You can reset password using create_admin.py")
            
except Exception as e:
    print(f"❌ Database error: {e}")