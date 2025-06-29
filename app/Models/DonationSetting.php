<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Donasi;

class DonationSetting extends Model
{
    use HasFactory;

    protected $table = 'donation_settings';
    
    protected $fillable = [
        'is_donation_active',
        'donation_end_date',
        'donation_target',
        'message_type',
        'denial_message',
    ];
    
    protected $casts = [
        'is_donation_active' => 'boolean',
        'donation_end_date' => 'date',
        'donation_target' => 'decimal:2',
    ];
    
    /**
     * Get the current donation settings
     * 
     * @return DonationSetting
     */
    public static function getCurrentSettings()
    {
        return self::first();
    }
    
    /**
     * Check if donations are currently active
     * 
     * @return bool
     */
    public static function isDonationActive()
    {
        try {
            $settings = self::getCurrentSettings();
            
            if (!$settings) {
                return true; // Default to active if no settings exist
            }
            
            // Check manual override
            if (!$settings->is_donation_active) {
                return false;
            }
            
            // Check end date
            if ($settings->donation_end_date && now()->greaterThan($settings->donation_end_date)) {
                return false;
            }
            
            // Check donation target (if set)
            if ($settings->donation_target) {
                try {
                    $totalDonations = Donasi::where('status', 'Diterima')->sum('jumlah');
                    if ($totalDonations >= $settings->donation_target) {
                        return false;
                    }
                } catch (\Exception $e) {
                    \Log::error('Error checking donation target: ' . $e->getMessage());
                    // Continue with default behavior if donation check fails
                }
            }
            
            return true;
        } catch (\Exception $e) {
            \Log::error('Error in isDonationActive: ' . $e->getMessage());
            return true; // Default to active on error
        }
    }
    
    /**
     * Get donation denial message with type
     * 
     * @return array
     */
    public static function getDenialMessage()
    {
        $settings = self::getCurrentSettings();
        
        if (!$settings) {
            return [
                'type' => 'warning',
                'message' => 'Donasi saat ini tidak tersedia. Silakan coba lagi nanti.'
            ];
        }
        
        return [
            'type' => $settings->message_type,
            'message' => $settings->denial_message
        ];
    }
} 