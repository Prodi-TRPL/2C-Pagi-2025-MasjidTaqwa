<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Pengguna;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Notifications\EmailVerificationNotification;

class AdminUserSeeder extends Seeder
{
    public function run()
    {
        $adminEmail = 'diva@gmail.com';
        $existingAdmin = Pengguna::where('email', $adminEmail)->first();

        if (!$existingAdmin) {
            $admin = new Pengguna();
            $admin->pengguna_id = (string) Str::uuid();
            $admin->nama = 'Diva Satria';
            $admin->email = $adminEmail;
            $admin->password = Hash::make('diva123');
            $admin->role = 'admin';
            $admin->nomor_hp = '081234567891';
            $admin->created_at = now();
            $admin->can_donate = false;
            $admin->can_view_history = false;
            $admin->can_view_notification = false;
            $admin->save();

            // Kirim kode verifikasi
            $kode = $admin->generateVerificationCode();
            $admin->notify(new EmailVerificationNotification($kode, $admin->nama));

            $this->command->info('Admin user created and verification email sent.');
        }
    }
}
