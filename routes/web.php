<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

// Named login route to fix "Route [login] not defined" error
Route::get('/login', function () {
    return view('react-main');
})->name('login');

// Route untuk menangani semua URL lainnya
Route::get('/{any}', function () {
    return view('react-main');
})->where('any', '.*');

// Add logout route with web middleware
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
