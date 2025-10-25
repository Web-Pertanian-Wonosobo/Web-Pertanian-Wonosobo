# 🗺️ Analisis Lereng dengan Google Elevation API

## ⚡ Quick Start

### 1. Setup API Key
```bash
# Copy file environment
cp .env.example .env

# Edit .env dan tambahkan Google Maps API Key
VITE_GOOGLE_MAPS_API_KEY=AIzaSy...
```

### 2. Dapatkan Google Maps API Key
1. Buka https://console.cloud.google.com/
2. Aktifkan **Elevation API**
3. Buat API Key
4. Copy ke file `.env`

### 3. Jalankan Aplikasi
```bash
npm run dev
```

### 4. Gunakan Fitur
1. Buka menu **Analisis Lereng**
2. Isi nama lokasi
3. Klik **"Analisis Slope Otomatis"**
4. Lihat hasil analisis kemiringan

## 📊 Hasil Analisis

- **Kemiringan** (% dan derajat)
- **Tingkat Risiko** (Rendah/Sedang/Tinggi)
- **Rekomendasi** tindakan mitigasi
- **Laporan** downloadable

## 📖 Dokumentasi Lengkap

Lihat [SLOPE_ANALYSIS_GUIDE.md](./SLOPE_ANALYSIS_GUIDE.md) untuk:
- Penjelasan detail algoritma
- Troubleshooting
- Best practices
- API limits & pricing

## 🎯 Klasifikasi Risiko

| Slope | Risiko | Warna | Tindakan |
|-------|---------|-------|----------|
| ≤ 20% | Rendah | 🟢 Hijau | Aman untuk pertanian |
| 21-30% | Sedang | 🟡 Kuning | Perlu monitoring |
| > 30% | Tinggi | 🔴 Merah | Hindari & evakuasi |

## ⚠️ Catatan Penting

- Google Elevation API **GRATIS** untuk 40,000 requests/bulan
- Akurasi ±10-15 meter
- Untuk keputusan kritis, kombinasikan dengan survey lapangan
