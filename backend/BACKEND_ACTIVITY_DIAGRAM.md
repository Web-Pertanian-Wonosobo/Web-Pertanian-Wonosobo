# Backend Activity Diagram (Lengkap)

Diagram lengkap dengan 3 kolom: Admin, Sistem Backend, dan Database/API.

## Activity Diagram End-to-End

```mermaid
flowchart LR
    subgraph A[Admin]
        direction TB
        A0((Mulai))
        A1[Login Admin]
        A2[Pilih menu Dashboard]
        A3[Kelola Data Harga]
        A4[Kelola User]
        A5[Prediksi Cuaca]
        A6[Prediksi Harga]
        A7[Analisis dan Rekomendasi]
        A8[Logout]
    end

    subgraph B[Sistem Backend]
        direction TB
        B1[Validasi input login]
        B2[Tampilkan dashboard admin]
        B3[Proses CRUD harga dan sync data pasar]
        B4[Proses CRUD user]
        B5[Proses prediksi cuaca]
        B6[Proses prediksi harga]
        B7[Proses analisis gabungan]
        B8[Kirim hasil ke admin]
    end

    subgraph C[Database/API]
        direction TB
        C1{Login valid?}
        C2[Simpan last login dan token JWT]
        C3[Simpan/ubah/hapus data harga]
        C4[Simpan/ubah/hapus data user]
        C5[Ambil/simpan data cuaca DB dan OpenWeather]
        C6[Ambil historis harga dan simpan hasil forecast]
        C7[Simpan hasil analisis/rekomendasi]
        C8((Selesai))
    end

    A0 --> A1 --> B1 --> C1
    C1 -->|Tidak| A1
    C1 -->|Ya| C2 --> B2 --> A2

    A2 --> A3 --> B3 --> C3 --> B8 --> A2
    A2 --> A4 --> B4 --> C4 --> B8 --> A2
    A2 --> A5 --> B5 --> C5 --> B8 --> A2
    A2 --> A6 --> B6 --> C6 --> B8 --> A2
    A2 --> A7 --> B7 --> C7 --> B8 --> A2

    A2 --> A8 --> C8
```

## Ringkasan Alur

- Admin login terlebih dahulu, lalu backend memvalidasi ke database.
- Jika login berhasil, admin masuk dashboard dan dapat memilih modul: harga, user, prediksi cuaca, prediksi harga, atau analisis.
- Setiap modul diproses backend, berinteraksi dengan database/API, lalu hasil dikembalikan ke admin.
- Setelah selesai, admin logout dan proses berakhir.
