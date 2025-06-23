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
        Schema::table('notifikasi', function (Blueprint $table) {
            // First, rename the existing created_at column to avoid conflicts
            $table->renameColumn('created_at', 'created_at_old');
        });

        // Add proper timestamp columns
        Schema::table('notifikasi', function (Blueprint $table) {
            $table->timestamp('created_at')->nullable();
            $table->timestamp('updated_at')->nullable();
        });

        // Copy data from old column to new one
        DB::statement('UPDATE notifikasi SET created_at = created_at_old');

        // Remove old column
        Schema::table('notifikasi', function (Blueprint $table) {
            $table->dropColumn('created_at_old');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('notifikasi', function (Blueprint $table) {
            // First add back the old column
            $table->timestamp('created_at_old')->nullable();
            
            // Copy data back
            DB::statement('UPDATE notifikasi SET created_at_old = created_at');
            
            // Drop the timestamp columns
            $table->dropColumn(['updated_at', 'created_at']);
            
            // Rename old column back to original name
            $table->renameColumn('created_at_old', 'created_at');
        });
    }
};
