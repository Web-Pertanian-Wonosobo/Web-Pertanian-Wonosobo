# 🌤️ MIGRASI DARI BMKG KE OPENWEATHER API

## 📋 Perubahan yang Dibuat

### ✅ Backend Changes
1. **Environment Configuration** (`.env`)
   - Tambah `OPENWEATHER_API_KEY=803399b54a5c001328d36698c5a25317`
   - Tambah `OPENWEATHER_BASE_URL=https://api.openweathermap.org/data/2.5`

2. **Service Layer** (`app/services/ai_weather.py`)
   - Ganti BMKG API dengan OpenWeather API
   - Update koordinat kecamatan Wonosobo
   - Implementasi current weather + 5-day forecast
   - Update logging messages

3. **Scheduler & Router Updates**
   - Update scheduler job logging
   - Update sync endpoint documentation

### ✅ Frontend Changes  
1. **New OpenWeather Service** (`frontend/src/services/openWeatherApi.ts`)
   - Direct OpenWeather API integration
   - Koordinat semua kecamatan di Wonosobo
   - Helper functions untuk data processing

2. **Component Updates** (`WeatherPrediction.tsx`)
   - Replace BMKG references dengan OpenWeather
   - Update tab "Prakiraan BMKG" → "Prakiraan OpenWeather"
   - Implementasi fetch dari OpenWeather API

## 🔑 OpenWeather API Details

### API Key yang Digunakan:
```
803399b54a5c001328d36698c5a25317
```

### Endpoints yang Diakses:
```
# Current Weather
GET https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={apikey}&units=metric

# 5-Day Forecast  
GET https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={apikey}&units=metric
```

### Koordinat Kecamatan Wonosobo:
```javascript
{
  'Wadaslintang': { lat: -7.5167, lon: 109.9167 },
  'Kalikajar': { lat: -7.3833, lon: 109.7500 },
  'Wonosobo': { lat: -7.3667, lon: 109.9000 },
  'Leksono': { lat: -7.3833, lon: 109.8500 },
  'Kertek': { lat: -7.4167, lon: 109.8833 },
  'Garung': { lat: -7.4500, lon: 109.8667 },
  'Kaliwiro': { lat: -7.4333, lon: 109.8167 },
  'Kalibawang': { lat: -7.4833, lon: 109.8833 },
  'Selomerto': { lat: -7.4667, lon: 109.9167 },
  'Kejajar': { lat: -7.3500, lon: 109.8000 },
  'Mojotengah': { lat: -7.4000, lon: 109.9500 }
}
```

## 🚀 Testing

### Backend API Test:
```bash
# Test sync endpoint
curl -X POST http://127.0.0.1:8000/weather/sync

# Test current weather 
curl http://127.0.0.1:8000/weather/current

# Test predictions
curl http://127.0.0.1:8000/weather/predict?days=7&location=Wonosobo
```

### Expected Response Format:
```json
{
  "status": "success", 
  "message": "Berhasil sinkron 44 data dari OpenWeather",
  "records": 44
}
```

## 📊 Data Mapping

### OpenWeather → Database:
- `main.temp` → `temperature` 
- `main.humidity` → `humidity`
- `rain.1h` / `rain.3h` → `rainfall`  
- `wind.speed` (m/s) → `wind_speed` (km/h)
- `coord` → `location_name`

### Advantages over BMKG:
✅ **Real-time data** - Updated setiap jam  
✅ **Global coverage** - Tidak terbatas Indonesia  
✅ **Reliable API** - 99.9% uptime  
✅ **Rich data** - More weather parameters  
✅ **JSON format** - Easy to parse  

## 🔧 Troubleshooting

### Common Issues:
1. **API Key Invalid**: Check `.env` file dan pastikan key benar
2. **Rate Limit**: OpenWeather free tier = 1000 calls/day
3. **Network Error**: Check internet connection
4. **Koordinat Wrong**: Verify lat/lon untuk kecamatan

### Debug Commands:
```python
# Check API key loading
from dotenv import load_dotenv
import os
load_dotenv()
print(os.getenv('OPENWEATHER_API_KEY'))

# Test API call
import requests
url = "https://api.openweathermap.org/data/2.5/weather?lat=-7.3667&lon=109.9&appid=803399b54a5c001328d36698c5a25317&units=metric"
response = requests.get(url)
print(response.json())
```

## 🎯 Next Steps

1. **Monitor Usage**: Track API calls untuk avoid rate limiting
2. **Cache Strategy**: Implement caching untuk reduce API calls  
3. **Backup Plan**: Keep BMKG as fallback jika OpenWeather down
4. **Enhanced Features**: Add weather alerts, satellite images
5. **Mobile App**: Extend untuk mobile platforms

---

**Migration Date**: November 28, 2025  
**Status**: ✅ COMPLETED  
**Impact**: All weather data sources now using OpenWeather API