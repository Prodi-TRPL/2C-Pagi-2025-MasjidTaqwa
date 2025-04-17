# 🕌 Sidontaq - Aplikasi Sistem Informasi Manajemen Donasi Pembangunan Masjid Taqwa Muhammadiyah Batam Kota
<img src="public/img/logo-app.jpg" alt="Logo Masjid Taqwa" width="500"/>

![MIT License](https://img.shields.io/badge/license-MIT-blue.svg) ![React](https://img.shields.io/badge/React-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) ![Laravel](https://img.shields.io/badge/Laravel-%23F05340.svg?style=for-the-badge&logo=laravel&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white) ![MySQL](https://img.shields.io/badge/MySQL-%2300f.svg?style=for-the-badge&logo=mysql&logoColor=white)


## 🚀 Project Overview

Aplikasi ini bertujuan untuk mengelola **donasi** yang masuk untuk **pembangunan Masjid Taqwa Muhammadiyah Batam Kota**. Sistem ini memungkinkan pengelolaan donasi secara efisien dengan antarmuka pengguna berbasis web yang dibangun menggunakan **ReactJS**, **TailwindCSS**, dan **Laravel** di backend.

---

## 🚀 **Fitur Utama**

### 1. **Landing Page**
   - Memuat informasi total donasi yang telah terkumpul.
   - Memuat informasi progress pembangunan masjid.
   - Memuat informasi rekapitulasi laporan donasi yang telah diterima.

### 2. **Manajemen Donasi**
   - Pencatatan otomatis setiap transaksi donasi yang masuk, baik melalui transfer bank maupun metode pemberian lainnya.
   - Notifikasi otomatis kepada donatur setelah donasi diterima.
   - Pengelolaan data donatur untuk memudahkan pelacakan riwayat donasi.

### 3. **Laporan Keuangan Transparan**
   - Rekapitulasi pemasukan dan pengeluaran secara otomatis.
   - Pembuatan laporan keuangan yang dapat diakses oleh panitia masjid dan donatur.
   - Penyajian laporan dalam bentuk grafik dan tabel untuk memudahkan analisis keuangan.

### 4. **Halaman Informasi Proyek**
   - Menampilkan informasi terkini mengenai progres pembangunan masjid.
   - Update foto, video, dan laporan perkembangan proyek secara berkala. *(Optional)*
   - Estimasi kebutuhan dana yang masih diperlukan untuk tahap pembangunan selanjutnya.

### 5. **Fitur Donasi Online**
   - Integrasi dengan berbagai metode pembayaran digital (QRIS, transfer bank, e-wallet).
   - Konfirmasi donasi otomatis untuk memudahkan pencatatan.
   - Formulir donasi online yang mudah digunakan oleh donatur.

### 6. **Dashboard Admin**
   - Panel kontrol bagi pengurus masjid untuk mengelola data donasi dan laporan keuangan.
   - Fitur pengelolaan user (admin, panitia, donatur).
   - Sistem audit log untuk mencatat aktivitas dalam sistem guna meningkatkan keamanan.

### 7. **Portal Donatur**
   - Akses bagi donatur untuk melihat riwayat donasi mereka.
   - Notifikasi tentang pencapaian target dana dan perkembangan pembangunan.
   - Fitur berbagi informasi donasi ke media sosial untuk mengajak lebih banyak donatur.

---

## 📁 Project Structure

Berikut adalah struktur folder dari project ini:

```
MasjidTaqwa/
│
├── app/                       # Kode utama Laravel (backend)
│   ├── Http/
│   │   ├── Controllers/       # Controller API
│   └── ...
│
├── public/                    # Output dari Vite dan file publik lainnya
│   ├── build/                 # Output dari Vite (frontend React)
│   └── index.php              # File utama Laravel
│
├── resources/
│   ├── js/                    # Semua file React (frontend)
│   │   ├── components/        # Komponen React
│   │   ├── pages/             # Halaman utama React
│   │   └── app.jsx            # Entry React untuk aplikasi
│   ├── views/                 # Laravel views
│   │   └── react-main.blade.php # Blade untuk React
│   └── css/
│       └── app.css            # Tailwind base styling
│
├── routes/
│   ├── web.php                # Laravel routing (untuk Blade)
│   └── api.php                # Endpoint API Laravel (untuk React)
│
├── database/                  # Migrasi dan Seeder database
│   ├── migrations/            # Migrasi
│   ├── seeders/               # Seeder
│   └── factories/             # Factory data
│
├── .env                       # Konfigurasi environment
├── package.json               # Konfigurasi npm
├── vite.config.js             # Konfigurasi Vite untuk React
├── tailwind.config.js         # Konfigurasi TailwindCSS
└── composer.json              # Konfigurasi Laravel composer
```


## 👨‍💻 Tim Pengembang

| No. | Nama                   | NIM         | Role                          |
|-----|--------------------------------|-------------|---------------------------------------|
| 1   | Muhammad Thariq Syafruddin    | 4342401067  | Database Developer                 |
| 2   | Ibra Marioka                   | 4342401071  | Backend Developer                     |
| 3   | Diva Satria                    | 4342401072  | Frontend Developer                    |
| 4   | Surya Nur Aini                 | 4342401074  | Business Analyst                     |
| 5   | Muhammad Addin                 | 4342401076  | Quality Assurance (QA)          |
| 6   | Nayla Nur Nabila              | 4342401083  | UI/UX Designer  |


## 🛠️ Instalasi dan Setup Lengkap

### Prasyarat
1. Pastikan sudah menginstal [Node.js](https://nodejs.org/en/) dan [Composer](https://getcomposer.org/).
2. Pastikan sudah menginstal [Laravel](https://laravel.com/docs/8.x) dan [MySQL](https://www.mysql.com/) untuk database.

### Langkah-langkah Instalasi

1. **Clone Repository**
   ```bash
   git clone https://github.com/Prodi-TRPL/2C-Pagi-2025-MasjidTaqwa
   cd MasjidTaqwa
   ```

2. **Instalasi Backend (Laravel)**
   - Pindah ke folder backend:
     ```bash
     cd backend
     ```
   - Instalasi dependensi Laravel:
     ```bash
     composer install
     ```
   - Copy file `.env.example` ke `.env`:
     ```bash
     cp .env.example .env
     ```
   - Generate key aplikasi:
     ```bash
     php artisan key:generate
     ```
   - Jalankan migrasi dan seeder:
     ```bash
     php artisan migrate --seed
     ```
   - Jalankan server Laravel:
     ```bash
     php artisan serve
     ```

3. **Instalasi Frontend (React + TailwindCSS)**
   - Pindah ke folder frontend:
     ```bash
     cd frontend
     ```
   - Instalasi dependensi frontend:
     ```bash
     npm install
     ```
   - Jalankan server development Vite:
     ```bash
     npm run dev
     ```

   Aplikasi akan berjalan di `http://localhost:3000`.

### Setup Environment
1. Atur konfigurasi `.env` di folder `backend` sesuai dengan environment (database, API keys, dll).
2. Pastikan koneksi database dan konfigurasi lainnya telah sesuai.

## 🔧 Script Tersedia

Sidontaq menyediakan script yang tersedia di dalam `package.json` untuk mempermudah pengembangan:

## 📜 Script Tersedia

| Script | Perintah |
|:---|:---|
| `npm run dev` | Menjalankan **Laravel server** dan **Vite dev server** secara bersamaan untuk pengembangan. |
| `npm run build` | Build **frontend** (React + Tailwind) menggunakan Vite untuk produksi. |
| `npm run serve` | Menjalankan **Laravel server** saja. |
| `npm run hot` | Menjalankan **Vite dev server** dengan **Hot Module Replacement** (HMR) aktif. |
| `npm run frontend:lint` | Menjalankan **ESLint** untuk melakukan pengecekan kode pada `resources/js`. |
| `npm run frontend:test` | Placeholder untuk menambahkan testing pada project React (bisa diubah sesuai kebutuhan). |
| `npm run db:fresh` | Menjalankan migrasi database **fresh** dan seed data ulang (menghapus semua data sebelumnya). |
| `npm run db:setup` | Menjalankan migrasi database dan seed data tanpa menghapus data lama. |
| `npm run storage:link` | Membuat symbolic link dari `storage` ke `public/storage` untuk akses file upload. |
| `npm run clear:cache` | Membersihkan semua cache: config, route, view, dan cache umum Laravel. |
| `npm run setup` | Instal semua dependensi (`npm` dan `composer`), setup environment, generate key Laravel, migrasi dan seed database, membuat storage link, install `concurrently`, serta clear cache. |


### Backend Setup
- **`php artisan migrate`**: Menjalankan migrasi untuk database.
- **`php artisan db:seed`**: Menjalankan seeder untuk mengisi data awal.

### Frontend Setup
- **`npm run build`**: Membuat build untuk frontend React.
- **`npm run dev`**: Menjalankan server development untuk React dengan Vite.

---

## ⚠️ Troubleshooting

| 🔍 Masalah Umum | 💡 Solusi Cepat |
|-----------------|----------------|
| **🛑 Laravel tidak bisa jalan / error saat serve** | Pastikan `.env` sudah dikonfigurasi dengan benar dan dependencies backend telah terinstall:<br>`composer install`<br>`php artisan key:generate` |
| **⚙️ Perubahan di UI tidak muncul** | Coba jalankan ulang dev server React:<br>`npm run dev` |
| **📦 Dependency error (npm/composer)** | Hapus dan install ulang dependencies:<br>`rm -rf node_modules`<br>`rm package-lock.json`<br>`npm install`<br>dan/atau<br>`composer install` |
| **❌ Error saat migrate database** | Coba reset ulang database:<br>`php artisan migrate:fresh --seed`<br>Pastikan koneksi DB di `.env` benar |
| **📂 File upload tidak muncul di storage/public** | Buat ulang symbolic link ke storage:<br>`php artisan storage:link` |
| **🔥 Cache masih menyimpan data lama** | Bersihkan semua cache Laravel:<br>`php artisan cache:clear`<br>`php artisan config:clear`<br>`php artisan view:clear`<br>`php artisan route:clear` |
| **🌐 Port bentrok saat menjalankan dev** | Ubah port Vite atau Laravel server di `.env` atau langsung lewat command line:<br>`php artisan serve --port=8001`<br>`vite --port 5174` |

## 🚧 Catatan Pengembangan
- Pastikan untuk membuat **branch terpisah** untuk setiap fitur atau bug fix yang dikerjakan.
- Jangan lupa untuk selalu **commit** dan **push** perubahan secara berkala.
- Gunakan **PR/MR (Pull Request/Merge Request)** untuk kolaborasi yang lebih mudah.

---

## 🛠️ Metode Pengembangan

Proyek dikembangkan menggunakan pendekatan metodologi **Waterfall**.

### 📌 Tahapan Pengembangan:

| Tahapan                  | Durasi         | Deskripsi                                                                 |
|--------------------------|----------------|---------------------------------------------------------------------------|
| **Requirement Analysis** | 2 minggu       | Mengumpulkan kebutuhan sistem dari pengguna dan stakeholder.              |
| **System Design**        | 2 minggu       | Mendesain arsitektur sistem, struktur database, dan antarmuka aplikasi.   |
| **Implementation**       | 5 minggu       | Proses pengembangan kode program, integrasi frontend & backend.           |
| **Testing**              | 3 minggu       | Pengujian fungsionalitas sistem, validasi, dan perbaikan bug.             |
| **Deployment**           | 1 minggu       | Peluncuran sistem ke lingkungan produksi dan penyebaran ke pengguna.      |
| **Maintenance**          | Berkelanjutan  | Pemeliharaan sistem, perbaikan error, serta penyesuaian kebutuhan baru.   |

---

## 📜 Lisensi

MIT License

Copyright (c) 2025 Tim PBL TRPL-212, Politeknik Negeri Batam

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
