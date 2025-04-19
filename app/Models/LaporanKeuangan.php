<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LaporanKeuangan extends Model
{
    protected $table = 'laporan_keuangan';
    protected $primaryKey = 'laporan_keuangan_id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = ['periode', 'total_pemasukan', 'total_pengeluaran', 'saldo', 'created_at'];

    public function donasi()
    {
        return $this->hasMany(Donasi::class, 'laporan_keuangan_id');
    }

    public function pengeluaran()
    {
        return $this->hasMany(Pengeluaran::class, 'laporan_keuangan_id');
    }
}
