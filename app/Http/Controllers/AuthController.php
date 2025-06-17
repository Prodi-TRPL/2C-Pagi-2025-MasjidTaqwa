<?php

namespace App\Http\Controllers;

use App\Models\Pengguna;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Auth\Events\PasswordReset;

class AuthController extends Controller
{
    /**
     * Register a new user (donatur).
     */
    public function register(Request $request)
    {
        $request->validate([
            'username' => 'required|email|unique:pengguna,email',
            'password' => 'required|min:6',
        ]);

        try {
            $user = Pengguna::create([
                'pengguna_id' => Str::uuid(),
                'nama' => 'Donatur',
                'email' => $request->username,
                'password' => Hash::make($request->password),
                'role' => 'donatur',
                'nomor_hp' => null,
                'created_at' => now(),
            ]);

            return response()->json([
                'message' => 'Pendaftaran berhasil!',
                'user' => $user,
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat mendaftar.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Log in user (admin atau donatur).
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = Pengguna::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Email atau password salah'], 401);
        }

        if (!in_array($user->role, ['admin', 'donatur'])) {
            return response()->json(['message' => 'Anda tidak memiliki akses'], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user,
        ]);
    }

    /**
     * Logout user.
     */
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json(['message' => 'Berhasil logout']);
    }

    /**
     * Kirim link reset password ke email pengguna.
     */
    public function resetPasswordLangsung(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);
    
        $user = Pengguna::where('email', $request->email)->first();
    
        if (!$user) {
            return response()->json(['message' => 'Email tidak ditemukan.'], 404);
        }
    
        // Ganti password ke default baru
        $newPassword = '12345678'; // kamu bisa acak jika mau
        $user->password = Hash::make($newPassword);
        $user->save();
    
        return response()->json([
            'message' => 'Password berhasil direset.',
            'new_password' => $newPassword,
        ]);
    }
}