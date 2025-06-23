<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notifikasi extends Model
{
    protected $table = 'notifikasi';
    protected $primaryKey = 'notifikasi_id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = true;

    protected $fillable = ['notifikasi_id', 'pengguna_id', 'donasi_id', 'tipe', 'judul', 'pesan', 'status'];
    
    protected $appends = ['is_read'];

    /**
     * Get whether the notification has been read.
     *
     * @return bool
     */
    public function getIsReadAttribute()
    {
        return $this->status === 'dibaca';
    }

    public function pengguna()
    {
        return $this->belongsTo(Pengguna::class, 'pengguna_id');
    }

    public function donasi()
    {
        return $this->belongsTo(Donasi::class, 'donasi_id');
    }
}
