<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Pengeluaran extends Model
{
    protected $table = 'pengeluaran';
    protected $primaryKey = 'pengeluaran_id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = true;
    const UPDATED_AT = null;

    protected $fillable = ['proyek_id', 'penginput_id', 'kategori_pengeluaran_id', 'laporan_keuangan_id', 'jumlah', 'nama_pengeluaran', 'keterangan', 'created_at'];

    public function proyek()
    {
        return $this->belongsTo(ProyekPembangunan::class, 'proyek_id');
    }

    public function penginput()
    {
        return $this->belongsTo(Pengguna::class, 'penginput_id');
    }

    public function kategori()
    {
        return $this->belongsTo(KategoriPengeluaran::class, 'kategori_pengeluaran_id');
    }

    public function laporanKeuangan()
    {
        return $this->belongsTo(LaporanKeuangan::class, 'laporan_keuangan_id');
    }
}
