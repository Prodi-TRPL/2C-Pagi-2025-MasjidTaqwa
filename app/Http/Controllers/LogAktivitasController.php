<?php

namespace App\Http\Controllers;

use App\Models\LogAktivitas;
use Illuminate\Http\Request;

class LogAktivitasController extends Controller
{
    /**
     * Display a listing of the log activities.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $query = LogAktivitas::query();
        
        // Search by keyword in aktivitas or detail
        if ($request->has('search') && !empty($request->search)) {
            $searchTerm = $request->search;
            $query->where(function($q) use ($searchTerm) {
                $q->where('aktivitas', 'like', "%{$searchTerm}%")
                  ->orWhere('detail', 'like', "%{$searchTerm}%");
            });
        }
        
        // Filter by date range
        if ($request->has('start_date') && !empty($request->start_date)) {
            $query->whereDate('created_at', '>=', $request->start_date);
        }
        
        if ($request->has('end_date') && !empty($request->end_date)) {
            $query->whereDate('created_at', '<=', $request->end_date);
        }
        
        // Order by created_at in descending order (newest first)
        $query->orderBy('created_at', 'desc');
        
        // Paginate the results
        $perPage = $request->per_page ?? 15;
        $logs = $query->paginate($perPage);
        
        return response()->json($logs);
    }

    /**
     * Store a newly created log entry in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $request->validate([
            'aktivitas' => 'required|string|max:255',
            'detail' => 'required|string',
        ]);
        
        $log = LogAktivitas::create([
            'aktivitas' => $request->aktivitas,
            'detail' => $request->detail,
        ]);
        
        return response()->json($log, 201);
    }

    /**
     * Create a log entry directly from other controllers.
     *
     * @param  string  $aktivitas
     * @param  string  $detail
     * @return \App\Models\LogAktivitas
     */
    public static function createLog($aktivitas, $detail)
    {
        return LogAktivitas::log($aktivitas, $detail);
    }
    
    /**
     * Log admin logout activity.
     * This endpoint is specifically for logging admin logout activities.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function logAdminLogout(Request $request)
    {
        try {
            // Get admin information from request
            $adminName = $request->input('name', 'Unknown');
            $adminEmail = $request->input('email', 'unknown@example.com');
            
            // Log the logout activity
            $logEntry = LogAktivitas::create([
                'aktivitas' => 'logout',
                'detail' => "Admin {$adminName} ({$adminEmail}) logout dari sistem",
                'created_at' => now(),
            ]);
            
            // Log success for debugging
            \Illuminate\Support\Facades\Log::info('Admin logout logged successfully via dedicated endpoint', [
                'admin_name' => $adminName,
                'admin_email' => $adminEmail,
                'log_id' => $logEntry->id
            ]);
            
            return response()->json([
                'success' => true,
                'message' => 'Admin logout logged successfully',
                'log_id' => $logEntry->id
            ]);
        } catch (\Exception $e) {
            // Log error for debugging
            \Illuminate\Support\Facades\Log::error('Error logging admin logout via dedicated endpoint', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Error logging admin logout: ' . $e->getMessage()
            ], 500);
        }
    }
}
