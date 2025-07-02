<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MetodePembayaran extends Model
{
    protected $table = 'metode_pembayaran';
    protected $primaryKey = 'metode_pembayaran_id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = ['nama_metode'];

    public function donasi()
    {
        return $this->hasMany(Donasi::class, 'metode_pembayaran_id');
    }
}
