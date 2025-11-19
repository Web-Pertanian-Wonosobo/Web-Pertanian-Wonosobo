# 📊 Data Contoh yang Sudah Digenerate

## ✅ Status: Data Siap Digunakan!

Sistem sudah berisi **900 records** data harga historis untuk **10 komoditas** utama Wonosobo.

---

## 📦 Komoditas yang Tersedia

| No | Komoditas | Harga Base | Data Historis | Lokasi |
|----|-----------|------------|---------------|--------|
| 1  | Kentang | Rp 8.500/kg | 90 hari | Wonosobo Kota |
| 2  | Bawang Merah | Rp 45.000/kg | 90 hari | Wonosobo Kota |
| 3  | Cabai Merah | Rp 35.000/kg | 90 hari | Wonosobo Kota |
| 4  | Cabai Rawit | Rp 55.000/kg | 90 hari | Wonosobo Kota |
| 5  | Wortel | Rp 7.000/kg | 90 hari | Wonosobo Kota |
| 6  | Kubis | Rp 5.500/kg | 90 hari | Wonosobo Kota |
| 7  | Tomat | Rp 12.000/kg | 90 hari | Wonosobo Kota |
| 8  | Bawang Daun | Rp 15.000/kg | 90 hari | Wonosobo Kota |
| 9  | Strawberry | Rp 45.000/kg | 90 hari | Kejajar |
| 10 | Kopi Arabika | Rp 85.000/kg | 90 hari | Kalibawang |

**Total: 900 data points** (10 komoditas × 90 hari)

---

## 📈 Karakteristik Data

### **Realistic Price Variations:**
- ✅ **Trend**: Kenaikan harga 10% selama 90 hari
- ✅ **Seasonality**: Pattern mingguan (naik-turun)
- ✅ **Noise**: Random variation ±3% (natural market fluctuation)
- ✅ **Floor**: Harga minimum 80% dari base price

### **Date Range:**
- **Start**: 90 hari yang lalu dari hari ini
- **End**: Hari ini
- **Frequency**: Daily (setiap hari)

---

## 🎯 Cara Menggunakan Data

### **1. Test Forecasting via API**

```bash
# Kentang - Prediksi 30 hari ke depan
curl "http://127.0.0.1:8000/forecast/commodity/Kentang?days_forward=30"

# Bawang Merah - Prediksi 7 hari ke depan
curl "http://127.0.0.1:8000/forecast/commodity/Bawang%20Merah?days_forward=7"

# Cabai Merah dengan data historis 60 hari
curl "http://127.0.0.1:8000/forecast/commodity/Cabai%20Merah?days_forward=30&days_back=60"
```

### **2. Test via Frontend**

1. Buka browser: `http://localhost:5173`
2. Login (atau tanpa login untuk public access)
3. Navigate ke **"Prediksi Harga"**
4. Pilih komoditas dari dropdown:
   - Kentang
   - Bawang Merah
   - Cabai Merah
   - dll
5. Input:
   - **Estimasi Hasil Panen**: 1000 kg
   - **Tanggal Panen**: Pilih tanggal 7-30 hari dari sekarang
6. Klik **"Prediksi dengan Prophet"**
7. Lihat hasil prediksi! 🎉

### **3. Check Data via Admin Panel**

1. Login sebagai admin
2. Navigate ke **"Manajemen Data Harga"**
3. Lihat semua 900 records yang sudah digenerate
4. Bisa edit/hapus/tambah data manual

---

## 📊 Contoh Output Forecasting

### **Request:**
```bash
GET /forecast/commodity/Kentang?days_forward=7
```

### **Response:**
```json
{
  "success": true,
  "commodity": "Kentang",
  "model": "Prophet",
  "current_price": 8795.63,
  "forecast_days": 7,
  "historical_data_points": 89,
  "statistics": {
    "average_predicted_price": 8850.45,
    "min_predicted_price": 8720.30,
    "max_predicted_price": 8980.20,
    "price_trend": "naik",
    "trend_percentage": 0.62
  },
  "predictions": [
    {
      "date": "2024-11-20",
      "predicted_price": 8820.50,
      "lower_bound": 8650.00,
      "upper_bound": 8990.00
    },
    // ... 6 more days
  ],
  "best_selling_dates": [
    {
      "date": "2024-11-26",
      "predicted_price": 8980.20,
      "confidence_range": "Rp 8,800 - Rp 9,160"
    }
  ]
}
```

---

## 🔄 Generate Ulang Data (Jika Perlu)

### **Hapus Data Lama (Optional):**
```sql
-- Via database
DELETE FROM market_prices WHERE user_id = 1;
```

### **Generate Data Baru:**
```bash
cd backend
python generate_sample_data.py
```

### **Generate untuk Komoditas Spesifik:**
```bash
# Via API
curl -X POST "http://127.0.0.1:8000/forecast/generate-sample-data?commodity_name=Jagung&base_price=4500&days=90"
```

---

## 💡 Tips Penggunaan

### **1. Testing Forecasting:**
- Mulai dengan prediksi **7 hari** (lebih cepat)
- Coba berbagai komoditas untuk compare hasil
- Test dengan tanggal panen berbeda

### **2. Evaluasi Akurasi:**
- Compare prediksi dengan harga "current"
- Check confidence interval (lower_bound - upper_bound)
- Smaller interval = more confident prediction

### **3. Best Selling Dates:**
- Gunakan **best_selling_dates** untuk rekomendasi kapan jual
- Top 5 dates dengan harga tertinggi prediksi
- Confidence range menunjukkan rentang kemungkinan

---

## 📋 Verifikasi Data

### **Check Total Records:**
```bash
curl "http://127.0.0.1:8000/market/list?limit=1000" | ConvertFrom-Json | Select-Object -ExpandProperty total
# Expected: 900
```

### **Check Per Commodity:**
```bash
curl "http://127.0.0.1:8000/market/list?commodity=Kentang" | ConvertFrom-Json | Select-Object -ExpandProperty total
# Expected: 90
```

### **Check Available Commodities:**
```bash
curl "http://127.0.0.1:8000/forecast/available-commodities"
```

---

## 🎯 Next Steps

### **Untuk Demo/Testing:**
✅ Data sudah siap! Langsung test forecasting di frontend

### **Untuk Production:**
1. ✅ Data contoh sudah ada (900 records)
2. 🔄 Enable auto-sync untuk data real:
   ```env
   AUTO_SYNC_ENABLED=true
   SYNC_INTERVAL_HOURS=24
   ```
3. 📝 Admin bisa tambah data lokal via UI

### **Untuk Development:**
- Test berbagai skenario forecasting
- Tuning model Prophet parameters
- Add more commodities sesuai kebutuhan

---

## ❓ FAQ

**Q: Data ini real atau synthetic?**  
A: Synthetic (generated) dengan pattern realistic. Untuk production, gunakan data real dari admin input atau auto-sync API.

**Q: Bisa tambah komoditas lain?**  
A: Ya! Edit `generate_sample_data.py` atau gunakan endpoint POST `/forecast/generate-sample-data`

**Q: Berapa lama data valid?**  
A: Data bisa digunakan untuk testing/demo kapan saja. Untuk production, update dengan data real.

**Q: Forecasting error "insufficient data"?**  
A: Pastikan komoditas punya minimal 10 records. Check dengan: `curl "http://127.0.0.1:8000/market/list?commodity=NamaKomoditas"`

---

## 🚀 Quick Test Checklist

- [ ] Backend running: `http://127.0.0.1:8000/health`
- [ ] Data generated: 900 records ✅
- [ ] Forecasting works: Test Kentang
- [ ] Frontend accessible: `http://localhost:5173`
- [ ] Can select commodity in dropdown
- [ ] Can see prediction results
- [ ] Admin can view data in management panel

**Status: ✅ ALL READY!**

---

## 📞 Support

Jika forecasting error:
1. Check backend logs
2. Verify data exists: `/market/list?commodity=X`
3. Test API directly: `/forecast/commodity/X?days_forward=7`
4. Check model requirements: minimal 10 data points

Enjoy forecasting! 🎉
