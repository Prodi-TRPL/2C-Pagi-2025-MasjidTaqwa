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
        // First, set any existing successful payments to "Diterima"
        // Using a temporary table to avoid the MySQL error when updating and selecting from the same table
        DB::statement("CREATE TEMPORARY TABLE temp_successful_donations AS
            SELECT DISTINCT order_id FROM donasi 
            WHERE snap_token IS NOT NULL AND status = 'Menunggu' AND created_at < DATE_SUB(NOW(), INTERVAL 1 HOUR)
            AND order_id IS NOT NULL AND payment_type IS NOT NULL");
        
        DB::statement("UPDATE donasi SET status = 'Diterima' WHERE order_id IN (
            SELECT order_id FROM temp_successful_donations
        )");
        
        DB::statement("DROP TEMPORARY TABLE IF EXISTS temp_successful_donations");
        
        // Convert remaining "Menunggu" status to "Kadaluarsa" as we're removing it
        DB::statement("UPDATE donasi SET status = 'Kadaluarsa' WHERE status = 'Menunggu'");
        
        // Change the ENUM type to only include "Diterima" and "Kadaluarsa"
        DB::statement("ALTER TABLE donasi MODIFY COLUMN status ENUM('Diterima', 'Kadaluarsa') DEFAULT 'Kadaluarsa'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Add "Menunggu" back to the ENUM type
        DB::statement("ALTER TABLE donasi MODIFY COLUMN status ENUM('Menunggu', 'Diterima', 'Kadaluarsa') DEFAULT 'Menunggu'");
    }
}; 