<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Donation;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class DonasiSimpleController extends Controller
{
    /**
     * Process donation without Midtrans integration for testing
     */
    public function processDonasi(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'amount' => 'required|numeric|min:10000'
            ]);
            
            Log::info('Simple donation request received', [
                'name' => $request->name,
                'email' => $request->email,
                'amount' => $request->amount
            ]);
            
            // Generate a mock token and order ID
            $orderId = 'SIMPLE-' . Str::random(8) . '-' . time();
            $mockToken = 'mock-' . Str::random(32);
            
            // Create donation record
            $donation = new Donation();
            $donation->donasi_id = Str::uuid();
            $donation->jumlah = $request->amount;
            $donation->status = 'Diterima';
            // tanggal_donasi has been removed, using created_at instead
            $donation->order_id = $orderId;
            $donation->snap_token = $mockToken;
            $donation->payment_type = 'testing';
            
            // Set user info
            if (Auth::check()) {
                $donation->pengguna_id = Auth::id();
            } else {
                $donation->name = $request->name;
                $donation->email = $request->email;
            }
            
            $donation->save();
            
            return response()->json([
                'success' => true,
                'message' => 'Donasi berhasil dibuat untuk testing',
                'data' => [
                    'donation_id' => $donation->donasi_id,
                    'amount' => $donation->jumlah,
                    'status' => $donation->status,
                    'order_id' => $donation->order_id
                ]
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error in simple donation process', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error: ' . $e->getMessage()
            ], 500);
        }
    }
} 