<?php
// database/seeders/ReportAmountSeeder.php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportAmountSeeder extends Seeder
{
    public function run(): void
    {
        $data = [];

        for ($month = 1; $month <= 12; $month++) {
            // Pemasukan
            for ($i = 0; $i < rand(3, 6); $i++) {
                $data[] = [
                    'amount' => rand(200, 500),
                    'type' => 'income',
                    'created_at' => Carbon::create(2024, $month, rand(1, 28)),
                    'updated_at' => now(),
                ];
            }

            // Pengeluaran
            for ($i = 0; $i < rand(2, 4); $i++) {
                $data[] = [
                    'amount' => rand(100, 400),
                    'type' => 'expense',
                    'created_at' => Carbon::create(2024, $month, rand(1, 28)),
                    'updated_at' => now(),
                ];
            }
        }

        DB::table('laporan_keuangan')->insert($data);
    }
}
