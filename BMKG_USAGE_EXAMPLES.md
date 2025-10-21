# 🚀 Cara Menambahkan Component BMKG Dashboard ke Aplikasi

## Quick Start

### 1. Import Component di PageRouter atau Dashboard
```tsx
// Di file PageRouter.tsx atau Dashboard.tsx
import { BMKGWeatherDashboard } from "./components/BMKGWeatherDashboard";

// Tambahkan di routing atau tab baru
<BMKGWeatherDashboard />
```

### 2. Contoh Integrasi di Navigation
```tsx
// Di Navigation.tsx atau AdminNavigation.tsx
const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/" },
  { name: "Cuaca BMKG", icon: Cloud, path: "/cuaca-bmkg" }, // ← BARU
  { name: "Prediksi Cuaca", icon: CloudRain, path: "/weather" },
  // ... menu lainnya
];
```

### 3. Contoh Penggunaan di Tab
```tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { BMKGWeatherDashboard } from "./BMKGWeatherDashboard";
import { WeatherPrediction } from "./WeatherPrediction";

export function WeatherPage() {
  return (
    <div className="p-6">
      <Tabs defaultValue="bmkg">
        <TabsList>
          <TabsTrigger value="bmkg">Data BMKG Langsung</TabsTrigger>
          <TabsTrigger value="prediction">Prediksi ML</TabsTrigger>
        </TabsList>

        <TabsContent value="bmkg">
          <BMKGWeatherDashboard />
        </TabsContent>

        <TabsContent value="prediction">
          <WeatherPrediction />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## Cara Menggunakan API BMKG Langsung

### A. Fetch Data BMKG (Client-Side)
```tsx
import { fetchBMKGDirect } from "./src/services/bmkgApi";

// Di dalam component
const [data, setData] = useState(null);

useEffect(() => {
  async function loadData() {
    const bmkgData = await fetchBMKGDirect("31.71.03.1001"); // Wonosobo
    setData(bmkgData);
  }
  loadData();
}, []);
```

### B. Menampilkan Data Sederhana
```tsx
import { fetchBMKGDirect } from "./src/services/bmkgApi";

export function SimpleBMKGWidget() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBMKGDirect("31.71.03.1001")
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>Error loading data</div>;

  return (
    <div className="p-4 border rounded">
      <h2 className="text-xl font-bold mb-3">
        {data.location.desa}, {data.location.kotkab}
      </h2>
      
      {data.forecasts.slice(0, 5).map((forecast, i) => (
        <div key={i} className="mb-2 p-2 bg-gray-50 rounded">
          <p className="font-medium">{forecast.local_datetime}</p>
          <p>🌡️ {forecast.t}°C | 💧 {forecast.hu}% | 🌧️ {forecast.tp}mm</p>
          <p className="text-sm">{forecast.weather_desc}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## Perbedaan Backend vs Client-Side

### Backend API (`weatherApi.ts`)
```tsx
// ✅ Menggunakan backend Python (FastAPI)
// ✅ Data disimpan di PostgreSQL
// ✅ Ada ML prediction (Prophet/Simple Moving Average)
// ✅ Cache data di database

import { fetchWeatherPredictions } from "../src/services/weatherApi";

const predictions = await fetchWeatherPredictions(3);
// → http://127.0.0.1:8000/weather/predict?days=3
```

**Keuntungan:**
- Data tersimpan dan bisa dianalisis
- Prediksi ML menggunakan historical data
- Lebih cepat (cache di database)
- Satu source of truth

### Client-Side API (`bmkgApi.ts`)
```tsx
// ✅ Langsung ke BMKG API dari browser
// ✅ Tidak perlu backend
// ✅ Data real-time dari BMKG
// ✅ Lebih detail (per jam)

import { fetchBMKGDirect } from "../src/services/bmkgApi";

const bmkgData = await fetchBMKGDirect("31.71.03.1001");
// → https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=31.71.03.1001
```

**Keuntungan:**
- Data paling update dari BMKG
- Detail per jam untuk 3 hari
- Tidak tergantung backend
- Lebih lengkap (visibility, weather icons, dll)

---

## Kombinasi Terbaik

### Gunakan Keduanya untuk Fitur Berbeda:

```tsx
import { fetchWeatherPredictions } from "../src/services/weatherApi"; // Backend ML
import { fetchBMKGDirect } from "../src/services/bmkgApi"; // BMKG Direct

export function ComprehensiveWeather() {
  const [mlPredictions, setMlPredictions] = useState([]);
  const [bmkgData, setBmkgData] = useState(null);

  useEffect(() => {
    // Ambil prediksi ML dari backend (7-30 hari ke depan)
    fetchWeatherPredictions(7).then(setMlPredictions);
    
    // Ambil data detail dari BMKG (3 hari per jam)
    fetchBMKGDirect("31.71.03.1001").then(setBmkgData);
  }, []);

  return (
    <div>
      {/* Detail 3 hari dari BMKG */}
      <section>
        <h2>Prakiraan Detail 3 Hari (BMKG)</h2>
        {bmkgData && <BMKGWeatherDashboard />}
      </section>

      {/* Prediksi ML 7 hari */}
      <section>
        <h2>Prediksi Machine Learning 7 Hari</h2>
        <WeatherPrediction />
      </section>
    </div>
  );
}
```

---

## Kode Lokasi Wonosobo

```typescript
import { WONOSOBO_ADM4_CODES } from "../src/services/bmkgApi";

// Pilih lokasi
const lokasi = WONOSOBO_ADM4_CODES.KERTEK;
const data = await fetchBMKGDirect(lokasi);
```

**Kecamatan yang tersedia:**
- WONOSOBO: `31.71.03.1001`
- KERTEK: `31.71.01.1001`
- GARUNG: `31.71.02.1001`
- LEKSONO: `31.71.04.1001`
- KALIWIRO: `31.71.05.1001`
- SUKOHARJO: `31.71.06.1001`
- SAPURAN: `31.71.07.1001`
- KALIBAWANG: `31.71.08.1001`
- KALIKAJAR: `31.71.09.1001`
- KEPIL: `31.71.10.1001`
- MOJOTENGAH: `31.71.11.1001`
- SELOMERTO: `31.71.12.1001`
- WADASLINTANG: `31.71.13.1001`
- WATUMALANG: `31.71.14.1001`
- KEJAJAR: `31.71.15.1001`

---

## Troubleshooting

### CORS Error
Jika ada error CORS saat fetch dari browser:
```
Access to fetch at 'https://api.bmkg.go.id/...' has been blocked by CORS policy
```

**Solusi:** BMKG API sudah support CORS, tapi jika masih error:
1. Gunakan backend sebagai proxy
2. Atau gunakan endpoint backend yang sudah ada

### Data Tidak Muncul
```tsx
// Tambahkan error handling
const data = await fetchBMKGDirect("31.71.03.1001");
if (!data) {
  console.error("Failed to fetch BMKG data");
}
```

### Gambar Icon Tidak Tampil
Icon BMKG kadang ada space di URL, sudah ditangani di code:
```typescript
// Di bmkgApi.ts sudah ada handler
const cleanUrl = forecast.image.replace(/ /g, "%20");
```

---

## Best Practices

### 1. Caching Data
```tsx
// Simpan di localStorage untuk mengurangi request
const CACHE_KEY = "bmkg_data_cache";
const CACHE_DURATION = 30 * 60 * 1000; // 30 menit

const getCachedData = () => {
  const cached = localStorage.getItem(CACHE_KEY);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }
  }
  return null;
};

const setCachedData = (data) => {
  localStorage.setItem(
    CACHE_KEY,
    JSON.stringify({ data, timestamp: Date.now() })
  );
};
```

### 2. Loading States
```tsx
if (loading) return <Skeleton />;
if (error) return <ErrorMessage error={error} onRetry={loadData} />;
if (!data) return <EmptyState />;
```

### 3. Refresh Button
```tsx
<button onClick={loadBMKGData} disabled={loading}>
  {loading ? "Memuat..." : "🔄 Refresh Data"}
</button>
```

---

## Kesimpulan

✅ Backend API → Prediksi ML jangka panjang (7-30 hari)  
✅ BMKG Direct API → Detail real-time per jam (3 hari)  
✅ Kombinasi keduanya → Aplikasi cuaca yang lengkap!

**File yang sudah dibuat:**
1. `src/services/bmkgApi.ts` - API service untuk BMKG
2. `components/BMKGWeatherDashboard.tsx` - Component UI lengkap
3. `BMKG_INTEGRATION_GUIDE.md` - Dokumentasi lengkap

**Tinggal:**
1. Import component di routing/navigation
2. Tambahkan menu atau tab baru
3. Deploy dan test! 🚀
