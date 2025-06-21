<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Notifikasi;

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

        $query = Notifikasi::where('pengguna_id', $user->pengguna_id);

        // Optional filter by type
        if ($request->has('tipe')) {
            $query->where('tipe', $request->input('tipe'));
        }

        // Eager load donasi info if donasi_id present
        $notifications = $query->with(['donasi' => function ($q) {
            $q->select('donasi_id', 'jumlah', 'status', 'tanggal_donasi');
        }])->orderBy('created_at', 'desc')->get();

        // Map notifications to include short donasi info
        $notifications = $notifications->map(function ($notif) {
            $notifArray = $notif->toArray();
            if ($notif->donasi) {
                $notifArray['donasi_info'] = [
                    'jumlah' => $notif->donasi->jumlah,
                    'status' => $notif->donasi->status,
                    'tanggal_donasi' => $notif->donasi->tanggal_donasi,
                ];
            } else {
                $notifArray['donasi_info'] = null;
            }
            return $notifArray;
        });

        return response()->json($notifications);
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
}