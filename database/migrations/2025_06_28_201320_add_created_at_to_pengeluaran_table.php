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
        // First, add the created_at column
        Schema::table('pengeluaran', function (Blueprint $table) {
            // Add created_at column if it doesn't exist
            if (!Schema::hasColumn('pengeluaran', 'created_at')) {
                $table->timestamp('created_at')->nullable()->after('keterangan');
            }
        });
        
        // Then, update the values
        DB::statement('UPDATE pengeluaran SET created_at = tanggal_pengeluaran');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pengeluaran', function (Blueprint $table) {
            $table->dropColumn('created_at');
        });
    }
};
