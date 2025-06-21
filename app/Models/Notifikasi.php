<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notifikasi extends Model
{
    protected $table = 'notifikasi';
    protected $primaryKey = 'notifikasi_id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = ['notifikasi_id', 'pengguna_id', 'donasi_id', 'tipe', 'pesan', 'status', 'created_at'];


    public function pengguna()
    {
        return $this->belongsTo(Pengguna::class, 'pengguna_id');
    }

    public function donasi()
    {
        return $this->belongsTo(Donasi::class, 'donasi_id');
    }
}
