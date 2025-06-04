<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('laporan_keuangan', function (Blueprint $table) {
            $table->uuid('laporan_keuangan_id')->primary();
            $table->date('periode')->nullable();
            $table->decimal('total_pemasukan', 15, 2)->nullable();
            $table->decimal('total_pengeluaran', 15, 2)->nullable();
            $table->decimal('saldo', 15, 2)->nullable();
            $table->timestamp('created_at')->nullable();
        });
    }

    public function down(): void {
        Schema::dropIfExists('laporan_keuangan');
    }
}; 