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
        Schema::create('anonymous_donors', function (Blueprint $table) {
            $table->id('anonymous_donor_id');
            $table->string('email')->nullable();
            $table->string('nama')->nullable();
            $table->boolean('is_linked_to_account')->default(false);
            $table->foreignId('pengguna_id')->nullable();
            $table->timestamps();
            
            // Add indexes for better performance
            $table->index('email');
            $table->index('pengguna_id');
        });
        
        // Add anonymous_donor_id to donasi table
        Schema::table('donasi', function (Blueprint $table) {
            $table->foreignId('anonymous_donor_id')->nullable()->after('pengguna_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Remove anonymous_donor_id from donasi table
        Schema::table('donasi', function (Blueprint $table) {
            $table->dropColumn('anonymous_donor_id');
        });
        
        Schema::dropIfExists('anonymous_donors');
    }
}; 