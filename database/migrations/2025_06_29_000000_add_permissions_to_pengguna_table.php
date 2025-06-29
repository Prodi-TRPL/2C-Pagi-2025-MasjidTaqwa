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
            $table->boolean('can_donate')->default(true)->after('role');
            $table->boolean('can_view_history')->default(true)->after('can_donate');
            $table->boolean('can_view_notification')->default(true)->after('can_view_history');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('pengguna', function (Blueprint $table) {
            $table->dropColumn('can_donate');
            $table->dropColumn('can_view_history');
            $table->dropColumn('can_view_notification');
        });
    }
}; 