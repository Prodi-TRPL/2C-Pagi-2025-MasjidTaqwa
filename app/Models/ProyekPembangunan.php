<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProyekPembangunan extends Model
{
    protected $table = 'proyek_pembangunan';
    protected $primaryKey = 'proyek_id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = ['pengelola_id', 'nama_item', 'deskripsi', 'target_dana', 'dana_terkumpul', 'created_at'];

    public function pengelola()
    {
        return $this->belongsTo(Pengguna::class, 'pengelola_id');
    }

    public function pengeluaran()
    {
        return $this->hasMany(Pengeluaran::class, 'proyek_id');
    }
}
