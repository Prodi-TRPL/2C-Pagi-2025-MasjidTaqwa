<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DonationController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DonasiController;
use App\Http\Controllers\NotifikasiController;

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


Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout']);

Route::middleware('auth:sanctum')->get('/donasi/user', [DonasiController::class, 'userDonations']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/notifikasi', [NotifikasiController::class, 'index']);
    Route::post('/notifikasi/mark-as-read/{id}', [NotifikasiController::class, 'markAsRead']);
    Route::post('/notifikasi/mark-all-as-read', [NotifikasiController::class, 'markAllAsRead']);
    Route::delete('/notifikasi/{id}', [NotifikasiController::class, 'destroy']);
});
