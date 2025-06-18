<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Notifikasi;
use App\Models\User; // atau model user yang sesuai
use Illuminate\Support\Facades\DB;

class AdminNotifikasiController extends Controller
{
    /**
     * Get all notifications (for admin view)
     */
    public function index()
    {
        // Cek apakah user adalah admin (sesuaikan dengan sistem role Anda)
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Ambil notifikasi yang dibuat manual (bukan dari sistem donasi)
        // Asumsi: notifikasi manual tidak punya donasi_id
        $notifications = Notifikasi::whereNull('donasi_id')
            ->select('notifikasi_id', 'tipe', 'pesan as judul', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get()
            ->unique(['tipe', 'pesan']) // Hapus duplikat berdasarkan tipe dan pesan
            ->values(); // Reset array keys

        return response()->json($notifications);
    }

    /**
     * Create and send notification to all users
     */
    public function store(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $request->validate([
            'jenis' => 'required|string|in:Progress Pembangunan,Target Proyek Tercapai',
            'judul' => 'required|string|max:255',
        ]);

        // Map frontend types to database types
        $typeMapping = [
            'Progress Pembangunan' => 'progres_pembangunan',
            'Target Proyek Tercapai' => 'target_tercapai'
        ];

        $tipe = $typeMapping[$request->jenis];

        try {
            // Cari semua user donatur - sesuaikan dengan struktur tabel user Anda
            // Ganti 'users' dengan nama tabel user yang benar
            // Ganti 'id' dengan primary key user yang benar (mungkin 'pengguna_id')
            $users = DB::table('pengguna')
                ->where('role', 'donatur') // Sesuaikan dengan field role Anda
                ->get();

            // Jika tidak ada field role, ambil semua user kecuali admin
            // $users = DB::table('users')->where('id', '!=', $user->id)->get();

            if ($users->isEmpty()) {
                return response()->json(['message' => 'Tidak ada donatur ditemukan'], 404);
            }

            $notifications = [];
            foreach ($users as $targetUser) {
                $notification = Notifikasi::create([
                    'pengguna_id' => $targetUser->pengguna_id, // Sesuaikan dengan field ID user
                    'donasi_id' => null, // Null karena ini notifikasi manual
                    'tipe' => $tipe,
                    'pesan' => $request->judul,
                    'status' => 'terkirim',
                ]);
                $notifications[] = $notification;
            }

            return response()->json([
                'message' => 'Notifikasi berhasil dikirim ke semua donatur',
                'count' => count($notifications),
            ]);

        } catch (\Exception $e) {
    return response()->json([
        'message' => 'Gagal mengirim notifikasi',
        'error' => $e->getMessage(), // tambah baris ini
    ], 500);
}

    }

    /**
     * Delete notification (hapus untuk semua user)
     */
    public function destroy($id)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        try {
            // Cari notifikasi berdasarkan ID
            $notification = Notifikasi::where('notifikasi_id', $id)->first();

            if (!$notification) {
                return response()->json(['message' => 'Notification not found'], 404);
            }

            // Hapus semua notifikasi dengan pesan dan tipe yang sama (untuk semua user)
            $deletedCount = Notifikasi::where('pesan', $notification->pesan)
                ->where('tipe', $notification->tipe)
                ->whereNull('donasi_id') // Hanya hapus yang notifikasi manual
                ->delete();

            return response()->json([
                'message' => "Notification deleted for {$deletedCount} users"
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal menghapus notifikasi: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get notification statistics
     */
    public function getStats()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        try {
            // Hitung statistik notifikasi manual (tanpa donasi_id)
            $totalSent = Notifikasi::whereNull('donasi_id')->count();
            $totalRead = Notifikasi::whereNull('donasi_id')
                ->where('status', 'dibaca')->count();
            $totalUnread = Notifikasi::whereNull('donasi_id')
                ->where('status', 'terkirim')->count();

            return response()->json([
                'total_sent' => $totalSent,
                'total_read' => $totalRead,
                'total_unread' => $totalUnread,
                'read_percentage' => $totalSent > 0 ? round(($totalRead / $totalSent) * 100, 2) : 0
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal mengambil statistik: ' . $e->getMessage()
            ], 500);
        }
    }
}