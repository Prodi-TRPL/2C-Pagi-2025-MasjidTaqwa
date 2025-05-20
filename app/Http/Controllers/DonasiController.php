<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DonasiController extends Controller
{
    /**
     * Get donation history for the authenticated user.
     */
    public function userDonations(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $donations = DB::table('donasi')
            ->leftJoin('metode_pembayaran', 'donasi.metode_pembayaran_id', '=', 'metode_pembayaran.metode_pembayaran_id')
            ->leftJoin('laporan_keuangan', 'donasi.laporan_keuangan_id', '=', 'laporan_keuangan.laporan_keuangan_id')
            ->select(
                'donasi.donasi_id',
                'donasi.jumlah',
                'donasi.status',
                'donasi.tanggal_donasi',
                'metode_pembayaran.nama_metode',
                'laporan_keuangan.periode'
            )
            ->where('donasi.pengguna_id', $user->pengguna_id)
            ->orderBy('donasi.tanggal_donasi', 'desc')
            ->get();

        return response()->json($donations);
    }
}
