<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KategoriPengeluaran extends Model
{
    protected $table = 'kategori_pengeluaran';
    protected $primaryKey = 'kategori_pengeluaran_id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = ['nama_kategori'];

    public function pengeluaran()
    {
        return $this->hasMany(Pengeluaran::class, 'kategori_pengeluaran_id');
    }
}
