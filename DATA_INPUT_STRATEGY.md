# Strategi Input Data Harga: Manual vs Auto-Sync

## 🎯 Tiga Mode Operasi

Sistem ini mendukung **3 mode** untuk mengelola data harga:

---

## ✅ Mode 1: Input Historis Saja (One-Time Setup)

### **Konsep:**
Admin **hanya input data historis sekali** (30-90 hari), lalu **forecasting tetap bisa jalan** untuk prediksi jangka panjang tanpa perlu update harian.

### **Cara Kerja:**
```
Admin Input 90 hari data historis (Jan-Mar 2025)
         ↓
Prophet belajar pattern & trend
         ↓
User bisa prediksi Apr-Jun 2025 (bahkan tanpa data baru!)
```

### **Kelebihan:**
- ✅ **Sekali setup**, tidak perlu maintenance
- ✅ Model Prophet bisa **extrapolate** trend dari data historis
- ✅ Cocok untuk **prediksi jangka pendek** (7-30 hari)

### **Kekurangan:**
- ⚠️ Semakin lama tanpa update, **akurasi menurun**
- ⚠️ Tidak bisa capture **perubahan musiman** atau **event terbaru**
- ⚠️ Prediksi untuk 3-6 bulan ke depan kurang akurat

### **Rekomendasi:**
Bagus untuk **proof-of-concept** atau sistem dengan **harga relatif stabil**

### **Setup:**
```bash
# Generate 90 hari data historis untuk 5 komoditas
curl -X POST "http://127.0.0.1:8000/forecast/generate-sample-data?commodity_name=Kentang&base_price=8500&days=90"
curl -X POST "http://127.0.0.1:8000/forecast/generate-sample-data?commodity_name=Bawang%20Merah&base_price=45000&days=90"
curl -X POST "http://127.0.0.1:8000/forecast/generate-sample-data?commodity_name=Cabai%20Merah&base_price=35000&days=90"
curl -X POST "http://127.0.0.1:8000/forecast/generate-sample-data?commodity_name=Wortel&base_price=7000&days=90"
curl -X POST "http://127.0.0.1:8000/forecast/generate-sample-data?commodity_name=Kubis&base_price=5500&days=90"
```

Selesai! User sudah bisa forecasting untuk 30-90 hari ke depan.

---

## ✅ Mode 2: Auto-Sync Harian (Recommended) ⭐

### **Konsep:**
Sistem **otomatis sync** data dari API Disdagkopukm setiap hari. Admin hanya perlu setup awal, sisanya **automatic**.

### **Cara Kerja:**
```
Initial Setup: Admin input data historis (opsional)
         ↓
Auto-Sync Scheduler aktif (default: setiap 24 jam)
         ↓
Data harga selalu fresh & up-to-date
         ↓
Forecasting selalu akurat dengan data terbaru
```

### **Konfigurasi:**

#### **Enable Auto-Sync (Default: ON)**
File: `backend/.env`
```env
AUTO_SYNC_ENABLED=true
SYNC_INTERVAL_HOURS=24  # Sync setiap 24 jam (1x/hari)
```

#### **Opsi Interval:**
- `SYNC_INTERVAL_HOURS=1` → Sync setiap 1 jam
- `SYNC_INTERVAL_HOURS=6` → Sync 4x/hari
- `SYNC_INTERVAL_HOURS=24` → Sync 1x/hari (recommended)
- `SYNC_INTERVAL_HOURS=168` → Sync 1x/minggu

#### **Disable Auto-Sync:**
```env
AUTO_SYNC_ENABLED=false
```

### **Kelebihan:**
- ✅ **Fully automatic**, no maintenance
- ✅ Data **selalu fresh** setiap hari
- ✅ Forecasting **lebih akurat** karena pakai data real-time
- ✅ Admin tidak perlu manual input harian

### **Kekurangan:**
- ⚠️ Tergantung **availability API eksternal**
- ⚠️ API mungkin **limited data historis**

### **Rekomendasi:**
**Best practice** untuk production! Kombinasi dengan manual input untuk data yang tidak ada di API.

### **Monitoring:**
```bash
# Check sync status
GET http://127.0.0.1:8000/health

# Manual sync kapan saja
POST http://127.0.0.1:8000/market/sync

# Check data terbaru
GET http://127.0.0.1:8000/market/list?limit=10
```

---

## ✅ Mode 3: Hybrid (Manual + Auto-Sync)

### **Konsep:**
Kombinasi **manual input** (untuk data spesifik/lokal) + **auto-sync** (untuk data umum dari API).

### **Cara Kerja:**
```
Admin input manual: Data lokal yang tidak ada di API
         +
Auto-Sync: Data umum dari API Disdagkopukm
         ↓
Database lengkap: Data lokal + API
         ↓
Forecasting super akurat!
```

### **Use Case:**
- **Manual Input**: Harga lokal pasar Wonosobo yang spesifik
- **Auto-Sync**: Harga umum dari API pemerintah
- **Result**: Database lengkap & akurat

### **Setup:**
1. Enable auto-sync di `.env`
2. Admin input data lokal via UI
3. Sistem auto-sync data API
4. Database gabungan keduanya

### **Kelebihan:**
- ✅ **Best of both worlds**
- ✅ Data **lengkap** (lokal + API)
- ✅ Fleksibel untuk **custom data**
- ✅ Auto-update untuk **data umum**

---

## 📊 Perbandingan Mode

| Aspek | Mode 1: Historis Saja | Mode 2: Auto-Sync | Mode 3: Hybrid |
|-------|----------------------|-------------------|----------------|
| **Setup Effort** | Sekali saja | Minimal | Sedang |
| **Maintenance** | Tidak ada | Tidak ada | Minimal |
| **Akurasi Jangka Pendek** | Baik | Sangat Baik | Excellent |
| **Akurasi Jangka Panjang** | Menurun | Baik | Sangat Baik |
| **Data Freshness** | Statis | Real-time | Real-time |
| **Fleksibilitas** | Rendah | Sedang | Tinggi |
| **Cocok Untuk** | Demo/POC | Production | Enterprise |

---

## 🎯 Rekomendasi Berdasarkan Skenario

### **Scenario A: Demo/Testing**
→ **Mode 1**: Input historis saja
```bash
# Quick setup 5 menit
curl -X POST "http://127.0.0.1:8000/forecast/generate-sample-data?commodity_name=Kentang&base_price=8500&days=90"
```

### **Scenario B: Production (Tergantung API)**
→ **Mode 2**: Auto-sync enabled
```env
AUTO_SYNC_ENABLED=true
SYNC_INTERVAL_HOURS=24
```

### **Scenario C: Production (Custom Data)**
→ **Mode 3**: Hybrid approach
- Enable auto-sync untuk data umum
- Admin input manual untuk data lokal spesifik

---

## ❓ FAQ

### **Q: Apakah forecasting tetap akurat tanpa update harian?**
A: Ya untuk **jangka pendek** (7-30 hari). Untuk jangka panjang (3-6 bulan), **akurasi menurun** tanpa data baru.

### **Q: Bagaimana Prophet bisa prediksi tanpa data baru?**
A: Prophet **belajar pattern** dari data historis:
- **Trend**: Naik/turun/stabil
- **Seasonality**: Pola harian/mingguan/bulanan
- **Extrapolation**: Memprediksi berdasarkan pattern tersebut

### **Q: Berapa lama data historis valid untuk forecasting?**
A: Tergantung volatility harga:
- **Harga stabil**: 30-90 hari cukup untuk prediksi 30-60 hari
- **Harga volatile**: Butuh update lebih sering

### **Q: Auto-sync menggunakan resource banyak?**
A: Tidak. Sync 1x/hari hanya butuh **~1-2 detik** dan **minimal CPU/memory**.

### **Q: Bisa switch mode di tengah jalan?**
A: Ya! Tinggal:
- Update `.env` file
- Restart backend
- Mode berubah

### **Q: Data manual input akan tertimpa auto-sync?**
A: **Tidak**. Keduanya **koeksistensi** di database. Auto-sync hanya tambah data baru dari API, tidak hapus data manual.

---

## 🚀 Quick Start: Pilih Mode Anda

### **Mode 1: Setup Cepat (5 menit)**
```bash
# Generate sample data
curl -X POST "http://127.0.0.1:8000/forecast/generate-sample-data?commodity_name=Kentang&base_price=8500&days=90"

# Test forecast
curl "http://127.0.0.1:8000/forecast/commodity/Kentang?days_forward=30"
```

### **Mode 2: Auto-Sync Production**
```bash
# Edit backend/.env
echo "AUTO_SYNC_ENABLED=true" >> backend/.env
echo "SYNC_INTERVAL_HOURS=24" >> backend/.env

# Restart backend
cd backend
uvicorn app.main:app --reload
```

### **Mode 3: Hybrid Setup**
```bash
# 1. Enable auto-sync (seperti Mode 2)
# 2. Login sebagai admin
# 3. Buka "Manajemen Data Harga"
# 4. Input data lokal manual
# 5. Done! Sistem akan auto-sync + manual data
```

---

## 📈 Best Practice Recommendation

Untuk **sistem production di Wonosobo**, gunakan:

### **Setup Awal:**
1. ✅ Input 30-90 hari data historis manual (via UI atau generate-sample)
2. ✅ Enable auto-sync dengan interval 24 jam
3. ✅ Admin review data seminggu sekali

### **Operasional:**
- Sistem auto-sync setiap hari dari API
- Admin hanya perlu input jika ada **data lokal spesifik**
- Review akurasi forecasting setiap bulan

### **Result:**
- Data selalu fresh
- Forecasting akurat
- Maintenance minimal
- Fleksibel untuk custom data

---

## 📞 Support

Jika perlu bantuan memilih mode:
1. **Demo/POC**: Mode 1
2. **Production Standard**: Mode 2
3. **Production Premium**: Mode 3

Semua mode bisa **switch kapan saja** tanpa kehilangan data!
