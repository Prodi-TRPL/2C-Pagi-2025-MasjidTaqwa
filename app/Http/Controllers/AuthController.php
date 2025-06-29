<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Pengguna;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\QueryException;
use PDOException;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    /**
     * Handle user login.
     */
    public function login(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required',
            ]);

            try {
                // Attempt to find the user by email
                $user = Pengguna::where('email', $request->email)->first();
                
                if (!$user || !Hash::check($request->password, $user->password)) {
                    return response()->json(['message' => 'Email atau password salah'], 401);
                }

                if ($user->role !== 'admin' && $user->role !== 'donatur') {
                    return response()->json(['message' => 'Anda tidak memiliki akses sebagai admin'], 403);
                }

                // Create token (assuming Laravel Sanctum or Passport is used)
                $token = $user->createToken('auth_token')->plainTextToken;

                return response()->json([
                    'token' => $token,
                    'user' => $user,
                ]);
                
            } catch (QueryException $e) {
                // Log the actual database error for administrators
                Log::error('Database error during login: ' . $e->getMessage(), [
                    'email' => $request->email,
                    'error_code' => $e->getCode()
                ]);
                
                // Check for specific MySQL error codes
                $errorCode = $e->getCode();
                $errorMessage = $e->getMessage();
                
                // Common MySQL error codes for permission issues
                if (in_array($errorCode, ['1044', '1142', '1045']) || 
                    str_contains($errorMessage, 'SQLSTATE[HY000]') || 
                    str_contains($errorMessage, 'Access denied for user')) {
                    return response()->json([
                        'message' => 'Akun Anda tidak dapat diakses saat ini. Silakan hubungi administrator.'
                    ], 403);
                }
                
                // Generic database error
                return response()->json([
                    'message' => 'Terjadi masalah pada sistem. Silakan coba beberapa saat lagi.'
                ], 500);
                
            } catch (PDOException $e) {
                // Log the PDO error
                Log::error('PDO error during login: ' . $e->getMessage(), [
                    'email' => $request->email,
                    'error_code' => $e->getCode()
                ]);
                
                // PDOException error codes for access issues
                if (str_contains($e->getMessage(), 'Access denied for user') || 
                    str_contains($e->getMessage(), 'SQLSTATE[HY000]')) {
                    return response()->json([
                        'message' => 'Akun Anda tidak dapat diakses saat ini. Silakan hubungi administrator.'
                    ], 403);
                }
                
                return response()->json([
                    'message' => 'Terjadi masalah pada sistem. Silakan coba beberapa saat lagi.'
                ], 500);
            }
            
        } catch (\Exception $e) {
            Log::error('Unexpected error during login: ' . $e->getMessage(), [
                'email' => $request->email ?? 'not provided',
                'exception_class' => get_class($e)
            ]);
            
            return response()->json([
                'message' => 'Terjadi kesalahan yang tidak diharapkan. Silakan coba lagi nanti.'
            ], 500);
        }
    }

    /**
     * Handle user logout.
     */
    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out successfully']);
    }
}
