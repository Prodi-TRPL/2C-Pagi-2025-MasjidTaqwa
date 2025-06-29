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
        // Hapus view jika sudah ada untuk menghindari error
        DB::statement("DROP VIEW IF EXISTS v_donation_summary");

        // view baru
        DB::statement("
            CREATE VIEW v_donation_summary AS
            SELECT 
                COUNT(*) as total_donations,
                SUM(CASE WHEN status = 'Diterima' THEN jumlah ELSE 0 END) as total_accepted,
                SUM(CASE WHEN status = 'Pending' THEN jumlah ELSE 0 END) as total_pending,
                SUM(CASE WHEN status = 'Kadaluarsa' THEN jumlah ELSE 0 END) as total_expired,
                DATE_FORMAT(created_at, '%Y-%m') as donation_month
            FROM donasi
            GROUP BY DATE_FORMAT(created_at, '%Y-%m')
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("DROP VIEW IF EXISTS v_donation_summary");
    }
};
