<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Donasi extends Model
{
    protected $table = 'donasi';
    protected $primaryKey = 'donasi_id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = true;

    protected $fillable = [
        'pengguna_id', 
        'laporan_keuangan_id', 
        'jumlah',
        'status', 
        'order_id',
        'payment_type',
        'snap_token',
        'name',
        'email',
        'is_anonymous',
        'created_at',
        'updated_at'
    ];
    
    protected $attributes = [
        'status' => 'Kadaluarsa', // Default value until payment is confirmed
        'is_anonymous' => false,  // Default value for anonymous flag
    ];

    public function pengguna()
    {
        return $this->belongsTo(Pengguna::class, 'pengguna_id');
    }

    public function laporanKeuangan()
    {
        return $this->belongsTo(LaporanKeuangan::class, 'laporan_keuangan_id');
    }
}
