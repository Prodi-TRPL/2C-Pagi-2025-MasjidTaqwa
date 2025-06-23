<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Midtrans\Snap;

use App\Models\Donation;
use App\Models\Pengguna;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Midtrans\Config;
use App\Models\Donasi;
use App\Models\Notifikasi;


class DonasiController extends Controller
{
    public function form()
    {
        return view('donasi.form');
    }

    public function prosesDonasi(Request $request)
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'amount' => 'required|numeric|min:10000',
                'user_id' => 'nullable|string'
            ]);
            
            Log::info('Donation request received', [
                'name' => $request->name,
                'email' => $request->email,
                'amount' => $request->amount,
                'user_id' => $request->user_id
            ]);
            
            // Generate order ID
            $orderId = 'ORDER-' . Str::random(8) . '-' . time();
            
            // Configure Midtrans
            Config::$serverKey = config('midtrans.server_key');
            Config::$isProduction = config('midtrans.is_production');
            Config::$isSanitized = config('midtrans.is_sanitized');
            Config::$is3ds = config('midtrans.is_3ds');

            // Set up transaction parameters
            $params = [
                'transaction_details' => [
                    'order_id' => $orderId,
                    'gross_amount' => (int)$request->amount,
                ],
                'customer_details' => [
                    'first_name' => $request->name,
                    'email' => $request->email
                ]
            ];

            // Get Snap Payment Page URL
            $snapToken = Snap::getSnapToken($params);
            Log::info('Midtrans snap token generated', ['token' => $snapToken]);
            
            // Create donation record
            $donation = new Donation();
            $donation->donasi_id = Str::uuid();
            $donation->jumlah = $request->amount;
            $donation->status = 'Kadaluarsa'; // Default status until payment is confirmed
            $donation->order_id = $orderId;
            $donation->snap_token = $snapToken;
            $donation->payment_type = 'midtrans';
            
            // Always store name and email regardless of authentication status
            $donation->name = $request->name;
            $donation->email = $request->email;
            
            // Set user ID if authenticated or provided
            if (Auth::check()) {
                $donation->pengguna_id = Auth::id();
                Log::info('Setting pengguna_id from Auth', ['id' => Auth::id()]);
            } elseif ($request->user_id) {
                $donation->pengguna_id = $request->user_id;
                
                // Try to get user data for this ID
                $user = Pengguna::find($request->user_id);
                if ($user) {
                    $donation->name = $user->nama;
                    $donation->email = $user->email;
                }
                
                Log::info('Setting pengguna_id from request', [
                    'id' => $request->user_id,
                    'name' => $donation->name,
                    'email' => $donation->email
                ]);
            } else {
                Log::info('Setting anonymous donor info', ['name' => $request->name]);
            }
            
            $donation->save();
            
            // Return token to frontend
            return response()->json([
                'snap_token' => $snapToken,
                'order_id' => $orderId,
                'status' => 'success'
            ]);
                
        } catch (\Exception $e) {
            Log::error('Error processing donation', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Terjadi kesalahan: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mendapatkan statistik donasi dari pengguna yang sedang login
     */
    public function getDonationStats(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Hitung total jumlah donasi
        $totalCount = Donasi::where('pengguna_id', $user->pengguna_id)
            ->where('status', 'Diterima')
            ->count();

        // Hitung total nominal donasi
        $totalAmount = Donasi::where('pengguna_id', $user->pengguna_id)
            ->where('status', 'Diterima')
            ->sum('jumlah');

        return response()->json([
            'total_count' => $totalCount,
            'total_amount' => $totalAmount,
        ]);
    }

    public function handleCallback(Request $request)
    {
        try {
            Log::info('Payment callback received', ['request' => $request->all()]);
            
            // Handle callbacks from frontend (our JavaScript)
            if ($request->has('order_id') && $request->has('payment_status')) {
                $orderId = $request->order_id;
                
                // Manual handling for frontend callbacks
                $donation = Donation::where('order_id', $orderId)->first();
                
                if (!$donation) {
                    Log::error('Donation not found for frontend callback with order_id: ' . $orderId);
                    return response()->json(['status' => 'error', 'message' => 'Donation not found'], 404);
                }
                
                // If frontend reports success, mark as accepted
                if ($request->payment_status === 'success') {
                    $donation->status = 'Diterima';
                    Log::info('Donation marked as accepted from frontend callback', [
                        'donation_id' => $donation->donasi_id, 
                        'order_id' => $orderId
                    ]);
                    
                    // Create notification for the user if they're authenticated
                    if ($donation->pengguna_id) {
                        $this->createDonationNotification($donation);
                    }
                }
                
                $donation->save();
                
                return response()->json(['status' => 'success', 'message' => 'Donation status updated']);
            }
            
            // Handle callbacks from Midtrans
            $notificationBody = json_decode($request->getContent(), true) ?: [];
            
            if (!empty($notificationBody) && isset($notificationBody['order_id'])) {
                $orderId = $notificationBody['order_id'];
                $transactionStatus = $notificationBody['transaction_status'] ?? null;
                $paymentType = $notificationBody['payment_type'] ?? 'midtrans';
                
                // Find the donation by order_id
                $donation = Donation::where('order_id', $orderId)->first();
                
                if (!$donation) {
                    Log::error('Donation not found for Midtrans callback with order_id: ' . $orderId);
                    return response()->json(['status' => 'error', 'message' => 'Donation not found'], 404);
                }

                // Store previous status to check if it changed
                $previousStatus = $donation->status;

                // Update donation status based on transaction_status
                if ($transactionStatus) {
                    switch ($transactionStatus) {
                        case 'capture':
                        case 'settlement':
                        case 'success':
                            $donation->status = 'Diterima';
                            break;
                        case 'pending':
                            $donation->status = 'Kadaluarsa';
                            break;
                        case 'deny':
                        case 'cancel':
                        case 'expire':
                            $donation->status = 'Kadaluarsa';
                            break;
                    }
                }
                
                // Update payment_type if it wasn't set before
                if (!$donation->payment_type) {
                    $donation->payment_type = $paymentType;
                }
                
                $donation->save();
                
                // Create notification if status changed to Diterima
                if ($previousStatus !== 'Diterima' && $donation->status === 'Diterima' && $donation->pengguna_id) {
                    $this->createDonationNotification($donation);
                }
                
                Log::info('Donation status updated from Midtrans callback', [
                    'donation_id' => $donation->donasi_id, 
                    'new_status' => $donation->status,
                    'transaction_status' => $transactionStatus
                ]);
                
                return response()->json(['status' => 'success']);
            }
            
            return response()->json(['status' => 'error', 'message' => 'Invalid callback data'], 400);
            
        } catch (\Exception $e) {
            Log::error('Error handling payment callback', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Create a notification for a successful donation
     */
    private function createDonationNotification($donation)
    {
        try {
            // Format the donation amount
            $formattedAmount = number_format($donation->jumlah, 0, ',', '.');
            
            // Create notification for the user
            $notification = new Notifikasi();
            $notification->notifikasi_id = Str::uuid();
            $notification->pengguna_id = $donation->pengguna_id;
            $notification->donasi_id = $donation->donasi_id;
            $notification->tipe = 'donasi_diterima';
            $notification->judul = 'Donasi Anda Berhasil';
            $notification->pesan = "Terima kasih! Donasi Anda sebesar Rp {$formattedAmount} telah berhasil diterima. Semoga kebaikan Anda dibalas berlipat ganda.";
            $notification->status = 'terkirim';
            $notification->save();
            
            Log::info('Donation notification created', [
                'donation_id' => $donation->donasi_id,
                'notification_id' => $notification->notifikasi_id,
                'user_id' => $donation->pengguna_id
            ]);
            
            return $notification;
        } catch (\Exception $e) {
            Log::error('Failed to create donation notification', [
                'donation_id' => $donation->donasi_id,
                'error' => $e->getMessage()
            ]);
            return null;
        }
    }
    
    public function userDonations(Request $request)
    {
        try {
            // Ambil donasi untuk user yang sedang login
            $user = $request->user();
            if (!$user) {
                return response()->json(['message' => 'Unauthorized'], 401);
            }
            
            $donations = Donation::where('pengguna_id', $user->pengguna_id)
                        ->orderBy('created_at', 'desc')
                        ->get();
            
            Log::info('User donations retrieved', [
                'user_id' => $user->pengguna_id,
                'count' => $donations->count()
            ]);
            
            return response()->json([
                'donations' => $donations
            ]);
        } catch (\Exception $e) {
            Log::error('Error retrieving user donations', [
                'message' => $e->getMessage(),
                'user_id' => $request->user() ? $request->user()->pengguna_id : null
            ]);
            return response()->json(['error' => 'Failed to retrieve donations'], 500);
        }
    }
    
    public function validateDonation(Request $request, $id)
    {
        try {
            // Validasi input
            $request->validate([
                'status' => 'required|in:Diterima,Kadaluarsa',
            ]);
            
            // Cari donasi berdasarkan ID
            $donation = Donation::findOrFail($id);
            
            Log::info('Validating donation', [
                'donation_id' => $id,
                'old_status' => $donation->status,
                'new_status' => $request->status
            ]);
            
            // Update status
            $donation->status = $request->status;
            $donation->save();
            
            // Jika donasi diterima, tambahkan ke laporan keuangan
            if ($donation->status == 'Diterima') {
                // Logic untuk update laporan keuangan bisa ditambahkan di sini
                Log::info('Donation validated and accepted');
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Status donasi berhasil diperbarui',
                'data' => $donation
            ]);
        } catch (\Exception $e) {
            Log::error('Error validating donation', [
                'message' => $e->getMessage(),
                'donation_id' => $id
            ]);
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal memperbarui status donasi: ' . $e->getMessage()
            ], 500);
        }
    }
    
    public function fixDonations()
    {
        try {
            // Fix null payment types
            $nullPaymentTypes = DB::table('donasi')
                ->whereNull('payment_type')
                ->update(['payment_type' => 'midtrans']);
            Log::info('Fixed donations with null payment_type', ['count' => $nullPaymentTypes]);

            // Fix donations with status Menunggu that are more than 24 hours old
            $oneDayAgo = now()->subDay();
            $expiredDonations = DB::table('donasi')
                ->where('status', 'Menunggu')
                ->where('created_at', '<', $oneDayAgo)
                ->update(['status' => 'Kadaluarsa']);
            Log::info('Marked old pending donations as expired', ['count' => $expiredDonations]);
            
            // Fix missing name/email for users with pengguna_id
            $donations = DB::table('donasi')
                ->whereNotNull('pengguna_id')
                ->whereNull('name')
                ->orWhereNull('email')
                ->get();
                
            $nameFixes = 0;
            
            foreach ($donations as $donation) {
                $user = DB::table('pengguna')->where('pengguna_id', $donation->pengguna_id)->first();
                if ($user) {
                    DB::table('donasi')
                        ->where('donasi_id', $donation->donasi_id)
                        ->update([
                            'name' => $user->nama,
                            'email' => $user->email
                        ]);
                    $nameFixes++;
                }
            }
            
            $total = DB::table('donasi')->count();
            
            Log::info('Fix donations complete', [
                'total' => $total, 
                'fixed_payment_types' => $nullPaymentTypes,
                'fixed_statuses' => $expiredDonations,
                'fixed_names' => $nameFixes
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Donations fixed successfully',
                'data' => [
                    'total' => $total,
                    'fixed_payment_types' => $nullPaymentTypes,
                    'fixed_statuses' => $expiredDonations,
                    'fixed_names' => $nameFixes
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error fixing donations', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error fixing donations: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cancel a donation when user closes the payment popup
     */
    public function cancelDonation(Request $request)
    {
        try {
            $request->validate([
                'order_id' => 'required|string'
            ]);
            
            $orderId = $request->order_id;
            
            // Find the donation by order_id
            $donation = Donation::where('order_id', $orderId)->first();
            
            if (!$donation) {
                Log::error('Donation not found for order_id when trying to cancel: ' . $orderId);
                return response()->json(['status' => 'error', 'message' => 'Donation not found'], 404);
            }

            // Update donation status to Kadaluarsa
            $donation->status = 'Kadaluarsa';
            $donation->save();
            
            Log::info('Donation cancelled by user', [
                'donation_id' => $donation->donasi_id, 
                'order_id' => $orderId
            ]);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Donasi berhasil dibatalkan'
            ]);
        } catch (\Exception $e) {
            Log::error('Error cancelling donation', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal membatalkan donasi: ' . $e->getMessage()
            ], 500);
        }
    }
}
