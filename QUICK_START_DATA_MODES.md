# ⚡ Quick Reference: Data Input Modes

## 🎯 Pilih Mode Anda

### **Mode 1: Input Historis Saja** (Setup Sekali, Tidak Perlu Update)
```bash
# Setup 90 hari data historis
curl -X POST "http://127.0.0.1:8000/forecast/generate-sample-data?commodity_name=Kentang&base_price=8500&days=90"

# Forecasting langsung bisa jalan!
# ✅ Tidak perlu update harian
# ⚠️ Akurasi menurun setelah 30-60 hari
```

---

### **Mode 2: Auto-Sync Harian** ⭐ RECOMMENDED
```bash
# Edit backend/.env
AUTO_SYNC_ENABLED=true
SYNC_INTERVAL_HOURS=24

# Restart backend
cd backend
uvicorn app.main:app --reload

# ✅ Data otomatis update setiap hari
# ✅ Admin tidak perlu input manual
# ✅ Forecasting selalu akurat
```

---

### **Mode 3: Hybrid** (Manual + Auto)
```bash
# 1. Enable auto-sync (Mode 2)
# 2. Login admin → Manajemen Data Harga
# 3. Input data lokal spesifik
# 4. Sistem auto-sync data API

# ✅ Data lengkap (lokal + API)
# ✅ Fleksibel + automatic
```

---

## 🔧 Konfigurasi Cepat

### **Default (Recommended):**
```env
AUTO_SYNC_ENABLED=true       # Enable auto-sync
SYNC_INTERVAL_HOURS=24       # Sync 1x/hari
```

### **Frequent Updates:**
```env
AUTO_SYNC_ENABLED=true
SYNC_INTERVAL_HOURS=6        # Sync 4x/hari
```

### **Manual Only:**
```env
AUTO_SYNC_ENABLED=false      # Disable auto-sync
```

---

## 📊 Jawaban Pertanyaan Anda

### ❓ **"Admin tidak harus input data harian bisa ga?"**
**Jawab: BISA!** Ada 2 cara:

1. **Mode 1**: Input historis sekali (90 hari) → Forecasting tetap jalan 30-60 hari tanpa update
2. **Mode 2**: Enable auto-sync → Sistem otomatis update setiap hari tanpa input manual

---

### ❓ **"Perubahan harga harus admin yang ubah atau bisa otomatis?"**
**Jawab: BISA OTOMATIS!**

- **Auto-Sync**: Sistem otomatis ambil data dari API Disdagkopukm setiap hari
- **Manual**: Admin bisa override/tambah data lokal kapan saja
- **Hybrid**: Keduanya jalan bersamaan (recommended!)

---

## 🎯 Rekomendasi Final

### **Untuk Production:**
```
✅ Enable auto-sync (24 jam interval)
✅ Admin input data historis awal (90 hari)
✅ Sistem auto-update setiap hari
✅ Admin hanya perlu review, tidak perlu input harian
```

### **Workflow:**
```
Week 1: Admin input 90 hari data historis (sekali saja)
Week 2-∞: Sistem auto-sync setiap hari (zero maintenance)
Occasional: Admin input data lokal spesifik (jika perlu)
```

---

## 📞 Need Help?

### **Test Auto-Sync:**
```bash
# Manual trigger sync
POST http://127.0.0.1:8000/market/sync

# Check hasil
GET http://127.0.0.1:8000/market/list?limit=10
```

### **Check Status:**
```bash
GET http://127.0.0.1:8000/health
```

### **Disable Auto-Sync:**
```bash
# Edit backend/.env
AUTO_SYNC_ENABLED=false

# Restart backend
```

---

## 💡 TL;DR

**Pertanyaan:** Admin harus input harian?  
**Jawaban:** **TIDAK!**

**Opsi 1:** Input historis sekali → Forecasting jalan 30-60 hari  
**Opsi 2:** Enable auto-sync → Sistem update otomatis tiap hari  
**Opsi 3:** Hybrid → Auto-sync + manual input lokal

**Recommended:** **Opsi 2** (auto-sync) 🚀
