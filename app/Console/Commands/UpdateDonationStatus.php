<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Donation;
use Illuminate\Support\Facades\Log;

class UpdateDonationStatus extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'donations:update-status {--status=Diterima : Status to set for donations}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update all donations to a specified status';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $status = $this->option('status');
        $this->info("Updating all donations to status: {$status}");
        
        try {
            $count = Donation::count();
            $this->info("Found {$count} donations to update");
            
            // Update all donations to the specified status
            Donation::query()->update(['status' => $status]);
            
            $this->info("Successfully updated {$count} donations to status: {$status}");
            Log::info("Updated all donations to status: {$status}", [
                'count' => $count
            ]);
            
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error("Error updating donations: {$e->getMessage()}");
            Log::error("Error updating donations", [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return Command::FAILURE;
        }
    }
} 
 