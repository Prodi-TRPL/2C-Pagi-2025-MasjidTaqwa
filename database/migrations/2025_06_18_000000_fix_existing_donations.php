<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update donations with NULL payment type
        DB::table('donasi')
            ->whereNull('payment_type')
            ->update([
                'payment_type' => 'direct'
            ]);
            
        // Update donations with NULL snap_token
        DB::table('donasi')
            ->whereNull('snap_token')
            ->update([
                'snap_token' => 'mock-' . Str::random(32)
            ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration cannot be reversed since we don't know the original values
    }
}; 