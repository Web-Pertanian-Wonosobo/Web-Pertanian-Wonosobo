# 🌤️ Panduan Integrasi Data JSON BMKG

## Status Integrasi
✅ **Backend sudah mengintegrasikan data JSON dari BMKG API**

Data JSON dari repository [infoBMKG/data-cuaca](https://github.com/infoBMKG/data-cuaca) sudah otomatis diambil oleh backend Anda melalui API resmi BMKG.

---

## 📊 Struktur Data JSON BMKG

Struktur JSON dari API BMKG (`https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=CODE`):

```json
{
  "lokasi": {
    "adm4": "31.71.03.1001",
    "desa": "Wonosobo",
    "kecamatan": "Wonosobo",
    "kotkab": "Wonosobo",
    "provinsi": "Jawa Tengah",
    "lat": -7.36,
    "lon": 109.90,
    "timezone": "Asia/Jakarta"
  },
  "data": [
    {
      "cuaca": [
        [
          {
            "datetime": "2025-10-21T00:00:00",
            "local_datetime": "2025-10-21 07:00:00",
            "t": 24.5,           // Suhu (°C)
            "hu": 85,            // Kelembaban (%)
            "tp": 2.3,           // Curah hujan (mm)
            "ws": 10.5,          // Kecepatan angin (km/h)
            "wd": "BARAT",       // Arah angin
            "weather": "Berawan",
            "weather_desc": "Cerah Berawan",
            "image": "https://cdn.bmkg.go.id/Web/IconCuaca-NoShadow-PNG/Cerah%20Berawan.png",
            "vs_text": "Baik"   // Jarak pandang
          }
        ]
      ]
    }
  ]
}
```

---

## 🔧 Cara Kerja Backend (Sudah Terimplementasi)

### 1. File: `backend/app/services/ai_weather.py`

```python
# Endpoint BMKG untuk Wonosobo
BMKG_ENDPOINT = "https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=31.71.03.1001"

def fetch_weather_data():
    # 1. Ambil data JSON dari API BMKG
    res = requests.get(BMKG_ENDPOINT, timeout=15)
    data = res.json()
    
    # 2. Parse struktur JSON
    location_name = data.get("lokasi", {}).get("desa", "Unknown")
    
    # 3. Loop through nested arrays
    for item in data.get("data", []):
        cuaca_array = item.get("cuaca", [])
        for day_forecast in cuaca_array:
            for forecast in day_forecast:
                records.append({
                    "ds": forecast.get("datetime"),
                    "temperature": float(forecast.get("t", 0)),      # Suhu
                    "humidity": float(forecast.get("hu", 0)),        # Kelembaban
                    "rainfall": float(forecast.get("tp", 0)),        # Hujan
                    "wind_speed": float(forecast.get("ws", 0)),      # Angin
                    "location": location_name
                })
    
    # 4. Convert ke pandas DataFrame
    df = pd.DataFrame(records)
    return df
```

### 2. Data Disimpan ke Database PostgreSQL

```python
def save_weather_data(db: Session, df: pd.DataFrame):
    for _, row in df.iterrows():
        weather = WeatherData(
            location_name=row.get("location", "BMKG"),
            temperature=row["temperature"],
            humidity=row.get("humidity"),
            rainfall=row.get("rainfall"),
            wind_speed=row.get("wind_speed"),
            date=row["ds"].date(),
        )
        db.add(weather)
    db.commit()
```

---

## 🚀 Cara Menggunakan Data BMKG

### Opsi 1: Otomatis Saat Prediksi (Recommended)
Backend akan otomatis mengambil data BMKG ketika Anda memanggil endpoint prediksi:

```bash
# Frontend akan otomatis memanggil:
http://127.0.0.1:8000/weather/predict?days=3
```

### Opsi 2: Manual Sync Data
Gunakan endpoint sync untuk mengambil data terbaru dari BMKG:

```bash
# POST request
curl -X POST http://127.0.0.1:8000/weather/sync
```

**Di Frontend (React):**
```typescript
import { syncWeatherData } from "../src/services/weatherApi";

const handleSync = async () => {
  const success = await syncWeatherData();
  if (success) {
    console.log("✅ Data BMKG berhasil disinkronkan");
  }
};
```

### Opsi 3: Ambil Data Langsung dari API BMKG di Frontend

Jika Anda ingin mengambil data JSON langsung di frontend:

```typescript
// Tambahkan function baru di weatherApi.ts
export const fetchBMKGDirect = async (adm4Code: string = "31.71.03.1001") => {
  try {
    const response = await fetch(
      `https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=${adm4Code}`
    );
    const data = await response.json();
    
    // Parse data BMKG
    const location = data.lokasi.desa;
    const forecasts = [];
    
    for (const item of data.data) {
      for (const dayForecast of item.cuaca) {
        for (const forecast of dayForecast) {
          forecasts.push({
            date: forecast.datetime,
            localDate: forecast.local_datetime,
            temperature: forecast.t,
            humidity: forecast.hu,
            rainfall: forecast.tp,
            windSpeed: forecast.ws,
            windDirection: forecast.wd,
            weather: forecast.weather,
            weatherDesc: forecast.weather_desc,
            imageUrl: forecast.image,
            visibility: forecast.vs_text,
          });
        }
      }
    }
    
    return {
      location,
      forecasts
    };
  } catch (error) {
    console.error("Error fetching BMKG data:", error);
    return null;
  }
};
```

---

## 🗺️ Kode Lokasi (ADM4) untuk Daerah Wonosobo

Ganti parameter `adm4` di `BMKG_ENDPOINT` dengan kode lokasi yang sesuai:

| Kecamatan | Kode ADM4 |
|-----------|-----------|
| Wonosobo | 31.71.03.1001 |
| Kertek | 31.71.01.1001 |
| Garung | 31.71.02.1001 |
| Leksono | 31.71.04.1001 |
| Kaliwiro | 31.71.05.1001 |

**Cara mencari kode ADM4:**
1. Buka https://data.bmkg.go.id/prakiraan-cuaca
2. Cari lokasi Anda
3. Lihat parameter `adm4` di URL

---

## 🔄 Flow Data Lengkap

```
┌─────────────────┐
│   BMKG API      │  (api.bmkg.go.id)
│  JSON Response  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Backend Python │  (ai_weather.py)
│  fetch_weather  │  - Parse JSON
│  _data()        │  - Extract data
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   PostgreSQL    │  (weather_data table)
│   Database      │  - Simpan historis
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  ML Prediction  │  (Prophet/SMA)
│  predict_       │  - Generate forecast
│  weather()      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  REST API       │  (/weather/predict)
│  JSON Response  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  React Frontend │  (WeatherPrediction.tsx)
│  Display UI     │  - Show cards/charts
└─────────────────┘
```

---

## 📝 Contoh Implementasi di Component

### Menampilkan Data BMKG di React:

```tsx
import { useEffect, useState } from "react";
import { fetchBMKGDirect } from "../src/services/weatherApi";

function BMKGWeatherWidget() {
  const [bmkgData, setBmkgData] = useState(null);

  useEffect(() => {
    const loadBMKGData = async () => {
      const data = await fetchBMKGDirect("31.71.03.1001");
      setBmkgData(data);
    };
    loadBMKGData();
  }, []);

  if (!bmkgData) return <div>Loading BMKG data...</div>;

  return (
    <div>
      <h2>Data Cuaca BMKG - {bmkgData.location}</h2>
      {bmkgData.forecasts.map((forecast, index) => (
        <div key={index} className="weather-card">
          <p>🕐 {forecast.localDate}</p>
          <p>🌡️ Suhu: {forecast.temperature}°C</p>
          <p>💧 Kelembaban: {forecast.humidity}%</p>
          <p>🌧️ Hujan: {forecast.rainfall}mm</p>
          <p>💨 Angin: {forecast.windSpeed} km/j dari {forecast.windDirection}</p>
          <p>☁️ {forecast.weatherDesc}</p>
          {forecast.imageUrl && (
            <img src={forecast.imageUrl} alt={forecast.weather} />
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## 🎯 Testing Integrasi

### 1. Test Backend API
```bash
# Test predict endpoint (akan otomatis fetch BMKG data)
curl http://127.0.0.1:8000/weather/predict?days=3

# Test manual sync
curl -X POST http://127.0.0.1:8000/weather/sync

# Test current data
curl http://127.0.0.1:8000/weather/current
```

### 2. Test di Browser
Buka browser console dan jalankan:
```javascript
// Test fetch predictions
fetch('http://127.0.0.1:8000/weather/predict?days=3')
  .then(r => r.json())
  .then(console.log);

// Test sync
fetch('http://127.0.0.1:8000/weather/sync', { method: 'POST' })
  .then(r => r.json())
  .then(console.log);
```

---

## ⚠️ Troubleshooting

### Data Tidak Muncul
1. **Cek backend logs:**
   ```bash
   # Di terminal backend, lihat error messages
   ```

2. **Cek database:**
   ```sql
   SELECT * FROM weather_data ORDER BY date DESC LIMIT 10;
   ```

3. **Test endpoint BMKG langsung:**
   ```bash
   curl "https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=31.71.03.1001"
   ```

### Kode ADM4 Tidak Valid
- Verifikasi kode di https://data.bmkg.go.id/prakiraan-cuaca
- Format harus: `XX.XX.XX.XXXX` (contoh: `31.71.03.1001`)

### CORS Error
Backend sudah dikonfigurasi dengan CORS. Jika masih error, tambahkan di `main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 📚 Referensi

- **BMKG API Documentation:** https://data.bmkg.go.id/prakiraan-cuaca
- **GitHub Repository:** https://github.com/infoBMKG/data-cuaca
- **Portal Data BMKG:** https://data.bmkg.go.id

---

## ✅ Kesimpulan

**Backend Anda sudah mengintegrasikan data JSON BMKG secara otomatis!** 

Setiap kali frontend memanggil `/weather/predict`, backend akan:
1. ✅ Cek database untuk data historis
2. ✅ Jika tidak ada/terlalu lama, fetch dari BMKG API
3. ✅ Parse JSON sesuai struktur BMKG
4. ✅ Simpan ke database PostgreSQL
5. ✅ Generate prediksi menggunakan ML (Prophet/Simple Moving Average)
6. ✅ Return hasil prediksi ke frontend

**Tidak perlu konfigurasi tambahan - data BMKG sudah otomatis digunakan!** 🎉

---

## 🙏 Attribution

**Wajib mencantumkan BMKG sebagai sumber data:**
```html
<p>Data cuaca bersumber dari BMKG (Badan Meteorologi, Klimatologi, dan Geofisika)</p>
```

Atau di footer aplikasi Anda:
```tsx
<footer>
  <p>© 2025 Web Pertanian Wonosobo</p>
  <p>Data cuaca: <strong>BMKG</strong></p>
</footer>
```
