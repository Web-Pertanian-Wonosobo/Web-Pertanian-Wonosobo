
# 📑 WEB PERTANIAN WONOSOBO

Sistem Informasi Pertanian Wonosobo.

---

## 🛠️ Teknologi yang Digunakan (Asumsi)

| Komponen | Bahasa / Framework | Versi Paling Mungkin |
| :--- | :--- | :--- |
| **Bahasa Utama** | PHP | 8.1+ |
| **Framework** | Laravel | 10.x |
| **Database** | MySQL / MariaDB | 5.7+ |
| **Frontend** | Bootstrap | 5.x |

---

## 🚀 Panduan Instalasi Cepat

Asumsi: Anda telah menginstal **Git**, **PHP 8.1+**, **Composer**, dan **MySQL**.

### 1. Kloning & Dependensi

Kloning repositori, pindah ke *branch* `nanta`, dan instal semua pustaka yang diperlukan.

```bash
# Kloning dan pindah branch
git clone [https://github.com/Web-Pertanian-Wonosobo/Web-Pertanian-Wonosobo.git](https://github.com/Web-Pertanian-Wonosobo/Web-Pertanian-Wonosobo.git)
cd Web-Pertanian-Wonosobo
git checkout nanta

# Instal pustaka PHP via Composer
composer install
````

### 2\. Konfigurasi Lingkungan (.env)

Buat file konfigurasi `.env` dan buat kunci aplikasi. **JANGAN LUPA** sesuaikan `DB_DATABASE`, `DB_USERNAME`, dan `DB_PASSWORD` di file `.env`.

```bash
# Buat file .env dari contoh
cp .env.example .env

# Buat kunci aplikasi Laravel
php artisan key:generate
```

### 3\. Migrasi Database

Jalankan skrip untuk membuat tabel dan mengisi data awal.

```bash
# Jalankan migrasi tabel
php artisan migrate

# Opsional: Jalankan seeder (data awal)
# php artisan db:seed
```
