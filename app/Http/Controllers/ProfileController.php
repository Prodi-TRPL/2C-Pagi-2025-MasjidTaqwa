<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class ProfileController extends Controller
{
    /**
     * Menampilkan data profil donatur yang sedang login.
     */
    public function getProfile(Request $request)
    {
        $user = $request->user();
        
        if (!$user || $user->role !== 'donatur') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Helper function to convert value to boolean
        $toBool = function($value) {
            if (is_bool($value)) return $value;
            if (is_numeric($value)) return (int)$value === 1;
            if (is_string($value)) {
                $lower = strtolower($value);
                return $lower === '1' || $lower === 'true' || $lower === 'yes';
            }
            return (bool)$value;
        };
        
        // Debug logging
        Log::debug('User permissions from database:', [
            'user_id' => $user->pengguna_id,
            'can_donate_raw' => $user->can_donate,
            'can_view_history_raw' => $user->can_view_history,
            'can_view_notification_raw' => $user->can_view_notification,
            'can_donate_type' => gettype($user->can_donate),
            'can_view_history_type' => gettype($user->can_view_history),
            'can_view_notification_type' => gettype($user->can_view_notification)
        ]);

        // Ensure all permission values are properly converted to boolean
        $canDonate = $toBool($user->can_donate);
        $canViewHistory = $toBool($user->can_view_history);
        $canViewNotification = $toBool($user->can_view_notification);
        
        // Debug logging after conversion
        Log::debug('User permissions after boolean conversion:', [
            'user_id' => $user->pengguna_id,
            'can_donate' => $canDonate,
            'can_view_history' => $canViewHistory,
            'can_view_notification' => $canViewNotification
        ]);

        return response()->json([
            'pengguna_id' => $user->pengguna_id,
            'nama' => $user->nama,
            'email' => $user->email,
            'role' => $user->role,
            'can_donate' => $canDonate,
            'can_view_history' => $canViewHistory,
            'can_view_notification' => $canViewNotification
        ]);
    }

    /**
     * Memperbarui password donatur.
     */
    public function updatePassword(Request $request)
    {
        $user = $request->user();

        if (!$user || $user->role !== 'donatur') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:8|confirmed',
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Password lama tidak sesuai.'],
            ]);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json(['message' => 'Password berhasil diubah']);
    }

    /**
     * Memperbarui nama donatur.
     */
    public function update(Request $request)
    {
        $user = $request->user();

        if (!$user || $user->role !== 'donatur') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'nama' => 'required|string|min:3|max:255',
        ]);

        $user->nama = $validated['nama'];
        $user->save();

        return response()->json([
            'message' => 'Profil berhasil diperbarui',
            'user' => [
                'nama' => $user->nama,
                'email' => $user->email,
            ],
        ]);
    }
}
