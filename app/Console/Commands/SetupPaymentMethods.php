<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class SetupPaymentMethods extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'setup:payment-methods';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Set up default payment methods in the database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Setting up default payment methods...');
        
        $paymentMethods = [
            ['name' => 'Transfer', 'description' => 'Pembayaran via transfer'],
            ['name' => 'Transfer Bank', 'description' => 'Pembayaran via transfer bank'],
            ['name' => 'QRIS', 'description' => 'Pembayaran via QRIS'],
            ['name' => 'GoPay', 'description' => 'Pembayaran via GoPay'],
            ['name' => 'ShopeePay', 'description' => 'Pembayaran via ShopeePay'],
            ['name' => 'Kartu Kredit', 'description' => 'Pembayaran via kartu kredit'],
            ['name' => 'Tunai', 'description' => 'Pembayaran tunai langsung']
        ];
        
        $count = 0;
        
        foreach ($paymentMethods as $method) {
            // Check if payment method already exists
            $exists = DB::table('metode_pembayaran')
                ->where('nama_metode', $method['name'])
                ->exists();
                
            if (!$exists) {
                // Create new payment method
                DB::table('metode_pembayaran')->insert([
                    'metode_pembayaran_id' => Str::uuid(),
                    'nama_metode' => $method['name'],
                    'deskripsi' => $method['description']
                ]);
                
                $this->info("Created payment method: {$method['name']}");
                $count++;
            } else {
                $this->line("Payment method already exists: {$method['name']}");
            }
        }
        
        $this->info("Setup complete! Created {$count} new payment methods.");
        Log::info("Payment methods setup complete", ['created' => $count]);
        
        return Command::SUCCESS;
    }
} 
 