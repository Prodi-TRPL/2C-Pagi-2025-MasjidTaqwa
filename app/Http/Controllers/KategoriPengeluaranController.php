<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\KategoriPengeluaran;

class KategoriPengeluaranController extends Controller
{
    // Tampilkan semua data kategori
    public function index()
    {
        $kategori = KategoriPengeluaran::all();
        
        // Check if request is from API
        if (request()->wantsJson() || request()->is('api/*')) {
            return response()->json($kategori);
        }
        
        return view('kategori_pengeluaran.index', compact('kategori'));
    }

    // Tampilkan form tambah
    public function create()
    {
        return view('kategori_pengeluaran.create');
    }

    // Simpan data baru
    public function store(Request $request)
    {
        // Auto-generate ID seperti KT001, KT002, dst
        $last = KategoriPengeluaran::orderBy('kategori_pengeluaran_id', 'desc')->first();
        if ($last) {
            $number = (int) substr($last->kategori_pengeluaran_id, 2) + 1;
        } else {
            $number = 1;
        }
        $newId = 'KT' . str_pad($number, 3, '0', STR_PAD_LEFT);

        $kategori = KategoriPengeluaran::create([
            'kategori_pengeluaran_id' => $newId,
            'nama_kategori' => $request->nama_kategori
        ]);

        // Check if request is from API
        if ($request->wantsJson() || $request->is('api/*')) {
            return response()->json([
                'success' => true,
                'message' => 'Data berhasil ditambahkan',
                'data' => $kategori
            ]);
        }

        return redirect('/kategori_pengeluaran')->with('success', 'Data berhasil ditambahkan');
    }

    // Tampilkan form edit
    public function edit($id)
    {
        $kategori = KategoriPengeluaran::findOrFail($id);
        
        // Check if request is from API
        if (request()->wantsJson() || request()->is('api/*')) {
            return response()->json($kategori);
        }
        
        return view('kategori_pengeluaran.edit', compact('kategori'));
    }

    // Update data
    public function update(Request $request, $id)
    {
        $kategori = KategoriPengeluaran::findOrFail($id);
        $kategori->update([
            'nama_kategori' => $request->nama_kategori
        ]);

        // Check if request is from API
        if ($request->wantsJson() || $request->is('api/*')) {
            return response()->json([
                'success' => true,
                'message' => 'Data berhasil diperbarui',
                'data' => $kategori
            ]);
        }

        return redirect('/kategori_pengeluaran')->with('success', 'Data berhasil diperbarui');
    }

    // Hapus data
    public function destroy($id)
    {
        $kategori = KategoriPengeluaran::findOrFail($id);
        $kategori->delete();

        // Check if request is from API
        if (request()->wantsJson() || request()->is('api/*')) {
            return response()->json([
                'success' => true,
                'message' => 'Data berhasil dihapus'
            ]);
        }

        return redirect('/kategori_pengeluaran')->with('success', 'Data berhasil dihapus');
    }
}
