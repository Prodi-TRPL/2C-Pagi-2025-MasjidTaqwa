<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\File;
use App\Http\Controllers\PengeluaranController;
use App\Models\LogAktivitas;

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

// Public route for Pengeluaran stats - no authentication required
Route::get('/public-api/pengeluaran-stats', [PengeluaranController::class, 'getStats']);

// Named login route to fix "Route [login] not defined" error
Route::get('/login', function () {
    return view('react-main');
})->name('login');

// Specific route for DetailProyek to ensure React Router works
Route::get('/dashboard/proyek-pembangunan/detail/{id}', function () {
    return view('react-main');
});

// Route untuk menangani semua URL lainnya
Route::get('/{any}', function () {
    return view('react-main');
})->where('any', '.*');

// Add logout route with web middleware
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// Admin routes
Route::middleware(['auth', 'admin'])->prefix('admin')->group(function () {
    // Add route to check pending donations (for testing)
    Route::get('/check-pending-donations', function () {
        Artisan::call('donations:check-pending');
        return redirect()->back()->with('status', 'Pending donations checked.');
    });
    
    // Add route to mark all pending donations as received (for testing)
    Route::get('/mark-pending-donations', function () {
        Artisan::call('donations:check-pending', ['--mark-as-received' => true]);
        return redirect()->back()->with('status', 'All pending donations marked as received.');
    });
    
    // Add route to update all donations to 'Diterima' status
    Route::get('/update-all-donations', function () {
        Artisan::call('donations:update-status', ['--status' => 'Diterima']);
        return redirect()->back()->with('status', 'All donations updated to Diterima status.');
    });
    
    // Add route to set up payment methods
    Route::get('/setup-payment-methods', function () {
        Artisan::call('setup:payment-methods');
        return redirect()->back()->with('status', 'Payment methods have been set up.');
    });
    
    // Add route to directly fix donations (without command)
    Route::get('/fix-donations-directly', function () {
        // Find a Transfer payment method or create one
        $transferMethod = DB::table('metode_pembayaran')
            ->where('nama_metode', 'Transfer')
            ->first();

        if (!$transferMethod) {
            $transferId = Str::uuid();
            DB::table('metode_pembayaran')->insert([
                'metode_pembayaran_id' => $transferId,
                'nama_metode' => 'Transfer',
                'deskripsi' => 'Pembayaran via transfer'
            ]);
        } else {
            $transferId = $transferMethod->metode_pembayaran_id;
        }

        // Fix null payment types
        DB::table('donasi')
            ->whereNull('payment_type')
            ->update(['payment_type' => 'transfer']);

        // Fix null metode_pembayaran_id
        DB::table('donasi')
            ->whereNull('metode_pembayaran_id')
            ->update(['metode_pembayaran_id' => $transferId]);

        // Fix non-Diterima statuses
        DB::table('donasi')
            ->where('status', '!=', 'Diterima')
            ->update(['status' => 'Diterima']);
            
        return redirect()->back()->with('status', 'All donations have been fixed.');
    });
});

// Route to provide CSRF token for testing
Route::get('/csrf-token', function () {
    return response()->json(['csrf_token' => csrf_token()]);
});

// Test routes
Route::get('/donation-test', function() {
    return view('welcome', ['title' => 'Donation Test']);
});

Route::get('/simple-donation', function() {
    return File::get(public_path('simple-donation.html'));
});

// Utility routes
Route::get('/fix-donations', function() {
    try {
        // Update all donations to have status "Diterima"
        DB::table('donasi')->update(['status' => 'Diterima']);
        
        // Get default payment method ID
        $paymentMethod = DB::table('metode_pembayaran')
            ->where('nama_metode', 'Direct Payment')
            ->first();
            
        if (!$paymentMethod) {
            // Create a new payment method
            $paymentMethodId = \Illuminate\Support\Str::uuid();
            DB::table('metode_pembayaran')->insert([
                'metode_pembayaran_id' => $paymentMethodId,
                'nama_metode' => 'Direct Payment'
            ]);
        } else {
            $paymentMethodId = $paymentMethod->metode_pembayaran_id;
        }
        
        // Update donations with NULL payment type
        DB::table('donasi')
            ->whereNull('payment_type')
            ->update([
                'payment_type' => 'direct',
                'metode_pembayaran_id' => $paymentMethodId
            ]);
            
        return "All donations have been fixed. <a href='/api/donations'>View donations</a>";
    } catch (\Exception $e) {
        return "Error fixing donations: " . $e->getMessage();
    }
});

// Quick donation test without CSRF
Route::get('/quick-donation', function() {
    return File::get(public_path('quick-donation.html'));
});

// Direct test donation page
Route::get('/test-donation', function() {
    return File::get(public_path('test-donation.php'));
});

// Midtrans test page
Route::get('/midtrans-test', function() {
    return File::get(public_path('midtrans-test.html'));
});

// Check Midtrans configuration
Route::get('/check-midtrans', function () {
    $output = [
        'server_key_set' => !empty(config('midtrans.server_key')),
        'client_key_set' => !empty(config('midtrans.client_key')),
        'environment' => config('midtrans.is_production') ? 'Production' : 'Sandbox',
        'server_key_masked' => !empty(config('midtrans.server_key')) 
            ? substr(config('midtrans.server_key'), 0, 4) . '...' . substr(config('midtrans.server_key'), -4) 
            : 'Not set',
        'client_key_masked' => !empty(config('midtrans.client_key')) 
            ? substr(config('midtrans.client_key'), 0, 4) . '...' . substr(config('midtrans.client_key'), -4)
            : 'Not set',
    ];
    
    return response()->json($output);
});

// Midtrans setup guide
Route::get('/midtrans-setup', function() {
    return File::get(public_path('midtrans-setup.html'));
});

// Test route for log aktivitas
Route::get('/test-log-aktivitas', function () {
    $log = LogAktivitas::log(
        'test_aktivitas', 
        'Ini adalah test untuk mencatat aktivitas di tabel log_aktivitas'
    );
    
    return [
        'success' => true,
        'message' => 'Log aktivitas berhasil dibuat',
        'data' => $log
    ];
});
