<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnonymousDonor extends Model
{
    use HasFactory;

    protected $table = 'anonymous_donors';
    protected $primaryKey = 'anonymous_donor_id';
    protected $fillable = ['email', 'nama', 'is_linked_to_account', 'pengguna_id'];

    /**
     * Get the donations made by this anonymous donor.
     */
    public function donasi()
    {
        return $this->hasMany(Donasi::class, 'anonymous_donor_id', 'anonymous_donor_id');
    }

    /**
     * Get the user account linked to this anonymous donor.
     */
    public function pengguna()
    {
        return $this->belongsTo(Pengguna::class, 'pengguna_id', 'pengguna_id');
    }
} 