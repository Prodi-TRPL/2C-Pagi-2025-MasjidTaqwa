<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Donasi extends Model
{
    protected $table = 'donasi';
    protected $primaryKey = 'donasi_id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = ['pengguna_id', 'laporan_keuangan_id', 'jumlah', 'metode_pembayaran_id', 'status', 'tanggal_donasi'];

    public function pengguna()
    {
        return $this->belongsTo(Pengguna::class, 'pengguna_id');
    }

    public function laporanKeuangan()
    {
        return $this->belongsTo(LaporanKeuangan::class, 'laporan_keuangan_id');
    }

    public function metodePembayaran()
    {
        return $this->belongsTo(MetodePembayaran::class, 'metode_pembayaran_id');
    }
}
