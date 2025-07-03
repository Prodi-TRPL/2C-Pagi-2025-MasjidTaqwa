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
use Illuminate\Support\Facades\Artisan;

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

Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    Route::get('/notifikasi', [AdminNotifikasiController::class, 'index']);
    Route::post('/notifikasi', [AdminNotifikasiController::class, 'store']);
    Route::delete('/notifikasi/{id}', [AdminNotifikasiController::class, 'destroy']);
    Route::get('/notifikasi/stats', [AdminNotifikasiController::class, 'getStats']);
    
    // Donor permissions management routes (kept for backward compatibility)
    Route::get('/donors', [DonorPermissionsController::class, 'index']);
    Route::put('/donors/{id}/permissions', [DonorPermissionsController::class, 'updatePermissions']);       
    Route::get('/donors/stats', [DonorPermissionsController::class, 'getStats']);
    
    // Validate donation using stored procedure
    Route::post('/donations/{id}/validate-procedure', [DonasiController::class, 'validateDonationUsingProcedure']);
});


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

// Admin routes - requires auth and admin role
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    // Donation validation route
    Route::post('/donations/{id}/validate', [DonasiController::class, 'validateDonation']);
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



