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

    protected $fillable = ['admin_id', 'nama_item', 'deskripsi', 'target_dana', 'dana_terkumpul', 'created_at'];

    public function admin()
    {
        return $this->belongsTo(Pengguna::class, 'admin_id');
    }

    public function pengeluaran()
    {
        return $this->hasMany(Pengeluaran::class, 'proyek_id');
    }
}
