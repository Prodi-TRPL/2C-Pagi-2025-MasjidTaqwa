# Analisis Struktur Data pada Aplikasi MasjidTaqwa

Dokumen ini berisi analisis struktur data yang digunakan dalam aplikasi manajemen donasi MasjidTaqwa, serta implementasi dan penjelasan fungsi masing-masing struktur data.

## 1. Array

Array adalah struktur data yang menyimpan elemen-elemen dengan tipe data yang sama secara berurutan dalam memori. Dalam aplikasi MasjidTaqwa, array digunakan secara luas untuk menyimpan dan mengelola data seperti proyek pembangunan, pengeluaran, dan kategori.

### Implementasi pada Aplikasi:

```javascript
// Contoh penggunaan array di ProyekPembangunan.jsx
const [proyeks, setProyeks] = useState([]);
const [pengeluarans, setPengeluarans] = useState([]);
const [kategoris, setKategoris] = useState([]);
```

### Fungsi:
- **Penyimpanan Data**: Menyimpan daftar proyek, pengeluaran, dan kategori
- **Iterasi**: Memungkinkan perulangan untuk menampilkan data dalam UI
- **Manipulasi Data**: Memungkinkan operasi seperti filter, map, dan sort

### Manfaat:
- **Akses Cepat**: Akses elemen berdasarkan indeks dengan kompleksitas O(1)
- **Fleksibilitas**: Mudah dimanipulasi untuk berbagai kebutuhan tampilan
- **Kompatibilitas**: Bekerja dengan baik dengan React hooks dan rendering

<!-- ## 2. Array 2 Dimensi (2D Array)

Array 2 dimensi adalah array yang berisi array lain sebagai elemennya. Struktur ini berguna untuk merepresentasikan data tabular atau matriks.

### Implementasi pada Aplikasi:

```javascript
// Implementasi array 2D untuk data grafik di AdminGraphAmountController.php
// Direpresentasikan sebagai objek dengan array sebagai nilai
const chartData = {
  incomes: [100000, 200000, 150000, 300000, 250000, 350000, 400000, 200000, 300000, 450000, 500000, 600000],
  expenses: [50000, 100000, 75000, 125000, 200000, 150000, 300000, 100000, 150000, 200000, 250000, 300000]
};
```

### Fungsi:
- **Data Multidimensi**: Menyimpan data yang memiliki hubungan baris dan kolom
- **Visualisasi**: Menyediakan struktur untuk data yang akan divisualisasikan dalam grafik
- **Analisis**: Memudahkan perbandingan data antara kategori yang berbeda

### Manfaat:
- **Organisasi Data**: Mengelompokkan data terkait dalam struktur yang logis
- **Pemrosesan Efisien**: Memudahkan operasi pada kelompok data terkait
- **Visualisasi Jelas**: Struktur data yang cocok untuk representasi visual -->

## 3. Queue (Antrian)

Queue adalah struktur data yang mengikuti prinsip FIFO (First In, First Out), di mana elemen pertama yang masuk adalah elemen pertama yang keluar.

### Implementasi pada Aplikasi:

```php
// Implementasi Queue untuk sistem notifikasi di NotifikasiController.php
class NotificationQueue {
    private $queue = [];
    
    // Menambahkan notifikasi ke antrian
    public function enqueue($notification) {
        $this->queue[] = $notification;
    }
    
    // Mengambil notifikasi dari antrian
    public function dequeue() {
        if ($this->isEmpty()) {
            return null;
        }
        return array_shift($this->queue);
    }
    
    // Memeriksa apakah antrian kosong
    public function isEmpty() {
        return empty($this->queue);
    }
    
    // Mendapatkan jumlah notifikasi dalam antrian
    public function size() {
        return count($this->queue);
    }
    
    // Melihat notifikasi paling depan tanpa menghapusnya
    public function peek() {
        if ($this->isEmpty()) {
            return null;
        }
        return $this->queue[0];
    }
}
```

### Fungsi:
- **Manajemen Notifikasi**: Memastikan notifikasi diproses secara berurutan
- **Prioritas**: Dapat dimodifikasi untuk mendukung notifikasi berprioritas
- **Asinkronisitas**: Mendukung pemrosesan notifikasi secara asinkron

### Manfaat:
- **Urutan Teratur**: Memastikan notifikasi diproses sesuai urutan kedatangan
- **Skalabilitas**: Dapat menangani volume notifikasi yang besar
- **Keandalan**: Mencegah kehilangan notifikasi saat sistem sibuk

## Implementasi Praktis dalam Aplikasi MasjidTaqwa

### 1. Implementasi Array untuk Pengelolaan Proyek

```javascript
// File: resources/js/pages/dashboard/DashboardAdmin/ProyekPembangunan.jsx

// Array untuk menyimpan daftar proyek
const [proyeks, setProyeks] = useState([]);

// Fungsi untuk memfilter dan mengurutkan proyek
useEffect(() => {
  // Penerapan filter pencarian
  let filtered = [...proyeks];
  
  if (searchTerm.trim() !== '') {
    filtered = filtered.filter(p => 
      p.nama_item.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (p.deskripsi && p.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }
  
  // Penerapan filter status
  if (statusFilter !== 'all') {
    filtered = filtered.filter(p => {
      const progress = hitungProgress(p);
      if (statusFilter === 'completed') {
        return progress >= 100;
      } else if (statusFilter === 'in-progress') {
        return progress < 100;
      }
      return true;
    });
  }
  
  // Penerapan pengurutan
  filtered.sort((a, b) => {
    switch (sortOption) {
      case 'date-desc': // Newest first
        return new Date(b.created_at) - new Date(a.created_at);
      case 'date-asc': // Oldest first
        return new Date(a.created_at) - new Date(b.created_at);
      case 'title-asc': // A-Z
        return a.nama_item.localeCompare(b.nama_item);
      case 'title-desc': // Z-A
        return b.nama_item.localeCompare(a.nama_item);
      default:
        return new Date(b.created_at) - new Date(a.created_at);
    }
  });
  
  setFilteredProyeks(filtered);
  // Reset ke halaman pertama saat filter berubah
  setCurrentPage(1);
}, [searchTerm, proyeks, sortOption, statusFilter]);
```

<!-- ### 2. Implementasi Array 2D untuk Visualisasi Data Keuangan

```javascript
// File: resources/js/components/charts/DonationChart.jsx

// Implementasi array 2D untuk data grafik donasi dan pengeluaran
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

// Penggunaan data untuk grafik
const options = {
  chart: {
    type: 'bar',
    height: 350,
    stacked: false,
  },
  plotOptions: {
    bar: {
      horizontal: false,
    },
  },
  series: [
    {
      name: 'Pemasukan',
      data: chartData.map(item => item[1])
    },
    {
      name: 'Pengeluaran',
      data: chartData.map(item => item[2])
    }
  ],
  xaxis: {
    categories: chartData.map(item => item[0])
  }
};
``` -->

### 3. Implementasi Queue untuk Sistem Notifikasi

```php
// File: app/Http/Controllers/NotifikasiController.php

/**
 * Menambahkan notifikasi ke antrian
 */
public function queueNotification($userId, $title, $message, $priority = 'normal')
{
    // Membuat objek notifikasi
    $notification = new Notifikasi();
    $notification->notifikasi_id = (string) Str::uuid();
    $notification->pengguna_id = $userId;
    $notification->judul = $title;
    $notification->pesan = $message;
    $notification->dibaca = false;
    $notification->priority = $priority;
    $notification->created_at = now();
    $notification->save();
    
    // Menambahkan ke antrian untuk pemrosesan
    $this->processNotificationQueue();
    
    return $notification->notifikasi_id;
}

/**
 * Memproses antrian notifikasi berdasarkan prioritas
 */
public function processNotificationQueue($limit = 50)
{
    // Mengambil notifikasi dari antrian berdasarkan prioritas
    $notifications = Notifikasi::where('processed', false)
        ->orderBy('priority', 'desc')  // Prioritas tinggi diproses lebih dulu
        ->orderBy('created_at', 'asc') // FIFO untuk prioritas yang sama
        ->limit($limit)
        ->get();
    
    foreach ($notifications as $notification) {
        // Proses notifikasi (misalnya, kirim email, push notification, dll)
        $this->sendNotification($notification);
        
        // Tandai sebagai diproses
        $notification->processed = true;
        $notification->save();
    }
    
    return count($notifications);
}

/**
 * Mengirim notifikasi ke pengguna
 */
private function sendNotification($notification)
{
    // Implementasi pengiriman notifikasi
    // Bisa berupa email, push notification, atau in-app notification
    
    // Contoh implementasi in-app notification
    // Notifikasi sudah tersimpan di database, jadi tidak perlu implementasi tambahan
    
    return true;
}
```

## Kesimpulan

Struktur data yang diimplementasikan dalam aplikasi MasjidTaqwa memiliki peran penting dalam pengelolaan dan visualisasi data donasi dan pengeluaran. Penggunaan array memungkinkan penyimpanan dan manipulasi data yang efisien, array 2D mendukung visualisasi data yang kompleks, dan queue memastikan pengelolaan notifikasi yang teratur dan andal.

Dengan kombinasi struktur data ini, aplikasi MasjidTaqwa dapat menyediakan pengalaman pengguna yang responsif dan informatif, serta memastikan pengelolaan donasi yang transparan dan efisien. 