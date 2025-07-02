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
        Schema::create('donasi', function (Blueprint $table) {
            $table->uuid('donasi_id')->primary();
            $table->uuid('pengguna_id')->nullable();
            $table->uuid('laporan_keuangan_id')->nullable();
            $table->decimal('jumlah', 15, 2)->nullable();
            $table->uuid('metode_pembayaran_id')->nullable();
            $table->enum('status', ['Menunggu', 'Diterima', 'Kadaluarsa'])->default('Menunggu');
            $table->timestamp('tanggal_donasi')->nullable();
            
            $table->foreign('pengguna_id')->references('pengguna_id')->on('pengguna');
            $table->foreign('laporan_keuangan_id')->references('laporan_keuangan_id')->on('laporan_keuangan');
            $table->foreign('metode_pembayaran_id')->references('metode_pembayaran_id')->on('metode_pembayaran');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('donasi');
    }
}; 