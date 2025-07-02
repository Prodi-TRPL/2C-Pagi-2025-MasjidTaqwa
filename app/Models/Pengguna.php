<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Pengguna extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'pengguna';
    protected $primaryKey = 'pengguna_id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    // Kolom yang bisa diisi
    protected $fillable = [
        'pengguna_id',
        'nama',
        'email',
        'password',
        'role',
        'nomor_hp',
        'created_at',
    ];

    // Kolom yang harus disembunyikan saat dikembalikan ke frontend
    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function getAuthIdentifierName()
    {
        return 'pengguna_id';
    }

    // Relasi
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
