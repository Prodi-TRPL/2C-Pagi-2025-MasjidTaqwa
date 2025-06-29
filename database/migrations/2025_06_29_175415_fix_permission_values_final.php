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
        // Explicitly convert all permission columns to boolean values (1)
        DB::statement('UPDATE pengguna SET can_donate = 1, can_view_history = 1, can_view_notification = 1 WHERE role = "donatur"');
        
        // Log the operation
        \Log::info('FINAL FIX: Explicitly set all permissions to 1 for all donatur users');
        
        // Add debug output for each user
        $users = DB::table('pengguna')->where('role', 'donatur')->get();
        foreach ($users as $user) {
            \Log::info("User {$user->pengguna_id} ({$user->email}) permissions:", [
                'can_donate' => $user->can_donate,
                'can_view_history' => $user->can_view_history,
                'can_view_notification' => $user->can_view_notification,
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No need to revert as this is just ensuring data consistency
    }
}; 