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
        // Update all donations to have status "Diterima"
        DB::table('donasi')->update(['status' => 'Diterima']);
        
        // Log the action
        error_log('Migration: Updated all donations to Diterima status');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // We can't properly revert this change
    }
}; 