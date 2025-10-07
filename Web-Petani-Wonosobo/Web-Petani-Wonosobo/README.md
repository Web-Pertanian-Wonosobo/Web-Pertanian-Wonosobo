# Web Petani Wonosobo 🌾

Platform digital untuk membantu petani di Wonosobo dalam mengakses informasi cuaca BMKG dan prediksi harga komoditas dari Bapanas serta pasar lokal.

## 🚀 Fitur Utama

### ☁️ Prediksi Cuaca (WeatherPrediction.tsx)
- **Integrasi BMKG API**: Data cuaca real-time dari Badan Meteorologi, Klimatologi, dan Geofisika
- **Prakiraan 7 Hari**: Prediksi cuaca detail untuk perencanaan pertanian
- **Rekomendasi AI**: Saran waktu tanam berdasarkan kondisi cuaca
- **Analisis Lokasi**: Data spesifik untuk wilayah Kabupaten Wonosobo (15 kecamatan, 266+ desa/kelurahan)

### 💰 Prediksi Harga (PricePrediction.tsx)
- **Integrasi Bapanas API**: Data harga resmi dari Badan Pangan Nasional
- **Pasar Lokal**: Informasi harga dari pasar-pasar di Wonosobo (Wage, Kejajar, Sapuran)
- **Simulasi Pendapatan**: Kalkulator estimasi keuntungan berdasarkan hasil panen
- **Trend Analysis**: Grafik historis dan prediksi harga komoditas
- **Export Report**: Download laporan dalam format PDF

## 🛠️ Teknologi yang Digunakan

### Frontend
- **React 19** dengan TypeScript
- **Vite** sebagai build tool dan dev server
- **TailwindCSS** untuk styling
- **Shadcn/ui** sebagai component library
- **Recharts** untuk visualisasi data
- **jsPDF** untuk export laporan

### Backend
- **FastAPI** (Python) sebagai REST API server
- **httpx** untuk HTTP client requests
- **Pydantic** untuk data validation
- **Uvicorn** sebagai ASGI server

### API External
- **BMKG API**: `https://api.bmkg.go.id/publik/prakiraan-cuaca`
- **Bapanas API**: `https://panelinfo.pangan.go.id/api`
- **Data Pasar Lokal**: Simulasi data pasar Wonosobo

## 📦 Quick Start

### Otomatis (Recommended)
```bash
# Windows
start-dev.bat

# Linux/Mac  
chmod +x start-dev.sh && ./start-dev.sh
```

### Manual Setup
```bash
# 1. Install frontend dependencies
npm install

# 2. Install backend dependencies
cd backend
pip install -r requirements.txt

# 3. Start backend (Terminal 1)
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 4. Start frontend (Terminal 2)
cd .. && npm run dev
```

## 🌐 URL Akses

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📋 API Endpoints

### Weather Endpoints
- `GET /api/weather/forecast?adm4_code={kode}&days={jumlah}` - Prakiraan cuaca
- `GET /api/weather/current?adm4_code={kode}` - Cuaca saat ini
- `GET /api/weather/locations` - Daftar lokasi tersedia

### Market Endpoints
- `GET /api/market/prices?commodity={komoditas}&source={sumber}` - Harga komoditas
- `GET /api/market/price-history?commodity={komoditas}&days={hari}` - Riwayat harga
- `GET /api/market/markets` - Daftar pasar lokal
- `GET /api/market/commodities` - Daftar komoditas tersedia

## 🗺️ Coverage Area - Kabupaten Wonosobo

**15 Kecamatan dengan 266+ Desa/Kelurahan:**
1. **Wadaslintang** (33.07.01) - 17 desa/kelurahan
2. **Kepil** (33.07.02) - 21 desa/kelurahan  
3. **Sapuran** (33.07.03) - 17 desa/kelurahan
4. **Kalibawang** (33.07.04) - 21 desa/kelurahan
5. **Leksono** (33.07.05) - 14 desa/kelurahan
6. **Sukoharjo** (33.07.06) - 24 desa/kelurahan
7. **Kalikajar** (33.07.07) - 19 desa/kelurahan
8. **Kertek** (33.07.08) - 21 desa/kelurahan
9. **Wonosobo** (33.07.09) - 21 desa/kelurahan
10. **Watumalang** (33.07.10) - 16 desa/kelurahan
11. **Mojotengah** (33.07.11) - 19 desa/kelurahan
12. **Garung** (33.07.12) - 15 desa/kelurahan
13. **Kejajar** (33.07.13) - 16 desa/kelurahan
14. **Selomerto** (33.07.14) - 17 desa/kelurahan
15. **Kaliwiro** (33.07.15) - 8 desa/kelurahan

## 🛒 Komoditas Pertanian

### Komoditas Nasional (Bapanas):
- Beras Premium
- Cabai Merah Keriting
- Bawang Merah/Putih
- Jagung Pipilan Kering
- Gula Pasir Premium

### Komoditas Lokal Wonosobo:
- **Kentang Dieng** (unggulan)
- Wortel, Kubis, Brokoli
- Kacang Tanah, Ubi Jalar
- Singkong, Tomat

## 💡 Fitur Unggulan

### 📊 Simulasi Pendapatan
- Kalkulator estimasi keuntungan
- Prediksi waktu jual optimal
- Export laporan PDF
- Share hasil simulasi

### 🌤️ Rekomendasi AI
- Saran tanaman berdasarkan cuaca
- Prediksi musim tanam
- Analisis kondisi iklim

### 📈 Data Visualization  
- Grafik tren harga real-time
- Chart cuaca 7 hari
- Perbandingan harga antar pasar

## 🐛 Troubleshooting

```bash
# Test backend connection
curl http://localhost:8000/health

# Test BMKG integration
curl "http://localhost:8000/api/weather/forecast?adm4_code=33.07.01.2001&days=3"

# Test market data
curl "http://localhost:8000/api/market/prices?source=all"

# Restart services
# Windows: Tutup terminal dan jalankan start-dev.bat lagi
# Linux/Mac: Ctrl+C kemudian ./start-dev.sh
```

## 📄 License

MIT License

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Submit pull request

---

**🌾 Dibuat untuk Petani Indonesia - Membangun Pertanian Digital yang Cerdas**
