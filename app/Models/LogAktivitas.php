<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LogAktivitas extends Model
{
    use HasFactory;
    
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'log_aktivitas';
    
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'aktivitas',
        'detail',
    ];
    
    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;
    
    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'created_at' => 'datetime',
    ];
    
    /**
     * Static method to log an activity
     *
     * @param string $aktivitas Type of activity
     * @param string $detail Detailed description
     * @return \App\Models\LogAktivitas
     */
    public static function log($aktivitas, $detail)
    {
        try {
            \Illuminate\Support\Facades\Log::info('LogAktivitas::log called', [
                'aktivitas' => $aktivitas,
                'detail' => $detail
            ]);
            
            $logEntry = self::create([
                'aktivitas' => $aktivitas,
                'detail' => $detail,
                'created_at' => now(),
            ]);
            
            \Illuminate\Support\Facades\Log::info('Log entry created', [
                'id' => $logEntry->id,
                'created_at' => $logEntry->created_at
            ]);
            
            return $logEntry;
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error creating log entry', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e; // Re-throw to be caught by the caller
        }
    }
}
