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
        Schema::table('donasi', function (Blueprint $table) {
            // Check if columns don't exist before adding them
            if (!Schema::hasColumn('donasi', 'order_id')) {
                $table->string('order_id')->nullable()->unique();
            }
            
            if (!Schema::hasColumn('donasi', 'payment_type')) {
                $table->string('payment_type')->nullable();
            }
            
            if (!Schema::hasColumn('donasi', 'snap_token')) {
                $table->string('snap_token')->nullable();
            }
            
            // Add name and email columns for anonymous donations
            if (!Schema::hasColumn('donasi', 'name')) {
                $table->string('name')->nullable();
            }
            
            if (!Schema::hasColumn('donasi', 'email')) {
                $table->string('email')->nullable();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('donasi', function (Blueprint $table) {
            // Only drop columns if they exist
            if (Schema::hasColumn('donasi', 'order_id')) {
                $table->dropColumn('order_id');
            }
            
            if (Schema::hasColumn('donasi', 'payment_type')) {
                $table->dropColumn('payment_type');
            }
            
            if (Schema::hasColumn('donasi', 'snap_token')) {
                $table->dropColumn('snap_token');
            }
            
            if (Schema::hasColumn('donasi', 'name')) {
                $table->dropColumn('name');
            }
            
            if (Schema::hasColumn('donasi', 'email')) {
                $table->dropColumn('email');
            }
        });
    }
};
