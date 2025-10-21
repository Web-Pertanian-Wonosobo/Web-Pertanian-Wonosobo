# 🚀 Panduan Implementasi Harga Real-time

## 📋 Ringkasan

Sistem ini mengintegrasikan data harga komoditas real-time dari API Disdagkopukm Wonosobo ke dalam aplikasi Web Pertanian Wonosobo.

### ✨ Fitur Utama:
- ✅ Fetch data harga real-time dari API eksternal
- ✅ Sinkronisasi data ke database lokal
- ✅ Auto-refresh setiap 5 menit di frontend
- ✅ Multiple endpoints (komoditas, produk, produk-komoditas)
- ✅ Analisis tren harga otomatis
- ✅ Grouping data berdasarkan komoditas
- ✅ Error handling & loading states

---

## 🛠️ Setup Backend

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

Dependencies baru yang ditambahkan:
- `APScheduler==3.10.4` - untuk auto-sync scheduler
- `requests==2.32.3` - untuk HTTP requests ke API eksternal

### 2. Struktur File Backend

```
backend/
├── app/
│   ├── main.py                 # ✅ Updated (CORS, health check)
│   ├── scheduler.py            # ✨ New (auto-sync scheduler)
│   ├── routers/
│   │   └── market.py           # ✅ Updated (real-time endpoints)
│   ├── services/
│   │   └── market_sync.py      # ✅ Updated (multi-endpoint fetch)
│   └── models/
│       └── market_model.py     # Existing
├── requirements.txt            # ✅ Updated
└── API_DOCUMENTATION.md        # ✨ New
```

### 3. Konfigurasi Database

Pastikan tabel `market_prices` sudah ada. Jika belum, jalankan migration:

```bash
# Contoh jika menggunakan Alembic
alembic upgrade head
```

Schema tabel:
```sql
CREATE TABLE market_prices (
    price_id SERIAL PRIMARY KEY,
    user_id INTEGER,
    commodity_name VARCHAR(100),
    market_location VARCHAR(100),
    unit VARCHAR(20),
    price FLOAT,
    date DATE,
    created_at TIMESTAMP
);
```

### 4. Jalankan Backend

```bash
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 5. Test Endpoints

```bash
# Test health check
curl http://localhost:8000/health

# Test real-time prices
curl http://localhost:8000/market/realtime

# Test sync
curl -X POST http://localhost:8000/market/sync

# Test filtered prices
curl "http://localhost:8000/market/list?commodity=padi&limit=10"
```

### 6. Enable Auto-Sync (Optional)

Edit `backend/app/main.py`:

```python
# Uncomment these lines:
@app.on_event("startup")
def startup_event():
    from app.scheduler import start_scheduler
    start_scheduler()

@app.on_event("shutdown")
def shutdown_event():
    from app.scheduler import stop_scheduler
    stop_scheduler()
```

Dengan ini, backend akan otomatis sync data setiap 1 jam.

---

## 🎨 Setup Frontend

### 1. Struktur File Frontend

```
src/
├── services/
│   └── marketApi.ts            # ✨ New (API service)
components/
├── RealtimeMarketPrices.tsx    # ✨ New (real-time component)
└── PricePrediction.tsx         # Existing (bisa diupdate)
.env.example                     # ✨ New
```

### 2. Environment Variables

Copy `.env.example` ke `.env`:

```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_DISDAGKOPUKM_API_URL=https://disdagkopukm.wonosobokab.go.id/api
VITE_MARKET_REFRESH_INTERVAL=300000
```

### 3. Install Dependencies (jika diperlukan)

```bash
npm install
# atau
yarn install
```

### 4. Integrasi Komponen

#### Option A: Standalone Page

Edit `components/PageRouter.tsx`:

```tsx
import { RealtimeMarketPrices } from './RealtimeMarketPrices';

// Tambahkan route:
<Route path="/market/realtime" element={<RealtimeMarketPrices />} />
```

#### Option B: Dalam Dashboard

```tsx
import { RealtimeMarketPrices } from './RealtimeMarketPrices';

function Dashboard() {
  return (
    <div>
      {/* ... other components */}
      <RealtimeMarketPrices />
    </div>
  );
}
```

### 5. Update Navigation

Tambahkan menu di `components/Navigation.tsx`:

```tsx
<Link to="/market/realtime">
  <DollarSign className="h-4 w-4 mr-2" />
  Harga Real-time
</Link>
```

---

## 🔄 Update PricePrediction Component

Untuk mengintegrasikan data real-time ke komponen yang sudah ada:

```tsx
import { fetchRealtimeMarketPrices, formatPrice } from '@/services/marketApi';
import { useEffect, useState } from 'react';

export function PricePrediction() {
  const [realtimePrices, setRealtimePrices] = useState([]);
  
  useEffect(() => {
    const loadPrices = async () => {
      const result = await fetchRealtimeMarketPrices();
      if (result.success) {
        setRealtimePrices(result.data);
      }
    };
    
    loadPrices();
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadPrices, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  
  // Replace static marketInfo with real-time data
  const marketInfo = realtimePrices.map(price => ({
    market: price.market_location,
    commodity: price.commodity_name,
    price: formatPrice(price.price),
    updated: new Date(price.date).toLocaleString('id-ID')
  }));
  
  // ... rest of your component
}
```

---

## 📊 Contoh Penggunaan API Service

### Fetch Real-time Prices

```typescript
import { fetchRealtimeMarketPrices } from '@/services/marketApi';

const result = await fetchRealtimeMarketPrices();
console.log(result.data); // Array of prices
```

### Fetch Specific Endpoint

```typescript
import { fetchKomoditas, fetchProdukKomoditas } from '@/services/marketApi';

const komoditas = await fetchKomoditas();
const produkKomoditas = await fetchProdukKomoditas();
```

### Get Local Prices with Filter

```typescript
import { fetchLocalMarketPrices } from '@/services/marketApi';

const prices = await fetchLocalMarketPrices({
  commodity: 'padi',
  location: 'wonosobo',
  start_date: '2025-10-01',
  end_date: '2025-10-21',
  limit: 50
});
```

### Calculate Trends

```typescript
import { calculatePriceTrend, groupPricesByCommodity } from '@/services/marketApi';

// Group by commodity
const grouped = groupPricesByCommodity(prices);

// Calculate trend for each commodity
grouped.forEach((commodityPrices, commodityName) => {
  const trend = calculatePriceTrend(commodityPrices);
  console.log(`${commodityName}: ${trend.changePercent.toFixed(1)}%`);
});
```

### Format Prices

```typescript
import { formatPrice } from '@/services/marketApi';

const formatted = formatPrice(6200); // "Rp 6.200"
```

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest
```

### Frontend Tests

```bash
npm test
# atau
yarn test
```

### Manual Testing Checklist

- [ ] Backend API berjalan di port 8000
- [ ] Endpoint `/market/realtime` mengembalikan data
- [ ] Endpoint `/market/sync` berhasil menyimpan data
- [ ] Database terisi dengan data setelah sync
- [ ] Frontend dapat fetch data dari backend
- [ ] Auto-refresh bekerja setiap 5 menit
- [ ] Error handling bekerja dengan baik
- [ ] Loading states ditampilkan dengan benar

---

## 🐛 Troubleshooting

### Problem: Backend tidak dapat connect ke API eksternal

**Solution:**
1. Check koneksi internet
2. Verify API URL: `https://disdagkopukm.wonosobokab.go.id/api/`
3. Test dengan curl:
```bash
curl https://disdagkopukm.wonosobokab.go.id/api/komoditas
```

### Problem: CORS Error di Frontend

**Solution:**
Pastikan CORS sudah dikonfigurasi di `backend/app/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # atau specify domain frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Problem: Data tidak muncul di Frontend

**Solution:**
1. Check browser console untuk errors
2. Verify `VITE_API_BASE_URL` di `.env`
3. Test API dengan curl atau Postman
4. Check Network tab di DevTools

### Problem: Database error saat sync

**Solution:**
1. Check database connection
2. Verify table `market_prices` exists
3. Check user permissions
4. Review logs untuk error details

---

## 📈 Performance Optimization

### Backend Caching (Optional)

Tambahkan Redis caching untuk mengurangi load ke API eksternal:

```python
from redis import Redis
import json

redis_client = Redis(host='localhost', port=6379, db=0)

def get_cached_prices():
    cached = redis_client.get('market_prices')
    if cached:
        return json.loads(cached)
    
    # Fetch from API
    prices = fetch_realtime_market_prices()
    
    # Cache for 5 minutes
    redis_client.setex('market_prices', 300, json.dumps(prices))
    
    return prices
```

### Frontend Optimization

1. **Lazy Loading**: Load component only when needed
2. **Memoization**: Use `useMemo` untuk expensive calculations
3. **Debouncing**: Debounce search/filter inputs

---

## 🔒 Security Considerations

### API Key (jika diperlukan)

Jika API Disdagkopukm memerlukan API key:

```python
# backend/app/config.py
DISDAGKOPUKM_API_KEY = os.getenv("DISDAGKOPUKM_API_KEY")

# backend/app/services/market_sync.py
headers = {
    "Authorization": f"Bearer {DISDAGKOPUKM_API_KEY}"
}
response = requests.get(url, headers=headers)
```

### Rate Limiting

Tambahkan rate limiting di backend:

```bash
pip install slowapi
```

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter

@app.get("/market/realtime")
@limiter.limit("10/minute")
def get_realtime_prices():
    ...
```

---

## 📚 Documentation

- **API Documentation**: `backend/API_DOCUMENTATION.md`
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## 🎯 Next Steps

1. [ ] Test semua endpoint
2. [ ] Deploy ke production
3. [ ] Setup monitoring (Sentry, DataDog)
4. [ ] Add unit tests
5. [ ] Add integration tests
6. [ ] Setup CI/CD pipeline
7. [ ] Add analytics tracking
8. [ ] Performance profiling

---

## 📞 Support

Jika ada pertanyaan atau masalah:
1. Check dokumentasi API
2. Review error logs
3. Test dengan curl/Postman
4. Create GitHub issue

---

**Created:** October 21, 2025  
**Last Updated:** October 21, 2025  
**Version:** 1.0.0
