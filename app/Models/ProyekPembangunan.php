<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProyekPembangunan extends Model
{
    protected $table = 'proyek_pembangunan';
    protected $primaryKey = 'proyek_id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = true;
    const CREATED_AT = 'created_at';
    const UPDATED_AT = null;

    protected $fillable = ['proyek_id', 'admin_id', 'nama_item', 'deskripsi', 'target_dana', 'dana_terkumpul', 'created_at', 'gambar'];
    
    /**
     * The "booting" method of the model.
     *
     * @return void
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (!$model->proyek_id) {
                $model->proyek_id = (string) \Illuminate\Support\Str::uuid();
            }
        });
    }

    public function admin()
    {
        return $this->belongsTo(Pengguna::class, 'admin_id');
    }

    public function pengeluaran()
    {
        return $this->hasMany(Pengeluaran::class, 'proyek_id');
    }
}
