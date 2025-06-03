<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            AdminUserSeeder::class,
            DonorsUserSeeder::class,
        ]);
    }
}

// database/seeders/DatabaseSeeder.php
public function run(): void {
    $this->call([
        ReportAmounSeeder::class,
    ]);
}
