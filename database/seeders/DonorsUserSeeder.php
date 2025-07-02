<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Pengguna;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DonorsUserSeeder extends Seeder
{
    public function run()
    {
        $donorEmail = 'addin@gmail.com';
        $existingDonor = Pengguna::where('email', $donorEmail)->first();

        if (!$existingDonor) {
            $donor = new Pengguna();
            $donor->pengguna_id = (string) Str::uuid();
            $donor->nama = 'Muhammad Addin';
            $donor->email = $donorEmail;
            $donor->password = Hash::make('addin123'); // Known password
            $donor->role = 'donatur';
            $donor->nomor_hp = '081234567890';
            $donor->created_at = now();
            $donor->save();
        }
    }
}
