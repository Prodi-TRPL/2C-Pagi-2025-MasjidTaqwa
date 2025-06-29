<?php

namespace App\Http\Controllers;

use App\Models\Pengguna;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class DonorPermissionsController extends Controller
{
    /**
     * Get all donors with their permissions
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        try {
            $donors = Pengguna::where('role', 'donatur')
                ->select('pengguna_id', 'nama', 'email', 'role', 'can_donate', 'can_view_history', 'can_view_notification', 'created_at')
                ->get();

            // Calculate statistics
            $stats = [
                'totalDonors' => $donors->count(),
                'activeDonors' => $donors->where('can_donate', true)->count(),
                'inactiveDonors' => $donors->where('can_donate', false)->count(),
                'permissionChanges' => 0 // This would require a log table to track changes
            ];

            return response()->json([
                'donors' => $donors,
                'stats' => $stats
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching donors: ' . $e->getMessage());
            return response()->json(['message' => 'Error fetching donors: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Update permissions for a donor
     */
    public function updatePermissions(Request $request, $id)
    {
        // Validate request
        $request->validate([
            'can_donate' => 'required|boolean',
            'can_view_history' => 'required|boolean',
            'can_view_notification' => 'required|boolean',
        ]);
        
        // Helper function to convert value to boolean
        $toBool = function($value) {
            if (is_bool($value)) return $value ? 1 : 0;
            if (is_numeric($value)) return (int)$value === 1 ? 1 : 0;
            if (is_string($value)) {
                $lower = strtolower($value);
                return ($lower === '1' || $lower === 'true' || $lower === 'yes') ? 1 : 0;
            }
            return (bool)$value ? 1 : 0;
        };

        try {
            // Find the donor
            $donor = Pengguna::where('pengguna_id', $id)
                ->where('role', 'donatur')
                ->firstOrFail();
            
            // Log the old permissions
            Log::info("Updating permissions for donor {$id}", [
                'old_can_donate' => $donor->can_donate,
                'old_can_view_history' => $donor->can_view_history,
                'old_can_view_notification' => $donor->can_view_notification,
                'new_can_donate' => $request->can_donate,
                'new_can_view_history' => $request->can_view_history,
                'new_can_view_notification' => $request->can_view_notification,
            ]);
            
            // Update permissions - explicitly convert to 1/0
            $donor->can_donate = $toBool($request->can_donate);
            $donor->can_view_history = $toBool($request->can_view_history);
            $donor->can_view_notification = $toBool($request->can_view_notification);
            $donor->save();
            
            // Log the updated permissions
            Log::info("Updated permissions for donor {$id}", [
                'can_donate' => $donor->can_donate,
                'can_view_history' => $donor->can_view_history,
                'can_view_notification' => $donor->can_view_notification,
            ]);
            
            return response()->json([
                'message' => 'Permissions updated successfully',
                'donor' => $donor
            ]);
        } catch (\Exception $e) {
            Log::error("Error updating permissions for donor {$id}: " . $e->getMessage());
            return response()->json([
                'message' => 'Failed to update permissions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get donor permission statistics
     *
     * @return \Illuminate\Http\Response
     */
    public function getStats()
    {
        try {
            $donors = Pengguna::where('role', 'donatur')->get();
            
            $stats = [
                'totalDonors' => $donors->count(),
                'activeDonors' => $donors->where('can_donate', true)->count(),
                'inactiveDonors' => $donors->where('can_donate', false)->count(),
                'permissionChanges' => 0 // This would require a log table to track changes
            ];

            return response()->json($stats);
        } catch (\Exception $e) {
            Log::error('Error fetching stats: ' . $e->getMessage());
            return response()->json(['message' => 'Error fetching stats: ' . $e->getMessage()], 500);
        }
    }
} 