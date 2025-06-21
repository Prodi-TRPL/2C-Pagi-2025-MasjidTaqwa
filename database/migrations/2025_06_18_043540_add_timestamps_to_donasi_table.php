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
        Schema::table('donasi', function (Blueprint $table) {
            // Add timestamps (created_at and updated_at)
            $table->timestamps();
        });

        // Update existing records to set created_at equal to tanggal_donasi where available
        $donations = DB::table('donasi')->whereNotNull('tanggal_donasi')->get();
        foreach ($donations as $donation) {
            DB::table('donasi')
                ->where('donasi_id', $donation->donasi_id)
                ->update([
                    'created_at' => $donation->tanggal_donasi,
                    'updated_at' => $donation->tanggal_donasi
                ]);
        }
        
        // For records without tanggal_donasi, set created_at to current time
        DB::table('donasi')
            ->whereNull('created_at')
            ->update([
                'created_at' => now(),
                'updated_at' => now()
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('donasi', function (Blueprint $table) {
            // Remove timestamps
            $table->dropColumn(['created_at', 'updated_at']);
        });
    }
};
