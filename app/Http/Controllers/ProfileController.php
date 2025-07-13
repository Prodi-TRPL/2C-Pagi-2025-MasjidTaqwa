<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\log;
use Illuminate\Validation\ValidationException;
use App\Models\LogAktivitas;

class ProfileController extends Controller
{
    /**
     * Menampilkan data profil pengguna yang sedang login.
     */
    public function getProfile(Request $request)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
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
            'role' => $user->role,
            'can_donate_raw' => $user->can_donate ?? null,
            'can_view_history_raw' => $user->can_view_history ?? null,
            'can_view_notification_raw' => $user->can_view_notification ?? null,
        ]);

        // Ensure all permission values are properly converted to boolean for donatur users
        $canDonate = $user->role === 'donatur' ? $toBool($user->can_donate) : null;
        $canViewHistory = $user->role === 'donatur' ? $toBool($user->can_view_history) : null;
        $canViewNotification = $user->role === 'donatur' ? $toBool($user->can_view_notification) : null;
        
        // Prepare response data
        $responseData = [
            'pengguna_id' => $user->pengguna_id,
            'nama' => $user->nama,
            'email' => $user->email,
            'role' => $user->role,
            'nomor_hp' => $user->nomor_hp,
            'created_at' => $user->created_at,
            'email_verified_at' => $user->email_verified_at
        ];
        
        // Add permission fields only for donatur users
        if ($user->role === 'donatur') {
            $responseData['can_donate'] = $canDonate;
            $responseData['can_view_history'] = $canViewHistory;
            $responseData['can_view_notification'] = $canViewNotification;
        }

        return response()->json($responseData);
    }

    /**
     * Memperbarui password pengguna.
     */
    public function updatePassword(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $request->validate([
            'current_password' => 'required',
            'password' => 'required|min:8|confirmed',
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Password lama tidak sesuai.'],
            ]);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        // Log activity for admin users
        if ($user->role === 'admin') {
            try {
                LogAktivitas::log(
                    'ubah',
                    "Admin {$user->nama} mengubah password"
                );
            } catch (\Exception $e) {
                Log::error('Error logging password change: ' . $e->getMessage());
            }
        }

        return response()->json(['message' => 'Password berhasil diubah']);
    }

    /**
     * Memperbarui profil pengguna.
     */
    public function update(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $rules = [];
        $updateFields = [];
        
        // Validate and update nama if provided
        if ($request->has('nama')) {
            $rules['nama'] = 'required|string|min:3|max:255';
            $updateFields[] = 'nama';
        }
        
        // Validate and update nomor_hp if provided
        if ($request->has('nomor_hp')) {
            $rules['nomor_hp'] = 'nullable|string|max:15';
            $updateFields[] = 'nomor_hp';
        }
        
        $validated = $request->validate($rules);
        
        // Update user fields
        foreach ($updateFields as $field) {
            $user->{$field} = $validated[$field];
        }
        
        $user->save();
        
        // Log activity for admin users
        if ($user->role === 'admin' && !empty($updateFields)) {
            try {
                LogAktivitas::log(
                    'ubah',
                    "Admin {$user->nama} mengubah profil: " . implode(', ', $updateFields)
                );
            } catch (\Exception $e) {
                Log::error('Error logging profile update: ' . $e->getMessage());
            }
        }

        return response()->json([
            'message' => 'Profil berhasil diperbarui',
            'user' => [
                'nama' => $user->nama,
                'email' => $user->email,
                'nomor_hp' => $user->nomor_hp,
            ],
        ]);
    }
}
