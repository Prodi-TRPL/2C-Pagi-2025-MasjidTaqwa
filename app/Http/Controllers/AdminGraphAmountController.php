<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use App\Models\Donation;
use App\Models\Pengeluaran;
use Carbon\Carbon;

class AdminGraphAmountController extends Controller
{
    public function getMonthlyReport()
    {
        // Get current year
        $year = Carbon::now()->year;
        
        // Get monthly donations (income)
        $incomes = Donation::select(
                DB::raw('MONTH(created_at) as month'),
                DB::raw('SUM(jumlah) as total')
            )
            ->where('status', 'Diterima')
                          ->whereYear('created_at', $year)
              ->groupBy(DB::raw('MONTH(created_at)'))
            ->orderBy('month')
            ->get();

        // Get monthly expenses
        $expenses = Pengeluaran::select(
                DB::raw('MONTH(tanggal) as month'),
                DB::raw('SUM(jumlah) as total')
            )
            ->whereYear('tanggal', $year)
            ->groupBy(DB::raw('MONTH(tanggal)'))
            ->orderBy('month')
            ->get();

        // Initialize arrays with zeros for all 12 months
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