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
        Schema::table('pengguna', function (Blueprint $table) {
            // Drop old columns if they exist
            if (Schema::hasColumn('pengguna', 'verification_token')) {
                $table->dropColumn('verification_token');
            }
            if (Schema::hasColumn('pengguna', 'reset_password_token')) {
                $table->dropColumn('reset_password_token');
            }
            if (Schema::hasColumn('pengguna', 'reset_token_expires_at')) {
                $table->dropColumn('reset_token_expires_at');
            }
            
            // Add new verification code columns
            $table->string('verification_code', 10)->nullable();
            $table->timestamp('verification_code_expires_at')->nullable();
            $table->string('reset_code', 10)->nullable();
            $table->timestamp('reset_code_expires_at')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pengguna', function (Blueprint $table) {
            // Remove the new columns
            $table->dropColumn('verification_code');
            $table->dropColumn('verification_code_expires_at');
            $table->dropColumn('reset_code');
            $table->dropColumn('reset_code_expires_at');
            
            // Add back the old columns
            $table->string('verification_token')->nullable();
            $table->string('reset_password_token')->nullable();
            $table->timestamp('reset_token_expires_at')->nullable();
        });
    }
};
