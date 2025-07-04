# Ringkasan Implementasi Struktur Data pada Aplikasi MasjidTaqwa

## Struktur Data yang Diimplementasikan

Dalam pengembangan aplikasi MasjidTaqwa, telah diimplementasikan tiga struktur data utama:

1. **Array**
2. **Array 2 Dimensi (2D Array)**
3. **Queue (Antrian)**

## Detail Implementasi

### 1. Array

Array diimplementasikan pada komponen React untuk pengelolaan data proyek dan pengeluaran.

**File:** `resources/js/pages/dashboard/DashboardAdmin/ProyekPembangunan.jsx`

```javascript
/**
 * STRUKTUR DATA: ARRAY IMPLEMENTATION
 * Array untuk menyimpan daftar proyek, pengeluaran, dan kategori
 * Memungkinkan penyimpanan, iterasi, dan manipulasi data secara efisien
 */
const [proyeks, setProyeks] = useState([]);
const [pengeluarans, setPengeluarans] = useState([]);
const [kategoris, setKategoris] = useState([]);
```

**Operasi yang Diimplementasikan:**
- Filtering data berdasarkan kriteria pencarian
- Sorting data berdasarkan berbagai parameter
- Pagination untuk menampilkan data secara bertahap

### 2. Array 2 Dimensi (2D Array)

Array 2D diimplementasikan untuk visualisasi data keuangan dalam bentuk grafik.

**File:** `resources/js/components/charts/DonationChart.jsx` dan `app/Http/Controllers/AdminGraphAmountController.php`

```javascript
/**
 * STRUKTUR DATA: 2D ARRAY PROCESSING
 * Memproses data pemasukan dan pengeluaran menjadi struktur array 2 dimensi
 */
const prepareChartData = (incomeData, expenseData) => {
  // Array 2D: Baris mewakili bulan, kolom mewakili tipe data (income/expense)
  const chartData = [];
  
  // Nama bulan untuk label
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  
  // Membangun array 2D
  for (let i = 0; i < 12; i++) {
    chartData.push([
      months[i],                // Nama bulan
      incomeData[i] || 0,       // Data pemasukan
      expenseData[i] || 0       // Data pengeluaran
    ]);
  }
  
  return chartData;
};
```

**Operasi yang Diimplementasikan:**
- Penyimpanan data multidimensi (bulan dan jenis data)
- Akses dan manipulasi data untuk visualisasi grafik
- Perhitungan total dan statistik dari data multidimensi

### 3. Queue (Antrian)

Queue diimplementasikan untuk sistem notifikasi dengan prioritas.

**File:** `app/Models/Notifikasi.php`, `app/Http/Controllers/NotifikasiController.php`, dan `app/Console/Commands/ProcessNotificationQueue.php`

```php
/**
 * STRUKTUR DATA: QUEUE METHODS
 * Metode untuk mendukung operasi Queue pada notifikasi
 */

/**
 * Menambahkan notifikasi ke antrian (enqueue)
 */
public static function enqueue($userId, $title, $message, $priority = 'normal')
{
    $notification = new self();
    $notification->notifikasi_id = (string) \Illuminate\Support\Str::uuid();
    $notification->pengguna_id = $userId;
    $notification->judul = $title;
    $notification->pesan = $message;
    $notification->dibaca = false;
    $notification->processed = false;
    $notification->priority = $priority;
    $notification->created_at = now();
    $notification->save();
    
    return $notification->notifikasi_id;
}

/**
 * Mengambil notifikasi dari antrian berdasarkan prioritas (dequeue)
 */
public static function dequeueByPriority($limit = 50)
{
    return self::where('processed', false)
        ->orderBy('priority', 'desc')  // Prioritas tinggi diproses lebih dulu
        ->orderBy('created_at', 'asc') // FIFO untuk prioritas yang sama
        ->limit($limit)
        ->get();
}
```

**Operasi yang Diimplementasikan:**
- Enqueue: Menambahkan notifikasi ke antrian
- Dequeue: Mengambil notifikasi dari antrian berdasarkan prioritas
- Pemrosesan FIFO (First In, First Out) dengan dukungan prioritas

## Migrasi Database

Untuk mendukung implementasi Queue, telah dibuat migrasi database untuk menambahkan kolom `processed` dan `priority` ke tabel `notifikasi`:

**File:** `database/migrations/2025_07_02_000000_add_processed_and_priority_to_notifikasi_table.php`

```php
/**
 * STRUKTUR DATA: QUEUE SUPPORT
 * Menambahkan kolom 'processed' dan 'priority' ke tabel notifikasi
 * untuk mendukung implementasi struktur data Queue
 */
public function up(): void
{
    Schema::table('notifikasi', function (Blueprint $table) {
        // Kolom untuk menandai apakah notifikasi sudah diproses
        $table->boolean('processed')->default(false);
        
        // Kolom untuk menentukan prioritas notifikasi
        $table->enum('priority', ['low', 'normal', 'high'])->default('normal');
    });
}
```

## Command untuk Memproses Queue

Untuk memudahkan pemrosesan antrian notifikasi, telah dibuat command Artisan:

**File:** `app/Console/Commands/ProcessNotificationQueue.php`

```php
/**
 * STRUKTUR DATA: QUEUE PROCESSING COMMAND
 * Command untuk memproses antrian notifikasi
 * Mengimplementasikan konsep Queue (FIFO) dengan prioritas
 */
class ProcessNotificationQueue extends Command
{
    protected $signature = 'notifications:process {--limit=50 : Maximum number of notifications to process}';
    protected $description = 'Process the notification queue based on priority';

    public function handle()
    {
        $limit = $this->option('limit');
        $this->info("Processing notification queue (limit: $limit)...");
        
        $notificationController = new NotifikasiController();
        $count = $notificationController->processNotificationQueue($limit);
        
        $this->info("Processed $count notifications.");
        
        return Command::SUCCESS;
    }
}
```

Command ini dapat dijalankan dengan perintah:

```bash
php artisan notifications:process --limit=10
```

## Kesimpulan

Implementasi struktur data Array, Array 2D, dan Queue pada aplikasi MasjidTaqwa telah berhasil dilakukan. Struktur data ini memberikan manfaat berupa:

1. **Efisiensi**: Akses dan manipulasi data yang lebih cepat dan efisien
2. **Keterbacaan**: Kode yang lebih terstruktur dan mudah dipahami
3. **Skalabilitas**: Kemampuan menangani volume data yang lebih besar
4. **Fleksibilitas**: Kemampuan untuk menerapkan berbagai operasi pada data

Dengan implementasi ini, aplikasi MasjidTaqwa menjadi lebih handal dalam mengelola data donasi dan pengeluaran, serta memberikan pengalaman pengguna yang lebih baik melalui visualisasi data dan sistem notifikasi yang efisien. 