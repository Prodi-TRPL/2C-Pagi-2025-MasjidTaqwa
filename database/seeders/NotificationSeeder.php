<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Pengguna;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class NotificationSeeder extends Seeder
{
    public function run()
    {
        $donorEmail = 'addin@gmail.com';
        $donor = Pengguna::where('email', $donorEmail)->first();

        if (!$donor) {
            $this->command->info("Donor user with email {$donorEmail} not found. Please run DonorsUserSeeder first.");
            return;
        }

        $notifications = [
            [
                'notifikasi_id' => (string) Str::uuid(),
                'pengguna_id' => $donor->pengguna_id,
                'donasi_id' => null,
                'tipe' => 'target_tercapai',
                'pesan' => 'Target donasi pembangunan masjid telah tercapai! Terima kasih atas dukungan Anda.',
                'status' => 'terkirim',
                'created_at' => now()->subDays(2),
            ],
            [
                'notifikasi_id' => (string) Str::uuid(),
                'pengguna_id' => $donor->pengguna_id,
                'donasi_id' => null,
                'tipe' => 'progres_pembangunan',
                'pesan' => 'Progres pembangunan masjid sudah mencapai 75%. Mari terus dukung bersama.',
                'status' => 'terkirim',
                'created_at' => now()->subDays(1),
            ],
            [
                'notifikasi_id' => (string) Str::uuid(),
                'pengguna_id' => $donor->pengguna_id,
                'donasi_id' => null,
                'tipe' => 'donasi_diterima',
                'pesan' => 'Donasi Anda sebesar Rp 500.000 telah diterima dan tercatat dengan baik.',
                'status' => 'terkirim',
                'created_at' => now()->subHours(5),
            ],
        ];

        foreach ($notifications as $notif) {
            DB::table('notifikasi')->updateOrInsert(
                ['notifikasi_id' => $notif['notifikasi_id']],
                $notif
            );
        }

        $this->command->info("Sample notifications seeded for donor {$donorEmail}.");
    }
}
