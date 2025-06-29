<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Hapus procedure jika sudah ada
        DB::unprepared("DROP PROCEDURE IF EXISTS validate_donation");

        // Buat stored procedure
        DB::unprepared("
            CREATE PROCEDURE validate_donation(IN donation_id VARCHAR(255), IN new_status VARCHAR(50))
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
            END
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::unprepared("DROP PROCEDURE IF EXISTS validate_donation");
    }
};
