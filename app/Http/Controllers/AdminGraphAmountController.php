<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;

class AdminGraphAmountController extends Controller
{
    public function getMonthlySales()
    {
        $incomes = DB::table('laporan_keuangan')
            ->selectRaw('MONTH(created_at) as month, SUM(amount) as total')
            ->where('type', 'total_pemasukan')
            ->groupBy(DB::raw('MONTH(created_at)'))
            ->orderBy('month')
            ->get();

        $expenses = DB::table('laporan_keuangan')
            ->selectRaw('MONTH(created_at) as month, SUM(amount) as total')
            ->where('type', 'total_pengeluaran')
            ->groupBy(DB::raw('MONTH(created_at)'))
            ->orderBy('month')
            ->get();

        $monthlyIncomes = array_fill(0, 12, 0);
        foreach ($incomes as $item) {
            $monthlyIncomes[$item->month - 1] = (int)$item->total;
        }

        $monthlyExpenses = array_fill(0, 12, 0);
        foreach ($expenses as $item) {
            $monthlyExpenses[$item->month - 1] = (int)$item->total;
        }

        return response()->json([
            'incomes' => $monthlyIncomes,
            'expenses' => $monthlyExpenses,
        ]);
    }
}