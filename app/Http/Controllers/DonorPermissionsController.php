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
     * Update donor permissions
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $id
     * @return \Illuminate\Http\Response
     */
    public function updatePermissions(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'can_donate' => 'required|boolean',
                'can_view_history' => 'required|boolean',
                'can_view_notification' => 'required|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json(['message' => 'Validation error', 'errors' => $validator->errors()], 422);
            }

            $donor = Pengguna::where('role', 'donatur')->findOrFail($id);
            
            $donor->update([
                'can_donate' => $request->can_donate,
                'can_view_history' => $request->can_view_history,
                'can_view_notification' => $request->can_view_notification,
            ]);

            // Get updated donor with permissions
            $updatedDonor = Pengguna::select('pengguna_id', 'nama', 'email', 'role', 'can_donate', 'can_view_history', 'can_view_notification', 'created_at')
                ->findOrFail($id);

            return response()->json([
                'message' => 'Donor permissions updated successfully',
                'donor' => $updatedDonor
            ]);
        } catch (\Exception $e) {
            Log::error('Error updating donor permissions: ' . $e->getMessage());
            return response()->json(['message' => 'Error updating donor permissions: ' . $e->getMessage()], 500);
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