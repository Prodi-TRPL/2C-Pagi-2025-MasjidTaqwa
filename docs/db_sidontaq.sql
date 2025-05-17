-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: May 17, 2025 at 01:31 PM
-- Server version: 8.0.42
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_sidontaq`
--

-- --------------------------------------------------------

--
-- Table structure for table `donasi`
--

CREATE TABLE `donasi` (
  `donasi_id` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `pengguna_id` char(36) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `laporan_keuangan_id` char(36) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `jumlah` decimal(15,2) DEFAULT NULL,
  `metode_pembayaran_id` char(36) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `status` enum('Menunggu','Diterima','Kadaluarsa') COLLATE utf8mb4_general_ci DEFAULT 'Menunggu',
  `tanggal_donasi` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `kategori_pengeluaran`
--

CREATE TABLE `kategori_pengeluaran` (
  `kategori_pengeluaran_id` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `nama_kategori` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `laporan_keuangan`
--

CREATE TABLE `laporan_keuangan` (
  `laporan_keuangan_id` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `periode` date DEFAULT NULL,
  `total_pemasukan` decimal(15,2) DEFAULT NULL,
  `total_pengeluaran` decimal(15,2) DEFAULT NULL,
  `saldo` decimal(15,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `metode_pembayaran`
--

CREATE TABLE `metode_pembayaran` (
  `metode_pembayaran_id` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `nama_metode` varchar(50) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int UNSIGNED NOT NULL,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2019_12_14_000001_create_personal_access_tokens_table', 1);

-- --------------------------------------------------------

--
-- Table structure for table `notifikasi`
--

CREATE TABLE `notifikasi` (
  `notifikasi_id` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `pengguna_id` char(36) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `donasi_id` char(36) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `tipe` enum('target_tercapai','progres_pembangunan','donasi_diterima') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `pesan` text COLLATE utf8mb4_general_ci,
  `status` enum('terkirim','dibaca') COLLATE utf8mb4_general_ci DEFAULT 'terkirim',
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pengeluaran`
--

CREATE TABLE `pengeluaran` (
  `pengeluaran_id` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `proyek_id` char(36) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `penginput_id` char(36) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `kategori_pengeluaran_id` char(36) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `laporan_keuangan_id` char(36) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `jumlah` decimal(15,2) DEFAULT NULL,
  `tanggal_pengeluaran` timestamp NULL DEFAULT NULL,
  `nama_pengeluaran` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `keterangan` text COLLATE utf8mb4_general_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pengguna`
--

CREATE TABLE `pengguna` (
  `pengguna_id` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `nama` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `role` enum('admin','donatur') COLLATE utf8mb4_general_ci DEFAULT 'donatur',
  `nomor_hp` varchar(15) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pengguna`
--

INSERT INTO `pengguna` (`pengguna_id`, `nama`, `email`, `password`, `role`, `nomor_hp`, `created_at`) VALUES
('6fe76142-716f-492f-a592-4391b770aedc', 'Admin New', 'admin@gmail.com', '$2y$12$sKa6.MyVWMwduoErVvxANelZc2EdDwwOd.eyQuR6RxALHzJ3cQ3fy', 'admin', '081234567891', '2025-05-14 18:25:52');

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `proyek_pembangunan`
--

CREATE TABLE `proyek_pembangunan` (
  `proyek_id` char(36) COLLATE utf8mb4_general_ci NOT NULL,
  `admin_id` char(36) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `nama_item` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `deskripsi` text COLLATE utf8mb4_general_ci,
  `target_dana` decimal(15,2) DEFAULT NULL,
  `dana_terkumpul` decimal(15,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `donasi`
--
ALTER TABLE `donasi`
  ADD PRIMARY KEY (`donasi_id`),
  ADD KEY `pengguna_id` (`pengguna_id`),
  ADD KEY `laporan_keuangan_id` (`laporan_keuangan_id`),
  ADD KEY `metode_pembayaran_id` (`metode_pembayaran_id`);

--
-- Indexes for table `kategori_pengeluaran`
--
ALTER TABLE `kategori_pengeluaran`
  ADD PRIMARY KEY (`kategori_pengeluaran_id`);

--
-- Indexes for table `laporan_keuangan`
--
ALTER TABLE `laporan_keuangan`
  ADD PRIMARY KEY (`laporan_keuangan_id`);

--
-- Indexes for table `metode_pembayaran`
--
ALTER TABLE `metode_pembayaran`
  ADD PRIMARY KEY (`metode_pembayaran_id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifikasi`
--
ALTER TABLE `notifikasi`
  ADD PRIMARY KEY (`notifikasi_id`),
  ADD KEY `pengguna_id` (`pengguna_id`),
  ADD KEY `donasi_id` (`donasi_id`);

--
-- Indexes for table `pengeluaran`
--
ALTER TABLE `pengeluaran`
  ADD PRIMARY KEY (`pengeluaran_id`),
  ADD KEY `proyek_id` (`proyek_id`),
  ADD KEY `penginput_id` (`penginput_id`),
  ADD KEY `kategori_pengeluaran_id` (`kategori_pengeluaran_id`),
  ADD KEY `laporan_keuangan_id` (`laporan_keuangan_id`);

--
-- Indexes for table `pengguna`
--
ALTER TABLE `pengguna`
  ADD PRIMARY KEY (`pengguna_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);

--
-- Indexes for table `proyek_pembangunan`
--
ALTER TABLE `proyek_pembangunan`
  ADD PRIMARY KEY (`proyek_id`),
  ADD KEY `admin_id` (`admin_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `donasi`
--
ALTER TABLE `donasi`
  ADD CONSTRAINT `donasi_ibfk_1` FOREIGN KEY (`pengguna_id`) REFERENCES `pengguna` (`pengguna_id`),
  ADD CONSTRAINT `donasi_ibfk_2` FOREIGN KEY (`laporan_keuangan_id`) REFERENCES `laporan_keuangan` (`laporan_keuangan_id`),
  ADD CONSTRAINT `donasi_ibfk_3` FOREIGN KEY (`metode_pembayaran_id`) REFERENCES `metode_pembayaran` (`metode_pembayaran_id`);

--
-- Constraints for table `notifikasi`
--
ALTER TABLE `notifikasi`
  ADD CONSTRAINT `notifikasi_ibfk_1` FOREIGN KEY (`pengguna_id`) REFERENCES `pengguna` (`pengguna_id`),
  ADD CONSTRAINT `notifikasi_ibfk_2` FOREIGN KEY (`donasi_id`) REFERENCES `donasi` (`donasi_id`);

--
-- Constraints for table `pengeluaran`
--
ALTER TABLE `pengeluaran`
  ADD CONSTRAINT `pengeluaran_ibfk_1` FOREIGN KEY (`proyek_id`) REFERENCES `proyek_pembangunan` (`proyek_id`),
  ADD CONSTRAINT `pengeluaran_ibfk_2` FOREIGN KEY (`penginput_id`) REFERENCES `pengguna` (`pengguna_id`),
  ADD CONSTRAINT `pengeluaran_ibfk_3` FOREIGN KEY (`kategori_pengeluaran_id`) REFERENCES `kategori_pengeluaran` (`kategori_pengeluaran_id`),
  ADD CONSTRAINT `pengeluaran_ibfk_4` FOREIGN KEY (`laporan_keuangan_id`) REFERENCES `laporan_keuangan` (`laporan_keuangan_id`);

--
-- Constraints for table `proyek_pembangunan`
--
ALTER TABLE `proyek_pembangunan`
  ADD CONSTRAINT `proyek_pembangunan_ibfk_1` FOREIGN KEY (`admin_id`) REFERENCES `pengguna` (`pengguna_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
