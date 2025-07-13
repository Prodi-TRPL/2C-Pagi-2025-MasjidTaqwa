<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pengguna;
use Illuminate\Support\Facades\Log;
use App\Traits\LogsActivity;

class DonorPermissionsController extends Controller
{
    use LogsActivity;

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
     * Update user permissions.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  string  $id
     * @return \Illuminate\Http\Response
     */
    public function updatePermissions(Request $request, $id)
    {
        try {
            $donor = Pengguna::findOrFail($id);

            // Get original permission values for logging
            $originalPermissions = [
                'can_donate' => $donor->can_donate,
                'can_view_history' => $donor->can_view_history,
                'can_view_notification' => $donor->can_view_notification
            ];
            
            // Validate request
            $validated = $request->validate([
                'can_donate' => 'required|boolean',
                'can_view_history' => 'required|boolean',
                'can_view_notification' => 'required|boolean',
            ]);
            
            // Update permissions
            $donor->can_donate = $validated['can_donate'];
            $donor->can_view_history = $validated['can_view_history'];
            $donor->can_view_notification = $validated['can_view_notification'];
            $donor->save();
            
            // Prepare log message with changed permissions
            $changedPermissions = [];
            if ($originalPermissions['can_donate'] !== $validated['can_donate']) {
                $status = $validated['can_donate'] ? 'diizinkan' : 'ditolak';
                $changedPermissions[] = "hak donasi: $status";
            }
            if ($originalPermissions['can_view_history'] !== $validated['can_view_history']) {
                $status = $validated['can_view_history'] ? 'diizinkan' : 'ditolak';
                $changedPermissions[] = "hak lihat riwayat: $status";
            }
            if ($originalPermissions['can_view_notification'] !== $validated['can_view_notification']) {
                $status = $validated['can_view_notification'] ? 'diizinkan' : 'ditolak';
                $changedPermissions[] = "hak lihat notifikasi: $status";
            }
            
            // Log the permission changes
            if (!empty($changedPermissions)) {
                $this->logActivity(
                    'ubah_hak_akses',
                    "Mengubah hak akses donatur {$donor->nama} ({$donor->email}): " . implode(", ", $changedPermissions)
                );
            }
            
            return response()->json(['message' => 'Permissions updated successfully']);
        } catch (\Exception $e) {
            Log::error('Error updating donor permissions: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to update permissions'], 500);
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