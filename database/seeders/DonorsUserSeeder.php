<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Pengguna;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use App\Notifications\EmailVerificationNotification;

class DonorsUserSeeder extends Seeder
{
    public function run()
    {
        $donors = [
            [
                'nama' => 'Muhammad Addin',
                'email' => 'addin@gmail.com',
                'password' => 'addin123',
                'can_donate' => true,
                'can_view_history' => true,
                'can_view_notification' => true,
            ],
            [
                'nama' => 'Ahmad Doni',
                'email' => 'doni@gmail.com',
                'password' => 'password123',
                'can_donate' => true,
                'can_view_history' => true,
                'can_view_notification' => true,
            ],
            [
                'nama' => 'Siti Fatimah',
                'email' => 'siti@gmail.com',
                'password' => 'password123',
                'can_donate' => true,
                'can_view_history' => true,
                'can_view_notification' => true,
            ],
            [
                'nama' => 'Budi Santoso',
                'email' => 'budi@gmail.com',
                'password' => 'password123',
                'can_donate' => true,
                'can_view_history' => true,
                'can_view_notification' => true,
            ],
        ];

        foreach ($donors as $donorData) {
            $existingDonor = Pengguna::where('email', $donorData['email'])->first();

            if (!$existingDonor) {
                $donor = new Pengguna();
                $donor->pengguna_id = (string) Str::uuid();
                $donor->nama = $donorData['nama'];
                $donor->email = $donorData['email'];
                $donor->password = Hash::make($donorData['password']);
                $donor->role = 'donatur';
                $donor->can_donate = $donorData['can_donate'];
                $donor->can_view_history = $donorData['can_view_history'];
                $donor->can_view_notification = $donorData['can_view_notification'];
                $donor->created_at = now();
                $donor->save();

                // Kirim kode verifikasi
                $kode = $donor->generateVerificationCode();
                $donor->notify(new EmailVerificationNotification($kode, $donor->nama));

                $this->command->info('Created donor: ' . $donorData['nama']);
            }
        }
    }
}
