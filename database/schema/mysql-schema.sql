/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
DROP TABLE IF EXISTS `donasi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `donasi` (
  `donasi_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pengguna_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `laporan_keuangan_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `jumlah` decimal(15,2) DEFAULT NULL,
  `status` enum('Diterima','Kadaluarsa') COLLATE utf8mb4_unicode_ci DEFAULT 'Kadaluarsa',
  `order_id` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `payment_type` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `snap_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`donasi_id`),
  UNIQUE KEY `donasi_order_id_unique` (`order_id`),
  KEY `donasi_pengguna_id_foreign` (`pengguna_id`),
  KEY `donasi_laporan_keuangan_id_foreign` (`laporan_keuangan_id`),
  CONSTRAINT `donasi_laporan_keuangan_id_foreign` FOREIGN KEY (`laporan_keuangan_id`) REFERENCES `laporan_keuangan` (`laporan_keuangan_id`),
  CONSTRAINT `donasi_pengguna_id_foreign` FOREIGN KEY (`pengguna_id`) REFERENCES `pengguna` (`pengguna_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `donation_settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `donation_settings` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `is_donation_active` tinyint(1) NOT NULL DEFAULT '1',
  `donation_end_date` date DEFAULT NULL,
  `donation_target` decimal(15,2) DEFAULT NULL,
  `message_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'warning',
  `denial_message` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `kategori_pengeluaran`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `kategori_pengeluaran` (
  `kategori_pengeluaran_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama_kategori` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`kategori_pengeluaran_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `laporan_keuangan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `laporan_keuangan` (
  `laporan_keuangan_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `periode` date DEFAULT NULL,
  `total_pemasukan` decimal(15,2) DEFAULT NULL,
  `total_pengeluaran` decimal(15,2) DEFAULT NULL,
  `saldo` decimal(15,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`laporan_keuangan_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `notifikasi`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notifikasi` (
  `notifikasi_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `pengguna_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `donasi_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipe` enum('target_tercapai','progres_pembangunan','donasi_diterima') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `judul` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pesan` text COLLATE utf8mb4_unicode_ci,
  `status` enum('terkirim','dibaca') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'terkirim',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `processed` tinyint(1) NOT NULL DEFAULT '0',
  `priority` enum('low','normal','high') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'normal',
  PRIMARY KEY (`notifikasi_id`),
  KEY `notifikasi_pengguna_id_foreign` (`pengguna_id`),
  KEY `notifikasi_donasi_id_foreign` (`donasi_id`),
  CONSTRAINT `notifikasi_donasi_id_foreign` FOREIGN KEY (`donasi_id`) REFERENCES `donasi` (`donasi_id`),
  CONSTRAINT `notifikasi_pengguna_id_foreign` FOREIGN KEY (`pengguna_id`) REFERENCES `pengguna` (`pengguna_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `pengeluaran`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pengeluaran` (
  `pengeluaran_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `proyek_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `penginput_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `kategori_pengeluaran_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `laporan_keuangan_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `jumlah` decimal(15,2) DEFAULT NULL,
  `nama_pengeluaran` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `keterangan` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`pengeluaran_id`),
  KEY `pengeluaran_proyek_id_foreign` (`proyek_id`),
  KEY `pengeluaran_penginput_id_foreign` (`penginput_id`),
  KEY `pengeluaran_kategori_pengeluaran_id_foreign` (`kategori_pengeluaran_id`),
  KEY `pengeluaran_laporan_keuangan_id_foreign` (`laporan_keuangan_id`),
  CONSTRAINT `pengeluaran_kategori_pengeluaran_id_foreign` FOREIGN KEY (`kategori_pengeluaran_id`) REFERENCES `kategori_pengeluaran` (`kategori_pengeluaran_id`),
  CONSTRAINT `pengeluaran_laporan_keuangan_id_foreign` FOREIGN KEY (`laporan_keuangan_id`) REFERENCES `laporan_keuangan` (`laporan_keuangan_id`),
  CONSTRAINT `pengeluaran_penginput_id_foreign` FOREIGN KEY (`penginput_id`) REFERENCES `pengguna` (`pengguna_id`),
  CONSTRAINT `pengeluaran_proyek_id_foreign` FOREIGN KEY (`proyek_id`) REFERENCES `proyek_pembangunan` (`proyek_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `pengguna`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pengguna` (
  `pengguna_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('admin','donatur') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'donatur',
  `can_donate` tinyint(1) NOT NULL DEFAULT '1',
  `can_view_history` tinyint(1) NOT NULL DEFAULT '1',
  `can_view_notification` tinyint(1) NOT NULL DEFAULT '1',
  `nomor_hp` varchar(15) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`pengguna_id`),
  UNIQUE KEY `pengguna_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `proyek_pembangunan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `proyek_pembangunan` (
  `proyek_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `admin_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nama_item` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `deskripsi` text COLLATE utf8mb4_unicode_ci,
  `target_dana` decimal(15,2) DEFAULT NULL,
  `dana_terkumpul` decimal(15,2) DEFAULT NULL,
  `gambar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'Path to the project image',
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`proyek_id`),
  KEY `proyek_pembangunan_admin_id_foreign` (`admin_id`),
  CONSTRAINT `proyek_pembangunan_admin_id_foreign` FOREIGN KEY (`admin_id`) REFERENCES `pengguna` (`pengguna_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
DROP TABLE IF EXISTS `v_donation_summary`;
/*!50001 DROP VIEW IF EXISTS `v_donation_summary`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `v_donation_summary` AS SELECT 
 1 AS `total_donations`,
 1 AS `total_accepted`,
 1 AS `total_pending`,
 1 AS `total_expired`,
 1 AS `donation_month`*/;
SET character_set_client = @saved_cs_client;
/*!50003 DROP PROCEDURE IF EXISTS `validate_donation` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `validate_donation`(IN donation_id VARCHAR(255), IN new_status VARCHAR(50))
BEGIN
                DECLARE current_status VARCHAR(50);
                DECLARE donation_amount DECIMAL(15,2);
                DECLARE report_id VARCHAR(255);
                
                -- Get current status, amount, and report ID
                SELECT status, jumlah, laporan_keuangan_id 
                INTO current_status, donation_amount, report_id 
                FROM donasi 
                WHERE donasi_id = donation_id;
                
                -- Only process if status is different
                IF current_status != new_status THEN
                    -- Update status
                    UPDATE donasi SET status = new_status WHERE donasi_id = donation_id;
                    
                    -- If accepting donation, update related financial report
                    IF new_status = 'Diterima' AND current_status != 'Diterima' AND report_id IS NOT NULL THEN
                        UPDATE laporan_keuangan 
                        SET total_pemasukan = total_pemasukan + donation_amount
                        WHERE laporan_keuangan_id = report_id;
                    
                    -- If cancelling an accepted donation, subtract from financial report
                    ELSEIF new_status != 'Diterima' AND current_status = 'Diterima' AND report_id IS NOT NULL THEN
                        UPDATE laporan_keuangan 
                        SET total_pemasukan = total_pemasukan - donation_amount
                        WHERE laporan_keuangan_id = report_id;
                    END IF;
                END IF;
            END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50001 DROP VIEW IF EXISTS `v_donation_summary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `v_donation_summary` AS select count(0) AS `total_donations`,sum((case when (`donasi`.`status` = 'Diterima') then `donasi`.`jumlah` else 0 end)) AS `total_accepted`,sum((case when (`donasi`.`status` = 'Pending') then `donasi`.`jumlah` else 0 end)) AS `total_pending`,sum((case when (`donasi`.`status` = 'Kadaluarsa') then `donasi`.`jumlah` else 0 end)) AS `total_expired`,date_format(`donasi`.`created_at`,'%Y-%m') AS `donation_month` from `donasi` group by date_format(`donasi`.`created_at`,'%Y-%m') */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (1,'2019_12_14_000001_create_personal_access_tokens_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (2,'2025_05_17_000001_alter_personal_access_tokens_tokenable_id',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (3,'2025_06_01_000000_create_pengguna_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (4,'2025_06_01_000001_create_laporan_keuangan_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (5,'2025_06_01_000003_create_kategori_pengeluaran_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (6,'2025_06_01_000004_create_proyek_pembangunan_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (7,'2025_06_01_000005_create_pengeluaran_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (8,'2025_06_01_000006_create_donasi_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (9,'2025_06_01_000007_create_notifikasi_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (10,'2025_06_17_063907_add_midtrans_columns_to_donasi_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (11,'2025_06_17_071314_add_name_email_to_donasi_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (12,'2025_06_17_123822_fix_donation_names_and_emails',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (13,'2025_06_18_000000_fix_existing_donations',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (14,'2025_06_18_000001_update_all_donations_to_diterima',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (15,'2025_06_18_043540_add_timestamps_to_donasi_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (16,'2025_06_19_000000_update_donation_status_enum',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (17,'2025_06_20_000000_remove_tanggal_donasi_from_donasi_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (18,'2025_06_23_033929_add_judul_to_notifikasi_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (19,'2025_06_23_034354_add_timestamps_to_notifikasi_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (20,'2025_06_23_182241_add_gambar_to_proyek_pembangunan_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (21,'2025_06_28_201320_add_created_at_to_pengeluaran_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (22,'2025_06_29_000000_add_permissions_to_pengguna_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (23,'2025_06_29_160241_create_donation_summary_view',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (24,'2025_06_29_160313_create_donation_validation_procedure',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (25,'2025_06_29_175415_fix_permission_values_final',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (26,'2025_06_30_000000_create_donation_settings_table',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (27,'2025_07_01_081122_remove_tanggal_pengeluaran_column',1);
INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES (28,'2025_07_02_000000_add_processed_and_priority_to_notifikasi_table',1);
