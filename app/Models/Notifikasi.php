<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * STRUKTUR DATA: QUEUE SUPPORT
 * Model Notifikasi dengan dukungan untuk implementasi Queue
 */
class Notifikasi extends Model
{
    protected $table = 'notifikasi';
    protected $primaryKey = 'notifikasi_id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = true;
    const UPDATED_AT = null;

    protected $fillable = [
        'notifikasi_id',
        'pengguna_id', 
        'judul', 
        'pesan', 
        'status', 
        'tipe',
        'donasi_id',
        'created_at',
        'processed',  // Field untuk Queue implementation
        'priority'    // Field untuk Queue implementation dengan prioritas
    ];

    protected $casts = [
        'processed' => 'boolean',
    ];

    protected $appends = ['is_read'];

    /**
     * Get whether the notification has been read.
     *
     * @return bool
     */
    public function getIsReadAttribute()
    {
        return isset($this->attributes['status']) && $this->attributes['status'] === 'dibaca';
    }

    public function pengguna()
    {
        return $this->belongsTo(Pengguna::class, 'pengguna_id');
    }

    public function donasi()
    {
        return $this->belongsTo(Donasi::class, 'donasi_id');
    }

    /**
     * STRUKTUR DATA: QUEUE METHODS
     * Metode untuk mendukung operasi Queue pada notifikasi
     */
    
    /**
     * Menambahkan notifikasi ke antrian
     * 
     * @param string $userId ID pengguna tujuan
     * @param string $title Judul notifikasi
     * @param string $message Isi pesan notifikasi
     * @param string $priority Prioritas notifikasi ('low', 'normal', 'high')
     * @return string ID notifikasi yang dibuat
     */
    public static function enqueue($userId, $title, $message, $priority = 'normal')
    {
        $notification = new self();
        $notification->notifikasi_id = (string) \Illuminate\Support\Str::uuid();
        $notification->pengguna_id = $userId;
        $notification->judul = $title;
        $notification->pesan = $message;
        $notification->status = 'terkirim';
        $notification->processed = false;
        $notification->priority = $priority;
        $notification->created_at = now();
        $notification->save();
        
        return $notification->notifikasi_id;
    }
    
    /**
     * Mengambil notifikasi dari antrian berdasarkan prioritas
     * 
     * @param int $limit Jumlah maksimal notifikasi yang diambil
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function dequeueByPriority($limit = 50)
    {
        return self::where('processed', false)
            ->orderBy('priority', 'desc')  // Prioritas tinggi diproses lebih dulu
            ->orderBy('created_at', 'asc') // FIFO untuk prioritas yang sama
            ->limit($limit)
            ->get();
    }
    
    /**
     * Menandai notifikasi sebagai telah diproses
     * 
     * @return bool
     */
    public function markAsProcessed()
    {
        $this->processed = true;
        return $this->save();
    }
}
