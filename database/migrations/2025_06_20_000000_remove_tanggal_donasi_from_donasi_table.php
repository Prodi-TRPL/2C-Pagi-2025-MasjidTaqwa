<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('donasi', function (Blueprint $table) {
            // Remove tanggal_donasi column since created_at now serves this purpose
            $table->dropColumn('tanggal_donasi');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('donasi', function (Blueprint $table) {
            // Add back tanggal_donasi column if migration is rolled back
            $table->timestamp('tanggal_donasi')->nullable()->after('status');
        });
    }
}; 