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
    
    // Route CRUD ProyekPembangunan
    Route::apiResource('ProyekPembangunan', ProyekPembangunanController::class);
});

Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    Route::get('/notifikasi', [AdminNotifikasiController::class, 'index']);
    Route::post('/notifikasi', [AdminNotifikasiController::class, 'store']);
    Route::delete('/notifikasi/{id}', [AdminNotifikasiController::class, 'destroy']);
    Route::get('/notifikasi/stats', [AdminNotifikasiController::class, 'getStats']);
});


// PENGELUARAN - SEMENTARA TANPA LOGIN AGAR BISA TESTING
Route::post('/pengeluaran', [PengeluaranController::class, 'store']); // Simpan pengeluaran

// Admin routes - requires auth and admin role
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::apiResource('Pengeluaran', PengeluaranController::class);
    
    // API CRUD Kategori Pengeluaran
    Route::apiResource('KategoriPengeluaran', KategoriPengeluaranController::class);
    
    // Donation validation route
    Route::post('/donations/{id}/validate', [DonasiController::class, 'validateDonation']);
});

// Public donation history for dashboard display
Route::get('/donations', [DonationHistoryController::class, 'index']);

// Monthly report data for graphs
Route::get('/monthly-amount', [AdminGraphAmountController::class, 'getMonthlyReport']);

// Laporan Keuangan routes
Route::get('/laporan-keuangan', [LaporanKeuanganController::class, 'index']);
Route::post('/laporan-keuangan', [LaporanKeuanganController::class, 'store']);



