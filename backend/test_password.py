import hashlib
from app.db import SessionLocal
from app.models.user_model import User

db = SessionLocal()
admin = db.query(User).filter(User.email == 'admin@admin.com').first()
stored_hash = admin.password

print('\n=== PASSWORD TESTING ===')
print(f'Stored Hash: {stored_hash}\n')

passwords = ['admin', 'admin123', 'password', 'Admin123', 'Password', '123456', 'admin@admin.com', 'Administrator']

for pw in passwords:
    hash_pw = hashlib.sha256(pw.encode()).hexdigest()
    match = '✅ MATCH!' if hash_pw == stored_hash else '❌ No'
    print(f'{pw:20} -> {match}')

db.close()
