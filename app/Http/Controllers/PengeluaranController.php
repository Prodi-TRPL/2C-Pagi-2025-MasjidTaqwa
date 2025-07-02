<?php

namespace App\Http\Controllers;

use App\Models\Pengeluaran;
use App\Models\ProyekPembangunan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PengeluaranController extends Controller
{
    // List pengeluaran dengan filter dan relasi
    public function index(Request $request)
    {
        $query = Pengeluaran::with(['proyek', 'kategori']);
        
        // Filter by proyek_id if provided
        if ($request->has('proyek_id') && $request->proyek_id) {
            $query->where('proyek_id', $request->proyek_id);
        }
        
        // Filter by kategori_pengeluaran_id if provided
        if ($request->has('kategori_pengeluaran_id') && $request->kategori_pengeluaran_id) {
            $query->where('kategori_pengeluaran_id', $request->kategori_pengeluaran_id);
        }
        
        // Filter by tanggal_start if provided
        if ($request->has('tanggal_start') && $request->tanggal_start) {
            $query->whereDate('created_at', '>=', $request->tanggal_start);
        }
        
        // Filter by tanggal_end if provided
        if ($request->has('tanggal_end') && $request->tanggal_end) {
            $query->whereDate('created_at', '<=', $request->tanggal_end);
        }
        
        // Filter by single date if provided
        if ($request->has('tanggal_pengeluaran') && $request->tanggal_pengeluaran) {
            $query->whereDate('created_at', $request->tanggal_pengeluaran);
        }
        
        // Order by created_at desc (newest first)
        $query->orderBy('created_at', 'desc');
        
        $data = $query->get();
        return response()->json($data);
    }

    // Get statistics for pengeluaran
    public function getStats()
    {
        try {
            // Get total pengeluaran
            $totalPengeluaran = Pengeluaran::sum('jumlah');
            
            // Get total number of projects
            $totalProyek = ProyekPembangunan::count();
            
            // Get total target dana from all projects (total required funds)
            $totalTargetDana = ProyekPembangunan::sum('target_dana');
            
            // Get total dana terkumpul from all projects
            $totalDana = ProyekPembangunan::sum('dana_terkumpul');
            
            // Calculate sisa dana
            $sisaDana = $totalDana - $totalPengeluaran;
            
            return response()->json([
                'totalPengeluaran' => $totalPengeluaran,
                'totalProyek' => $totalProyek,
                'totalTargetDana' => $totalTargetDana,
                'totalDana' => $totalDana,
                'sisaDana' => $sisaDana
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error getting statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Simpan pengeluaran baru
    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_pengeluaran' => 'required|string|max:255',
            'proyek_id' => 'required|string',
            'kategori_pengeluaran_id' => 'required|string',
            'jumlah' => 'required|numeric',
            'keterangan' => 'nullable|string',
        ]);

        try {
            // Begin transaction
            DB::beginTransaction();
            
            // Create the pengeluaran record
            $pengeluaran = new Pengeluaran();
            $pengeluaran->pengeluaran_id = \Illuminate\Support\Str::uuid();
            $pengeluaran->nama_pengeluaran = $validated['nama_pengeluaran'];
            $pengeluaran->proyek_id = $validated['proyek_id'];
            $pengeluaran->kategori_pengeluaran_id = $validated['kategori_pengeluaran_id'];
            $pengeluaran->jumlah = $validated['jumlah'];
            $pengeluaran->keterangan = $validated['keterangan'] ?? null;
            
            // Set penginput_id if user is authenticated
            if (auth()->check()) {
                $pengeluaran->penginput_id = auth()->id();
            }
            
            $pengeluaran->save();
            
            // Commit transaction
            DB::commit();
            
            return response()->json($pengeluaran, 201);
        } catch (\Exception $e) {
            // Rollback transaction on error
            DB::rollBack();
            
            return response()->json([
                'message' => 'Error creating pengeluaran',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Tampilkan pengeluaran berdasarkan id
    public function show($id)
    {
        $pengeluaran = Pengeluaran::with(['proyek', 'kategori'])->findOrFail($id);
        return response()->json($pengeluaran);
    }

    // Update pengeluaran berdasarkan id
    public function update(Request $request, $id)
    {
        $pengeluaran = Pengeluaran::findOrFail($id);

        $validated = $request->validate([
            'nama_pengeluaran' => 'sometimes|required|string|max:255',
            'proyek_id' => 'sometimes|required|string',
            'kategori_pengeluaran_id' => 'sometimes|required|string',
            'jumlah' => 'sometimes|required|numeric',
            'keterangan' => 'nullable|string',
        ]);

        try {
            // Begin transaction
            DB::beginTransaction();
            
            $pengeluaran->update($validated);
            
            // Commit transaction
            DB::commit();
            
            return response()->json($pengeluaran);
        } catch (\Exception $e) {
            // Rollback transaction on error
            DB::rollBack();
            
            return response()->json([
                'message' => 'Error updating pengeluaran',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Hapus pengeluaran berdasarkan id
    public function destroy($id)
    {
        try {
            $pengeluaran = Pengeluaran::findOrFail($id);
            $pengeluaran->delete();
            
            return response()->json(null, 204);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error deleting pengeluaran',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
