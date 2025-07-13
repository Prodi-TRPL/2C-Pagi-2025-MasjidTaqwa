# Log Aktivitas Otomatis Cleanup

Sistem penghapusan otomatis log aktivitas setiap 6 bulan sekali.

## Deskripsi

Fitur ini secara otomatis menghapus data log aktivitas yang berumur lebih dari 6 bulan. Tujuannya adalah untuk:

1. Menjaga ukuran database agar tetap optimal
2. Mengurangi jumlah data yang perlu diproses saat menampilkan log
3. Mempertahankan hanya data yang relevan dan terkini

## Implementasi

Sistem menggunakan Laravel Task Scheduler untuk menjalankan perintah penghapusan setiap hari. Perintah ini akan:

1. Menghitung tanggal 6 bulan ke belakang dari tanggal saat ini
2. Menghapus semua catatan log dengan `created_at` yang lebih lama dari tanggal tersebut
3. Mencatat hasil penghapusan di log sistem

## Konfigurasi

Perintah `logs:cleanup` berjalan otomatis setiap hari pada tengah malam melalui Laravel Scheduler.

### Perubahan Jadwal

Jika Anda ingin mengubah jadwal penghapusan, ubah konfigurasi di file `app/Console/Kernel.php`:

```php
// Contoh: Jalankan setiap minggu (alih-alih harian)
$schedule->command('logs:cleanup')->weekly();

// Contoh: Jalankan setiap bulan
$schedule->command('logs:cleanup')->monthly();
```

### Perubahan Periode Retensi

Jika Anda ingin mengubah periode retensi (misalnya dari 6 bulan menjadi periode lain), ubah file `app/Console/Commands/CleanupOldLogs.php`:

```php
// Contoh: Ubah dari 6 bulan menjadi 12 bulan
$sixMonthsAgo = Carbon::now()->subMonths(12);
```

## Memastikan Scheduler Berjalan

Untuk memastikan Laravel Scheduler berjalan, pastikan cron job berikut sudah terkonfigurasi di server:

```
* * * * * cd /path-to-project && php artisan schedule:run >> /dev/null 2>&1
```

## Menjalankan Penghapusan Manual

Jika Anda perlu menjalankan penghapusan manual kapan saja, gunakan perintah:

```
php artisan logs:cleanup
``` 