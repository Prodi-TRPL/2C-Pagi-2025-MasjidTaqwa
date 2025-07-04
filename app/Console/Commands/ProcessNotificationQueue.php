<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Notifikasi;
use App\Http\Controllers\NotifikasiController;

/**
 * STRUKTUR DATA: QUEUE PROCESSING COMMAND
 * Command untuk memproses antrian notifikasi
 * Mengimplementasikan konsep Queue (FIFO) dengan prioritas
 */
class ProcessNotificationQueue extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notifications:process {--limit=50 : Maximum number of notifications to process}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process the notification queue based on priority';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $limit = $this->option('limit');
        $this->info("Processing notification queue (limit: $limit)...");
        
        $notificationController = new NotifikasiController();
        $count = $notificationController->processNotificationQueue($limit);
        
        $this->info("Processed $count notifications.");
        
        return Command::SUCCESS;
    }
} 