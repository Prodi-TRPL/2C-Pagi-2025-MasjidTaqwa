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
        Schema::create('pengeluaran', function (Blueprint $table) {
            $table->uuid('pengeluaran_id')->primary();
            $table->uuid('proyek_id')->nullable();
            $table->uuid('penginput_id')->nullable();
            $table->uuid('kategori_pengeluaran_id')->nullable();
            $table->uuid('laporan_keuangan_id')->nullable();
            $table->decimal('jumlah', 15, 2)->nullable();
            $table->timestamp('tanggal_pengeluaran')->nullable();
            $table->string('nama_pengeluaran', 255)->nullable();
            $table->text('keterangan')->nullable();
            
            $table->foreign('proyek_id')->references('proyek_id')->on('proyek_pembangunan');
            $table->foreign('penginput_id')->references('pengguna_id')->on('pengguna');
            $table->foreign('kategori_pengeluaran_id')->references('kategori_pengeluaran_id')->on('kategori_pengeluaran');
            $table->foreign('laporan_keuangan_id')->references('laporan_keuangan_id')->on('laporan_keuangan');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pengeluaran');
    }
}; 