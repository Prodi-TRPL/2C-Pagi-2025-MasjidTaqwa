<?php

namespace App\Http\Controllers;

use App\Models\LaporanKeuangan;
use App\Models\Donasi;
use App\Models\Pengeluaran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class LaporanKeuanganController extends Controller
{
    /**
     * Get financial reports with optional filtering
     * 
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // Get filter type (default to 'bulanan' if not specified)
        $filter = $request->query('filter', 'bulanan');
        
        // Get date range if specified
        $startDate = $request->query('start_date');
        $endDate = $request->query('end_date');
        
        // Validate filter parameter
        if (!in_array($filter, ['harian', 'bulanan', 'tahunan'])) {
            return response()->json(['error' => 'Filter tidak valid. Gunakan harian, bulanan, atau tahunan.'], 400);
        }

        // Define date format and group by clause based on filter
        switch ($filter) {
            case 'harian':
                $dateFormat = '%Y-%m-%d';
                $periodFormat = '%d %M %Y'; // 01 January 2025
                $carbonFormat = 'd F Y';
                break;
            case 'bulanan':
                $dateFormat = '%Y-%m';
                $periodFormat = '%M %Y'; // January 2025
                $carbonFormat = 'F Y';
                break;
            case 'tahunan':
                $dateFormat = '%Y';
                $periodFormat = '%Y'; // 2025
                $carbonFormat = 'Y';
                break;
        }

        // Query for income (donasi)
        $pemasukanQuery = DB::table('donasi')
            ->select(
                DB::raw("DATE_FORMAT(created_at, '$dateFormat') as periode"),
                DB::raw("SUM(jumlah) as total_pemasukan")
            )
            ->where('status', 'Diterima');
        
        // Apply date filters if provided
        if ($startDate) {
            $pemasukanQuery->where('created_at', '>=', $startDate);
        }
        if ($endDate) {
            $pemasukanQuery->where('created_at', '<=', $endDate . ' 23:59:59');
        }
        
        $pemasukan = $pemasukanQuery->groupBy(DB::raw("DATE_FORMAT(created_at, '$dateFormat')"))
            ->get();

        // Query for expenses (pengeluaran)
        $pengeluaranQuery = DB::table('pengeluaran')
            ->select(
                DB::raw("DATE_FORMAT(created_at, '$dateFormat') as periode"),
                DB::raw("SUM(jumlah) as total_pengeluaran")
            );
            
        // Apply date filters if provided
        if ($startDate) {
            $pengeluaranQuery->where('created_at', '>=', $startDate);
        }
        if ($endDate) {
            $pengeluaranQuery->where('created_at', '<=', $endDate . ' 23:59:59');
        }
        
        $pengeluaran = $pengeluaranQuery->groupBy(DB::raw("DATE_FORMAT(created_at, '$dateFormat')"))
            ->get();

        // Combine and process results
        $periodeData = [];
        
        // Process income data
        foreach ($pemasukan as $item) {
            if (!isset($periodeData[$item->periode])) {
                $periodeData[$item->periode] = [
                    'total_pemasukan' => 0,
                    'total_pengeluaran' => 0,
                    'saldo' => 0,
                ];
            }
            $periodeData[$item->periode]['total_pemasukan'] = $item->total_pemasukan;
        }
        
        // Process expense data
        foreach ($pengeluaran as $item) {
            if (!isset($periodeData[$item->periode])) {
                $periodeData[$item->periode] = [
                    'total_pemasukan' => 0,
                    'total_pengeluaran' => 0,
                    'saldo' => 0,
                ];
            }
            $periodeData[$item->periode]['total_pengeluaran'] = $item->total_pengeluaran;
        }
        
        // Calculate saldo and format period
        $formattedResult = [];
        foreach ($periodeData as $key => $data) {
            $data['saldo'] = $data['total_pemasukan'] - $data['total_pengeluaran'];
            
            // Format the period based on filter type
            switch ($filter) {
                case 'harian':
                    $date = Carbon::createFromFormat('Y-m-d', $key);
                    $formattedPeriode = $date->translatedFormat($carbonFormat);
                    break;
                case 'bulanan':
                    $date = Carbon::createFromFormat('Y-m', $key);
                    $formattedPeriode = $date->translatedFormat($carbonFormat);
                    break;
                case 'tahunan':
                    $formattedPeriode = $key;
                    break;
            }
            
            $formattedResult[] = [
                'periode_raw' => $key,
                'periode' => $formattedPeriode,
                'total_pemasukan' => (float) $data['total_pemasukan'],
                'total_pengeluaran' => (float) $data['total_pengeluaran'],
                'saldo' => (float) $data['saldo'],
            ];
        }

        // Sort by period (newest first)
        usort($formattedResult, function ($a, $b) {
            return strcmp($b['periode_raw'], $a['periode_raw']);
        });

        // Calculate overall totals
        $totalPemasukan = array_sum(array_column($formattedResult, 'total_pemasukan'));
        $totalPengeluaran = array_sum(array_column($formattedResult, 'total_pengeluaran'));
        $totalSaldo = $totalPemasukan - $totalPengeluaran;

        return response()->json([
            'filter' => $filter,
            'data' => $formattedResult,
            'summary' => [
                'total_pemasukan' => $totalPemasukan,
                'total_pengeluaran' => $totalPengeluaran,
                'total_saldo' => $totalSaldo,
            ]
        ]);
    }

    /**
     * Store a manually created report
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'periode' => 'required|date_format:Y-m',
            'total_pemasukan' => 'required|numeric|min:0',
            'total_pengeluaran' => 'required|numeric|min:0',
        ]);

        // Calculate saldo
        $saldo = $validated['total_pemasukan'] - $validated['total_pengeluaran'];
        
        // Check if a report already exists for this period
        $existingReport = LaporanKeuangan::where('periode', $validated['periode'] . '-01')->first();
        
        if ($existingReport) {
            // Update existing report
            $existingReport->update([
                'total_pemasukan' => $validated['total_pemasukan'],
                'total_pengeluaran' => $validated['total_pengeluaran'],
                'saldo' => $saldo,
            ]);
            
            return response()->json([
                'message' => 'Laporan berhasil diperbarui',
                'data' => $existingReport
            ]);
        }
        
        // Create new report
        $report = LaporanKeuangan::create([
            'laporan_keuangan_id' => Str::uuid(),
            'periode' => $validated['periode'] . '-01',
            'total_pemasukan' => $validated['total_pemasukan'],
            'total_pengeluaran' => $validated['total_pengeluaran'],
            'saldo' => $saldo,
            'created_at' => now(),
        ]);
        
        return response()->json([
            'message' => 'Laporan berhasil ditambahkan',
            'data' => $report
        ], 201);
    }
    
    /**
     * Get donations for a specific period
     * 
     * @param string $period The period in raw format (YYYY-MM-DD, YYYY-MM, or YYYY)
     * @return \Illuminate\Http\JsonResponse
     */
    public function getDonationsByPeriod($period)
    {
        try {
            // Determine the period type based on the format
            if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $period)) {
                // Daily format: YYYY-MM-DD
                $startDate = Carbon::createFromFormat('Y-m-d', $period)->startOfDay();
                $endDate = Carbon::createFromFormat('Y-m-d', $period)->endOfDay();
            } elseif (preg_match('/^\d{4}-\d{2}$/', $period)) {
                // Monthly format: YYYY-MM
                $startDate = Carbon::createFromFormat('Y-m', $period)->startOfMonth();
                $endDate = Carbon::createFromFormat('Y-m', $period)->endOfMonth();
            } elseif (preg_match('/^\d{4}$/', $period)) {
                // Yearly format: YYYY
                $startDate = Carbon::createFromFormat('Y', $period)->startOfYear();
                $endDate = Carbon::createFromFormat('Y', $period)->endOfYear();
            } else {
                return response()->json(['error' => 'Format periode tidak valid'], 400);
            }
            
            // Query donations for the period
            $donations = DB::table('donasi')
                ->select(
                    'id',
                    'jumlah',
                    'status',
                    DB::raw('COALESCE(name, "Anonymous") as nama'),
                    DB::raw('DATE_FORMAT(created_at, "%d %b %Y") as tanggal')
                )
                ->where('status', 'Diterima')
                ->whereBetween('created_at', [$startDate, $endDate])
                ->orderBy('created_at', 'desc')
                ->get();
                
            return response()->json($donations);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Gagal mengambil data donasi: ' . $e->getMessage()], 500);
        }
    }
    
    /**
     * Get expenses for a specific period
     * 
     * @param string $period The period in raw format (YYYY-MM-DD, YYYY-MM, or YYYY)
     * @return \Illuminate\Http\JsonResponse
     */
    public function getExpensesByPeriod($period)
    {
        try {
            // Determine the period type based on the format
            if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $period)) {
                // Daily format: YYYY-MM-DD
                $startDate = Carbon::createFromFormat('Y-m-d', $period)->startOfDay();
                $endDate = Carbon::createFromFormat('Y-m-d', $period)->endOfDay();
            } elseif (preg_match('/^\d{4}-\d{2}$/', $period)) {
                // Monthly format: YYYY-MM
                $startDate = Carbon::createFromFormat('Y-m', $period)->startOfMonth();
                $endDate = Carbon::createFromFormat('Y-m', $period)->endOfMonth();
            } elseif (preg_match('/^\d{4}$/', $period)) {
                // Yearly format: YYYY
                $startDate = Carbon::createFromFormat('Y', $period)->startOfYear();
                $endDate = Carbon::createFromFormat('Y', $period)->endOfYear();
            } else {
                return response()->json(['error' => 'Format periode tidak valid'], 400);
            }
            
            // Query expenses for the period
            $expenses = DB::table('pengeluaran')
                ->select(
                    'id',
                    'jumlah',
                    'keterangan',
                    DB::raw('DATE_FORMAT(created_at, "%d %b %Y") as tanggal')
                )
                ->whereBetween('created_at', [$startDate, $endDate])
                ->orderBy('created_at', 'desc')
                ->get();
                
            return response()->json($expenses);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Gagal mengambil data pengeluaran: ' . $e->getMessage()], 500);
        }
    }
} 