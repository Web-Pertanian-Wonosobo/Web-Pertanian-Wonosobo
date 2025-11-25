# Panduan Admin: Input Data Harga Manual

## 📊 Kenapa Perlu Input Manual?

API eksternal (Disdagkopukm) **tidak menyediakan data historis** yang cukup untuk forecasting. Dengan input manual, admin bisa:
1. ✅ Build data historis untuk forecasting yang akurat
2. ✅ Input data lokal Wonosobo yang tidak ada di API
3. ✅ Kontrol penuh atas kualitas data
4. ✅ Update data setiap hari untuk prediksi real-time

---

## 🎯 Cara Menggunakan

### 1. **Akses Menu Admin**
   - Login sebagai admin
   - Klik menu **"Manajemen Data Harga"** di sidebar

### 2. **Tambah Data Harga Baru**
   - Klik tombol **"Tambah Data Harga"**
   - Isi form:
     * **Komoditas**: Nama komoditas (contoh: Kentang, Bawang Merah)
     * **Lokasi**: Lokasi pasar (pilih dari dropdown atau ketik manual)
     * **Harga**: Harga per unit dalam Rupiah
     * **Satuan**: kg, ikat, dll
     * **Tanggal**: Tanggal data harga
   - Klik **"Simpan"**

### 3. **Edit Data Harga**
   - Klik icon **Edit** (✏️) pada baris data yang ingin diubah
   - Update data yang perlu diubah
   - Klik **"Simpan"**

### 4. **Hapus Data Harga**
   - Klik icon **Hapus** (🗑️) pada baris data
   - Konfirmasi penghapusan
   - Data akan terhapus dari database

---

## 💡 Best Practice untuk Forecasting

### **Minimal Data Requirements:**
- ✅ **Minimal 10 data points** per komoditas
- ✅ **Ideal: 30-90 hari** data historis
- ✅ **Update rutin** (harian/mingguan)

### **Contoh Input Harian:**
Setiap hari, input harga untuk komoditas utama:
1. Kentang - Rp 8.500/kg
2. Bawang Merah - Rp 45.000/kg
3. Cabai Merah - Rp 35.000/kg
4. Wortel - Rp 7.000/kg
5. Kubis - Rp 5.500/kg

### **Konsistensi Penting:**
- Gunakan **nama komoditas yang sama** (contoh: "Kentang", bukan kadang "kentang" kadang "Kentang Lokal")
- **Lokasi konsisten** (contoh: "Wonosobo Kota")
- **Unit konsisten** (kg untuk sayuran, ikat untuk daun bawang, dll)

---

## 📈 Workflow Ideal

### **Minggu Pertama:**
1. Input data historis **30-90 hari** untuk 5-10 komoditas utama
2. Gunakan data pasar lokal atau estimasi dari pedagang

### **Setelah Itu:**
1. **Setiap hari**: Input harga terbaru untuk komoditas utama
2. **Setiap minggu**: Review dan update data yang tidak akurat
3. **Setiap bulan**: Tambah komoditas baru jika perlu

---

## 🚀 Quick Start: Input Data Historis

### **Cara 1: Manual Input (via UI)**
1. Buka **Manajemen Data Harga**
2. Klik **"Tambah Data Harga"** berkali-kali
3. Input data untuk 30-90 hari terakhir

### **Cara 2: Bulk Import (via API)**
Untuk input banyak data sekaligus, gunakan endpoint:

```bash
POST http://127.0.0.1:8000/market/add
```

**Body:**
```json
{
  "user_id": 1,
  "commodity_name": "Kentang",
  "market_location": "Wonosobo Kota",
  "unit": "kg",
  "price": 8500,
  "date": "2024-11-19"
}
```

**Bulk dengan Script:**
```bash
# Generate 90 hari data untuk Kentang
curl -X POST "http://127.0.0.1:8000/forecast/generate-sample-data?commodity_name=Kentang&base_price=8500&days=90"
```

---

## 📊 Contoh Data untuk 5 Komoditas Utama

| Komoditas | Harga Saat Ini | Satuan | Lokasi |
|-----------|----------------|--------|--------|
| Kentang | Rp 8.500 | kg | Wonosobo Kota |
| Bawang Merah | Rp 45.000 | kg | Wonosobo Kota |
| Cabai Merah | Rp 35.000 | kg | Wonosobo Kota |
| Wortel | Rp 7.000 | kg | Wonosobo Kota |
| Kubis | Rp 5.500 | kg | Wonosobo Kota |

**Tip:** Copy data ini untuk input harian, update harganya sesuai kondisi pasar

---

## ✅ Checklist Admin Harian

- [ ] Cek harga pasar terbaru (survey ke pasar/pedagang)
- [ ] Input harga untuk 5-10 komoditas utama
- [ ] Pastikan tanggal benar (hari ini)
- [ ] Cek total data di database (minimal 10 per komoditas)
- [ ] Test forecasting untuk pastikan prediksi jalan

---

## 🔍 Monitoring Data

### **Cek Jumlah Data per Komoditas:**
1. Buka **Prediksi Harga**
2. Pilih komoditas
3. Jika forecasting berhasil → data cukup ✅
4. Jika error "insufficient data" → perlu tambah data ❌

### **Cek Available Commodities:**
```bash
GET http://127.0.0.1:8000/forecast/available-commodities
```

### **Cek Semua Data:**
```bash
GET http://127.0.0.1:8000/market/list?limit=500
```

---

## ❓ FAQ

**Q: Berapa lama waktu input data historis 90 hari?**  
A: Sekitar 10-15 menit untuk 5 komoditas (90 hari × 5 = 450 entries). Gunakan generate-sample-data untuk lebih cepat.

**Q: Apakah harus input setiap hari?**  
A: Ideal setiap hari, minimal seminggu 3-4 kali untuk data yang fresh.

**Q: Bagaimana jika lupa input beberapa hari?**  
A: Tidak masalah, Prophet bisa handle missing data. Tapi lebih baik konsisten.

**Q: Bisa import dari Excel?**  
A: Saat ini belum, tapi bisa pakai API untuk bulk insert. Akan ditambahkan fitur import CSV/Excel di update selanjutnya.

**Q: Data lama bisa dihapus?**  
A: Ya, bisa via tombol Hapus. Tapi lebih banyak data historis = prediksi lebih akurat, jadi jangan dihapus kecuali salah input.

---

## 📞 Support

Jika ada masalah:
1. Check console browser (F12) untuk error
2. Check backend logs
3. Pastikan backend jalan di http://127.0.0.1:8000
4. Test endpoint API dengan Postman/Thunder Client
