<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Donation;
use Illuminate\Support\Facades\Log;

class CheckPendingDonations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'donations:check-pending {--mark-as-received : Mark all pending donations as received}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check pending donations and optionally mark them as received';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $pendingDonations = Donation::where('status', 'Menunggu')->orderBy('tanggal_donasi', 'desc')->get();
        
        $this->info("Found {$pendingDonations->count()} pending donations.");
        
        if ($pendingDonations->count() > 0) {
            $this->table(
                ['ID', 'Order ID', 'Amount', 'Date', 'Payment Type', 'User'],
                $pendingDonations->map(function($donation) {
                    return [
                        'id' => $donation->donasi_id,
                        'order_id' => $donation->order_id ?? 'N/A',
                        'amount' => number_format($donation->jumlah, 0, ',', '.'),
                        'date' => $donation->tanggal_donasi,
                        'payment' => $donation->payment_type ?? 'N/A',
                        'user' => $donation->pengguna_id ? 'Yes' : 'No',
                    ];
                })
            );
            
            if ($this->option('mark-as-received')) {
                if ($this->confirm('Are you sure you want to mark all pending donations as received?')) {
                    $count = 0;
                    foreach ($pendingDonations as $donation) {
                        $donation->status = 'Diterima';
                        $donation->save();
                        $count++;
                        $this->info("Marked donation {$donation->donasi_id} as received.");
                    }
                    $this->info("Successfully marked {$count} donations as received.");
                    Log::info("Manual update: {$count} pending donations marked as received.");
                }
            }
        }
        
        return Command::SUCCESS;
    }
} 
 