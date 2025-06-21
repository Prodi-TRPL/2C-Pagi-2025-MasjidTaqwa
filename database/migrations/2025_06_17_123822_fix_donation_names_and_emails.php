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
        // Get all donations with pengguna_id that have missing name or email
        $donations = DB::table('donasi')
            ->whereNotNull('pengguna_id')
            ->where(function($query) {
                $query->whereNull('name')
                      ->orWhereNull('email')
                      ->orWhere('name', '')
                      ->orWhere('email', '');
            })
            ->get();

        $updated = 0;
        
        foreach ($donations as $donation) {
            // Find the user associated with this donation
            $user = DB::table('pengguna')
                ->where('pengguna_id', $donation->pengguna_id)
                ->first();
                
            if ($user) {
                // Update the donation with the user's name and email
                DB::table('donasi')
                    ->where('donasi_id', $donation->donasi_id)
                    ->update([
                        'name' => $user->nama,
                        'email' => $user->email
                    ]);
                    
                $updated++;
            }
        }
        
        echo "Updated $updated donation records with missing name/email data.\n";
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // This migration cannot be reversed since we don't know the original values
    }
};
