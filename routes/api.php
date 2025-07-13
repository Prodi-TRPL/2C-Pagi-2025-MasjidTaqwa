<?php

use App\Http\Controllers\AdminGraphAmountController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DonationController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DonasiController;
use App\Http\Controllers\NotifikasiController;
use App\Http\Controllers\AdminNotifikasiController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PengeluaranController;
use App\Http\Controllers\KategoriPengeluaranController;
use App\Http\Controllers\DonationHistoryController;
use App\Http\Controllers\DonasiSimpleController;
use App\Http\Controllers\LaporanKeuanganController;
use App\Http\Controllers\ProyekPembangunanController;
use App\Http\Controllers\DonorPermissionsController;
use App\Http\Controllers\DonationSettingsController;
use App\Http\Controllers\DonationSummaryController;
use App\Http\Controllers\LogAktivitasController;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Validator;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Email validation route
Route::post('/validate-email-domain', function (Request $request) {
    $domain = $request->input('domain');
    
    if (empty($domain)) {
        return response()->json(['valid' => false, 'message' => 'Domain is required']);
    }
    
    try {
        // Check if domain has MX records
        $hasMx = checkdnsrr($domain, 'MX');
        
        // If no MX records found, check for A records as fallback
        if (!$hasMx) {
            $hasA = checkdnsrr($domain, 'A');
            return response()->json(['valid' => $hasA, 'message' => $hasA ? 'Domain has A records' : 'Domain has no valid records']);
        }
        
        return response()->json(['valid' => true, 'message' => 'Domain has MX records']);
    } catch (\Exception $e) {
        return response()->json(['valid' => false, 'message' => 'Error validating domain: ' . $e->getMessage()]);
    }
});

// Donasi routes
Route::post('/donasi', [DonasiController::class, 'prosesDonasi']);
Route::post('/donasi/callback', [DonasiController::class, 'handleCallback']);
Route::post('/donasi/cancel', [DonasiController::class, 'cancelDonation']);
Route::get('/donasi/fix', [DonasiController::class, 'fixDonations']);
Route::get('/donasi/fix-statuses', function() {
    Artisan::call('donations:fix-statuses');
    return "Donation statuses fixed!";
});

// Testing route - bypasses Midtrans integration
Route::post('/donasi/simple', [DonasiSimpleController::class, 'processDonasi']);

// Auth routes
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/verify-email', [AuthController::class, 'verifyEmail']);
Route::post('/resend-verification', [AuthController::class, 'resendVerificationCode']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/verify-reset-code', [AuthController::class, 'verifyResetCode']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);
Route::post('/reset-password-langsung', [AuthController::class, 'resetPasswordLangsung']);

// Notifikasi routes
Route::middleware('auth:sanctum')->group(function () {
    // Donasi routes
    Route::get('/donasi/user', [DonasiController::class, 'userDonations']);
    Route::get('/donatur/donations/stats', [DonasiController::class, 'getDonationStats']);
    
    // Notifikasi routes
    Route::get('/notifikasi', [NotifikasiController::class, 'index']);
    Route::get('/notifikasi/check-new', [NotifikasiController::class, 'checkNewNotifications']);
    Route::post('/notifikasi/mark-as-read/{id}', [NotifikasiController::class, 'markAsRead']);
    Route::post('/notifikasi/mark-all-as-read', [NotifikasiController::class, 'markAllAsRead']);
    Route::delete('/notifikasi/{id}', [NotifikasiController::class, 'destroy']);
    
    // Profile routes
    Route::get('/donatur/profile', [ProfileController::class, 'getProfile']);
    Route::post('/donatur/change-password', [ProfileController::class, 'updatePassword']);
    Route::put('/donatur/profile', [ProfileController::class, 'update']);
    
    // Route CRUD ProyekPembangunan - Moved outside auth group
    // API CRUD Kategori Pengeluaran
    Route::apiResource('KategoriPengeluaran', KategoriPengeluaranController::class);
    
    // API CRUD Pengeluaran
    Route::apiResource('Pengeluaran', PengeluaranController::class);
    
    // New route for Pengeluaran statistics (inside auth middleware)
    Route::get('/Pengeluaran/stats', [PengeluaranController::class, 'getStats']);
    
    // Public donation history for dashboard display
    Route::get('/donations', [DonationHistoryController::class, 'index']);
});

// Donor permissions management routes - these match the frontend endpoints
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/donor-permissions', [DonorPermissionsController::class, 'index']);
    Route::put('/donor-permissions/{id}', [DonorPermissionsController::class, 'updatePermissions']);
    Route::get('/donor-permissions/stats', [DonorPermissionsController::class, 'getStats']);
});

// Donation settings management routes - moved outside auth for public access
Route::get('/donation-settings', [DonationSettingsController::class, 'getSettings']);
Route::put('/donation-settings', [DonationSettingsController::class, 'updateSettings']);

// Public route to check donation status
Route::get('/donation-status', [DonationSettingsController::class, 'checkDonationStatus']);

// Donation Summary routes using database view
Route::get('/donation-summary/monthly', [DonationSummaryController::class, 'getMonthlyDonationSummary']);
Route::get('/donation-summary/chart', [DonationSummaryController::class, 'getDonationChartData']);

// Admin routes - requires auth and admin role
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    // Donation validation route
    Route::post('/donations/{id}/validate', [DonasiController::class, 'validateDonation']);
});

// Admin routes - requires auth and admin role
Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
    Route::get('/notifikasi', [AdminNotifikasiController::class, 'index']);
    Route::post('/notifikasi', [AdminNotifikasiController::class, 'store']);
    Route::delete('/notifikasi/{id}', [AdminNotifikasiController::class, 'destroy']);
    Route::get('/notifikasi/stats', [AdminNotifikasiController::class, 'getStats']);
    
    // Admin profile routes
    Route::get('/profile', [ProfileController::class, 'getProfile']);
    Route::post('/change-password', [ProfileController::class, 'updatePassword']);
    Route::put('/profile', [ProfileController::class, 'update']);
    
    // Donor permissions management routes (kept for backward compatibility)
    Route::get('/donors', [DonorPermissionsController::class, 'index']);
    Route::put('/donors/{id}/permissions', [DonorPermissionsController::class, 'updatePermissions']);       
    Route::get('/donors/stats', [DonorPermissionsController::class, 'getStats']);
    
    // Validate donation using stored procedure
    Route::post('/donations/{id}/validate-procedure', [DonasiController::class, 'validateDonationUsingProcedure']);
    
    // Log Aktivitas routes
    Route::get('/log-aktivitas', [LogAktivitasController::class, 'index']);
    Route::post('/log-aktivitas', [LogAktivitasController::class, 'store']);
});

// TEMPORARY: Public log-aktivitas route for testing the component without authentication
// TODO: REMOVE THIS ROUTE AFTER FIXING AUTHENTICATION
Route::get('/public/log-aktivitas', [LogAktivitasController::class, 'index']);

// Add a dedicated endpoint for logging admin logout
Route::post('/log-admin-logout', [LogAktivitasController::class, 'logAdminLogout']);

// PENGELUARAN - SEMENTARA TANPA LOGIN AGAR BISA TESTING
Route::post('/pengeluaran', [PengeluaranController::class, 'store']); // Simpan pengeluaran
Route::get('/Pengeluaran', [PengeluaranController::class, 'index']); // Get pengeluaran list without auth
Route::get('/Pengeluaran/stats', [PengeluaranController::class, 'getStats']); // Get pengeluaran stats without auth
Route::get('/KategoriPengeluaran', [KategoriPengeluaranController::class, 'index']); // Get kategori pengeluaran without auth
Route::get('/ProyekPembangunan', [ProyekPembangunanController::class, 'index']); // Get proyek pembangunan without auth
Route::get('/ProyekPembangunan/{id}', [ProyekPembangunanController::class, 'show']); // Get specific proyek pembangunan without auth

// Protected ProyekPembangunan routes (create, update, delete)
Route::middleware('auth:sanctum')->group(function() {
    Route::post('/ProyekPembangunan', [ProyekPembangunanController::class, 'store']);
    Route::put('/ProyekPembangunan/{id}', [ProyekPembangunanController::class, 'update']);
    Route::delete('/ProyekPembangunan/{id}', [ProyekPembangunanController::class, 'destroy']);
});

// Public donation history for dashboard display
Route::get('/donations', [DonationHistoryController::class, 'index']);

// Monthly report data for graphs
Route::get('/monthly-amount', [AdminGraphAmountController::class, 'getMonthlyReport']);
Route::get('/dashboard-summary', [AdminGraphAmountController::class, 'getSummaryData']);

// Laporan Keuangan routes
Route::get('/laporan-keuangan', [LaporanKeuanganController::class, 'index']);
Route::post('/laporan-keuangan', [LaporanKeuanganController::class, 'store']);
Route::get('/donations-by-period/{period}', [LaporanKeuanganController::class, 'getDonationsByPeriod']);
Route::get('/expenses-by-period/{period}', [LaporanKeuanganController::class, 'getExpensesByPeriod']);

// Test route for simulating database access revocation
Route::get('/test-db-revocation', function() {
    // This will simulate a database error by throwing an exception
    throw new \PDOException('Access denied for user (simulated database access revocation)');
});

// Test route to simulate permission revocation
Route::get('/test/revoke-permission', function () {
    // Return permissions with some revoked
    return response()->json([
        'canDonate' => false,
        'canViewHistory' => false,
        'canViewNotification' => false,
        'message' => 'This route simulates permissions being revoked'
    ], 200);
});

// Add a public route for pengeluaran stats
Route::get('/public-api/pengeluaran-stats', [PengeluaranController::class, 'getStats']);

// Add a route to get user permissions
Route::middleware('auth:sanctum')->get('/user/permissions', function (Request $request) {
    $user = $request->user();
    
    return response()->json([
        'canDonate' => $user->can_donate === 1 || $user->can_donate === true,
        'canViewHistory' => $user->can_view_history === 1 || $user->can_view_history === true,
        'canViewNotification' => $user->can_view_notification === 1 || $user->can_view_notification === true
    ]);
});

// Add debugging route for registration
Route::post('/debug-register', function(Request $request) {
    return response()->json([
        'status' => 'received',
        'data' => $request->all(),
        'validation' => Validator::make($request->all(), [
            'nama' => 'required|string|max:100',
            'email' => 'required|email|unique:pengguna,email',
            'password' => 'required|string|min:8|confirmed',
            'nomor_hp' => 'nullable|string|max:15',
        ])->errors()
    ]);
});

// Add a simplified registration test route
Route::post('/simple-register', function(Request $request) {
    try {
        $validator = Validator::make($request->all(), [
            'nama' => 'required|string|max:100',
            'email' => 'required|email|unique:pengguna,email',
            'password' => 'required|string|min:8|confirmed',
            'nomor_hp' => 'nullable|string|max:15',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Validation passed',
            'data' => $request->except(['password', 'password_confirmation'])
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'An error occurred',
            'error' => $e->getMessage()
        ], 500);
    }
});


use App\Models\Pengguna;
use App\Notifications\EmailVerificationNotification;

Route::get('/test-mail', function () {
    $user = \App\Models\Pengguna::first();
    $kode = rand(100000, 999999);
    $user->notify(new EmailVerificationNotification($kode, $user->nama));
    return 'Email test terkirim';
});

// Test route for manually logging admin logout
Route::get('/test-log-admin-logout', function () {
    try {
        $logEntry = \App\Models\LogAktivitas::create([
            'aktivitas' => 'logout',
            'detail' => "Admin Test User (test@example.com) logout dari sistem",
            'created_at' => now(),
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'Admin logout logged successfully',
            'log_id' => $logEntry->id
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error logging admin logout: ' . $e->getMessage()
        ], 500);
    }
});

// Add a temporary debug route for admin authentication
Route::middleware(['auth:sanctum'])->get('/debug-auth', function (Request $request) {
    $user = $request->user();
    
    return response()->json([
        'authenticated' => true,
        'user_id' => $user->pengguna_id,
        'name' => $user->nama,
        'email' => $user->email,
        'role' => $user->role,
        'is_admin' => $user->role === 'admin'
    ]);
});

// Add a temporary public route to test the admin profile endpoint
Route::get('/public/admin-profile-test', function() {
    return response()->json([
        'message' => 'This route is working',
        'admin_profile_route' => '/api/admin/profile',
        'middleware' => ['auth:sanctum', 'admin']
    ]);
});

// Add a public endpoint to get admin contact information
Route::get('/public/admin-contact', function() {
    try {
        // Get the admin user (assuming there's only one or getting the first one)
        $admin = \App\Models\Pengguna::where('role', 'admin')->first();
        
        if (!$admin) {
            return response()->json([
                'message' => 'Admin not found',
                'phone' => '895-3712-88838' // Default fallback
            ]);
        }
        
        return response()->json([
            'phone' => $admin->nomor_hp ?? '895-3712-88838'
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'message' => 'Error fetching admin contact',
            'phone' => '895-3712-88838' // Default fallback
        ]);
    }
});

// Add a temporary route to test both admin middlewares
Route::middleware(['auth:sanctum', 'admin', \App\Http\Middleware\CheckAdmin::class])->get('/test-both-admin-middlewares', function() {
    return response()->json([
        'success' => true,
        'message' => 'Both admin middlewares are working correctly'
    ]);
});

// Add a temporary route to test the admin middleware directly
Route::middleware(['auth:sanctum', 'admin'])->get('/test-admin-middleware', function() {
    return response()->json([
        'success' => true,
        'message' => 'Admin middleware is working correctly'
    ]);
});

// Admin profile routes with explicit CheckAdmin middleware
Route::middleware(['auth:sanctum', \App\Http\Middleware\CheckAdmin::class])->prefix('admin-profile')->group(function () {
    Route::get('/', [ProfileController::class, 'getProfile']);
    Route::post('/change-password', [ProfileController::class, 'updatePassword']);
    Route::put('/update', [ProfileController::class, 'update']);
});



