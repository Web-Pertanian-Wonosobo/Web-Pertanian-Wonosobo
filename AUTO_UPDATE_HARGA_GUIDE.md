# Auto-Update Harga Pasar: Panduan Lengkap

## 📊 Pertanyaan: "Harga pasar real-time otomatis berubah tiap hari?"

### ✅ Jawaban: BISA! Ada 2 Level:

---

## 🔴 **Level 1: Harga Real-time (Live View Only)**

### **Komponen:** `RealtimeMarketPrices.tsx`

**Status:** ✅ **Sudah Auto-Refresh**

```typescript
// Auto-refresh setiap 5 menit
useEffect(() => {
  loadPrices();
  const interval = setInterval(() => {
    loadPrices();
  }, 5 * 60 * 1000); // 5 minutes
  return () => clearInterval(interval);
}, []);
```

**Karakteristik:**
- ✅ Data langsung dari API Disdagkopukm
- ✅ Refresh otomatis setiap **5 menit**
- ❌ **TIDAK disimpan ke database**
- ❌ **TIDAK bisa digunakan untuk forecasting**
- 🎯 Purpose: Monitoring harga saat ini saja

**Lokasi di App:**
```
Dashboard → Harga Pasar Real-time
```

---

## 🟢 **Level 2: Data Historis (Untuk Forecasting)**

### **Backend Scheduler**

**Status:** 🔄 **Bisa Diaktifkan**

### **Cara Aktifkan Auto-Sync:**

#### **1. Edit `.env` file:**
```env
# Enable auto-sync
AUTO_SYNC_ENABLED=true

# Interval sync (dalam jam)
SYNC_INTERVAL_HOURS=24  # Sync setiap 24 jam (1x/hari)
```

#### **2. Restart Backend:**
```bash
cd backend
uvicorn app.main:app --reload
```

#### **3. Verifikasi Scheduler Aktif:**
Check console backend saat startup:
```
✅ Initial sync completed: {'message': '...'}
✅ Auto-sync scheduler enabled (every 24 hours)
📅 Market data will sync every 24 hour(s)
```

---

## 🔄 **Flow Auto-Update dengan Scheduler**

```
Setiap 24 jam (atau custom interval):
├── 1. Scheduler trigger sync job
├── 2. Fetch data dari API Disdagkopukm
├── 3. Parse & clean data
├── 4. Check duplikasi (by commodity + location + date)
├── 5. Insert/Update ke database
└── 6. Data siap untuk forecasting! ✅
```

**Keuntungan:**
- ✅ Data historis selalu up-to-date
- ✅ Forecasting menggunakan data terbaru
- ✅ Zero maintenance (fully automatic)
- ✅ Admin tidak perlu input manual setiap hari

---

## ⚙️ **Konfigurasi Interval Sync**

### **Opsi 1: Sync Setiap Hari (Recommended)**
```env
SYNC_INTERVAL_HOURS=24
```
**Use case:** Production normal, harga tidak terlalu volatile

### **Opsi 2: Sync 4x Per Hari**
```env
SYNC_INTERVAL_HOURS=6
```
**Use case:** Monitoring harga yang volatile

### **Opsi 3: Sync Setiap Jam**
```env
SYNC_INTERVAL_HOURS=1
```
**Use case:** Development/testing

### **Opsi 4: Sync Seminggu Sekali**
```env
SYNC_INTERVAL_HOURS=168
```
**Use case:** Harga sangat stabil

---

## 🎯 **Kombinasi Optimal**

### **Untuk User Biasa:**
```
1. View: RealtimeMarketPrices (refresh 5 menit)
   → Lihat harga live saat ini

2. Forecast: PricePrediction (data dari database)
   → Prediksi berdasarkan data historis
```

### **Untuk Production:**
```
┌─────────────────────────────────────┐
│  Frontend: Auto-refresh 5 menit     │
│  (RealtimeMarketPrices)             │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  Backend Scheduler: Sync 24 jam     │
│  (Auto-save to database)            │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  Database: Data historis terkumpul  │
│  (Untuk forecasting Prophet)        │
└─────────────────────────────────────┘
```

---

## 📝 **Manual Sync (Jika Perlu)**

### **Via API:**
```bash
# Trigger manual sync kapan saja
curl -X POST http://127.0.0.1:8000/market/sync
```

### **Via UI:**
```
RealtimeMarketPrices → Tombol "Sync ke Database"
```

### **Via Admin:**
```
Admin Dashboard → Manajemen Data Harga → Manual input
```

---

## 🔍 **Monitoring Auto-Sync**

### **Check Last Sync:**
```bash
# Check data terbaru di database
curl "http://127.0.0.1:8000/market/list?limit=10" | ConvertFrom-Json
```

### **Check Scheduler Status:**
```bash
# Check backend logs
# Seharusnya ada log setiap 24 jam:
# "🔄 Starting market data sync at [timestamp]"
# "✅ Market data sync completed: {...}"
```

### **Check Total Records:**
```bash
# Via API
curl "http://127.0.0.1:8000/market/list?limit=1000" | ConvertFrom-Json | Select total

# Semakin lama sistem jalan, semakin banyak data historis
# Day 1: ~900 records (from sample)
# Day 30: ~900 + (30 × X) records (X = komoditas dari API per hari)
```

---

## ⚠️ **Perbedaan Penting**

| Aspek | Real-time View | Data Historis |
|-------|---------------|---------------|
| **Update Frequency** | 5 menit | 24 jam (configurable) |
| **Source** | API langsung | Database lokal |
| **Storage** | Tidak disimpan | Disimpan permanent |
| **Purpose** | Monitoring live | Forecasting |
| **Auto-refresh UI** | ✅ Ya | ❌ Tidak (manual refresh) |
| **Auto-save DB** | ❌ Tidak | ✅ Ya (if scheduler on) |

---

## 💡 **Best Practice**

### **Setup Awal (One Time):**
```bash
# 1. Generate sample data untuk baseline
cd backend
python generate_sample_data.py

# 2. Enable auto-sync
# Edit .env: AUTO_SYNC_ENABLED=true

# 3. Restart backend
uvicorn app.main:app --reload
```

### **Operasional (Zero Maintenance):**
```
Day 1-∞:
├── Scheduler auto-sync setiap 24 jam
├── Data historis bertambah otomatis
├── Forecasting menggunakan data terbaru
└── Admin hanya perlu review (optional)
```

---

## ❓ FAQ

**Q: Data sample yang di-generate akan auto-update?**  
A: **Tidak**. Data sample static. Tapi data baru dari API akan auto-sync setiap hari (jika scheduler on).

**Q: Berapa banyak data akan bertambah per hari?**  
A: Tergantung jumlah komoditas di API. Estimasi: **10-50 records/hari** (1 record per komoditas yang tersedia di API).

**Q: Apakah data sample akan tertimpa?**  
A: **Tidak**. Data sample tetap ada. Auto-sync hanya **menambah** data baru, tidak menghapus data lama.

**Q: Bisa disable auto-sync?**  
A: **Ya**. Set `AUTO_SYNC_ENABLED=false` di `.env` dan restart backend.

**Q: Bisa manual sync kapan saja?**  
A: **Ya**. POST ke `/market/sync` atau klik tombol "Sync ke Database" di UI.

---

## 🚀 Quick Checklist

- [ ] Backend running dengan scheduler enabled
- [ ] `.env` set: `AUTO_SYNC_ENABLED=true`
- [ ] `.env` set: `SYNC_INTERVAL_HOURS=24`
- [ ] Sample data sudah di-generate (900 records)
- [ ] Check backend logs untuk konfirmasi scheduler aktif
- [ ] Test manual sync: `POST /market/sync`
- [ ] Monitor data bertambah setiap hari

**Status: ✅ System Ready for Auto-Update!**

---

## 📞 Troubleshooting

### **Scheduler tidak jalan:**
1. Check `.env`: `AUTO_SYNC_ENABLED=true`
2. Restart backend
3. Check console logs saat startup
4. Verify: Harus ada log "✅ Auto-sync scheduler enabled"

### **Data tidak bertambah:**
1. Check API Disdagkopukm masih available
2. Manual sync untuk test: `POST /market/sync`
3. Check database: `SELECT COUNT(*) FROM market_prices;`
4. Check logs untuk error messages

### **Forecasting error setelah sync:**
- Normal! Data baru butuh waktu aggregate
- Tunggu minimal 10-30 records baru per komoditas
- Check: `curl "/forecast/available-commodities"`

---

**Kesimpulan:** Harga **BISA auto-update** setiap hari dengan enable scheduler! 🎉
