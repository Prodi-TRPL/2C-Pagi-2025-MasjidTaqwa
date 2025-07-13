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
        Schema::create('log_aktivitas', function (Blueprint $table) {
            $table->id(); // bigint, auto increment, primary key
            $table->string('aktivitas', 255); // varchar 255, berisi jenis aktivitas
            $table->text('detail'); // text, berisi keterangan lebih lengkap
            $table->timestamp('created_at')->useCurrent(); // datetime, default timestamp saat data dibuat
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('log_aktivitas');
    }
};
