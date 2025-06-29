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
        Schema::create('donation_settings', function (Blueprint $table) {
            $table->id();
            $table->boolean('is_donation_active')->default(true);
            $table->date('donation_end_date')->nullable();
            $table->decimal('donation_target', 15, 2)->nullable();
            $table->string('message_type')->default('warning'); // warning, info, error
            $table->text('denial_message')->nullable();
            $table->timestamps();
        });
        
        // Insert default settings
        DB::table('donation_settings')->insert([
            'is_donation_active' => true,
            'message_type' => 'warning',
            'denial_message' => 'Donasi saat ini tidak tersedia. Silakan coba lagi nanti.',
            'created_at' => now(),
            'updated_at' => now()
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('donation_settings');
    }
}; 