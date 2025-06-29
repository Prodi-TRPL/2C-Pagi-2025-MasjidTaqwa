<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Pengguna extends Authenticatable
{
    use HasApiTokens;
    protected $table = 'pengguna';
    protected $primaryKey = 'pengguna_id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'nama', 
        'email', 
        'password', 
        'role', 
        'nomor_hp', 
        'created_at',
        'can_donate',
        'can_view_history',
        'can_view_notification'
    ];

    protected $casts = [
        'can_donate' => 'boolean',
        'can_view_history' => 'boolean',
        'can_view_notification' => 'boolean',
    ];

    public function getAuthIdentifierName()
    {
        return 'pengguna_id';
    }

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
