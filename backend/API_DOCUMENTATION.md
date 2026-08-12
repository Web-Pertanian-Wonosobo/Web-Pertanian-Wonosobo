# 📚 API Documentation - Market Price Integration

## 🌐 Base URL
```
Production Source: https://disdagkopukm.wonosobokab.go.id/harga-pasar
Local Backend: http://localhost:8000
```

---

## 🔥 Endpoint Sumber Real-time (Disdagkopukm Wonosobo)

```http
GET https://disdagkopukm.wonosobokab.go.id/harga-pasar
```

Data harga dibaca dari tabel pada halaman tersebut (scraping server-side).

---

## 🚀 Backend API Endpoints (Local)

### 1. Get Real-time Market Prices (Aggregated)

**Endpoint:**
```http
GET /market/realtime
```

**Description:** Mengambil data harga real-time dari halaman `harga-pasar` dan menggabungkannya.

**Response:**
```json
{
  "success": true,
  "total": 45,
  "data": [
    {
      "commodity_name": "Padi",
      "category": "Pangan",
      "unit": "kg",
      "price": 6200,
      "market_location": "Wonosobo",
      "date": "2025-10-21",
      "source": "harga-pasar"
    },
    {
      "commodity_name": "Cabai Merah",
      "category": "Sayuran",
      "unit": "kg",
      "price": 35000,
      "market_location": "Wonosobo",
      "date": "2025-10-21",
      "source": "harga-pasar"
    }
  ],
  "timestamp": "2025-10-21T10:30:00"
}
```

---

### 2. Get Real-time Komoditas

**Endpoint:**
```http
GET /market/realtime/komoditas
```

**Description:** Mengambil data komoditas langsung dari halaman `harga-pasar`.

**Response:**
```json
{
  "success": true,
  "total": 15,
  "data": [...],
  "source": "https://disdagkopukm.wonosobokab.go.id/harga-pasar"
}
```

---

### 3. Get Real-time Produk Komoditas

**Endpoint:**
```http
GET /market/realtime/produk-komoditas
```

**Description:** Mengambil data produk komoditas langsung dari halaman `harga-pasar`.

**Response:**
```json
{
  "success": true,
  "total": 20,
  "data": [...],
  "source": "https://disdagkopukm.wonosobokab.go.id/harga-pasar"
}
```

---

### 4. Get Real-time Produk

**Endpoint:**
```http
GET /market/realtime/produk
```

**Description:** Mengambil data produk langsung dari halaman `harga-pasar`.

**Response:**
```json
{
  "success": true,
  "total": 10,
  "data": [...],
  "source": "https://disdagkopukm.wonosobokab.go.id/harga-pasar"
}
```

---

### 5. Sync Market Data to Database

**Endpoint:**
```http
POST /market/sync
```

**Description:** Mengambil data dari API dan menyimpannya ke database lokal untuk analisis historis.

**Response:**
```json
{
  "message": "25 data berhasil disimpan ke database.",
  "total_fetched": 45
}
```

---

### 6. Get Market Prices from Local Database

**Endpoint:**
```http
GET /market/list
```

**Query Parameters:**
- `commodity` (optional): Filter by commodity name
- `location` (optional): Filter by market location
- `start_date` (optional): Filter from date (YYYY-MM-DD)
- `end_date` (optional): Filter to date (YYYY-MM-DD)
- `limit` (optional): Maximum results (default: 100)

**Example:**
```http
GET /market/list?commodity=padi&location=wonosobo&limit=50
```

**Response:**
```json
{
  "success": true,
  "total": 50,
  "data": [
    {
      "price_id": 1,
      "commodity_name": "Padi",
      "market_location": "Wonosobo",
      "unit": "kg",
      "price": 6200,
      "date": "2025-10-21",
      "created_at": "2025-10-21T10:00:00"
    }
  ]
}
```

---

### 7. Add Market Price (Manual)

**Endpoint:**
```http
POST /market/add
```

**Request Body:**
```json
{
  "user_id": 1,
  "commodity_name": "Padi",
  "market_location": "Wonosobo",
  "unit": "kg",
  "price": 6200,
  "date": "2025-10-21"
}
```

**Response:**
```json
{
  "message": "Data harga berhasil disimpan",
  "data": 123
}
```

---

## 💻 Frontend Integration

### Using the Market API Service

```typescript
import {
  fetchRealtimeMarketPrices,
  fetchKomoditas,
  syncMarketData,
  formatPrice,
  calculatePriceTrend
} from '@/services/marketApi';

// Get real-time prices
const prices = await fetchRealtimeMarketPrices();
console.log(prices.data); // Array of market prices

// Get specific komoditas
const komoditas = await fetchKomoditas();

// Sync data to database
const syncResult = await syncMarketData();

// Format price
const formatted = formatPrice(6200); // "Rp 6.200"

// Calculate trend
const trend = calculatePriceTrend(prices.data);
console.log(trend.changePercent); // +2.5
```

---

## 🔄 Auto-Sync Configuration

### Scheduled Sync (Backend)

Add to `backend/app/main.py`:

```python
from apscheduler.schedulers.background import BackgroundScheduler
from app.services.market_sync import fetch_and_save_market_data

scheduler = BackgroundScheduler()

@app.on_event("startup")
def start_scheduler():
    # Sync every hour
    scheduler.add_job(
        fetch_and_save_market_data,
        'interval',
        hours=1,
        id='market_sync'
    )
    scheduler.start()

@app.on_event("shutdown")
def shutdown_scheduler():
    scheduler.shutdown()
```

### Install Dependencies

```bash
pip install apscheduler
```

---

## 📊 Data Structure

### MarketPrice Model
```python
{
  "price_id": Integer,
  "user_id": Integer,
  "commodity_name": String(100),
  "market_location": String(100),
  "unit": String(20),
  "price": Float,
  "date": Date,
  "created_at": Timestamp
}
```

---

## 🛠️ Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message here",
  "data": []
}
```

HTTP Status Codes:
- `200`: Success
- `400`: Bad Request
- `404`: Not Found
- `500`: Internal Server Error

---

## 🔐 Environment Variables

Create `.env` file:

```env
# Backend
DATABASE_URL=postgresql://user:password@localhost/dbname

# Frontend
VITE_API_BASE_URL=http://localhost:8000
```

---

## 📝 Testing API

### Using cURL

```bash
# Get real-time prices
curl http://localhost:8000/market/realtime

# Sync data
curl -X POST http://localhost:8000/market/sync

# Get local prices with filter
curl "http://localhost:8000/market/list?commodity=padi&limit=10"
```

### Using JavaScript (Browser Console)

```javascript
// Test real-time API
fetch('http://localhost:8000/market/realtime')
  .then(res => res.json())
  .then(data => console.log(data));

// Test sync
fetch('http://localhost:8000/market/sync', { method: 'POST' })
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## 📱 Frontend Component Example

```tsx
import { useEffect, useState } from 'react';
import { fetchRealtimeMarketPrices, MarketPrice } from '@/services/marketApi';

export function MarketPrices() {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPrices = async () => {
      setLoading(true);
      const result = await fetchRealtimeMarketPrices();
      if (result.success) {
        setPrices(result.data);
      }
      setLoading(false);
    };
    
    loadPrices();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadPrices, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {prices.map((price, idx) => (
        <div key={idx}>
          <h3>{price.commodity_name}</h3>
          <p>Rp {price.price.toLocaleString()}</p>
          <p>{price.market_location}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## ✅ Checklist Implementation

- [x] Create market_sync.py service
- [x] Create market router with real-time endpoints
- [x] Create marketApi.ts service for frontend
- [x] Add error handling
- [x] Add data parsing functions
- [ ] Add auto-sync scheduler (optional)
- [ ] Add caching mechanism (optional)
- [ ] Add rate limiting (optional)

---

## 📞 Support

For issues or questions:
- Email: support@ecoscope.id
- GitHub Issues: [repository-url]

---

**Last Updated:** October 21, 2025
**Version:** 1.0.0
