<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Pengguna;
use App\Models\LogAktivitas;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\QueryException;
use PDOException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use App\Notifications\EmailVerificationNotification;
use App\Notifications\ResetPasswordNotification;
use Carbon\Carbon;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Models\AnonymousDonor;
use App\Models\Donasi;
use App\Models\Notifikasi;

class AuthController extends Controller
{
    /**
     * Handle user registration with email verification
     */
public function register(Request $request)
{
    try {
        // Log incoming request data
        Log::info('Registration request data:', $request->all());
        
        $validator = Validator::make($request->all(), [
            'nama' => 'required|string|max:100',
            'email' => 'required|email|unique:pengguna,email',
            'password' => 'required|string|min:8|confirmed',
            'nomor_hp' => 'nullable|string|max:15',
        ]);

        if ($validator->fails()) {
            Log::warning('Registration validation failed:', [
                'errors' => $validator->errors()->toArray(),
                'data' => $request->except(['password', 'password_confirmation'])
            ]);
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Create new user
        $pengguna = new Pengguna();
        $pengguna->nama = $request->nama;
        $pengguna->email = $request->email;
        $pengguna->password = Hash::make($request->password);
        $pengguna->nomor_hp = $request->nomor_hp;
        $pengguna->role = 'donatur'; // Hanya donatur yang boleh registrasi
        $pengguna->can_donate = true;
        $pengguna->can_view_history = true;
        $pengguna->can_view_notification = true;
        $pengguna->created_at = now();

        try {
            $pengguna->save();
            
            // Link any anonymous donations made with this email address
            $this->linkAnonymousDonationsToUser($pengguna);
            
        } catch (\Exception $e) {
            Log::error('Database error during registration: ' . $e->getMessage());
            return response()->json(['message' => 'Terjadi kesalahan saat menyimpan data. Silakan coba lagi.'], 500);
        }

        // Generate verification code
        $verificationCode = $pengguna->generateVerificationCode();

        try {
            // Kirim email verifikasi
            $pengguna->notify(new EmailVerificationNotification($verificationCode, $pengguna->nama));
            $emailSent = true;
        } catch (\Exception $e) {
            Log::error('Email sending error during registration: ' . $e->getMessage());
            $emailSent = false;
        }

        Log::info('User registered successfully', [
            'user_id' => $pengguna->pengguna_id,
            'email' => $pengguna->email,
            'email_sent' => $emailSent
        ]);

        // Response ke frontend
        return response()->json([
            'message' => 'Pendaftaran berhasil! Silakan periksa email Anda untuk kode verifikasi.',
            'email_sent' => $emailSent,
            'verification_required' => true,
            'user_id' => $pengguna->pengguna_id,
            'email' => $pengguna->email
        ], 201);
    } catch (\Exception $e) {
        Log::error('Registration error: ' . $e->getMessage(), [
            'trace' => $e->getTraceAsString(),
            'request_data' => $request->except(['password', 'password_confirmation'])
        ]);
        return response()->json(['message' => 'Terjadi kesalahan saat registrasi. Silakan coba lagi.'], 500);
    }
}


    /**
     * Verify user email with verification code
     */
    public function verifyEmail(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
                'code' => 'required|string|size:6',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $pengguna = Pengguna::where('email', $request->email)->first();

            if (!$pengguna) {
                return response()->json(['message' => 'Email tidak ditemukan.'], 404);
            }

            if ($pengguna->hasVerifiedEmail()) {
                return response()->json(['message' => 'Email sudah diverifikasi sebelumnya.'], 200);
            }

            if (!$pengguna->isVerificationCodeValid($request->code)) {
                return response()->json(['message' => 'Kode verifikasi tidak valid atau sudah kadaluarsa.'], 400);
            }

            // Mark email as verified
            $pengguna->markEmailAsVerified();

            return response()->json(['message' => 'Email berhasil diverifikasi.']);
        } catch (\Exception $e) {
            Log::error('Email verification error: ' . $e->getMessage());
            return response()->json(['message' => 'Terjadi kesalahan saat verifikasi email.'], 500);
        }
    }

    /**
     * Resend verification code
     */
    public function resendVerificationCode(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $pengguna = Pengguna::where('email', $request->email)->first();

            if (!$pengguna) {
                return response()->json(['message' => 'Email tidak ditemukan.'], 404);
            }

            if ($pengguna->hasVerifiedEmail()) {
                return response()->json(['message' => 'Email sudah diverifikasi.'], 400);
            }

            // Generate new verification code
            $verificationCode = $pengguna->generateVerificationCode();

            try {
                // Send verification email with code
                $pengguna->notify(new EmailVerificationNotification($verificationCode, $pengguna->nama));
                $emailSent = true;
            } catch (\Exception $e) {
                Log::error('Email sending error: ' . $e->getMessage());
                $emailSent = false;
            }

            // Even if email sending fails, don't return 500 error
            // Instead, inform the client that we generated the code but couldn't send the email
            return response()->json([
                'message' => $emailSent 
                    ? 'Kode verifikasi baru telah dikirim ke email Anda.' 
                    : 'Kode verifikasi dibuat, tapi gagal dikirim via email. Silakan coba lagi nanti.',
                'email_sent' => $emailSent,
                'verification_required' => true
            ]);
        } catch (\Exception $e) {
            Log::error('Resend verification error: ' . $e->getMessage());
            return response()->json(['message' => 'Terjadi kesalahan saat mengirim ulang kode verifikasi.'], 500);
        }
    }

    /**
     * Send password reset code
     */
    public function forgotPassword(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $pengguna = Pengguna::where('email', $request->email)->first();

            if (!$pengguna) {
                return response()->json(['message' => 'Email tidak ditemukan.'], 404);
            }

            // Generate reset code
            $resetCode = $pengguna->generateResetCode();

            try {
                // Send reset password email with code
                $pengguna->notify(new ResetPasswordNotification($resetCode, $pengguna->nama));
                $emailSent = true;
            } catch (\Exception $e) {
                Log::error('Email sending error: ' . $e->getMessage());
                $emailSent = false;
            }

            // Even if email sending fails, don't return 500 error
            return response()->json([
                'message' => $emailSent 
                    ? 'Kode reset password telah dikirim ke email Anda.' 
                    : 'Kode reset password dibuat, tapi gagal dikirim via email. Silakan coba lagi nanti.',
                'email_sent' => $emailSent,
                'user_id' => $pengguna->pengguna_id,
                'email' => $pengguna->email
            ]);
        } catch (\Exception $e) {
            Log::error('Forgot password error: ' . $e->getMessage());
            return response()->json(['message' => 'Terjadi kesalahan saat mengirim kode reset password.'], 500);
        }
    }

    /**
     * Verify reset code
     */
    public function verifyResetCode(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|email',
                'code' => 'required|string|size:6',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $pengguna = Pengguna::where('email', $request->email)->first();

            if (!$pengguna) {
                return response()->json(['message' => 'Email tidak ditemukan.'], 404);
            }

            if (!$pengguna->isResetCodeValid($request->code)) {
                return response()->json(['message' => 'Kode reset tidak valid atau sudah kadaluarsa.'], 400);
            }

            // Return success for frontend to show password reset form
            return response()->json([
                'message' => 'Kode reset valid.',
                'valid' => true,
                'user_id' => $pengguna->pengguna_id
            ]);
        } catch (\Exception $e) {
            Log::error('Verify reset code error: ' . $e->getMessage());
            return response()->json(['message' => 'Terjadi kesalahan saat verifikasi kode reset.'], 500);
        }
    }

    /**
     * Reset password with verified code
     */
    public function resetPassword(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'user_id' => 'required|string',
                'code' => 'required|string|size:6',
                'password' => 'required|string|min:8|confirmed',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $pengguna = Pengguna::where('pengguna_id', $request->user_id)->first();

            if (!$pengguna) {
                return response()->json(['message' => 'Pengguna tidak ditemukan.'], 404);
            }

            if (!$pengguna->isResetCodeValid($request->code)) {
                return response()->json(['message' => 'Kode reset tidak valid atau sudah kadaluarsa.'], 400);
            }

            // Update password
            $pengguna->password = Hash::make($request->password);
            $pengguna->reset_code = null;
            $pengguna->reset_code_expires_at = null;
            $pengguna->save();

            return response()->json(['message' => 'Password berhasil diubah.']);
        } catch (\Exception $e) {
            Log::error('Reset password error: ' . $e->getMessage());
            return response()->json(['message' => 'Terjadi kesalahan saat reset password.'], 500);
        }
    }

    /**
     * Handle user login.
     */
    public function login(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'email' => 'required|string|email',
                'password' => 'required|string',
                'remember' => 'boolean'
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $credentials = $request->only('email', 'password');
            $remember = $request->remember ?? false;

            // Check if the user exists
            $user = Pengguna::where('email', $request->email)->first();
            
            if (!$user) {
                return response()->json(['message' => 'Email atau password salah.'], 401);
            }
            
            // Check if email is verified
            if ($user && !$user->email_verified_at) {
                return response()->json([
                    'message' => 'Email belum diverifikasi.',
                    'status' => 'unverified',
                    'email' => $user->email
                ], 403);
            }

            // Attempt to authenticate using web guard explicitly
            if (!Auth::guard('web')->attempt($credentials, $remember)) {
                return response()->json(['message' => 'Email atau password salah.'], 401);
            }

            $user = Auth::guard('web')->user();
            
            // Link any anonymous donations made with this email address
            $this->linkAnonymousDonationsToUser($user);
            
            // Use the createToken method from HasApiTokens trait which is properly used in the Pengguna model
            $token = $user->createToken('authToken')->plainTextToken;

            // Log successful login activity only for admin users
            if ($user->role === 'admin') {
                try {
                    LogAktivitas::log(
                        'login',
                        "Admin {$user->nama} ({$user->email}) berhasil login"
                    );
                } catch (\Exception $e) {
                    // Just log the error but don't interrupt the login process
                    Log::error('Error logging login activity: ' . $e->getMessage());
                }
            }

            return response()->json([
                'message' => 'Login berhasil',
                'user' => $user,
                'token' => $token
            ]);
        } catch (\Exception $e) {
            Log::error('Login error: ' . $e->getMessage());
            return response()->json(['message' => 'Terjadi kesalahan saat login. Silakan coba lagi.'], 500);
        }
    }

    /**
     * Handle user logout.
     */
    public function logout(Request $request)
    {
        // Get the user before logging them out
        $user = Auth::guard('web')->user();
        
        // Log logout activity only if user is an admin
        if ($user && $user->role === 'admin') {
            try {
                LogAktivitas::log(
                    'logout',
                    "Admin {$user->nama} ({$user->email}) logout dari sistem"
                );
            } catch (\Exception $e) {
                // Just log the error but don't interrupt the logout process
                Log::error('Error logging logout activity: ' . $e->getMessage());
            }
        }
        
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out successfully']);
    }

    /**
     * Helper method to link anonymous donations to a registered user.
     */
    protected function linkAnonymousDonationsToUser($user)
    {
        try {
            // First check if the anonymous_donors table exists
            $anonymousDonorsTableExists = false;
            
            try {
                $anonymousDonorsTableExists = DB::getSchemaBuilder()->hasTable('anonymous_donors');
                if (!$anonymousDonorsTableExists) {
                    // Table doesn't exist yet, nothing to link
                    return;
                }
            } catch (\Exception $e) {
                Log::warning('Error checking anonymous_donors table existence: ' . $e->getMessage());
                return;
            }
            
            // Find all anonymous donors with the same email
            $anonymousDonors = AnonymousDonor::where('email', $user->email)
                ->where(function($query) use ($user) {
                    $query->where('is_linked_to_account', false)
                        ->orWhereNull('pengguna_id');
                })
                ->get();
            
            if ($anonymousDonors->isEmpty()) {
                // No anonymous donations to link
                return;
            }
            
            Log::info('Found ' . $anonymousDonors->count() . ' anonymous donors to link to user ' . $user->email);
            
            foreach ($anonymousDonors as $anonymousDonor) {
                // Update the anonymous donor record to mark it as linked
                $anonymousDonor->pengguna_id = $user->pengguna_id;
                $anonymousDonor->is_linked_to_account = true;
                $anonymousDonor->save();
                
                // Find all donations by this anonymous donor
                $donations = \App\Models\Donasi::where('anonymous_donor_id', $anonymousDonor->anonymous_donor_id)
                                ->where('status', 'Diterima')  // Only link successful donations
                                ->get();
                
                foreach ($donations as $donation) {
                    // Update the donation to link it to the user
                    $donation->pengguna_id = $user->pengguna_id;
                    $donation->save();
                    
                    // Create notification for each linked donation
                    $this->createDonationNotification($donation, $user->pengguna_id);
                    
                    Log::info('Linked donation ID ' . $donation->donasi_id . ' to user ' . $user->email);
                }
            }
        } catch (\Exception $e) {
            Log::error('Error linking anonymous donations: ' . $e->getMessage());
        }
    }

    /**
     * Helper method to create notification for linked donations.
     */
    protected function createDonationNotification($donation, $userId)
    {
        try {
            // Format the donation amount
            $formattedAmount = number_format($donation->jumlah, 0, ',', '.');
            
            // Create a unique notification ID
            $notificationId = Str::uuid();
            
            // Check if a notification already exists for this donation and user
            $existingNotification = \App\Models\Notifikasi::where('pengguna_id', $userId)
                ->where('donasi_id', $donation->donasi_id)
                ->first();
                
            if ($existingNotification) {
                Log::info('Notification already exists for donation', [
                    'donation_id' => $donation->donasi_id,
                    'user_id' => $userId
                ]);
                return;
            }
            
            // Create donation notification
            $notifikasi = new \App\Models\Notifikasi();
            $notifikasi->notifikasi_id = $notificationId;
            $notifikasi->pengguna_id = $userId;
            $notifikasi->donasi_id = $donation->donasi_id;
            $notifikasi->tipe = 'donasi_diterima';
            $notifikasi->judul = 'Donasi Anda Berhasil';
            $notifikasi->pesan = "Terima kasih! Donasi Anda sebesar Rp {$formattedAmount} telah berhasil diterima. Semoga kebaikan Anda dibalas berlipat ganda.";
            $notifikasi->is_read = false;
            $notifikasi->created_at = now();
            $notifikasi->updated_at = now();
            $notifikasi->processed = true;
            $notifikasi->priority = 'normal';
            $notifikasi->save();
            
            Log::info('Created notification for linked donation', [
                'donation_id' => $donation->donasi_id,
                'user_id' => $userId,
                'notification_id' => $notifikasi->notifikasi_id
            ]);
        } catch (\Exception $e) {
            Log::error('Error creating notification for linked donation: ' . $e->getMessage(), [
                'donation_id' => $donation->donasi_id,
                'user_id' => $userId
            ]);
        }
    }
}
