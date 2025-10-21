# 🚀 Quick Start - Data BMKG Dashboard

## ✅ Implementasi Selesai!

Dashboard Data BMKG telah berhasil ditambahkan ke aplikasi Web Pertanian Wonosobo.

---

## 📍 Akses Dashboard BMKG

### 1. **Dari Menu Navigasi**
Setelah aplikasi berjalan, Anda akan melihat menu baru:

**Desktop:**
- Buka sidebar kiri
- Klik **"Data BMKG"** (icon ☁️ Cloud)

**Mobile:**
- Tap menu hamburger (☰)
- Pilih **"Data BMKG"**

### 2. **Page ID dalam Routing**
```typescript
// Di App.tsx atau PageRouter.tsx
onPageChange('bmkg-weather')
```

---

## 🎯 Fitur Dashboard BMKG

### ✨ Yang Tersedia:

1. **Prakiraan 7 Hari**
   - Card tampilan untuk setiap hari
   - Rata-rata suhu harian
   - Total curah hujan
   - Kecepatan angin
   - Icon cuaca dari BMKG

2. **Detail Per Jam (Hari Pertama)**
   - Prakiraan cuaca per jam
   - Suhu, kelembaban, curah hujan
   - Kecepatan dan arah angin
   - Jarak pandang (visibility)

3. **Pilihan Lokasi**
   - Dropdown untuk memilih 15 kecamatan di Wonosobo:
     - Wonosobo
     - Kertek
     - Garung
     - Leksono
     - Kaliwiro
     - Sukoharjo
     - Sapuran
     - Kalibawang
     - Kalikajar
     - Kepil
     - Mojotengah
     - Selomerto
     - Wadaslintang
     - Watumalang
     - Kejajar

4. **Info Lokasi Lengkap**
   - Nama desa/kelurahan
   - Kecamatan
   - Kabupaten
   - Provinsi
   - Koordinat (lat/lon)
   - Timezone

---

## 🔧 Cara Menjalankan Aplikasi

### Backend (FastAPI)
```powershell
cd backend
uvicorn app.main:app --reload
```
Server akan berjalan di: **http://127.0.0.1:8000**

### Frontend (Vite)
```powershell
# Di root folder
npm run dev
```
Aplikasi akan berjalan di: **http://localhost:5173**

---

## 📊 Perbedaan "Prediksi Cuaca" vs "Data BMKG"

| Fitur | Prediksi Cuaca | Data BMKG |
|-------|----------------|-----------|
| **Sumber Data** | Backend ML (Prophet/SMA) | BMKG API Langsung |
| **Jangka Waktu** | 3-30 hari | 3 hari |
| **Detail** | Harian | Per jam |
| **Prediksi ML** | ✅ Ya | ❌ Tidak |
| **Data Real-time** | ❌ Cache | ✅ Ya |
| **Database** | PostgreSQL | No storage |
| **Icon Cuaca** | Custom | BMKG Official |
| **Info Tambahan** | Temperature range | Humidity, Visibility, Wind direction |

---

## 🎨 Screenshot Expected

### Desktop View:
```
┌─────────────────────────────────────────────────────────┐
│  [☁️ Data BMKG - Wonosobo]          [Select: Wonosobo▼] │
│  Kecamatan Wonosobo, Kab. Wonosobo, Jawa Tengah         │
│  📍 Koordinat: -7.36, 109.90 | 🕐 Asia/Jakarta          │
├─────────────────────────────────────────────────────────┤
│  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐ │
│  │ Hari│  │ Hari│  │ Hari│  │ Hari│  │ Hari│  │ Hari│ │
│  │ ke-1│  │ ke-2│  │ ke-3│  │ ke-4│  │ ke-5│  │ ke-6│ │
│  │     │  │     │  │     │  │     │  │     │  │     │ │
│  │ ☀️  │  │ ⛅  │  │ 🌧️  │  │ ☁️  │  │ ⛈️  │  │ 🌤️  │ │
│  │ 28°C│  │ 27°C│  │ 24°C│  │ 26°C│  │ 23°C│  │ 29°C│ │
│  └─────┘  └─────┘  └─────┘  └─────┘  └─────┘  └─────┘ │
├─────────────────────────────────────────────────────────┤
│  [📅 Detail Prakiraan Per Jam - 21 Oktober 2025]       │
│  ├─ 07:00 | Cerah Berawan | 24°C | 85% | 0mm | 5km/j  │
│  ├─ 10:00 | Cerah         | 28°C | 70% | 0mm | 8km/j  │
│  ├─ 13:00 | Berawan       | 30°C | 65% | 0mm | 10km/j │
│  ├─ 16:00 | Hujan Ringan  | 26°C | 80% | 2mm | 12km/j │
│  └─ 19:00 | Berawan       | 24°C | 85% | 1mm | 7km/j  │
└─────────────────────────────────────────────────────────┘
```

---

## 🔍 Testing

### 1. Test Navigation
- ✅ Klik menu "Data BMKG"
- ✅ Pastikan page berubah ke dashboard BMKG
- ✅ Cek URL tidak error

### 2. Test Data Loading
- ✅ Lihat loading indicator saat fetch data
- ✅ Pastikan card prakiraan 7 hari muncul
- ✅ Cek detail per jam untuk hari pertama

### 3. Test Location Switch
- ✅ Pilih lokasi berbeda dari dropdown
- ✅ Pastikan data berubah sesuai lokasi
- ✅ Cek info lokasi update

### 4. Test Error Handling
- ✅ Matikan internet, pastikan error message muncul
- ✅ Cek button "Coba Lagi" berfungsi

### 5. Test Responsive
- ✅ Buka di mobile view
- ✅ Pastikan card responsive (1 kolom)
- ✅ Cek scroll horizontal tidak ada

---

## 📁 File yang Dibuat/Dimodifikasi

### ✅ File Baru:
1. `src/services/bmkgApi.ts` - API service untuk BMKG
2. `components/BMKGWeatherDashboard.tsx` - Dashboard component
3. `BMKG_INTEGRATION_GUIDE.md` - Dokumentasi lengkap
4. `BMKG_USAGE_EXAMPLES.md` - Contoh penggunaan
5. `QUICK_START_BMKG.md` - Quick start guide (file ini)

### ✅ File Dimodifikasi:
1. `components/PageRouter.tsx` - Tambah route 'bmkg-weather'
2. `components/PublicNavigation.tsx` - Tambah menu "Data BMKG"
3. `src/App.tsx` - Tambah 'bmkg-weather' ke public pages
4. `components/Navigation.tsx` - Tambah menu item (jika digunakan)

---

## 🐛 Troubleshooting

### Error: "Cannot fetch BMKG data"
**Solusi:**
1. Cek koneksi internet
2. Test endpoint langsung: https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4=31.71.03.1001
3. Cek browser console untuk detail error

### Error: "Component not found"
**Solusi:**
1. Pastikan `BMKGWeatherDashboard.tsx` ada di folder `components/`
2. Pastikan `bmkgApi.ts` ada di folder `src/services/`
3. Restart dev server

### Icon/Image Tidak Muncul
**Solusi:**
- BMKG API kadang URL image ada space, sudah ditangani di code
- Jika masih error, cek network tab di browser console

### Data Tidak Update
**Solusi:**
1. Clear browser cache
2. Hard refresh (Ctrl+Shift+R)
3. Pilih lokasi lain lalu kembali

---

## 💡 Tips Penggunaan

### 1. **Kombinasi dengan Prediksi ML**
Gunakan kedua dashboard untuk analisis lengkap:
- **Data BMKG**: Untuk 3 hari ke depan (detail per jam)
- **Prediksi Cuaca**: Untuk 7-30 hari ke depan (ML forecast)

### 2. **Monitor Multiple Locations**
Gunakan dropdown untuk membandingkan cuaca di berbagai kecamatan

### 3. **Perhatikan Attribution**
Di footer dashboard ada attribution BMKG - wajib ditampilkan sesuai ketentuan BMKG

### 4. **Data Real-time**
Data BMKG update setiap 3 jam, refresh halaman untuk data terbaru

---

## 📞 Kontak & Sumber

**Data Source:**
- BMKG API: https://data.bmkg.go.id/prakiraan-cuaca
- GitHub: https://github.com/infoBMKG/data-cuaca

**Attribution (Wajib):**
```html
Data cuaca bersumber dari BMKG 
(Badan Meteorologi, Klimatologi, dan Geofisika)
```

---

## 🎉 Selamat!

Dashboard Data BMKG sudah siap digunakan! 

Untuk informasi lebih detail, lihat:
- `BMKG_INTEGRATION_GUIDE.md` - Dokumentasi teknis lengkap
- `BMKG_USAGE_EXAMPLES.md` - Contoh code dan implementasi

Happy coding! 🚀🌤️
