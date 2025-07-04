<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Notifikasi;
use App\Models\User; // atau model user yang sesuai
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AdminNotifikasiController extends Controller
{
    /**
     * Get all notifications (for admin view)
     */
    public function index()
    {
        try {
        // Cek apakah user adalah admin (sesuaikan dengan sistem role Anda)
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

            // Log untuk debugging
            \Illuminate\Support\Facades\Log::info('Admin notification index accessed by user:', [
                'user_id' => $user->pengguna_id,
                'email' => $user->email,
                'role' => $user->role ?? 'unknown'
            ]);

            // Periksa apakah user adalah admin
            if ($user->role !== 'admin') {
                \Illuminate\Support\Facades\Log::warning('Non-admin user attempted to access admin notifications', [
                    'user_id' => $user->pengguna_id,
                    'role' => $user->role ?? 'unknown'
                ]);
                return response()->json(['message' => 'Forbidden: Admin access required'], 403);
            }

        // Ambil notifikasi yang dibuat manual (bukan dari sistem donasi)
        // Asumsi: notifikasi manual tidak punya donasi_id
        $notifications = Notifikasi::whereNull('donasi_id')
                ->select('notifikasi_id', 'tipe', 'judul', 'pesan', 'status', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($notifications);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error fetching admin notifications: ' . $e->getMessage());
            \Illuminate\Support\Facades\Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'message' => 'Gagal mengambil data notifikasi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create and send notification to all users
     */
    public function store(Request $request)
    {
        try {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $request->validate([
            'jenis' => 'required|string|in:Progress Pembangunan,Target Proyek Tercapai',
            'judul' => 'required|string|max:255',
            'pesan' => 'required|string',
        ]);

        // Map frontend types to database types
        $typeMapping = [
            'Progress Pembangunan' => 'progres_pembangunan',
            'Target Proyek Tercapai' => 'target_tercapai'
        ];

        $tipe = $typeMapping[$request->jenis];

            // Cari semua user donatur - sesuaikan dengan struktur tabel user Anda
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
                $notificationData = [
                    'notifikasi_id' => (string) Str::uuid(),
                    'pengguna_id' => $targetUser->pengguna_id,
                    'donasi_id' => null,
                    'tipe' => $tipe,
                    'judul' => $request->judul,
                    'pesan' => $request->pesan,
                    'status' => 'terkirim',
                    'processed' => true, // Admin notifications are considered already processed
                    'priority' => 'normal', // Default priority
                    'created_at' => now()
                ];
                
                // Log data yang akan disimpan untuk debugging
                \Illuminate\Support\Facades\Log::info('Creating notification with data:', $notificationData);
                
                $notification = Notifikasi::create($notificationData);
                $notifications[] = $notification;
            }

            return response()->json([
                'message' => 'Notifikasi berhasil dikirim ke semua donatur',
                'count' => count($notifications),
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            \Illuminate\Support\Facades\Log::error('Validation error: ' . $e->getMessage());
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error sending notification: ' . $e->getMessage());
            \Illuminate\Support\Facades\Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'message' => 'Gagal mengirim notifikasi',
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
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
            $deletedCount = Notifikasi::where('judul', $notification->judul)
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
        try {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

            // Log untuk debugging
            \Illuminate\Support\Facades\Log::info('Admin notification stats accessed by user:', [
                'user_id' => $user->pengguna_id,
                'email' => $user->email,
                'role' => $user->role ?? 'unknown'
            ]);

            // Periksa apakah user adalah admin
            if ($user->role !== 'admin') {
                \Illuminate\Support\Facades\Log::warning('Non-admin user attempted to access admin notification stats', [
                    'user_id' => $user->pengguna_id,
                    'role' => $user->role ?? 'unknown'
                ]);
                return response()->json(['message' => 'Forbidden: Admin access required'], 403);
            }

            // Hitung total notifikasi yang terkirim
            $totalSent = Notifikasi::count();
            
            // Hitung total notifikasi yang sudah dibaca
            $totalRead = Notifikasi::where('status', 'dibaca')->count();
            
            // Hitung total notifikasi yang belum dibaca
            $totalUnread = Notifikasi::where('status', 'terkirim')->count();
            
            // Hitung persentase yang sudah dibaca
            $readPercentage = $totalSent > 0 ? round(($totalRead / $totalSent) * 100) : 0;
            
            // Log stats untuk debugging
            \Illuminate\Support\Facades\Log::info('Notification stats calculated:', [
                'total_sent' => $totalSent,
                'total_read' => $totalRead,
                'total_unread' => $totalUnread,
                'read_percentage' => $readPercentage
            ]);

            return response()->json([
                'total_sent' => $totalSent,
                'total_read' => $totalRead,
                'total_unread' => $totalUnread,
                'read_percentage' => $readPercentage
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error fetching notification stats: ' . $e->getMessage());
            \Illuminate\Support\Facades\Log::error('Stack trace: ' . $e->getTraceAsString());
            
            return response()->json([
                'message' => 'Gagal mengambil statistik notifikasi',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}