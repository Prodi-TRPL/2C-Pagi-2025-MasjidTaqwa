<?php
/**
 * Fix Donations Script
 * 
 * This script:
 * 1. Runs the migrations to add payment types and fix statuses
 * 2. Sets up payment methods
 * 3. Directly updates any remaining problem records
 */

// Make sure this script is executed only from the command line
if (php_sapi_name() !== 'cli') {
    exit("This script can only be run from the command line.");
}

echo "=== DONATION FIX SCRIPT ===\n\n";

echo "1. Running migrations...\n";
passthru('php artisan migrate');
echo "\n";

echo "2. Setting up payment methods...\n";
passthru('php artisan setup:payment-methods');
echo "\n";

echo "3. Directly updating any problem donations...\n";

// Establish database connection
require_once 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Get a database connection
$db = $app->make('db');

// Find a Midtrans payment method or create one
$midtransMethod = $db->table('metode_pembayaran')
    ->where('nama_metode', 'Midtrans')
    ->first();

if (!$midtransMethod) {
    $midtransId = \Illuminate\Support\Str::uuid();
    $db->table('metode_pembayaran')->insert([
        'metode_pembayaran_id' => $midtransId,
        'nama_metode' => 'Midtrans',
        'deskripsi' => 'Pembayaran via Midtrans (online)'
    ]);
    echo "Created Midtrans payment method.\n";
} else {
    $midtransId = $midtransMethod->metode_pembayaran_id;
    echo "Found existing Midtrans payment method.\n";
}

// Fix null payment types
$nullPaymentTypes = $db->table('donasi')
    ->whereNull('payment_type')
    ->update(['payment_type' => 'midtrans']);
echo "Fixed {$nullPaymentTypes} donations with null payment_type.\n";

// Fix null metode_pembayaran_id
$nullPaymentMethods = $db->table('donasi')
    ->whereNull('metode_pembayaran_id')
    ->update(['metode_pembayaran_id' => $midtransId]);
echo "Fixed {$nullPaymentMethods} donations with null metode_pembayaran_id.\n";

// Fix non-Diterima statuses
$wrongStatuses = $db->table('donasi')
    ->where('status', '!=', 'Diterima')
    ->update(['status' => 'Diterima']);
echo "Fixed {$wrongStatuses} donations with incorrect status.\n";

// Show donation summary
$total = $db->table('donasi')->count();
$fixed = $db->table('donasi')
    ->whereNotNull('payment_type')
    ->whereNotNull('metode_pembayaran_id')
    ->where('status', 'Diterima')
    ->count();

echo "\nSummary: {$fixed} of {$total} donations are now properly configured.\n";

echo "\n=== FIX COMPLETE ===\n";
echo "Now refresh your browser to see updated donations.\n"; 
 