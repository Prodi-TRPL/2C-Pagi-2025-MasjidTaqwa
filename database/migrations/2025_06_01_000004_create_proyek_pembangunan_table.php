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
        Schema::create('proyek_pembangunan', function (Blueprint $table) {
            $table->uuid('proyek_id')->primary();
            $table->uuid('admin_id')->nullable();
            $table->string('nama_item', 255)->nullable();
            $table->text('deskripsi')->nullable();
            $table->decimal('target_dana', 15, 2)->nullable();
            $table->decimal('dana_terkumpul', 15, 2)->nullable();
            $table->timestamp('created_at')->nullable();
            
            $table->foreign('admin_id')->references('pengguna_id')->on('pengguna');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proyek_pembangunan');
    }
}; 