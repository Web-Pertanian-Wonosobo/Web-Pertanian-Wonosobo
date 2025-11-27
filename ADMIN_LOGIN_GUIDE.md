# 🔐 Panduan Login Admin - EcoScope Wonosobo

## ✅ Kredensial Admin yang Ada

```
Email    : admin@admin.com
Password : admin123
Role     : admin
```

## 📝 Cara Login

1. **Buka aplikasi** → Klik "Login Admin"
2. **Masukkan kredensial**:
   - Email: `admin@admin.com`
   - Password: `admin123`
3. **Klik tombol Login**

## ⚠️ Troubleshooting

### Problem 1: "Email tidak terdaftar"
**Penyebab:**
- Email salah ketik
- Email tidak ada @ atau domain

**Solusi:**
- Pastikan email: `admin@admin.com` (huruf kecil semua)
- Jangan ada spasi

### Problem 2: "Password salah"
**Penyebab:**
- Password salah ketik
- Case sensitive (besar kecil huruf beda)

**Solusi:**
- Pastikan password: `admin123` (huruf kecil semua)
- Tidak ada spasi

### Problem 3: "Validasi email browser"
**Penyebab:**
- Input type="email" di form memvalidasi format email

**Solusi:**
- Email harus format valid: `username@domain.com`
- Tidak bisa input tanpa `@`

## 🆕 Cara Buat Admin Baru

### Opsi 1: Via API (Postman/Insomnia)
```http
POST http://127.0.0.1:8000/auth/register-admin
Content-Type: application/json

{
  "name": "Nama Admin",
  "email": "admin@example.com",
  "phone": "081234567890",
  "password": "password_baru"
}
```

### Opsi 2: Via Python Script
Jalankan di terminal backend:

```bash
cd backend
python create_admin.py
```

Isi data yang diminta:
- Name: Nama lengkap admin
- Email: Email baru (harus format email valid)
- Phone: Nomor HP
- Password: Password baru

### Opsi 3: Via Database Direct (Advanced)
```python
import hashlib
from app.db import SessionLocal
from app.models.user_model import User
from datetime import datetime

db = SessionLocal()

# Hash password
password_hash = hashlib.sha256("password_baru".encode()).hexdigest()

# Create admin
new_admin = User(
    name="Nama Admin Baru",
    email="admin@contoh.com",
    password=password_hash,
    role="admin",
    created_at=datetime.now()
)

db.add(new_admin)
db.commit()
print(f"✅ Admin created: {new_admin.email}")
db.close()
```

## 🔑 Password Hashing

Password di-hash menggunakan **SHA256**. Backend otomatis:
1. Terima password dari frontend
2. Hash dengan SHA256
3. Compare dengan hash di database

**Contoh:**
```python
import hashlib
password = "admin123"
hashed = hashlib.sha256(password.encode()).hexdigest()
# Result: 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
```

## 📊 Database Schema

Table: `users`
```sql
- user_id (INTEGER, PK)
- name (VARCHAR(100))
- email (VARCHAR(100), UNIQUE)
- password (TEXT) -- SHA256 hash
- role (VARCHAR(20)) -- 'admin' atau 'user'
- created_at (TIMESTAMP)
- last_login (TIMESTAMP)
```

## 🚨 Security Notes

1. **Email lowercase**: Backend auto-lowercase email untuk konsistensi
2. **Password case-sensitive**: Password tetap case-sensitive
3. **No password recovery**: Jika lupa password, harus reset via database/script
4. **SHA256 hash**: Password tidak bisa di-decrypt, hanya compare hash

## 📞 Contact

Jika masih error, cek:
1. **Backend running**: `uvicorn app.main:app --reload`
2. **Database connection**: Check PostgreSQL running
3. **Console log**: Lihat error di browser console (F12)
4. **Backend log**: Lihat error di terminal backend

---

**Status**: ✅ Working  
**Last Updated**: 2025-11-20  
**Admin Email**: admin@admin.com  
**Admin Password**: admin123
