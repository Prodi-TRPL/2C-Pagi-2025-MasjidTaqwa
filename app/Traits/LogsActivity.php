<?php

namespace App\Traits;

use App\Models\LogAktivitas;
use Illuminate\Support\Facades\Auth;

trait LogsActivity
{
    /**
     * Log an admin activity
     *
     * @param string $aktivitas Type of activity (e.g., 'tambah_proyek', 'edit_kategori')
     * @param string $detail Detailed description of the activity
     * @param bool $forceLog Force logging even if user is not admin
     * @return \App\Models\LogAktivitas|null
     */
    protected function logActivity($aktivitas, $detail, $forceLog = true)
    {
        // Debug logging
        \Illuminate\Support\Facades\Log::info('logActivity method called', [
            'aktivitas' => $aktivitas,
            'detail' => $detail,
            'forceLog' => $forceLog
        ]);
        
        // Only log activities for admin users
        $user = Auth::user();
        
        // Debug logging for user
        if ($user) {
            \Illuminate\Support\Facades\Log::info('User found in logActivity', [
                'user_id' => $user->id ?? $user->pengguna_id ?? 'unknown',
                'role' => $user->role ?? 'unknown'
            ]);
        } else {
            \Illuminate\Support\Facades\Log::warning('No user found in logActivity');
        }
        
        // Log if it's an admin user or if logging is forced
        if ($forceLog || ($user && $user->role === 'admin')) {
            try {
                $logEntry = LogAktivitas::log($aktivitas, $detail);
                \Illuminate\Support\Facades\Log::info('Activity logged successfully', [
                    'log_id' => $logEntry->id ?? 'unknown'
                ]);
                return $logEntry;
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Error logging activity', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                return null;
            }
        }
        
        // Don't log for non-admin users
        \Illuminate\Support\Facades\Log::info('Activity not logged - not an admin and forceLog is false');
        return null;
    }
    
    /**
     * Log the creation of a resource
     *
     * @param string $resourceType Type of resource (e.g., 'proyek', 'kategori')
     * @param string $resourceName Name or identifier of the resource
     * @param array $additionalDetails Optional additional details to include
     * @param bool $forceLog Force logging even if user is not admin
     * @return \App\Models\LogAktivitas|null
     */
    protected function logCreation($resourceType, $resourceName, array $additionalDetails = [], $forceLog = false)
    {
        $aktivitas = "tambah_{$resourceType}";
        $detail = "Menambahkan {$resourceType} baru: {$resourceName}";
        
        if (!empty($additionalDetails)) {
            $detail .= ". " . $this->formatAdditionalDetails($additionalDetails);
        }
        
        return $this->logActivity($aktivitas, $detail, $forceLog);
    }
    
    /**
     * Log the update of a resource
     *
     * @param string $resourceType Type of resource (e.g., 'proyek', 'kategori')
     * @param string $resourceName Name or identifier of the resource
     * @param array $additionalDetails Optional additional details to include
     * @param bool $forceLog Force logging even if user is not admin
     * @return \App\Models\LogAktivitas|null
     */
    protected function logUpdate($resourceType, $resourceName, array $additionalDetails = [], $forceLog = false)
    {
        $aktivitas = "edit_{$resourceType}";
        $detail = "Mengubah {$resourceType}: {$resourceName}";
        
        if (!empty($additionalDetails)) {
            $detail .= ". " . $this->formatAdditionalDetails($additionalDetails);
        }
        
        return $this->logActivity($aktivitas, $detail, $forceLog);
    }
    
    /**
     * Log the deletion of a resource
     *
     * @param string $resourceType Type of resource (e.g., 'proyek', 'kategori')
     * @param string $resourceName Name or identifier of the resource
     * @param array $additionalDetails Optional additional details to include
     * @param bool $forceLog Force logging even if user is not admin
     * @return \App\Models\LogAktivitas|null
     */
    protected function logDeletion($resourceType, $resourceName, array $additionalDetails = [], $forceLog = false)
    {
        $aktivitas = "hapus_{$resourceType}";
        $detail = "Menghapus {$resourceType}: {$resourceName}";
        
        if (!empty($additionalDetails)) {
            $detail .= ". " . $this->formatAdditionalDetails($additionalDetails);
        }
        
        return $this->logActivity($aktivitas, $detail, $forceLog);
    }
    
    /**
     * Log a status change
     *
     * @param string $resourceType Type of resource (e.g., 'donasi', 'pengguna')
     * @param string $resourceName Name or identifier of the resource
     * @param string $oldStatus Previous status
     * @param string $newStatus New status
     * @param array $additionalDetails Optional additional details to include
     * @param bool $forceLog Force logging even if user is not admin
     * @return \App\Models\LogAktivitas|null
     */
    protected function logStatusChange($resourceType, $resourceName, $oldStatus, $newStatus, array $additionalDetails = [], $forceLog = false)
    {
        $aktivitas = "ubah_status_{$resourceType}";
        $detail = "Mengubah status {$resourceType} {$resourceName} dari '{$oldStatus}' menjadi '{$newStatus}'";
        
        if (!empty($additionalDetails)) {
            $detail .= ". " . $this->formatAdditionalDetails($additionalDetails);
        }
        
        return $this->logActivity($aktivitas, $detail, $forceLog);
    }
    
    /**
     * Format additional details as a string
     *
     * @param array $details
     * @return string
     */
    private function formatAdditionalDetails(array $details)
    {
        $formattedDetails = [];
        
        foreach ($details as $key => $value) {
            if (is_array($value)) {
                $value = json_encode($value);
            }
            
            $formattedDetails[] = "{$key}: {$value}";
        }
        
        return "Detail tambahan: " . implode(", ", $formattedDetails);
    }
} 