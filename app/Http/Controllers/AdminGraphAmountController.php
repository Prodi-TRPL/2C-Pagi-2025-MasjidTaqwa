<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Models\Donation;
use App\Models\Pengeluaran;
use Carbon\Carbon;

class AdminGraphAmountController extends Controller
{
    public function getMonthlyReport(Request $request)
    {
        // Get parameters or set defaults
        $period = $request->input('period', 'monthly');
        $year = $request->input('year', Carbon::now()->year);
        $month = $request->input('month', Carbon::now()->month);
        
        // Call appropriate method based on period
        switch ($period) {
            case 'daily':
                return $this->getDailyReport($year, $month);
            case 'yearly':
                return $this->getYearlyReport($year);
            case 'monthly':
            default:
                return $this->getMonthlyReportData($year);
        }
    }
    
    /**
     * Get daily financial report for a specific month
     */
    private function getDailyReport($year, $month)
    {
        // Get days in month
        $daysInMonth = Carbon::createFromDate($year, $month, 1)->daysInMonth;
        
        // Initialize arrays with zeros for all days in the month
        $dailyIncomes = array_fill(0, $daysInMonth, 0);
        $dailyExpenses = array_fill(0, $daysInMonth, 0);
        
        // Get daily donations (income)
        $incomes = Donation::select(
                DB::raw('DAY(created_at) as day'),
                DB::raw('SUM(jumlah) as total')
            )
            ->where('status', 'Diterima')
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->groupBy(DB::raw('DAY(created_at)'))
            ->orderBy('day')
            ->get();
            
        // Get daily expenses (using created_at instead of tanggal_pengeluaran)
        $expenses = Pengeluaran::select(
                DB::raw('DAY(created_at) as day'),
                DB::raw('SUM(jumlah) as total')
            )
            ->whereYear('created_at', $year)
            ->whereMonth('created_at', $month)
            ->groupBy(DB::raw('DAY(created_at)'))
            ->orderBy('day')
            ->get();
        
        // Fill the daily arrays with data
        foreach ($incomes as $item) {
            $dailyIncomes[$item->day - 1] = (int)$item->total;
        }
        
        foreach ($expenses as $item) {
            $dailyExpenses[$item->day - 1] = (int)$item->total;
        }
        
        return response()->json([
            'incomes' => $dailyIncomes,
            'expenses' => $dailyExpenses,
            'period' => 'daily',
            'year' => $year,
            'month' => $month
        ]);
    }
    
    /**
     * Get monthly financial report for a specific year
     */
    private function getMonthlyReportData($year)
    {
        // Initialize arrays with zeros for all 12 months
        $monthlyIncomes = array_fill(0, 12, 0);
        $monthlyExpenses = array_fill(0, 12, 0);
        
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
            
        // Get monthly expenses (using created_at instead of tanggal_pengeluaran)
        $expenses = Pengeluaran::select(
                DB::raw('MONTH(created_at) as month'),
                DB::raw('SUM(jumlah) as total')
            )
            ->whereYear('created_at', $year)
            ->groupBy(DB::raw('MONTH(created_at)'))
            ->orderBy('month')
            ->get();
        
        // Fill the monthly arrays with data
        foreach ($incomes as $item) {
            $monthlyIncomes[$item->month - 1] = (int)$item->total;
        }
        
        foreach ($expenses as $item) {
            $monthlyExpenses[$item->month - 1] = (int)$item->total;
        }
        
        return response()->json([
            'incomes' => $monthlyIncomes,
            'expenses' => $monthlyExpenses,
            'period' => 'monthly',
            'year' => $year
        ]);
    }
    
    /**
     * Get yearly financial report
     */
    private function getYearlyReport($year)
    {
        // For yearly reports, we still return monthly data, but provide a year context
        return $this->getMonthlyReportData($year);
    }
    
    /**
     * Get summary data for the dashboard
     */
    public function getSummaryData()
    {
        // Get total donations
        $totalDonations = Donation::where('status', 'Diterima')
            ->sum('jumlah');
            
        // Get total expenses
        $totalExpenses = Pengeluaran::sum('jumlah');
        
        // Get donor count
        $donorCount = Donation::where('status', 'Diterima')
            ->distinct('pengguna_id')
            ->count();
            
        // Calculate balance
        $balance = $totalDonations - $totalExpenses;
        
        return response()->json([
            'totalDonations' => (int)$totalDonations,
            'totalExpenses' => (int)$totalExpenses,
            'balance' => (int)$balance,
            'donorCount' => $donorCount
        ]);
    }
}