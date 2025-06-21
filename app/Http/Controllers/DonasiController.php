<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Midtrans\Snap;
use App\Models\Donasi;
use Illuminate\Support\Facades\DB;

class DonasiController extends Controller
{
    public function form()
    {
        return view('donasi.form');
    }

    public function prosesDonasi(Request $request)
    {
        // Konfigurasi Midtrans
        \Midtrans\Config::$serverKey = config('midtrans.server_key');
        \Midtrans\Config::$isProduction = config('midtrans.is_production');
        \Midtrans\Config::$isSanitized = config('midtrans.is_sanitized');
        \Midtrans\Config::$is3ds = config('midtrans.is_3ds');

        // Data transaksi
            $params = [
        'transaction_details' => [
            'order_id' => uniqid(), // Simpan juga ke database nanti
            'gross_amount' => (int) $request->amount,
        ],
        'customer_details' => [
            'first_name' => $request->name,
            'email' => $request->email,
        ],
        'enabled_payments' => ['bank_transfer', 'gopay'], // ⬅️ Tambahkan baris ini
    ];

        $snapToken = Snap::getSnapToken($params);

        // Kirim token ke view yang auto trigger Snap
        return response()->json(['snap_token' => $snapToken]);

    }

    /**
     * Mendapatkan daftar donasi dari pengguna yang sedang login
     */
    public function userDonations(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $donations = Donasi::where('pengguna_id', $user->pengguna_id)
            ->orderBy('tanggal_donasi', 'desc')
            ->get();

        return response()->json([
            'donations' => $donations,
        ]);
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
        $serverKey = config('midtrans.server_key');
        $hashed = hash('sha512', $request->order_id . $request->status_code . $request->gross_amount . $serverKey);

        if ($hashed != $request->signature_key) {
            return response(['message' => 'Invalid signature'], 403);
        }

        // Ambil data dari callback
        $orderId = $request->order_id;
        $transactionStatus = $request->transaction_status;
        $paymentType = $request->payment_type;
        $amount = $request->gross_amount;

        // Update atau simpan data transaksi ke database
        $donation = Donasi::where('order_id', $orderId)->first();
        if ($donation) {
            $donation->status = $transactionStatus;
            $donation->payment_type = $paymentType;
            $donation->amount = $amount;
            $donation->save();
        }

        return response(['message' => 'Callback processed'], 200);
    }
}
