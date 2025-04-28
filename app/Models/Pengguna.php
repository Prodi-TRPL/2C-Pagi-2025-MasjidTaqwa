<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Pengguna extends Authenticatable
{
    protected $table = 'pengguna';
    protected $primaryKey = 'pengguna_id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = ['nama', 'email', 'password', 'role', 'nomor_hp', 'created_at'];

    public function donasi()
    {
        return $this->hasMany(Donasi::class, 'pengguna_id');
    }

    public function proyek()
    {
        return $this->hasMany(ProyekPembangunan::class, 'admin_id'); 
    }

    public function pengeluaran()
    {
        return $this->hasMany(Pengeluaran::class, 'penginput_id');
    }

    public function notifikasi()
    {
        return $this->hasMany(Notifikasi::class, 'pengguna_id');
    }
}
