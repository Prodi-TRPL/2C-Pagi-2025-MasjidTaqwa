<?php
// database/seeders/ReportAmountSeeder.php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Str;

class ReportAmountSeeder extends Seeder
{
    public function run(): void
    {
        $reports = [];

        for ($month = 1; $month <= 12; $month++) {
            $periode = Carbon::create(2024, $month, 1)->format('Y-m-d');
            
            // Calculate totals for the month
            $total_pemasukan = 0;
            $total_pengeluaran = 0;
            
            // Simulate pemasukan for this month
            $pemasukan_count = rand(3, 6);
            for ($i = 0; $i < $pemasukan_count; $i++) {
                $amount = rand(200, 500);
                $total_pemasukan += $amount;
            }
            
            // Simulate pengeluaran for this month
            $pengeluaran_count = rand(2, 4);
            for ($i = 0; $i < $pengeluaran_count; $i++) {
                $amount = rand(100, 400);
                $total_pengeluaran += $amount;
            }
            
            // Calculate saldo
            $saldo = $total_pemasukan - $total_pengeluaran;
            
            // Create monthly report
            $reports[] = [
                'laporan_keuangan_id' => Str::uuid()->toString(),
                'periode' => $periode,
                'total_pemasukan' => $total_pemasukan,
                'total_pengeluaran' => $total_pengeluaran,
                'saldo' => $saldo,
                'created_at' => now(),
            ];
        }

        DB::table('laporan_keuangan')->insert($reports);
    }
}
