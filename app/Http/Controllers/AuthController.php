<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\Pengguna;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        Log::info('Login attempt with email: ' . $request->input('email'));

        $credentials = $request->only('email', 'password');

        if (Auth::attempt($credentials)) {
            $user = Auth::user();
            Log::info('Authenticated user: ' . $user->email . ', role: ' . $user->role);

            if ($user->role === 'admin') {
                return response()->json([
                    'status' => true,
                    'message' => 'Login successful',
                    'role' => $user->role,
                    'user' => $user,
                ]);
            } else {
                Auth::logout();
                Log::warning('Unauthorized role login attempt: ' . $user->email);
                return response()->json([
                    'status' => false,
                    'message' => 'Unauthorized role',
                ], 403);
            }
        } else {
            Log::warning('Invalid credentials for email: ' . $request->input('email'));
            return response()->json([
                'status' => false,
                'message' => 'Invalid credentials',
            ], 401);
        }
    }

    // New method to create admin user manually
    public function createAdmin()
    {
        $adminEmail = 'admin@example.com';
        $existingAdmin = Pengguna::where('email', $adminEmail)->first();

        if ($existingAdmin) {
            return response()->json([
                'status' => false,
                'message' => 'Admin user already exists',
            ], 409);
        }

        $admin = new Pengguna();
        $admin->pengguna_id = (string) Str::uuid();
        $admin->nama = 'Admin User';
        $admin->email = $adminEmail;
        $admin->password = Hash::make('password123'); // hashed password
        $admin->role = 'admin';
        $admin->nomor_hp = '081234567890';
        $admin->created_at = now();
        $admin->save();

        return response()->json([
            'status' => true,
            'message' => 'Admin user created successfully',
            'user' => $admin,
        ]);
    }

    // Method to update password with hashing
    public function updatePassword(Request $request, $id)
    {
        $request->validate([
            'password' => 'required|string|min:6|confirmed',
        ]);

        $user = Pengguna::findOrFail($id);
        $user->password = Hash::make($request->password);
        $user->save();

        return response()->json([
            'status' => true,
            'message' => 'Password updated successfully',
        ]);
    }

    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'status' => true,
            'message' => 'Logged out successfully',
        ]);
    }

    // Added method to return authenticated user data
    public function user(Request $request)
    {
        return response()->json($request->user());
    }
}
