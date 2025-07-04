<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * STRUKTUR DATA: QUEUE SUPPORT
 * Menambahkan kolom 'processed' dan 'priority' ke tabel notifikasi
 * untuk mendukung implementasi struktur data Queue
 */
class AddProcessedAndPriorityToNotifikasiTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('notifikasi', function (Blueprint $table) {
            // Kolom untuk menandai apakah notifikasi sudah diproses
            $table->boolean('processed')->default(false);
            
            // Kolom untuk menentukan prioritas notifikasi
            // Prioritas tinggi akan diproses lebih dulu
            $table->enum('priority', ['low', 'normal', 'high'])->default('normal');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notifikasi', function (Blueprint $table) {
            $table->dropColumn('processed');
            $table->dropColumn('priority');
        });
    }
} 