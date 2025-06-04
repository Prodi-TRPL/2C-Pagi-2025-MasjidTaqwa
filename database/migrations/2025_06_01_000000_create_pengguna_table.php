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
        Schema::create('pengguna', function (Blueprint $table) {
            $table->uuid('pengguna_id')->primary();
            $table->string('nama', 100)->nullable();
            $table->string('email', 100)->nullable()->unique();
            $table->string('password', 255)->nullable();
            $table->enum('role', ['admin', 'donatur'])->default('donatur');
            $table->string('nomor_hp', 15)->nullable();
            $table->timestamp('created_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pengguna');
    }
}; 