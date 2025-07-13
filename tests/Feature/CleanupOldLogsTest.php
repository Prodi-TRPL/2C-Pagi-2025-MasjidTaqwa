<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\LogAktivitas;
use Carbon\Carbon;

class CleanupOldLogsTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that logs older than 6 months are deleted.
     */
    public function test_old_logs_are_deleted(): void
    {
        // Create a log entry older than 6 months
        LogAktivitas::create([
            'aktivitas' => 'test_old',
            'detail' => 'This is an old log entry',
            'created_at' => Carbon::now()->subMonths(7)
        ]);

        // Create a log entry less than 6 months old
        LogAktivitas::create([
            'aktivitas' => 'test_recent',
            'detail' => 'This is a recent log entry',
            'created_at' => Carbon::now()->subMonths(5)
        ]);

        // Run the command
        $this->artisan('logs:cleanup')
             ->expectsOutput('Successfully deleted 1 log entries older than 6 months.')
             ->assertExitCode(0);

        // Verify that only the recent log remains
        $this->assertEquals(1, LogAktivitas::count());
        $this->assertEquals('test_recent', LogAktivitas::first()->aktivitas);
    }

    /**
     * Test that the command works correctly when there are no logs to delete.
     */
    public function test_no_old_logs_to_delete(): void
    {
        // Create only recent logs
        LogAktivitas::create([
            'aktivitas' => 'test_recent',
            'detail' => 'This is a recent log entry',
            'created_at' => Carbon::now()->subMonths(5)
        ]);

        // Run the command
        $this->artisan('logs:cleanup')
             ->expectsOutput('No log entries older than 6 months found.')
             ->assertExitCode(0);

        // Verify that the recent log remains
        $this->assertEquals(1, LogAktivitas::count());
    }
} 