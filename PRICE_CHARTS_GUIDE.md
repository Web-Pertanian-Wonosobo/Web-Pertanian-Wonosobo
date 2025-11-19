# 📊 Grafik Harga Komoditas - Dokumentasi

## Overview
Fitur grafik harga komoditas untuk visualisasi data pasar real-time dan historis sampai 1 tahun terakhir.

## Fitur Utama

### 1. **Visualisasi Multi-Chart**
- **Line Chart**: Tren pergerakan harga
- **Area Chart**: Visualisasi area harga dengan gradient
- **Bar Chart**: Perbandingan harga antar periode

### 2. **Filter Data**
- **Pilih Komoditas**: Dropdown untuk memilih komoditas yang ingin divisualisasikan
- **Rentang Waktu**:
  - 7 Hari Terakhir
  - 30 Hari Terakhir
  - 90 Hari Terakhir
  - 1 Tahun Terakhir

### 3. **Statistik Real-time**
- **Harga Saat Ini**: Harga terbaru dengan badge perubahan
- **Harga Rata-rata**: Average price dalam periode
- **Harga Tertinggi**: Maximum price (merah)
- **Harga Terendah**: Minimum price (biru)

### 4. **Interactive Charts**
- Tooltip detail saat hover
- Format Rupiah otomatis
- Responsive design (mobile-friendly)
- Smooth animations

## Komponen

### File: `components/PriceCharts.tsx`

**Dependencies:**
```tsx
import { fetchAllKomoditas } from "../src/services/komoditasApi";
import { LineChart, BarChart, AreaChart } from "recharts";
import { Card, Select, Tabs, Badge } from "shadcn/ui";
```

**Data Source:**
- Backend API: `GET /market/list?limit=1000`
- Database: `market_prices` table
- Real-time sync dengan data Disdagkopukm

## Navigasi

Menu baru ditambahkan di:
- **PublicNavigation.tsx**: Icon BarChart3
- **PageRouter.tsx**: Route `price-charts`

## Cara Menggunakan

1. **Buka Aplikasi**
   ```
   npm run dev
   ```

2. **Navigasi ke Grafik Harga**
   - Klik menu "Grafik Harga" (icon BarChart3)
   - Atau akses: `http://localhost:5173/?page=price-charts`

3. **Filter Data**
   - Pilih komoditas dari dropdown (contoh: Strawberry, Kubis, Tomat)
   - Pilih rentang waktu (7d, 30d, 90d, 1y)

4. **Explore Visualisasi**
   - Tab "Line Chart": Lihat tren
   - Tab "Area Chart": Lihat area coverage
   - Tab "Bar Chart": Bandingkan periode

5. **Analisis Data**
   - Lihat statistik cards di atas grafik
   - Hover pada chart untuk detail
   - Check badge untuk perubahan harga (% change)

## Technical Details

### Data Processing
```typescript
// Filter by time range
const filterByTimeRange = (data: Komoditas[]): Komoditas[] => {
  const daysAgo = timeRange === "7d" ? 7 : 
                  timeRange === "30d" ? 30 : 
                  timeRange === "90d" ? 90 : 365;
  
  const cutoffDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  return data.filter(item => new Date(item.tanggal) >= cutoffDate);
}
```

### Chart Configuration
- **Width**: 100% (responsive)
- **Height**: 400px
- **Colors**: 
  - Primary: `#10b981` (green-500)
  - Success: `#10b981`
  - Danger: Red gradient
  - Info: Blue gradient

### Statistics Calculation
```typescript
const stats = {
  currentPrice: prices[prices.length - 1],
  avgPrice: sum(prices) / prices.length,
  minPrice: Math.min(...prices),
  maxPrice: Math.max(...prices),
  priceChange: currentPrice - previousPrice,
  priceChangePercent: (change / previous) * 100
}
```

## Data Flow

```
Database (PostgreSQL)
    ↓
Backend API (/market/list)
    ↓
fetchAllKomoditas()
    ↓
PriceCharts Component
    ↓
Filter by Commodity + Time Range
    ↓
Calculate Statistics
    ↓
Render Charts (Line/Area/Bar)
```

## Performance

- **Lazy Loading**: Data loaded on component mount
- **Memoization**: Chart data cached per filter change
- **Debounce**: Filter changes debounced
- **Pagination**: Backend supports limit parameter

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Troubleshooting

### No Data Displayed
**Solusi:**
1. Check backend running: `http://127.0.0.1:8000/docs`
2. Verify database has data: Check Dashboard commodity count
3. Try different time range or commodity

### Chart Not Rendering
**Solusi:**
1. Check console for errors
2. Verify Recharts installed: `npm list recharts`
3. Clear browser cache

### Slow Performance
**Solusi:**
1. Reduce time range (use 7d instead of 1y)
2. Check network tab for slow API calls
3. Optimize database query with indexes

## Future Enhancements

- [ ] Export chart as PNG/PDF
- [ ] Compare multiple commodities
- [ ] Add prediction overlay (combine with ML forecast)
- [ ] Real-time updates (WebSocket)
- [ ] Custom date range picker
- [ ] Download data as CSV/Excel
- [ ] Share chart via URL/Social Media

## API Endpoints Used

```typescript
// Get all commodities with historical data
GET /market/list?limit=1000

// Response format:
{
  success: boolean;
  total: number;
  data: Array<{
    commodity_name: string;
    price: number;
    date: string;
    unit: string;
    market_location: string;
  }>;
}
```

## Component Props

```typescript
interface PriceChartsProps {
  // No props required - fully self-contained
}

// Internal state:
interface State {
  allData: Komoditas[];           // Raw data from API
  chartData: ChartDataPoint[];    // Processed for charts
  selectedCommodity: string;      // Selected filter
  timeRange: "7d" | "30d" | "90d" | "1y";
  stats: CommodityStats | null;   // Calculated statistics
  loading: boolean;
}
```

## Styling

- **Theme**: Tailwind CSS
- **Components**: shadcn/ui
- **Colors**: Green palette (agriculture theme)
- **Typography**: Inter font family
- **Spacing**: 4px grid system

## Accessibility

- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ ARIA labels
- ✅ Color contrast WCAG AA
- ✅ Focus indicators

## Changelog

### Version 1.0.0 (2025-01-19)
- ✨ Initial release
- 📊 Line, Area, Bar charts
- 🎯 Commodity filter
- ⏰ Time range filter (7d-1y)
- 📈 Real-time statistics
- 📱 Responsive design
- 🎨 Interactive tooltips

---

**Status**: ✅ Production Ready  
**Last Updated**: 2025-01-19  
**Author**: EcoScope Development Team
