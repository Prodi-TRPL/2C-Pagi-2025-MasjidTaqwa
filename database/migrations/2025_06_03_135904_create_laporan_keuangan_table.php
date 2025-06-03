<?php
// database/migrations/xxxx_xx_xx_create_laporan_keuangan_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
         Schema::table('laporan_keuangan', function (Blueprint $table) {
             $table->enum('type', ['income', 'expense'])->default('income');
        });
    }

    public function down(): void {
        Schema::dropIfExists('laporan_keuangan');
    }
};
