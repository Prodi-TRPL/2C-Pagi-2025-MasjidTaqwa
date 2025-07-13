<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        Commands\CheckPendingDonations::class,
        Commands\FixDonationStatuses::class,
        Commands\SetupPaymentMethods::class,
        Commands\UpdateDonationStatus::class,
        Commands\ProcessNotificationQueue::class,
        Commands\CleanupOldLogs::class,
    ];

    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // $schedule->command('inspire')->hourly();
        
        // Process notification queue every 5 minutes
        $schedule->command('notifications:process')->everyFiveMinutes();
        
        // Run log cleanup at midnight every day
        // It will check for and remove logs older than 6 months
        $schedule->command('logs:cleanup')->daily();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
