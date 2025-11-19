# Panduan Forecasting Harga Komoditas

## 🎯 Solusi untuk "Kurang Data"

Sistem forecasting membutuhkan **minimal 10 data historis** untuk training model Prophet. Ada 3 solusi jika data tidak cukup:

---

## ✅ Solusi 1: Automatic Fallback (RECOMMENDED)

Sistem akan **otomatis menggunakan data sintetis** jika data historis kurang dari 10 records.

### Cara Kerja:
1. Pilih komoditas (contoh: "Kentang")
2. Masukkan jumlah panen dan tanggal panen
3. Klik **"Prediksi dengan Prophet"**
4. Jika data historis < 10, sistem otomatis generate data sintetis
5. Hasil prediksi akan menampilkan badge **"⚠️ Menggunakan data sintetis"**

### Karakteristik Data Sintetis:
- Base price dari harga terakhir (atau default Rp 10.000)
- 90 hari data historis
- Trend naik 10%
- Seasonality pattern (weekly)
- Random noise realistic ±3%

---

## ✅ Solusi 2: Generate Sample Data ke Database

Untuk testing atau demo, generate data historis langsung ke database.

### Via API (Postman/Thunder Client):

**Endpoint:**
```
POST http://127.0.0.1:8000/forecast/generate-sample-data
```

**Query Parameters:**
- `commodity_name` (required): Nama komoditas (contoh: "Kentang")
- `base_price` (optional): Harga dasar (default: 10000)
- `days` (optional): Jumlah hari data (default: 90, max: 365)

**Contoh:**
```
POST http://127.0.0.1:8000/forecast/generate-sample-data?commodity_name=Kentang&base_price=8500&days=90
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully generated 90 sample records for Kentang",
  "commodity": "Kentang",
  "records_created": 90,
  "date_range": {
    "start": "2024-08-21",
    "end": "2024-11-19"
  },
  "hint": "You can now forecast this commodity at /forecast/commodity/Kentang"
}
```

### Via cURL:
```bash
curl -X POST "http://127.0.0.1:8000/forecast/generate-sample-data?commodity_name=Kentang&base_price=8500&days=90"
```

---

## ✅ Solusi 3: Sync Data Real dari API

Sync data harga pasar dari API Disdagkopukm Wonosobo.

### Via API:
```
POST http://127.0.0.1:8000/market/sync
```

### Via cURL:
```bash
curl -X POST http://127.0.0.1:8000/market/sync
```

**Response:**
```json
{
  "success": true,
  "message": "Data berhasil disinkronkan",
  "saved": 45,
  "source": "https://disdagkopukm.wonosobokab.go.id/api/produk-komoditas"
}
```

**Note:** 
- Data sync otomatis setiap startup backend
- Untuk data historis lengkap, lakukan sync berkala
- API eksternal mungkin limited data historis

---

## 📊 Endpoints Forecasting

### 1. Forecast Komoditas
```
GET /forecast/commodity/{commodity_name}
```

**Query Parameters:**
- `days_forward` (default: 30): Jumlah hari prediksi
- `days_back` (default: 90): Jumlah hari data historis
- `use_synthetic` (default: true): Auto-fallback ke data sintetis

**Contoh:**
```
GET http://127.0.0.1:8000/forecast/commodity/Kentang?days_forward=30&days_back=90&use_synthetic=true
```

### 2. Batch Forecast
```
POST /forecast/batch?days_forward=30
Body: ["Kentang", "Bawang Merah", "Cabai Merah"]
```

### 3. Quick Prediction
```
GET /forecast/quick-predict/Kentang?target_date=2024-12-25
```

### 4. Available Commodities
```
GET /forecast/available-commodities
```

---

## 🔍 Testing Workflow

### Scenario A: Komoditas Baru (Belum Ada Data)
1. Buka aplikasi, pilih komoditas "Kentang"
2. Masukkan data panen
3. Klik "Prediksi dengan Prophet"
4. ✅ Sistem otomatis gunakan data sintetis
5. Badge muncul: "⚠️ Menggunakan data sintetis"

### Scenario B: Generate Sample Data
1. POST ke `/forecast/generate-sample-data?commodity_name=Kentang&base_price=8500&days=90`
2. ✅ 90 records masuk database
3. Buka aplikasi, pilih "Kentang"
4. Klik "Prediksi dengan Prophet"
5. ✅ Prediksi menggunakan data REAL dari database (90 records)

### Scenario C: Data Cukup (≥10 records)
1. Pastikan komoditas sudah punya ≥10 data historis
2. Pilih komoditas di aplikasi
3. Klik "Prediksi dengan Prophet"
4. ✅ Prediksi menggunakan model Prophet dengan data real
5. Tidak ada badge warning

---

## 🎯 Cara Disable Synthetic Fallback

Jika ingin **error** ketika data tidak cukup (tanpa fallback):

### Via API:
```
GET /forecast/commodity/Kentang?use_synthetic=false
```

### Via Frontend:
Update di `PricePredictionNew.tsx`:
```typescript
const forecast = await forecastCommodityPrice(
  currentCommodityData.name,
  daysUntilHarvest + 5,
  90,
  false  // ← set to false untuk disable fallback
);
```

**Response jika data tidak cukup:**
```json
{
  "success": false,
  "message": "Insufficient data for forecasting. Need at least 10 data points, found 3",
  "commodity": "Kentang",
  "historical_data_points": 3,
  "hint": "Use use_synthetic_fallback=true or sync more market data"
}
```

---

## 📈 Model Details

### Prophet Configuration:
- **Daily Seasonality**: ON
- **Weekly Seasonality**: ON
- **Yearly Seasonality**: ON (if data ≥ 365 days)
- **Changepoint Prior Scale**: 0.05 (flexibility of trend)
- **Seasonality Prior Scale**: 10.0 (flexibility of seasonality)

### Output:
- **predicted_price**: Prediksi harga
- **lower_bound**: Confidence interval bawah
- **upper_bound**: Confidence interval atas
- **best_selling_dates**: Top 5 tanggal dengan harga tertinggi

---

## ⚠️ Catatan Penting

1. **Data Sintetis adalah Fallback**
   - Hanya untuk testing/demo
   - Tidak mencerminkan kondisi pasar real
   - Badge warning akan muncul

2. **Data Real Lebih Baik**
   - Semakin banyak data historis, semakin akurat
   - Minimal 30 hari untuk hasil terbaik
   - Ideal: 90-180 hari

3. **Limitations**
   - Max prediction: 90 hari ke depan
   - Min historical data: 10 records (atau gunakan synthetic)
   - Model retrain setiap forecast request

---

## 🚀 Quick Start

1. **Generate sample data untuk 3 komoditas:**
```bash
curl -X POST "http://127.0.0.1:8000/forecast/generate-sample-data?commodity_name=Kentang&base_price=8500&days=90"
curl -X POST "http://127.0.0.1:8000/forecast/generate-sample-data?commodity_name=Bawang%20Merah&base_price=45000&days=90"
curl -X POST "http://127.0.0.1:8000/forecast/generate-sample-data?commodity_name=Cabai%20Merah&base_price=35000&days=90"
```

2. **Cek available commodities:**
```bash
curl http://127.0.0.1:8000/forecast/available-commodities
```

3. **Test forecast:**
```bash
curl "http://127.0.0.1:8000/forecast/commodity/Kentang?days_forward=30"
```

4. **Buka aplikasi dan test di UI** ✅

---

## 📞 Support

Jika masih error:
1. Check backend logs untuk detail error
2. Verify database connection
3. Pastikan Prophet 1.1.7 terinstall: `pip list | grep prophet`
4. Check API response dengan Postman/Thunder Client
