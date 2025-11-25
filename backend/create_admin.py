"""
Script untuk membuat admin baru
Jalankan: python create_admin.py
"""
import hashlib
from app.db import SessionLocal
from app.models.user_model import User
from datetime import datetime

def hash_password(password: str) -> str:
    """Hash password menggunakan SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()

def create_admin():
    print("\n=== CREATE NEW ADMIN ===\n")
    
    # Input data
    name = input("Nama lengkap: ").strip()
    email = input("Email (harus format valid, contoh: admin@example.com): ").strip().lower()
    phone = input("Nomor HP (opsional): ").strip()
    password = input("Password: ").strip()
    
    # Validasi
    if not name or not email or not password:
        print("❌ Nama, email, dan password harus diisi!")
        return
    
    if "@" not in email or "." not in email:
        print("❌ Email tidak valid! Harus format: username@domain.com")
        return
    
    # Connect to database
    db = SessionLocal()
    
    try:
        # Cek apakah email sudah ada
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            print(f"❌ Email {email} sudah terdaftar!")
            db.close()
            return
        
        # Hash password
        password_hash = hash_password(password)
        
        # Create new admin
        new_admin = User(
            name=name,
            email=email,
            password=password_hash,
            role="admin",
            created_at=datetime.now()
        )
        
        db.add(new_admin)
        db.commit()
        db.refresh(new_admin)
        
        print("\n✅ Admin berhasil dibuat!")
        print(f"\nID    : {new_admin.user_id}")
        print(f"Nama  : {new_admin.name}")
        print(f"Email : {new_admin.email}")
        print(f"Role  : {new_admin.role}")
        print(f"\n🔑 Kredensial Login:")
        print(f"Email    : {email}")
        print(f"Password : {password}")
        print("\nSimpan kredensial ini dengan aman!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
