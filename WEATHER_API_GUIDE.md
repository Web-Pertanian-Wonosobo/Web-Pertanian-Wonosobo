# Panduan API Weather - Web Pertanian Wonosobo

## 📋 Endpoint yang Tersedia

### 1. GET `/weather/predict?days=3`
**Deskripsi**: Mendapatkan prediksi cuaca untuk N hari ke depan menggunakan ML Model

**Parameters**:
- `days` (optional, default=3): Jumlah hari prediksi

**Response**:
```json
{
  "status": "success",
  "predictions": [
    {
      "date": "2025-10-24",
      "predicted_temp": 28.14,
      "lower_bound": 26.04,
      "upper_bound": 30.24,
      "source": "Simple Moving Average"
    },
    {
      "date": "2025-10-25",
      "predicted_temp": 28.14,
      "lower_bound": 26.04,
      "upper_bound": 30.24,
      "source": "Simple Moving Average"
    }
  ]
}
```

---

### 2. GET `/weather/current`
**Deskripsi**: Mendapatkan data cuaca terkini dari database atau fetch dari BMKG jika belum ada

**Response**:
```json
{
  "status": "success",
  "data": [
    {
      "date": "2025-10-21",
      "temperature": 26.0,
      "humidity": 88.0,
      "rainfall": 0.0,
      "wind_speed": 1.0,
      "location_name": "Kemayoran"
    },
    ...
  ]
}
```

---

### 3. POST `/weather/sync`
**Deskripsi**: Sinkronisasi manual data cuaca dari BMKG API ke database

**Response**:
```json
{
  "status": "success",
  "message": "Successfully synced 24 weather records",
  "records": 24
}
```

---

## 🔧 Cara Menggunakan di Frontend

### Option 1: Menggunakan Backend API (Recommended)

```typescript
// Fetch weather predictions from backend
const fetchWeatherPrediction = async () => {
  const response = await fetch('http://localhost:8000/weather/predict?days=7');
  const data = await response.json();
  return data.predictions;
};

// Fetch current weather data
const fetchCurrentWeather = async () => {
  const response = await fetch('http://localhost:8000/weather/current');
  const data = await response.json();
  return data.data;
};
```

### Option 2: Tetap Menggunakan BMKG API Langsung (Current Implementation)

Jika Anda ingin tetap menggunakan BMKG API langsung dari frontend seperti sekarang, itu juga OK. Backend hanya digunakan untuk prediksi ML.

---

## 📊 Perbedaan Data

| Sumber | Jenis Data | Kelebihan | Kekurangan |
|--------|-----------|-----------|------------|
| **Backend `/weather/predict`** | Prediksi ML (suhu) | - Menggunakan ML<br>- Ada upper/lower bounds<br>- Data tersimpan di DB | - Hanya suhu<br>- Perlu data historis |
| **Backend `/weather/current`** | Data real dari BMKG | - Data lengkap (temp, humidity, rainfall, wind)<br>- Tersimpan di DB<br>- Bisa offline | - Perlu sync manual |
| **BMKG API Langsung** | Prakiraan real-time | - Data terbaru<br>- Detail lengkap<br>- Banyak lokasi | - Butuh internet<br>- Tergantung BMKG uptime |

---

## ✅ Rekomendasi untuk Frontend

### Untuk WeatherPrediction.tsx:

**Opsi A - Hybrid (Recommended)**:
1. Gunakan BMKG API langsung untuk data cuaca real-time (seperti sekarang)
2. Tambahkan section untuk ML predictions dari backend `/weather/predict`
3. Tampilkan kedua data: Real forecast dari BMKG + ML prediction dari backend

**Opsi B - Full Backend**:
1. Gunakan `/weather/current` untuk data cuaca
2. Gunakan `/weather/predict` untuk prediksi
3. Backend yang handle semua fetching dari BMKG

**Opsi C - Keep Current** (Paling sederhana):
1. Frontend tetap langsung ke BMKG untuk cuaca real-time
2. Backend hanya untuk fitur tambahan (ML prediction, analytics, dll)

---

## 🚀 Status Saat Ini

✅ **Backend API**:
- ✅ Endpoint `/weather/predict` - WORKING
- ✅ Endpoint `/weather/current` - WORKING  
- ✅ Endpoint `/weather/sync` - WORKING
- ✅ BMKG API parser - FIXED
- ✅ ML Prediction (Simple Moving Average fallback) - WORKING
- ✅ Database storage - WORKING

⚠️ **Frontend**:
- ✅ BMKG API Integration - WORKING (langsung dari frontend)
- ❌ Backend API Integration - NOT IMPLEMENTED YET
- ℹ️ AI Recommendations - HARDCODED (dummy data)

---

## 📝 Next Steps (Opsional)

1. **Integrasi Frontend ke Backend** (jika diperlukan):
   - Buat service API di frontend untuk call backend
   - Update WeatherPrediction.tsx untuk menggunakan backend data
   
2. **Improve ML Model** (future):
   - Install Prophet properly (perlu compiler)
   - Atau gunakan model lain yang lebih ringan
   
3. **Add More Features**:
   - Scheduler untuk auto-sync BMKG data
   - Cache predictions
   - Historical data analysis

---

## 💡 Kesimpulan

**Apakah prediksi cuaca sudah sesuai dengan API?**

**Jawaban**: 
- ✅ **Backend API sudah bekerja dengan baik** dan bisa memberikan prediksi cuaca
- ⚠️ **Frontend belum menggunakan backend API** - masih langsung ke BMKG
- ✅ **Keduanya bisa bekerja parallel** - tidak ada konflik

**Rekomendasi**:
- Frontend tetap bisa menggunakan BMKG API langsung (seperti sekarang) untuk data real-time
- Tambahkan section di frontend untuk menampilkan ML predictions dari backend
- Ini akan memberikan value lebih: Real forecast + AI prediction
