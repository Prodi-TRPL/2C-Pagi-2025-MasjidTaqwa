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
use Illuminate\Support\Facades\Validator;


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
                'user_id' => 'nullable|string',
                'is_anonymous' => 'nullable|boolean'
            ]);
            
            // Parse and validate amount to ensure it's an integer
            $amount = (int)$request->amount;
            
            // Basic sanity check for unrealistically large amounts
            if ($amount > 1000000000) { // More than 1 billion rupiah
                Log::warning('Extremely large donation amount detected', [
                    'amount' => $amount,
                    'raw_amount' => $request->amount
                ]);
                return response()->json([
                    'status' => 'error',
                    'message' => 'Jumlah donasi terlalu besar'
                ], 400);
            }
            
            Log::info('Donation request received', [
                'name' => $request->name,
                'email' => $request->email,
                'raw_amount' => $request->amount,
                'processed_amount' => $amount,
                'user_id' => $request->user_id,
                'is_anonymous' => $request->is_anonymous
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
                    'gross_amount' => $amount,
                ],
                'customer_details' => [
                    'first_name' => $request->name,
                    'email' => $request->email
                ]
            ];

            // Get Snap Payment Page URL
            $snapToken = Snap::getSnapToken($params);
            Log::info('Midtrans snap token generated', [
                'token' => $snapToken, 
                'amount' => $amount
            ]);
            
            // Create donation record
            $donation = new Donation();
            $donation->donasi_id = Str::uuid();
            $donation->jumlah = $amount;
            $donation->status = 'Kadaluarsa'; // Default status until payment is confirmed
            $donation->order_id = $orderId;
            $donation->snap_token = $snapToken;
            $donation->payment_type = 'midtrans';
            
            // Handle anonymous donations
            $isAnonymous = $request->has('is_anonymous') && $request->is_anonymous === true;
            
            // Always store name and email regardless of authentication status
            $donation->name = $isAnonymous ? 'Donatur Anonim' : $request->name;
            $donation->email = $request->email;
            $donation->is_anonymous = $isAnonymous;
            
            // Set user ID if authenticated or provided
            if (Auth::check()) {
                $donation->pengguna_id = Auth::id();
                Log::info('Setting pengguna_id from Auth', ['id' => Auth::id()]);
            } elseif ($request->user_id) {
                $donation->pengguna_id = $request->user_id;
                
                // Try to get user data for this ID
                $user = Pengguna::find($request->user_id);
                if ($user) {
                    // Only override name if not anonymous
                    if (!$isAnonymous) {
                        $donation->name = $user->nama;
                    }
                    $donation->email = $user->email;
                }
                
                Log::info('Setting pengguna_id from request', [
                    'id' => $request->user_id,
                    'name' => $donation->name,
                    'email' => $donation->email,
                    'is_anonymous' => $isAnonymous
                ]);
            } else {
                // User is not logged in - create or update an anonymous donor record
                // First check if the anonymous_donors table exists
                $anonymousDonorsTableExists = false;
                $anonymousDonorIdColumnExists = false;
                
                try {
                    $anonymousDonorsTableExists = DB::getSchemaBuilder()->hasTable('anonymous_donors');
                    if ($anonymousDonorsTableExists) {
                        $anonymousDonorIdColumnExists = DB::getSchemaBuilder()->hasColumn('donasi', 'anonymous_donor_id');
                    }
                } catch (\Exception $e) {
                    Log::warning('Error checking anonymous_donors table existence: ' . $e->getMessage());
                }
                
                // Only create anonymous donor record if the table exists
                if ($anonymousDonorsTableExists && $anonymousDonorIdColumnExists) {
                    try {
                        $anonymousDonor = \App\Models\AnonymousDonor::firstOrCreate(
                            ['email' => $request->email],
                            [
                                'nama' => $isAnonymous ? 'Donatur Anonim' : $request->name,
                                'is_linked_to_account' => false
                            ]
                        );
                        
                        // Associate the anonymous donor with this donation
                        $donation->anonymous_donor_id = $anonymousDonor->anonymous_donor_id;
                        
                        Log::info('Created anonymous donor record', [
                            'anonymous_donor_id' => $anonymousDonor->anonymous_donor_id,
                            'email' => $anonymousDonor->email,
                            'name' => $anonymousDonor->nama,
                            'is_anonymous' => $isAnonymous
                        ]);
                    } catch (\Exception $e) {
                        Log::warning('Error creating anonymous donor record: ' . $e->getMessage());
                        // Continue without anonymous donor association
                    }
                } else {
                    Log::info('Anonymous donor table does not exist, storing donor info directly', [
                        'name' => $donation->name,
                        'email' => $donation->email,
                        'is_anonymous' => $isAnonymous
                    ]);
                }
            }
            
            $donation->save();
            
            Log::info('Donation record created successfully', [
                'donasi_id' => $donation->donasi_id,
                'amount' => $donation->jumlah,
                'order_id' => $orderId,
                'is_anonymous' => $isAnonymous
            ]);
            
            // Return token to frontend
            return response()->json([
                'snap_token' => $snapToken,
                'order_id' => $orderId,
                'amount' => $amount, // Return the processed amount for verification
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

        try {
            // Get donations directly made by this user
            $directDonations = Donasi::where('pengguna_id', $user->pengguna_id)
                ->where('status', 'Diterima');

            // Hitung total jumlah donasi langsung
            $totalDirectCount = $directDonations->count();

            // Hitung total nominal donasi langsung
            $totalDirectAmount = $directDonations->sum('jumlah');
            
            // Initialize anonymous donation stats
            $totalAnonymousCount = 0;
            $totalAnonymousAmount = 0;
            
            // Check if anonymous_donors table exists before trying to query it
            $anonymousDonorsTableExists = false;
            $anonymousDonorIdColumnExists = false;
            
            try {
                // Check if the anonymous_donors table exists
                $anonymousDonorsTableExists = DB::getSchemaBuilder()->hasTable('anonymous_donors');
                
                // Check if the anonymous_donor_id column exists in the donasi table
                if ($anonymousDonorsTableExists) {
                    $anonymousDonorIdColumnExists = DB::getSchemaBuilder()->hasColumn('donasi', 'anonymous_donor_id');
                }
            } catch (\Exception $e) {
                // Log the error but continue with direct donations only
                Log::warning('Error checking anonymous_donors table existence in stats: ' . $e->getMessage());
            }
            
            // Only query anonymous donations if the necessary tables/columns exist
            if ($anonymousDonorsTableExists && $anonymousDonorIdColumnExists) {
                try {
                    // Get donations made as anonymous donor before registration
                    $anonymousDonationsQuery = Donasi::whereIn('anonymous_donor_id', function($query) use ($user) {
                        $query->select('anonymous_donor_id')
                            ->from('anonymous_donors')
                            ->where('email', $user->email)
                            ->orWhere('pengguna_id', $user->pengguna_id);
                    })->where('status', 'Diterima');
                    
                    // Hitung total jumlah donasi anonim
                    $totalAnonymousCount = $anonymousDonationsQuery->count();
                    
                    // Hitung total nominal donasi anonim
                    $totalAnonymousAmount = $anonymousDonationsQuery->sum('jumlah');
                } catch (\Exception $e) {
                    // Log error but continue with direct donations
                    Log::warning('Error fetching anonymous donations stats: ' . $e->getMessage());
                }
            }
            
            // Calculate totals
            $totalCount = $totalDirectCount + $totalAnonymousCount;
            $totalAmount = $totalDirectAmount + $totalAnonymousAmount;

            return response()->json([
                'total_count' => $totalCount,
                'total_amount' => $totalAmount,
                'direct_count' => $totalDirectCount,
                'anonymous_count' => $totalAnonymousCount,
            ]);
        } catch (\Exception $e) {
            Log::error('Error getting donation stats: ' . $e->getMessage());
            return response()->json([
                'message' => 'Failed to get donation stats: ' . $e->getMessage()
            ], 500);
        }
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
            $notification->processed = true; // Donasi notifications are considered already processed
            $notification->priority = 'normal'; // Default priority
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
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        
        try {
            // Get donations directly made by this user
            $directDonations = Donasi::where('pengguna_id', $user->pengguna_id)
                ->orderBy('created_at', 'desc')
                ->get();
                
            // Check if anonymous_donors table exists before trying to query it
            $anonymousDonorsTableExists = false;
            $anonymousDonorIdColumnExists = false;
            
            try {
                // Check if the anonymous_donors table exists
                $anonymousDonorsTableExists = DB::getSchemaBuilder()->hasTable('anonymous_donors');
                
                // Check if the anonymous_donor_id column exists in the donasi table
                if ($anonymousDonorsTableExists) {
                    $anonymousDonorIdColumnExists = DB::getSchemaBuilder()->hasColumn('donasi', 'anonymous_donor_id');
                }
                
                Log::info('Database schema check for anonymous donors', [
                    'anonymousDonorsTableExists' => $anonymousDonorsTableExists,
                    'anonymousDonorIdColumnExists' => $anonymousDonorIdColumnExists
                ]);
            } catch (\Exception $e) {
                // Log the error but continue with direct donations only
                Log::warning('Error checking anonymous_donors table existence: ' . $e->getMessage());
            }
            
            // Initialize anonymous donations collection
            $anonymousDonations = collect([]);
                
            // Only query anonymous donations if the necessary tables/columns exist
            if ($anonymousDonorsTableExists && $anonymousDonorIdColumnExists) {
                try {
                    // Get donations made as anonymous donor before registration (by email)
                    $anonymousDonations = Donasi::whereIn('anonymous_donor_id', function($query) use ($user) {
                        $query->select('anonymous_donor_id')
                              ->from('anonymous_donors')
                              ->where('email', $user->email)
                              ->orWhere('pengguna_id', $user->pengguna_id);
                    })
                    ->whereNull('pengguna_id') // Ensure we don't double-count
                    ->orderBy('created_at', 'desc')
                    ->get();
                    
                    // After retrieving donations, link any anonymous donors that aren't already linked
                    if ($anonymousDonations->isNotEmpty()) {
                        \App\Models\AnonymousDonor::where('email', $user->email)
                            ->where('is_linked_to_account', false)
                            ->update([
                                'pengguna_id' => $user->pengguna_id,
                                'is_linked_to_account' => true
                            ]);
                    }
                } catch (\Exception $e) {
                    // Log error but continue with direct donations
                    Log::warning('Error fetching anonymous donations: ' . $e->getMessage());
                }
            }
            
            // Merge the collections (even if anonymous_donations is empty)
            $allDonations = $directDonations->merge($anonymousDonations)
                ->sortByDesc('created_at')
                ->values(); // Reindex array after sorting
            
            return response()->json($allDonations);
        } catch (\Exception $e) {
            Log::error('Error fetching user donations', [
                'user_id' => $user->pengguna_id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Failed to fetch donations: ' . $e->getMessage()
            ], 500);
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

    /**
     * Validate a donation using stored procedure
     *
     * @param  string  $id
     * @param  Request  $request
     * @return \Illuminate\Http\Response
     */
    public function validateDonationUsingProcedure($id, Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'status' => 'required|in:Diterima,Pending,Kadaluarsa,Dibatalkan'
            ]);

            if ($validator->fails()) {
                return response()->json(['message' => 'Validation error', 'errors' => $validator->errors()], 422);
            }

            $new_status = $request->status;
            
            // Call the stored procedure
            DB::select('CALL validate_donation(?, ?)', [$id, $new_status]);
            
            // Get the updated donation
            $donation = Donasi::find($id);
            
            if (!$donation) {
                return response()->json(['message' => 'Donation not found'], 404);
            }
            
            return response()->json([
                'message' => 'Donation validated successfully',
                'donation' => $donation
            ]);
        } catch (\Exception $e) {
            Log::error('Error validating donation: ' . $e->getMessage());
            return response()->json(['message' => 'Error validating donation: ' . $e->getMessage()], 500);
        }
    }
}
