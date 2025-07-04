<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Str;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Pengguna extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
    protected $table = 'pengguna';
    protected $primaryKey = 'pengguna_id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'nama', 
        'email', 
        'password', 

        'nomor_hp', 
        'created_at',
        'can_donate',
        'can_view_history',
        'can_view_notification',
        'email_verified_at',
        'verification_code',
        'verification_code_expires_at',
        'reset_code',
        'reset_code_expires_at'
    ];

    protected $casts = [
        'can_donate' => 'boolean',
        'can_view_history' => 'boolean',
        'can_view_notification' => 'boolean',
        'created_at' => 'datetime',
        'email_verified_at' => 'datetime',
        'verification_code_expires_at' => 'datetime',
        'reset_code_expires_at' => 'datetime',
    ];

    /**
     * The "booting" method of the model.
     *
     * @return void
     */
    protected static function boot()
    {
        parent::boot();

        // Auto-generate UUID for new records
        static::creating(function ($model) {
            if (!$model->pengguna_id) {
                $model->pengguna_id = (string) Str::uuid();
            }
        });
    }

    // Check if the email has been verified
    public function hasVerifiedEmail()
    {
        return !is_null($this->email_verified_at);
    }

    // Mark the email as verified
    public function markEmailAsVerified()
    {
        return $this->forceFill([
            'email_verified_at' => now(),
            'verification_code' => null,
            'verification_code_expires_at' => null,
        ])->save();
    }

    // Generate a new verification code for this user
    public function generateVerificationCode()
    {
        $code = rand(100000, 999999); // 6-digit code
        $expires = now()->addMinutes(60); // expires in 60 minutes
        
        $this->verification_code = $code;
        $this->verification_code_expires_at = $expires;
        $this->save();
        
        return $code;
    }
    
    // Generate a password reset code for this user
    public function generateResetCode()
    {
        $code = rand(100000, 999999); // 6-digit code
        $expires = now()->addMinutes(60); // expires in 60 minutes
        
        $this->reset_code = $code;
        $this->reset_code_expires_at = $expires;
        $this->save();
        
        return $code;
    }
    
    // Check if verification code is valid and not expired
    public function isVerificationCodeValid($code)
    {
        return $this->verification_code == $code && 
               $this->verification_code_expires_at && 
               now()->lt($this->verification_code_expires_at);
    }
    
    // Check if reset code is valid and not expired
    public function isResetCodeValid($code)
    {
        return $this->reset_code == $code && 
               $this->reset_code_expires_at && 
               now()->lt($this->reset_code_expires_at);
    }

    public function getAuthIdentifierName()
    {
        return 'pengguna_id';
    }

    public function donasi()
    {
        return $this->hasMany(Donasi::class, 'pengguna_id');
    }

    public function proyek()
    {
        return $this->hasMany(ProyekPembangunan::class, 'admin_id'); 
    }

    public function pengeluaran()
    {
        return $this->hasMany(Pengeluaran::class, 'penginput_id');
    }

    public function notifikasi()
    {
        return $this->hasMany(Notifikasi::class, 'pengguna_id');
    }
}
