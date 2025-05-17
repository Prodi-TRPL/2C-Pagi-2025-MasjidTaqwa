<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Pengguna;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

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
            $admin->password = Hash::make('diva123'); // Known password
            $admin->role = 'admin';
            $admin->nomor_hp = '081234567891';
            $admin->created_at = now();
            $admin->save();
        }
    }
}
