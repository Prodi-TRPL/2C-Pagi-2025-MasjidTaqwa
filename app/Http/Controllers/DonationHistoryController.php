<?php

// app/Http/Controllers/Api/DonationController.php
namespace App\Http\Controllers;

use App\Http\Controllers;
use App\Models\Donation;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class DonationHistoryController extends Controller
{
    public function index()
    {
        try {
            // Get only donations with "Diterima" status
            $donations = Donation::with(['pengguna'])
                        ->where('status', 'Diterima')
                        ->orderBy('created_at', 'desc')
                        ->get();
            
            Log::info('Raw donations fetched', [
                'count' => $donations->count(),
                'sample' => $donations->first() ? $donations->first()->toArray() : null
            ]);
            
            // Process donations to include payment method from Midtrans if available
            $processedDonations = $donations->map(function($donation) {
                // For donations without a linked pengguna but with name/email in the form
                if (!$donation->pengguna_id && ($donation->name || $donation->email)) {
                    $donation->anonymous_donor = [
                        'nama' => $donation->name ?? 'Anonymous',
                        'email' => $donation->email ?? ''
                    ];
                }
                
                // Format payment type from Midtrans to be more readable
                if ($donation->payment_type) {
                    switch ($donation->payment_type) {
                        case 'bank_transfer':
                            $donation->payment_method_name = 'Transfer Bank';
                            break;
                        case 'qris':
                            $donation->payment_method_name = 'QRIS';
                            break;
                        case 'gopay':
                            $donation->payment_method_name = 'GoPay';
                            break;
                        case 'shopeepay':
                            $donation->payment_method_name = 'ShopeePay';
                            break;
                        case 'midtrans':
                            $donation->payment_method_name = 'Midtrans';
                            break;
                        default:
                            $donation->payment_method_name = ucfirst(str_replace('_', ' ', $donation->payment_type));
                    }
                } else {
                    $donation->payment_method_name = 'Pembayaran Online';
                }
                
                return $donation;
            });
            
            Log::info('Fetched donation history', [
                'count' => $processedDonations->count(),
                'sample' => $processedDonations->first() ? [
                    'id' => $processedDonations->first()->donasi_id,
                    'amount' => $processedDonations->first()->jumlah,
                    'payment' => $processedDonations->first()->payment_method_name ?? 'N/A',
                    'status' => $processedDonations->first()->status
                ] : null
            ]);
            
            return response()->json($processedDonations);
        } catch (\Exception $e) {
            Log::error('Error fetching donation history', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['error' => 'Failed to retrieve donation history'], 500);
        }
    }
}
