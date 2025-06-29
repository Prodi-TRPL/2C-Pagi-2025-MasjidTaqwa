<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DonationSummary;
use Illuminate\Support\Facades\Log;

class DonationSummaryController extends Controller
{
    /**
     * Get monthly donation summary
     *
     * @return \Illuminate\Http\Response
     */
    public function getMonthlyDonationSummary()
    {
        try {
            // Mengambil data langsung dari database view
            $summaries = DonationSummary::orderBy('donation_month', 'desc')
                                       ->get();
            
            $result = [
                'monthly_data' => $summaries,
                'total_stats' => [
                    'total_donations' => $summaries->sum('total_donations'),
                    'total_accepted' => $summaries->sum('total_accepted'),
                    'total_pending' => $summaries->sum('total_pending'),
                    'total_expired' => $summaries->sum('total_expired'),
                ]
            ];
            
            return response()->json($result);
        } catch (\Exception $e) {
            Log::error('Error getting donation summary: ' . $e->getMessage());
            return response()->json(['message' => 'Error getting donation summary: ' . $e->getMessage()], 500);
        }
    }
    
    /**
     * Get donation chart data
     *
     * @return \Illuminate\Http\Response
     */
    public function getDonationChartData()
    {
        try {
            // Mengambil data dari database view
            $summaries = DonationSummary::orderBy('donation_month', 'asc')
                                       ->get();
            
            // Format data untuk chart
            $chartData = [
                'labels' => $summaries->pluck('month_name')->toArray(),
                'datasets' => [
                    [
                        'label' => 'Total Diterima',
                        'data' => $summaries->pluck('total_accepted')->toArray(),
                        'backgroundColor' => 'rgba(89, 185, 151, 0.2)',
                        'borderColor' => '#59B997',
                        'borderWidth' => 2,
                        'tension' => 0.4,
                    ],
                    [
                        'label' => 'Total Pending',
                        'data' => $summaries->pluck('total_pending')->toArray(),
                        'backgroundColor' => 'rgba(255, 153, 0, 0.2)',
                        'borderColor' => '#FF9900',
                        'borderWidth' => 2,
                        'tension' => 0.4,
                    ]
                ]
            ];
            
            return response()->json($chartData);
        } catch (\Exception $e) {
            Log::error('Error getting donation chart data: ' . $e->getMessage());
            return response()->json(['message' => 'Error getting donation chart data: ' . $e->getMessage()], 500);
        }
    }
}
