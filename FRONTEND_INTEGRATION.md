# Frontend Integration - Weather Prediction

## 🎯 Update Summary

Frontend WeatherPrediction.tsx telah diupdate untuk mengintegrasikan **Backend ML Predictions API** sambil tetap mempertahankan **BMKG API** untuk data real-time.

---

## ✨ Fitur Baru

### 1. **Tab Prediksi AI/ML** (Baru!)
- Menampilkan prediksi suhu dari backend ML model
- Visualisasi dengan cards untuk setiap hari
- Grafik prediksi dengan upper/lower bounds
- Info box tentang metodologi ML

### 2. **Status Indicator**
- Badge "ML Active" ketika backend terhubung
- Badge "ML Offline" ketika backend tidak tersedia
- Automatic fallback jika backend down

### 3. **Comparison Chart** 
- Tab "Grafik Detail" sekarang menampilkan perbandingan
- BMKG Forecast vs ML Prediction
- Side-by-side comparison untuk validasi

### 4. **Weather API Service** (`src/services/weatherApi.ts`)
- Centralized API calls
- TypeScript interfaces
- Error handling
- Easy maintenance

---

## 🔌 Endpoints yang Digunakan

### Backend API (http://localhost:8000)
```typescript
// 1. Get ML Predictions
GET /weather/predict?days=7
Response: { status: "success", predictions: [...] }

// 2. Get Current Weather Data (future use)
GET /weather/current
Response: { status: "success", data: [...] }

// 3. Sync Weather Data (future use)
POST /weather/sync
Response: { status: "success", message: "...", records: 24 }
```

### BMKG API (Direct)
```typescript
GET https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4={code}
```

---

## 📊 Data Flow

```
┌─────────────────┐
│   Frontend      │
│ (React/TSX)     │
└────────┬────────┘
         │
         ├──────────────────┐
         │                  │
         ▼                  ▼
┌────────────────┐  ┌──────────────┐
│  BMKG API      │  │ Backend API  │
│  (Real-time)   │  │ (ML Model)   │
└────────────────┘  └──────┬───────┘
         │                  │
         │                  ▼
         │          ┌──────────────┐
         │          │  Database    │
         │          │ (PostgreSQL) │
         │          └──────────────┘
         │
         ▼
┌─────────────────────────────┐
│  Combined Display           │
│  - BMKG Forecast (Weekly)   │
│  - ML Predictions (7 days)  │
│  - Comparison Charts        │
└─────────────────────────────┘
```

---

## 🚀 How to Use

### Start Backend
```bash
cd backend
uvicorn app.main:app --reload
```

### Start Frontend
```bash
npm run dev
```

### Access
```
http://localhost:5173
```

---

## 📱 UI Components

### Tabs
1. **Prakiraan 3 Harian** - BMKG real-time forecast
2. **Prediksi AI/ML** - Backend ML predictions (NEW!)
3. **Prediksi Bulanan** - Hardcoded recommendations
4. **Grafik Detail** - Charts + comparison (UPDATED!)
5. **Riwayat** - Historical data

### New Elements
- **ML Status Badge** - Shows backend connection status
- **Prediction Cards** - Visual representation of ML predictions
- **Temperature Range Bar** - Shows confidence interval
- **Comparison Chart** - BMKG vs ML side-by-side

---

## 🔧 Configuration

### Change Backend URL
Edit `src/services/weatherApi.ts`:
```typescript
const API_BASE_URL = "http://localhost:8000"; // Change here
```

### Change Prediction Days
In component:
```typescript
const predictions = await fetchBackendPredictions(7); // Change number
```

---

## 🐛 Troubleshooting

### Backend Not Connected
- Check if uvicorn server is running
- Verify `http://localhost:8000/health`
- Check CORS settings in backend
- Frontend will still work with BMKG data only

### ML Predictions Empty
- Backend might be syncing data
- Try POST `/weather/sync` to manually sync
- Check backend logs for errors

### CORS Errors
Backend should have:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## 📦 Dependencies

### Frontend
```json
{
  "react": "^18.x",
  "recharts": "^2.x",
  "lucide-react": "^0.x"
}
```

### Backend
```python
fastapi
uvicorn
sqlalchemy
psycopg2-binary
pandas
numpy
prophet (optional)
```

---

## 🎨 Styling

Uses **shadcn/ui** components:
- Card
- Badge
- Button
- Tabs
- Select
- Custom icons from lucide-react

---

## 📈 Future Enhancements

- [ ] Add refresh button for manual sync
- [ ] Show prediction accuracy metrics
- [ ] Add more ML models comparison
- [ ] Historical data visualization
- [ ] Export predictions to PDF
- [ ] Real-time updates with WebSocket
- [ ] Notification for extreme weather

---

## 👨‍💻 Developer Notes

### File Structure
```
components/
  └── WeatherPrediction.tsx    (Main component)
src/
  └── services/
      └── weatherApi.ts         (API service layer)
backend/
  └── app/
      ├── routers/
      │   └── weather.py        (API endpoints)
      └── services/
          └── ai_weather.py     (ML logic)
```

### Key Functions
```typescript
// Fetch from backend
fetchWeatherPredictions(days: number)

// Fetch from BMKG
fetchBMKGData(adm4Code: string)

// Process BMKG data
convertForecastToWeekly(forecast: any)
```

---

## ✅ Testing Checklist

- [x] Backend API connection
- [x] ML predictions display
- [x] BMKG data still working
- [x] Charts rendering correctly
- [x] Responsive design
- [x] Error handling
- [x] Loading states
- [x] Fallback mechanisms

---

## 📞 Support

Jika ada masalah:
1. Check browser console for errors
2. Check backend terminal for logs
3. Verify database connection
4. Check BMKG API status

---

**Status**: ✅ READY FOR PRODUCTION
**Last Updated**: October 21, 2025
