# 🗺️ Panduan Prediksi Cuaca Berdasarkan Koordinat

## Overview
Sistem prediksi cuaca telah diupgrade untuk mendukung **prediksi berdasarkan koordinat spesifik** tanpa menggunakan interpolasi. Sistem ini langsung mengambil data cuaca dari OpenWeather API berdasarkan koordinat geografis yang diberikan.

## 🚀 Fitur Baru

### 1. Prediksi Berdasarkan Koordinat
- **Endpoint**: `GET /weather/predict/coordinates`
- **Method**: Direct API call ke OpenWeather (tanpa interpolasi)
- **Model**: Prophet ML untuk prediksi akurat

### 2. Sinkronisasi Data Koordinat
- **Endpoint**: `POST /weather/sync/coordinates`
- **Fungsi**: Mengambil data real-time untuk koordinat spesifik
- **Data**: Current weather + 5-day forecast (setiap 3 jam)

## 📊 API Endpoints

### Prediksi Cuaca Koordinat
```
GET /weather/predict/coordinates
```

**Parameters:**
- `lat` (required): Latitude (-90 to 90)
- `lon` (required): Longitude (-180 to 180) 
- `location_name` (optional): Nama lokasi custom
- `days` (optional): Jumlah hari prediksi (default: 7)

**Example Request:**
```bash
GET /weather/predict/coordinates?lat=-7.3667&lon=109.9000&location_name=Wonosobo_Center&days=5
```

**Example Response:**
```json
{
  "status": "success",
  "coordinates": {"lat": -7.3667, "lon": 109.9},
  "location_name": "Wonosobo_Center",
  "predictions": [
    {
      "date": "2025-12-04",
      "predicted_temp": 22.97,
      "lower_bound": 19.79,
      "upper_bound": 26.11,
      "source": "Prophet ML (OpenWeather Direct) - Wonosobo_Center"
    }
  ],
  "method": "Direct OpenWeather API (No Interpolation)"
}
```

### Sinkronisasi Data Koordinat
```
POST /weather/sync/coordinates
```

**Parameters:**
- `lat` (required): Latitude
- `lon` (required): Longitude
- `location_name` (optional): Nama lokasi custom

**Example Request:**
```bash
POST /weather/sync/coordinates?lat=-7.4&lon=109.95&location_name=Custom_Location
```

**Example Response:**
```json
{
  "status": "success",
  "message": "Berhasil sinkron 41 data untuk Custom_Location dari OpenWeather",
  "coordinates": {"lat": -7.4, "lon": 109.95},
  "location_name": "Custom_Location",
  "records": 41
}
```

## 🔧 Backend Functions

### New Functions Added:

1. **`fetch_weather_by_coordinates(lat, lon, location_name)`**
   - Mengambil data cuaca untuk koordinat spesifik
   - Mengembalikan current weather + 5-day forecast
   - Error handling untuk koordinat invalid

2. **`predict_weather_by_coordinates(db, lat, lon, location_name, days_ahead)`**
   - Prediksi menggunakan Prophet ML
   - Fallback ke Simple Moving Average jika Prophet gagal
   - Otomatis fetch data fresh jika tidak ada data historis

3. **`predict_weather_simple_by_coordinates(db, lat, lon, location_name, days_ahead)`**
   - Fallback Simple Moving Average untuk koordinat spesifik
   - Menggunakan 7-day window untuk perhitungan rata-rata

## 🎯 Keuntungan Sistem Baru

### ✅ Tanpa Interpolasi
- **Lebih Akurat**: Data langsung dari OpenWeather API
- **Real-time**: Selalu menggunakan data cuaca terbaru
- **Spesifik**: Prediksi sesuai koordinat exact yang diminta

### ✅ Flexible Location Support
- **Custom Coordinates**: Bisa input koordinat apa saja
- **Named Locations**: Support nama lokasi custom
- **Validation**: Auto-validate koordinat range

### ✅ Robust Error Handling
- **Coordinate Validation**: Cek range lat/lon
- **API Fallbacks**: SMA jika Prophet gagal
- **Fresh Data**: Auto-fetch jika tidak ada data historis

## 🗺️ Contoh Koordinat Wonosobo

```
Wonosobo Kota: -7.3667, 109.9000
Dieng Plateau: -7.2167, 109.9167
Garung: -7.4500, 109.8667
Kertek: -7.4167, 109.8833
Selomerto: -7.4667, 109.9167
```

## 🔄 Backward Compatibility

Fungsi lama (`predict_weather()`) masih tersedia dengan enhancement:
- Auto-detect koordinat untuk lokasi yang ada di `DISTRICTS`
- Fallback ke metode lama untuk compatibility
- No breaking changes untuk existing code

## 🚀 Usage in Frontend

Frontend dapat menggunakan koordinat user's location:

```javascript
// Get user coordinates
navigator.geolocation.getCurrentPosition(async (position) => {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;
  
  // Predict weather for user location
  const response = await fetch(`/weather/predict/coordinates?lat=${lat}&lon=${lon}&days=7`);
  const data = await response.json();
  
  console.log('Weather prediction for your location:', data);
});
```

## 📈 Performance Benefits

- **Faster**: No interpolation calculations
- **More Accurate**: Direct API data
- **Scalable**: Support unlimited locations
- **Reliable**: Less complex logic, fewer failure points

---

**🌤️ Sistem prediksi cuaca Wonosobo kini mendukung prediksi berdasarkan koordinat dengan akurasi tinggi tanpa interpolasi!**