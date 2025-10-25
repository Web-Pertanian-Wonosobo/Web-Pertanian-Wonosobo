# Panduan Integrasi Google Elevation API untuk Analisis Lereng

## 📋 Deskripsi

Fitur analisis lereng sekarang menggunakan **Google Elevation API** untuk menghitung kemiringan tanah secara otomatis berdasarkan koordinat yang dipilih di Google Maps.

## 🔧 Setup Google Maps API

### 1. Dapatkan API Key

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih project yang sudah ada
3. Aktifkan API berikut:
   - **Elevation API** (utama untuk analisis slope)
   - **Maps JavaScript API** (untuk menampilkan peta)
   - **Geocoding API** (opsional, untuk konversi alamat ke koordinat)

4. Buat credentials:
   - Pergi ke **APIs & Services** → **Credentials**
   - Klik **Create Credentials** → **API Key**
   - Copy API key yang dihasilkan

### 2. Konfigurasi API Key

1. Copy file `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit file `.env` dan tambahkan API key:
   ```env
   VITE_GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

3. Restart development server:
   ```bash
   npm run dev
   ```

## 🎯 Cara Penggunaan

### Metode 1: Analisis Otomatis dari Form

1. Buka halaman **Analisis Lereng**
2. Di panel kanan "Update Lokasi", isi:
   - Nama Lokasi (contoh: "Bukit Dieng")
   - Desa (opsional)
   - Kecamatan (opsional)
3. Klik tombol **"Analisis Slope Otomatis"**
4. Sistem akan:
   - Mengambil data elevasi dari Google Elevation API
   - Menghitung slope/kemiringan tanah
   - Menentukan tingkat risiko (Rendah/Sedang/Tinggi)
   - Memberikan rekomendasi tindakan

### Metode 2: Klik Langsung di Peta (Coming Soon)

Fitur untuk klik langsung di peta Google Maps akan ditambahkan untuk analisis real-time pada titik tertentu.

## 📊 Cara Kerja Analisis Slope

### Algoritma

1. **Pengambilan Data Elevasi**
   - Mengambil elevasi dari 9 titik (grid 3x3) di sekitar lokasi
   - Radius default: 100 meter

2. **Perhitungan Slope**
   ```
   Slope (%) = (Perbedaan Elevasi / Jarak Horizontal) × 100
   Slope (°) = arctan(Slope / 100) × (180 / π)
   ```

3. **Klasifikasi Risiko**
   - **Rendah**: Slope ≤ 20%
   - **Sedang**: Slope 21-30%
   - **Tinggi**: Slope > 30%

### Data yang Dihasilkan

- **Kemiringan** dalam persentase (%) dan derajat (°)
- **Tingkat Risiko** (Low/Medium/High)
- **Rekomendasi** tindakan sesuai tingkat risiko
- **Data Elevasi** untuk 9 titik sampling

## 🎨 Fitur Tambahan

### Rekomendasi Otomatis

Sistem memberikan rekomendasi berbeda berdasarkan tingkat slope:

**Slope Rendah (≤20%)**
- Kondisi aman untuk pertanian
- Tetap jaga sistem drainase
- Cocok untuk berbagai jenis tanaman
- Monitor rutin kondisi tanah

**Slope Sedang (21-30%)**
- Tanam tanaman penutup tanah
- Buat saluran drainase memadai
- Pertimbangkan terasering sederhana
- Hindari pembersihan vegetasi berlebihan
- Monitoring berkala diperlukan

**Slope Tinggi (>30%)**
- ⚠️ HINDARI aktivitas berat
- Pasang jaring pengaman/struktur penahan
- Monitoring ketat WAJIB
- Konsultasi dengan ahli geologi
- Buat sistem early warning
- Jangan bangun struktur permanen
- Evakuasi saat hujan lebat

### Laporan PDF

Setelah analisis, Anda dapat:
- Download laporan lengkap
- Kirim alert ke BASARNAS (untuk risiko tinggi)
- Share ke komunitas via WhatsApp/Instagram

## 💡 Tips Penggunaan

1. **Akurasi Data**
   - Google Elevation API memiliki akurasi ±10-15 meter
   - Untuk keputusan kritis, kombinasikan dengan data drone/satelit

2. **Batas Penggunaan**
   - Google memberikan $200 kredit gratis per bulan
   - ~40,000 request gratis per bulan untuk Elevation API
   - Monitor usage di Google Cloud Console

3. **Best Practices**
   - Gunakan untuk screening awal area
   - Validasi dengan survey lapangan untuk risiko tinggi
   - Kombinasikan dengan data curah hujan dan jenis tanah

## 🔍 Troubleshooting

### Error: "API key belum di-set"
**Solusi:** Pastikan file `.env` sudah dibuat dan berisi `VITE_GOOGLE_MAPS_API_KEY`

### Error: "Failed to fetch elevation data"
**Solusi:** 
- Periksa koneksi internet
- Pastikan Elevation API sudah diaktifkan di Google Cloud Console
- Cek API key sudah benar dan memiliki permission

### Error: "Elevation API error: REQUEST_DENIED"
**Solusi:**
- API key mungkin salah atau tidak valid
- Elevation API belum diaktifkan untuk project
- Periksa billing account di Google Cloud Console

### Hasil slope tidak akurat
**Penyebab:**
- Resolusi data Google Elevation API terbatas (30m untuk SRTM)
- Area dengan topografi kompleks perlu data resolusi lebih tinggi

**Solusi:**
- Untuk keputusan kritis, gunakan data drone/LIDAR
- Kombinasikan dengan survey lapangan

## 📚 Referensi

- [Google Elevation API Documentation](https://developers.google.com/maps/documentation/elevation)
- [Slope Calculation Methods](https://pro.arcgis.com/en/pro-app/latest/tool-reference/spatial-analyst/how-slope-works.htm)
- [Landslide Risk Assessment](https://www.usgs.gov/programs/earthquake-hazards/landslides)

## 🚀 Pengembangan Selanjutnya

- [ ] Integrasi dengan Google Earth Engine untuk data resolusi lebih tinggi
- [ ] Visualisasi 3D profil elevasi
- [ ] Historical trend analysis
- [ ] Integration dengan data curah hujan BMKG
- [ ] Machine learning untuk prediksi risiko longsor
- [ ] Notifikasi real-time berbasis cuaca

## 📞 Support

Untuk pertanyaan atau masalah, hubungi tim development atau buat issue di repository.
