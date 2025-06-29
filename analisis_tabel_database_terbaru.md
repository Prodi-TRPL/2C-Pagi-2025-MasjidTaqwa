# Analisis Normalisasi Tabel Database MasjidTaqwa

## Tabel: pengguna
- Bentuk Normal: 1NF → 2NF → 3NF → BCNF

Analisis:
Tabel ini telah memenuhi BCNF. Primary key adalah `pengguna_id` (UUID), dan seluruh atribut lain (nama, email, password, dll) secara fungsional bergantung hanya pada primary key. Tidak ada ketergantungan transitif atau ketergantungan parsial.

### Struktur Tabel
| Kolom                 | Tipe Data       | Keterangan                  |
|-----------------------|-----------------|----------------------------- |
| pengguna_id           | UUID            | PRIMARY KEY                 |
| nama                  | VARCHAR(100)    | nullable                    |
| email                 | VARCHAR(100)    | nullable, unique            |
| password              | VARCHAR(255)    | nullable                    |
| role                  | ENUM            | 'admin', 'donatur'          |
| nomor_hp              | VARCHAR(15)     | nullable                    |
| created_at            | TIMESTAMP       | nullable                    |
| can_donate            | BOOLEAN         | default: true               |
| can_view_history      | BOOLEAN         | default: true               |
| can_view_notification | BOOLEAN         | default: true               |

### Contoh Data
| pengguna_id                           | nama           | email                  | password (hashed)                                       | role    | nomor_hp      | created_at          | can_donate | can_view_history | can_view_notification |
|--------------------------------------|----------------|------------------------|--------------------------------------------------------|---------|---------------|---------------------|------------|-----------------|----------------------|
| 550e8400-e29b-41d4-a716-446655440000 | Ahmad Fauzi    | ahmad@example.com      | $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi | admin   | 081234567890  | 2025-06-01 08:00:00 | true       | true            | true                 |
| 6ba7b810-9dad-11d1-80b4-00c04fd430c8 | Siti Rahayu    | siti@example.com       | $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi | donatur | 089876543210  | 2025-06-01 09:30:00 | true       | true            | true                 |

**1NF**: ✓ Semua nilai atribut adalah atomik (tidak bisa dibagi lagi)
**2NF**: ✓ Memenuhi 1NF dan semua atribut non-kunci bergantung sepenuhnya pada primary key
**3NF**: ✓ Memenuhi 2NF dan tidak ada ketergantungan transitif (atribut non-kunci bergantung pada atribut non-kunci lainnya)
**BCNF**: ✓ Memenuhi 3NF dan setiap determinan adalah candidate key

## Tabel: laporan_keuangan
- Bentuk Normal: 1NF → 2NF → 3NF → BCNF

Analisis:
Tabel ini telah memenuhi BCNF. Primary key adalah `laporan_keuangan_id`, dan semua atribut lainnya bergantung penuh pada primary key tersebut. Tidak ada ketergantungan transitif.

### Struktur Tabel
| Kolom                 | Tipe Data       | Keterangan                  |
|-----------------------|-----------------|----------------------------- |
| laporan_keuangan_id   | UUID            | PRIMARY KEY                 |
| bulan                 | VARCHAR(50)     |                             |
| tahun                 | INT             |                             |
| total_pemasukan       | DECIMAL(15,2)   | default: 0                  |
| total_pengeluaran     | DECIMAL(15,2)   | default: 0                  |

### Contoh Data
| laporan_keuangan_id                  | bulan     | tahun | total_pemasukan | total_pengeluaran |
|-------------------------------------|-----------|-------|-----------------|-------------------|
| 7dc53df5-703e-49b3-8670-b1c468f47f1f | Juni      | 2025  | 15000000.00     | 7500000.00        |
| e23a9520-7ad7-4b3a-b4e7-59812b3b5c01 | Juli      | 2025  | 18500000.00     | 9200000.00        |

**1NF**: ✓ Semua nilai atribut adalah atomik
**2NF**: ✓ Memenuhi 1NF dan semua atribut non-kunci bergantung sepenuhnya pada primary key
**3NF**: ✓ Memenuhi 2NF dan tidak ada ketergantungan transitif
**BCNF**: ✓ Memenuhi 3NF dan setiap determinan adalah candidate key

## Tabel: kategori_pengeluaran
- Bentuk Normal: 1NF → 2NF → 3NF → BCNF

Analisis:
Tabel ini telah memenuhi BCNF. Memiliki primary key `kategori_id` dengan atribut `nama` yang bergantung langsung pada primary key. Struktur tabel sangat sederhana dan sudah optimal.

### Struktur Tabel
| Kolom                 | Tipe Data       | Keterangan                  |
|-----------------------|-----------------|----------------------------- |
| kategori_id           | VARCHAR(255)    | PRIMARY KEY                 |
| nama                  | VARCHAR(100)    |                             |

### Contoh Data
| kategori_id                          | nama                    |
|-------------------------------------|-------------------------|
| 9b2d8f91-a8b7-4c60-9c0d-53e5dd63b9a5 | Pembelian Material      |
| 4f9e8d7c-6b5a-4c3d-2e1f-0a9b8c7d6e5f | Upah Tukang            |

**1NF**: ✓ Semua nilai atribut adalah atomik
**2NF**: ✓ Memenuhi 1NF dan semua atribut non-kunci bergantung sepenuhnya pada primary key
**3NF**: ✓ Memenuhi 2NF dan tidak ada ketergantungan transitif
**BCNF**: ✓ Memenuhi 3NF dan setiap determinan adalah candidate key

## Tabel: proyek_pembangunan
- Bentuk Normal: 1NF → 2NF → 3NF → BCNF

Analisis:
Tabel ini telah memenuhi BCNF. Primary key adalah `proyek_id` dan seluruh atribut non-kunci (`admin_id`, `nama_item`, `deskripsi`, dll.) bergantung langsung pada primary key. Foreign key `admin_id` sudah tepat untuk relasi dengan tabel pengguna.

### Struktur Tabel
| Kolom                 | Tipe Data       | Keterangan                  |
|-----------------------|-----------------|----------------------------- |
| proyek_id             | VARCHAR(255)    | PRIMARY KEY                 |
| admin_id              | UUID            | FOREIGN KEY                 |
| nama_item             | VARCHAR(255)    |                             |
| deskripsi             | TEXT            |                             |
| target_dana           | DECIMAL(15,2)   |                             |
| dana_terkumpul        | DECIMAL(15,2)   | default: 0                  |
| created_at            | TIMESTAMP       |                             |
| gambar                | VARCHAR(255)    | nullable                    |

### Contoh Data
| proyek_id                            | admin_id                             | nama_item            | deskripsi                        | target_dana  | dana_terkumpul | created_at          | gambar             |
|-------------------------------------|--------------------------------------|----------------------|----------------------------------|--------------|----------------|---------------------|-------------------|
| 1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p | 550e8400-e29b-41d4-a716-446655440000 | Renovasi Kubah       | Renovasi kubah masjid yang rusak | 100000000.00 | 75000000.00    | 2025-06-05 10:00:00 | kubah.jpg         |
| 2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q | 550e8400-e29b-41d4-a716-446655440000 | Perluasan Area Sholat | Perluasan area sholat utama      | 200000000.00 | 120000000.00   | 2025-06-10 14:30:00 | area_sholat.jpg   |

**1NF**: ✓ Semua nilai atribut adalah atomik
**2NF**: ✓ Memenuhi 1NF dan semua atribut non-kunci bergantung sepenuhnya pada primary key
**3NF**: ✓ Memenuhi 2NF dan tidak ada ketergantungan transitif
**BCNF**: ✓ Memenuhi 3NF dan setiap determinan adalah candidate key

## Tabel: pengeluaran
- Bentuk Normal: 1NF → 2NF → 3NF → BCNF

Analisis:
Tabel ini telah memenuhi BCNF. Primary key adalah `pengeluaran_id`, dengan dependensi fungsional penuh dari semua atribut non-kunci ke primary key. Foreign key `penginput_id`, `kategori_id`, dan `proyek_id` menunjukkan relasi yang tepat ke tabel lain.

### Struktur Tabel
| Kolom                 | Tipe Data       | Keterangan                  |
|-----------------------|-----------------|----------------------------- |
| pengeluaran_id        | VARCHAR(255)    | PRIMARY KEY                 |
| penginput_id          | UUID            | FOREIGN KEY                 |
| kategori_id           | VARCHAR(255)    | FOREIGN KEY                 |
| proyek_id             | VARCHAR(255)    | FOREIGN KEY                 |
| jumlah                | DECIMAL(15,2)   |                             |
| keterangan            | TEXT            |                             |
| tanggal_pengeluaran   | DATE            |                             |
| created_at            | TIMESTAMP       | nullable                    |

### Contoh Data
| pengeluaran_id                       | penginput_id                         | kategori_id                         | proyek_id                            | jumlah      | keterangan                 | tanggal_pengeluaran | created_at          |
|-------------------------------------|-------------------------------------|-------------------------------------|-------------------------------------|-------------|---------------------------|---------------------|---------------------|
| 3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r | 550e8400-e29b-41d4-a716-446655440000 | 9b2d8f91-a8b7-4c60-9c0d-53e5dd63b9a5 | 1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p | 25000000.00 | Pembelian bahan kubah      | 2025-06-15         | 2025-06-15 09:45:00 |
| 4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s | 550e8400-e29b-41d4-a716-446655440000 | 4f9e8d7c-6b5a-4c3d-2e1f-0a9b8c7d6e5f | 1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p | 15000000.00 | Pembayaran upah tukang     | 2025-06-20         | 2025-06-20 15:30:00 |

**1NF**: ✓ Semua nilai atribut adalah atomik
**2NF**: ✓ Memenuhi 1NF dan semua atribut non-kunci bergantung sepenuhnya pada primary key
**3NF**: ✓ Memenuhi 2NF dan tidak ada ketergantungan transitif
**BCNF**: ✓ Memenuhi 3NF dan setiap determinan adalah candidate key

## Tabel: donasi
- Bentuk Normal: 1NF → 2NF → 3NF

Analisis:
Tabel donasi memenuhi 3NF tetapi tidak sepenuhnya BCNF. Meskipun tidak ada ketergantungan transitif antara atribut non-kunci, tabel ini menyimpan data donatur (name, email) yang seharusnya disimpan di tabel terpisah berdasarkan konsep BCNF ketat. Namun, struktur ini dapat dipertahankan karena pertimbangan praktis, seperti:
1. Memungkinkan donasi anonim atau donasi satu kali tanpa perlu membuat akun pengguna
2. Memudahkan proses bisnis dan mengurangi kompleksitas aplikasi

### Struktur Tabel
| Kolom                 | Tipe Data       | Keterangan                  |
|-----------------------|-----------------|----------------------------- |
| donasi_id             | VARCHAR(255)    | PRIMARY KEY                 |
| pengguna_id           | UUID            | FOREIGN KEY, nullable       |
| laporan_keuangan_id   | VARCHAR(255)    | FOREIGN KEY                 |
| jumlah                | DECIMAL(15,2)   |                             |
| status                | ENUM            | 'Diterima','Pending','Kadaluarsa','Dibatalkan' |
| order_id              | VARCHAR(255)    | nullable                    |
| payment_type          | VARCHAR(50)     | nullable                    |
| snap_token            | VARCHAR(255)    | nullable                    |
| name                  | VARCHAR(100)    | nullable                    |
| email                 | VARCHAR(100)    | nullable                    |
| created_at            | TIMESTAMP       | nullable                    |
| updated_at            | TIMESTAMP       | nullable                    |

### Contoh Data
| donasi_id                            | pengguna_id                           | laporan_keuangan_id                  | jumlah      | status    | order_id           | payment_type | snap_token         | name         | email                | created_at          | updated_at          |
|-------------------------------------|--------------------------------------|-------------------------------------|-------------|-----------|-------------------|-------------|-------------------|--------------|---------------------|---------------------|---------------------|
| 5e6f7g8h-9i0j-1k2l-3m4n-5o6p7q8r9s0t | 6ba7b810-9dad-11d1-80b4-00c04fd430c8 | 7dc53df5-703e-49b3-8670-b1c468f47f1f | 5000000.00  | Diterima  | ORDER-123456      | bank_transfer | tok_abcd1234      | Siti Rahayu  | siti@example.com     | 2025-06-15 10:30:00 | 2025-06-15 11:00:00 |
| 6f7g8h9i-0j1k-2l3m-4n5o-6p7q8r9s0t1u | null                                 | 7dc53df5-703e-49b3-8670-b1c468f47f1f | 2500000.00  | Diterima  | ORDER-123457      | credit_card  | tok_efgh5678      | Budi Santoso | budi@example.com     | 2025-06-16 14:15:00 | 2025-06-16 14:20:00 |

**1NF**: ✓ Semua nilai atribut adalah atomik
**2NF**: ✓ Memenuhi 1NF dan semua atribut non-kunci bergantung sepenuhnya pada primary key
**3NF**: ✓ Memenuhi 2NF dan tidak ada ketergantungan transitif antar atribut non-key
**BCNF**: ✗ Tidak memenuhi karena atribut name dan email memiliki dependensi fungsional yang tidak bergantung pada candidate key (teoritis saja, dalam praktek tidak masalah)

### Struktur Tabel untuk BCNF (Optional)
#### Tabel donasi (revisi)
| Kolom                 | Tipe Data       | Keterangan                  |
|-----------------------|-----------------|----------------------------- |
| donasi_id             | VARCHAR(255)    | PRIMARY KEY                 |
| pengguna_id           | UUID            | FOREIGN KEY (nullable)      |
| donatur_id            | BIGINT          | FOREIGN KEY (baru)          |
| laporan_keuangan_id   | VARCHAR(255)    | FOREIGN KEY                 |
| jumlah                | DECIMAL(15,2)   |                             |
| status                | ENUM            | Diterima/Pending/Kadaluarsa |
| order_id              | VARCHAR(255)    |                             |
| payment_type          | VARCHAR(50)     |                             |
| snap_token            | VARCHAR(255)    |                             |
| created_at            | TIMESTAMP       |                             |
| updated_at            | TIMESTAMP       |                             |

#### Tabel donatur (baru)
| Kolom                 | Tipe Data       | Keterangan                  |
|-----------------------|-----------------|----------------------------- |
| id                    | BIGINT          | PRIMARY KEY, AUTO INCREMENT |
| name                  | VARCHAR(100)    |                             |
| email                 | VARCHAR(100)    |                             |

## Tabel: notifikasi
- Bentuk Normal: 1NF → 2NF → 3NF → BCNF

Analisis: 
Tabel ini telah memenuhi BCNF. Primary key adalah `notifikasi_id`, dan seluruh atribut (judul, isi, pengguna_id, dll.) bergantung langsung pada primary key. Relasi dengan tabel pengguna melalui `pengguna_id` sudah tepat.

### Struktur Tabel
| Kolom                 | Tipe Data       | Keterangan                  |
|-----------------------|-----------------|----------------------------- |
| notifikasi_id         | VARCHAR(255)    | PRIMARY KEY                 |
| pengguna_id           | UUID            | FOREIGN KEY                 |
| isi                   | TEXT            |                             |
| is_read               | BOOLEAN         | default: false              |
| judul                 | VARCHAR(255)    | nullable                    |
| created_at            | TIMESTAMP       | nullable                    |
| updated_at            | TIMESTAMP       | nullable                    |

### Contoh Data
| notifikasi_id                        | pengguna_id                           | isi                               | is_read | judul                    | created_at          | updated_at          |
|-------------------------------------|--------------------------------------|-----------------------------------|---------|--------------------------|---------------------|---------------------|
| 7g8h9i0j-1k2l-3m4n-5o6p-7q8r9s0t1u2v | 6ba7b810-9dad-11d1-80b4-00c04fd430c8 | Donasi Anda telah diterima        | false   | Konfirmasi Donasi        | 2025-06-15 11:00:00 | null                |
| 8h9i0j1k-2l3m-4n5o-6p7q-8r9s0t1u2v3w | 6ba7b810-9dad-11d1-80b4-00c04fd430c8 | Terima kasih atas dukungan Anda   | true    | Ucapan Terima Kasih      | 2025-06-16 09:30:00 | 2025-06-16 10:15:00 |

**1NF**: ✓ Semua nilai atribut adalah atomik
**2NF**: ✓ Memenuhi 1NF dan semua atribut non-kunci bergantung sepenuhnya pada primary key
**3NF**: ✓ Memenuhi 2NF dan tidak ada ketergantungan transitif
**BCNF**: ✓ Memenuhi 3NF dan setiap determinan adalah candidate key

## Tabel: donation_settings
- Bentuk Normal: 1NF → 2NF → 3NF → BCNF

Analisis:
Tabel ini telah memenuhi BCNF. Primary key adalah `id`, dan seluruh atribut lainnya bergantung hanya pada primary key. Foreign key `proyek_id`, `created_by`, dan `last_updated_by` telah menunjukkan relasi yang tepat dengan tabel lain.

### Struktur Tabel
| Kolom                 | Tipe Data       | Keterangan                  |
|-----------------------|-----------------|----------------------------- |
| id                    | BIGINT          | PRIMARY KEY                 |
| proyek_id             | VARCHAR(255)    | FOREIGN KEY, nullable       |
| is_donation_active    | BOOLEAN         | default: true               |
| donation_end_date     | DATE            | nullable                    |
| donation_target       | DECIMAL(15,2)   | nullable                    |
| message_type          | VARCHAR(10)     | default: 'warning'          |
| denial_message        | TEXT            | nullable                    |
| created_by            | UUID            | FOREIGN KEY, nullable       |
| last_updated_by       | UUID            | FOREIGN KEY, nullable       |
| created_at            | TIMESTAMP       |                             |
| updated_at            | TIMESTAMP       |                             |

### Contoh Data
| id | proyek_id                            | is_donation_active | donation_end_date | donation_target | message_type | denial_message                         | created_by                             | last_updated_by                        | created_at          | updated_at          |
|----|-------------------------------------|-------------------|------------------|----------------|-------------|---------------------------------------|--------------------------------------|--------------------------------------|---------------------|---------------------|
| 1  | 1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p | true              | 2025-12-31       | 100000000.00    | info        | null                                  | 550e8400-e29b-41d4-a716-446655440000 | 550e8400-e29b-41d4-a716-446655440000 | 2025-06-01 08:00:00 | 2025-06-15 10:30:00 |
| 2  | 2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q | true              | 2026-06-30       | 200000000.00    | warning     | Donasi untuk proyek ini akan berakhir | 550e8400-e29b-41d4-a716-446655440000 | null                                 | 2025-06-10 14:00:00 | 2025-06-10 14:00:00 |

**1NF**: ✓ Semua nilai atribut adalah atomik
**2NF**: ✓ Memenuhi 1NF dan semua atribut non-kunci bergantung sepenuhnya pada primary key
**3NF**: ✓ Memenuhi 2NF dan tidak ada ketergantungan transitif
**BCNF**: ✓ Memenuhi 3NF dan setiap determinan adalah candidate key

## Kesimpulan

Mayoritas tabel dalam database MasjidTaqwa telah memenuhi bentuk normal BCNF, yang merupakan bentuk normalisasi tertinggi yang umum digunakan. Satu-satunya pengecualian adalah tabel `donasi` yang secara teknis hanya memenuhi 3NF. 

Namun, struktur tabel `donasi` merupakan trade-off yang dapat diterima antara normalisasi ketat dan kebutuhan bisnis. Dengan mempertahankan informasi donatur langsung di tabel donasi, aplikasi dapat menangani donasi anonim atau satu kali dengan lebih efisien.

Secara keseluruhan, skema database sudah terstruktur dengan baik dan mempertimbangkan keseimbangan antara konsistensi data dan performa aplikasi. 