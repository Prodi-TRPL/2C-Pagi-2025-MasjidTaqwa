<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Donation;
use Illuminate\Support\Facades\Log;

class FixDonationStatuses extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'donations:fix-statuses';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fix incorrect donation statuses';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Fixing donation statuses...');
        
        // Check for donations with payment info but incorrect status
        $donations = Donation::whereNotNull('payment_type')
                            ->whereNotNull('order_id')
                            ->whereNotNull('snap_token')
                            ->where('status', 'Kadaluarsa')
                            ->where('created_at', '>', now()->subDays(7))  // Only recent donations
                            ->get();
        
        $updatedCount = 0;
        foreach($donations as $donation) {
            $donation->status = 'Diterima';
            $donation->save();
            $updatedCount++;
            
            Log::info('Fixed donation status', [
                'donation_id' => $donation->donasi_id,
                'order_id' => $donation->order_id,
                'new_status' => 'Diterima'
            ]);
        }
        
        $this->info("Fixed $updatedCount donation(s)");
        
        return 0;
    }
} 