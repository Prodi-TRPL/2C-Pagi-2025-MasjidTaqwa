<?php

namespace App\Http\Controllers;

use App\Models\DonationSetting;
use App\Models\Donasi;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class DonationSettingsController extends Controller
{
    /**
     * Get the current donation settings
     *
     * @return \Illuminate\Http\Response
     */
    public function getSettings()
    {
        try {
            $settings = DonationSetting::getCurrentSettings();
            
            if (!$settings) {
                // Create default settings if none exist
                $settings = DonationSetting::create([
                    'is_donation_active' => true,
                    'message_type' => 'warning',
                    'denial_message' => 'Donasi saat ini tidak tersedia. Silakan coba lagi nanti.'
                ]);
            }
            
            // Get total donations for progress calculation
            try {
                $totalDonations = Donasi::where('status', 'Diterima')->sum('jumlah');
            } catch (\Exception $e) {
                Log::error('Error calculating total donations: ' . $e->getMessage());
                $totalDonations = 0; // Default if error occurs
            }
            
            // Calculate progress percentage if target is set
            $progressPercentage = 0;
            if ($settings->donation_target && $settings->donation_target > 0) {
                $progressPercentage = min(100, round(($totalDonations / $settings->donation_target) * 100));
            }
            
            // Check if donations are active based on all criteria
            try {
                $isDonationActive = DonationSetting::isDonationActive();
            } catch (\Exception $e) {
                Log::error('Error checking donation active status: ' . $e->getMessage());
                $isDonationActive = true; // Default if error occurs
            }
            
            return response()->json([
                'settings' => $settings,
                'donation_status' => [
                    'is_active' => $isDonationActive,
                    'total_donations' => $totalDonations,
                    'progress_percentage' => $progressPercentage
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching donation settings: ' . $e->getMessage());
            Log::error('Stack trace: ' . $e->getTraceAsString());
            return response()->json(['message' => 'Error fetching donation settings: ' . $e->getMessage()], 500);
        }
    }
    
    /**
     * Update donation settings
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function updateSettings(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'is_donation_active' => 'required|boolean',
                'donation_end_date' => 'nullable|date',
                'donation_target' => 'nullable|numeric|min:0',
                'message_type' => 'required|in:warning,info,error',
                'denial_message' => 'required|string|max:500',
            ]);
            
            if ($validator->fails()) {
                return response()->json(['message' => 'Validation error', 'errors' => $validator->errors()], 422);
            }
            
            $settings = DonationSetting::getCurrentSettings();
            
            if (!$settings) {
                $settings = new DonationSetting();
            }
            
            $settings->is_donation_active = $request->is_donation_active;
            $settings->donation_end_date = $request->donation_end_date;
            $settings->donation_target = $request->donation_target;
            $settings->message_type = $request->message_type;
            $settings->denial_message = $request->denial_message;
            $settings->save();
            
            // Get total donations for progress calculation
            $totalDonations = Donasi::where('status', 'Diterima')->sum('jumlah');
            
            // Calculate progress percentage if target is set
            $progressPercentage = 0;
            if ($settings->donation_target && $settings->donation_target > 0) {
                $progressPercentage = min(100, round(($totalDonations / $settings->donation_target) * 100));
            }
            
            // Check if donations are active based on all criteria
            $isDonationActive = DonationSetting::isDonationActive();
            
            return response()->json([
                'message' => 'Donation settings updated successfully',
                'settings' => $settings,
                'donation_status' => [
                    'is_active' => $isDonationActive,
                    'total_donations' => $totalDonations,
                    'progress_percentage' => $progressPercentage
                ]
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating donation settings: ' . $e->getMessage());
            return response()->json(['message' => 'Error updating donation settings: ' . $e->getMessage()], 500);
        }
    }
    
    /**
     * Check if donations are currently active
     *
     * @return \Illuminate\Http\Response
     */
    public function checkDonationStatus()
    {
        try {
            $isActive = DonationSetting::isDonationActive();
            $message = $isActive ? null : DonationSetting::getDenialMessage();
            
            // Get detailed reasons for inactive status
            $settings = DonationSetting::getCurrentSettings();
            $details = [
                'end_date_reached' => false,
                'target_met' => false,
                'manually_disabled' => false
            ];
            
            if (!$isActive && $settings) {
                // Check why donation is inactive
                
                // Check manual override
                if (!$settings->is_donation_active) {
                    $details['manually_disabled'] = true;
                }
                
                // Check end date
                if ($settings->donation_end_date && now()->greaterThan($settings->donation_end_date)) {
                    $details['end_date_reached'] = true;
                }
                
                // Check donation target
                if ($settings->donation_target) {
                    $totalDonations = Donasi::where('status', 'Diterima')->sum('jumlah');
                    if ($totalDonations >= $settings->donation_target) {
                        $details['target_met'] = true;
                    }
                }
            }
            
            return response()->json([
                'is_active' => $isActive,
                'message' => $message,
                'details' => $details
            ]);
        } catch (\Exception $e) {
            Log::error('Error checking donation status: ' . $e->getMessage());
            return response()->json(['message' => 'Error checking donation status: ' . $e->getMessage()], 500);
        }
    }
} 