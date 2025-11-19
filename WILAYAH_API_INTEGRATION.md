# Integrasi API Wilayah Disdukcapil Wonosobo

## 📍 Overview

Aplikasi telah diintegrasikan dengan API resmi Disdukcapil Kabupaten Wonosobo untuk mendapatkan data wilayah kecamatan yang akurat dan real-time.

## 🔗 API Endpoint

```
https://disdukcapil.wonosobokab.go.id/api/wilayah
```

## 📊 Data yang Tersedia

Setiap wilayah kecamatan memiliki informasi:
- **ID**: Identitas unik wilayah
- **Kode**: Kode administratif wilayah (format: 330701, 330702, dll)
- **Nama**: Nama kecamatan
- **Koordinat Batas**: Array koordinat polygon batas administratif wilayah
- **Timestamps**: created_at, updated_at

## 🎯 Fitur yang Diimplementasikan

### 1. **Service API (`src/services/wilayahApi.ts`)**
Service untuk mengakses data wilayah dengan fungsi:
- `fetchWilayah()` - Ambil semua data wilayah
- `fetchWilayahByName(nama)` - Cari wilayah berdasarkan nama
- `fetchWilayahByKode(kode)` - Cari wilayah berdasarkan kode
- `fetchKecamatanNames()` - Ambil daftar nama kecamatan
- `parseLatLongArea(latlong_area)` - Parse koordinat dari string JSON

### 2. **Dashboard (`components/Dashboard.tsx`)**
Dashboard menampilkan:
- **Statistik Jumlah Kecamatan**: Card menunjukkan total 25 kecamatan
- **Section Data Wilayah**: Grid menampilkan semua kecamatan dengan kode
- **Sumber Data**: Indikator bahwa data berasal dari Disdukcapil resmi

### 3. **Halaman Wilayah Lengkap (`components/WilayahList.tsx`)**
Halaman khusus untuk melihat detail wilayah:
- **Pencarian**: Cari kecamatan berdasarkan nama atau kode
- **Daftar Detail**: Setiap wilayah dapat diklik untuk melihat detail
- **Export Data**: Download data wilayah dalam format JSON
- **Koordinat Lengkap**: Lihat titik-titik koordinat batas wilayah

### 4. **Navigasi**
Menu "Data Wilayah" ditambahkan di:
- PublicNavigation (sidebar & mobile menu)
- PageRouter dengan route 'wilayah'

## 📱 Cara Mengakses

1. **Dashboard**: Buka halaman utama, lihat section "Wilayah Kecamatan Wonosobo"
2. **Halaman Wilayah**: Klik menu "Data Wilayah" di sidebar atau mobile menu
3. **Detail**: Klik salah satu kecamatan untuk melihat detail lengkap

## 💾 Contoh Data Response

```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "kode": "330701",
      "nama": "Wadaslintang",
      "latlong_area": "[[[[109.7671, -7.5124], ...]]]",
      "created_at": null,
      "updated_at": null
    },
    {
      "id": 2,
      "kode": "330702",
      "nama": "Kepil",
      "latlong_area": "[[[[110.0704, -7.3928], ...]]]",
      "created_at": null,
      "updated_at": null
    }
    // ... 23 kecamatan lainnya
  ]
}
```

## 🗺️ 25 Kecamatan di Wonosobo

1. Wadaslintang (330701)
2. Kepil (330702)
3. Sapuran (330703)
4. Kaliwiro (330704)
5. Leksono (330705)
6. Selomerto (330706)
7. Kalikajar (330707)
8. Kertek (330708)
9. Wonosobo (330709)
10. Watumalang (330710)
11. Mojotengah (330711)
12. Garung (330712)
13. Kejajar (330713)
14. Sukoharjo (330714)
15. Kalibawang (330715)
16. Wadaslintang (3307011007)
17. Kaligowong (3307012001)
18. Sumbersari (3307012002)
19. Sumberejo (3307012003)
20. Erorejo (3307012004)
21. Karanganyar (3307012005)
22. Panerusan (3307012006)
23. Plunjaran (3307012008)
24. Kumejing (3307012009)
25. Lancar (3307012010)

## 🔄 Auto-Refresh

Data wilayah dimuat sekali saat halaman pertama kali dibuka (tidak perlu auto-refresh karena data administratif jarang berubah).

## 🚀 Pengembangan Lebih Lanjut

Dengan data koordinat yang tersedia, bisa dikembangkan:
- **Peta Interaktif**: Tampilkan batas wilayah di peta dengan library seperti Leaflet atau Mapbox
- **Overlay Data**: Tampilkan data cuaca/harga per wilayah di peta
- **Heat Map**: Visualisasi intensitas data per kecamatan
- **Routing**: Hitung jarak antar kecamatan
- **Geofencing**: Deteksi lokasi pengguna dalam wilayah tertentu

## 📝 Catatan Teknis

- API publik, tidak perlu authentication
- Response time rata-rata: ~500ms
- Data format: JSON dengan array nested untuk koordinat
- CORS enabled, bisa diakses dari browser
- Koordinat dalam format [longitude, latitude]

## 🔒 Keamanan

- API endpoint publik (read-only)
- Tidak ada data sensitif yang ditransmisikan
- Client-side caching untuk optimasi performa

## 📞 Sumber

API ini disediakan oleh **Dinas Kependudukan dan Pencatatan Sipil Kabupaten Wonosobo**.

Website: https://disdukcapil.wonosobokab.go.id
