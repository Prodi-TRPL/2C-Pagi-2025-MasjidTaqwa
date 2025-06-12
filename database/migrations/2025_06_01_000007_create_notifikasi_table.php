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
        Schema::create('notifikasi', function (Blueprint $table) {
            $table->uuid('notifikasi_id')->primary();
            $table->uuid('pengguna_id')->nullable();
            $table->uuid('donasi_id')->nullable();
            $table->enum('tipe', ['target_tercapai', 'progres_pembangunan', 'donasi_diterima'])->nullable();
            $table->text('pesan')->nullable();
            $table->enum('status', ['terkirim', 'dibaca'])->default('terkirim');
            $table->timestamp('created_at')->nullable();
            
            $table->foreign('pengguna_id')->references('pengguna_id')->on('pengguna');
            $table->foreign('donasi_id')->references('donasi_id')->on('donasi');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('notifikasi');
    }
}; 