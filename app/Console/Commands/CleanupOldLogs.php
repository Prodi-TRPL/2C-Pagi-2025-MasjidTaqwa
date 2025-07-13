<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\LogAktivitas;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class CleanupOldLogs extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'logs:cleanup';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Delete log activities older than 6 months';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        try {
            // Calculate the date 6 months ago
            $sixMonthsAgo = Carbon::now()->subMonths(6);
            
            // Get count of logs to be deleted for reporting
            $count = LogAktivitas::where('created_at', '<', $sixMonthsAgo)->count();
            
            if ($count > 0) {
                // Delete logs older than 6 months
                LogAktivitas::where('created_at', '<', $sixMonthsAgo)->delete();
                
                // Log the cleanup
                Log::info("Log aktivitas cleanup: {$count} log entries older than 6 months were deleted.");
                
                // Output to console
                $this->info("Successfully deleted {$count} log entries older than 6 months.");
            } else {
                // No logs to delete
                $this->info("No log entries older than 6 months found.");
            }
            
            return 0;
        } catch (\Exception $e) {
            // Log error
            Log::error("Error during log aktivitas cleanup: " . $e->getMessage(), [
                'trace' => $e->getTraceAsString()
            ]);
            
            // Output to console
            $this->error("Error during cleanup: " . $e->getMessage());
            
            return 1;
        }
    }
} 