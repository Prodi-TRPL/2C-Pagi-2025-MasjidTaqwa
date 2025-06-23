<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Notifikasi;
use Illuminate\Support\Facades\Log;

class NotifikasiController extends Controller
{
    /**
     * Get notifications for the authenticated user.
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        try {
            $query = Notifikasi::where('pengguna_id', $user->pengguna_id);

            // Optional filter by type
            if ($request->has('tipe')) {
                $query->where('tipe', $request->input('tipe'));
            }

            // Eager load donasi info if donasi_id present
            $notifications = $query->with(['donasi' => function ($q) {
                $q->select('donasi_id', 'jumlah', 'status', 'created_at');
            }])->orderBy('created_at', 'desc')->get();

            // Map notifications to include short donasi info and ensure judul field exists
            $notifications = $notifications->map(function ($notif) {
                $notifArray = $notif->toArray();
                
                // Make sure judul field exists, use pesan as fallback if needed
                if (!isset($notifArray['judul']) || empty($notifArray['judul'])) {
                    // Generate a title based on notification type
                    switch ($notif->tipe) {
                        case 'donasi_diterima':
                            $notifArray['judul'] = 'Donasi Anda Berhasil Diterima';
                            break;
                        case 'progres_pembangunan':
                            $notifArray['judul'] = 'Update Progres Pembangunan';
                            break;
                        case 'target_tercapai':
                            $notifArray['judul'] = 'Target Donasi Tercapai';
                            break;
                        default:
                            // Use first part of message as title if no specific title
                            $notifArray['judul'] = substr($notif->pesan, 0, 30) . (strlen($notif->pesan) > 30 ? '...' : '');
                    }
                }
                
                if ($notif->donasi) {
                    $notifArray['donasi_info'] = [
                        'jumlah' => $notif->donasi->jumlah,
                        'status' => $notif->donasi->status,
                        'tanggal_donasi' => $notif->donasi->created_at,
                    ];
                } else {
                    $notifArray['donasi_info'] = null;
                }
                return $notifArray;
            });

            return response()->json($notifications);
        } catch (\Exception $e) {
            Log::error('Error fetching notifications: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to fetch notifications'], 500);
        }
    }

    /**
     * Mark a notification as read.
     */
    public function markAsRead($id)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $notification = Notifikasi::where('notifikasi_id', $id)
            ->where('pengguna_id', $user->pengguna_id)
            ->first();

        if (!$notification) {
            return response()->json(['message' => 'Notification not found'], 404);
        }

        $notification->status = 'dibaca';
        $notification->save();

        return response()->json(['message' => 'Notification marked as read']);
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead()
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        Notifikasi::where('pengguna_id', $user->pengguna_id)
            ->where('status', 'terkirim')
            ->update(['status' => 'dibaca']);

        return response()->json(['message' => 'All notifications marked as read']);
    }

    /**
     * Delete a notification.
     */
    public function destroy($id)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $notification = Notifikasi::where('notifikasi_id', $id)
            ->where('pengguna_id', $user->pengguna_id)
            ->first();

        if (!$notification) {
            return response()->json(['message' => 'Notification not found'], 404);
        }

        $notification->delete();

        return response()->json(['message' => 'Notification deleted']);
    }

    /**
     * Check for new notifications since a given timestamp
     */
    public function checkNewNotifications(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        try {
            // Get the timestamp from the request
            $timestamp = $request->input('since', 0);
            $since = date('Y-m-d H:i:s', $timestamp / 1000); // Convert from JS timestamp to MySQL datetime
            
            // Count new notifications since the timestamp
            $newCount = Notifikasi::where('pengguna_id', $user->pengguna_id)
                ->where('created_at', '>', $since)
                ->count();
                
            // Get the latest notification if there are new ones
            $latestNotification = null;
            if ($newCount > 0) {
                $latestNotification = Notifikasi::where('pengguna_id', $user->pengguna_id)
                    ->orderBy('created_at', 'desc')
                    ->first();
            }
            
            return response()->json([
                'has_new' => $newCount > 0,
                'count' => $newCount,
                'latest' => $latestNotification ? [
                    'id' => $latestNotification->notifikasi_id,
                    'tipe' => $latestNotification->tipe,
                    'judul' => $latestNotification->judul,
                    'created_at' => $latestNotification->created_at
                ] : null
            ]);
        } catch (\Exception $e) {
            Log::error('Error checking for new notifications: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to check for new notifications'], 500);
        }
    }
}