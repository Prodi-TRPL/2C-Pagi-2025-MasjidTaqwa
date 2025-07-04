# Implementasi Struktur Data pada Aplikasi MasjidTaqwa

Dokumen ini berisi panduan untuk menjalankan migrasi dan menggunakan struktur data yang telah diimplementasikan dalam aplikasi MasjidTaqwa.

## Struktur Data yang Diimplementasikan

1. **Array**: Digunakan untuk pengelolaan proyek dan pengeluaran
2. **Array 2D**: Digunakan untuk visualisasi data keuangan dalam bentuk grafik
3. **Queue**: Digunakan untuk sistem notifikasi dengan prioritas

## Langkah-langkah Implementasi

### 1. Menjalankan Migrasi untuk Queue

Migrasi ini akan menambahkan kolom `processed` dan `priority` ke tabel `notifikasi` untuk mendukung implementasi Queue:

```bash
php artisan migrate
```

### 2. Menggunakan Struktur Data Array

Struktur data Array digunakan dalam komponen React untuk mengelola daftar proyek dan pengeluaran. Contoh penggunaannya dapat dilihat di file `resources/js/pages/dashboard/DashboardAdmin/ProyekPembangunan.jsx`.

Fitur-fitur yang menggunakan Array:
- Penyimpanan data proyek dan pengeluaran
- Filtering dan sorting data
- Pagination untuk menampilkan data secara bertahap

### 3. Menggunakan Struktur Data Array 2D

Struktur data Array 2D digunakan untuk visualisasi data keuangan dalam bentuk grafik. Implementasinya dapat dilihat di file `resources/js/components/charts/DonationChart.jsx`.

Untuk menggunakan komponen grafik:

```jsx
import DonationChart from '../components/charts/DonationChart';

// Dalam komponen React
<DonationChart year={2025} />
```

### 4. Menggunakan Struktur Data Queue

Struktur data Queue digunakan untuk sistem notifikasi dengan prioritas. Implementasinya dapat dilihat di file `app/Models/Notifikasi.php` dan `app/Http/Controllers/NotifikasiController.php`.

Contoh penggunaan Queue untuk notifikasi:

```php
// Menambahkan notifikasi ke antrian
$notificationId = Notifikasi::enqueue(
    $userId,
    'Judul Notifikasi',
    'Isi pesan notifikasi',
    'high' // Prioritas: 'low', 'normal', 'high'
);

// Memproses notifikasi dari antrian
$notifications = Notifikasi::dequeueByPriority(50);
foreach ($notifications as $notification) {
    // Proses notifikasi
    // ...
    
    // Tandai sebagai telah diproses
    $notification->markAsProcessed();
}
```

Atau menggunakan controller:

```php
// Menambahkan notifikasi ke antrian
$notificationId = $notifikasiController->queueNotification(
    $userId,
    'Judul Notifikasi',
    'Isi pesan notifikasi',
    'high' // Prioritas: 'low', 'normal', 'high'
);

// Memproses notifikasi dari antrian
$processedCount = $notifikasiController->processNotificationQueue(50);
```

## Manfaat Implementasi

1. **Array**:
   - Akses cepat ke data dengan kompleksitas O(1)
   - Fleksibilitas dalam manipulasi data
   - Kompatibilitas dengan React hooks dan rendering

2. **Array 2D**:
   - Organisasi data yang logis untuk visualisasi
   - Pemrosesan efisien untuk data multidimensi
   - Representasi visual yang jelas dan intuitif

3. **Queue**:
   - Pemrosesan notifikasi secara berurutan (FIFO)
   - Dukungan untuk notifikasi berprioritas
   - Skalabilitas untuk menangani volume notifikasi yang besar

## Kesimpulan

Implementasi struktur data Array, Array 2D, dan Queue dalam aplikasi MasjidTaqwa membantu meningkatkan efisiensi, keterbacaan kode, dan performa aplikasi secara keseluruhan. Struktur data ini memungkinkan pengelolaan data yang lebih terorganisir dan visualisasi yang lebih informatif untuk pengguna. 