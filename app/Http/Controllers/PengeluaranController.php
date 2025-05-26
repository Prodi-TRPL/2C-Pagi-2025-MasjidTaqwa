<?php

namespace App\Http\Controllers;

use App\Models\Pengeluaran;
use Illuminate\Http\Request;

class PengeluaranController extends Controller
{
    // List pengeluaran dengan pagination 10 per halaman
    public function index()
    {
        $data = Pengeluaran::paginate(10);
        return response()->json($data);
    }

    // Simpan pengeluaran baru
    public function store(Request $request)
    {
        $validated = $request->validate([
            'pengeluaran_id' => 'nullable|string|max:255', // Bisa auto-increment di DB
            'proyek_id' => 'required|integer|exists:proyek,id',
            'penginput_id' => 'required|integer|exists:users,id',
            'kategori_pengeluaran_id' => 'required|integer|exists:kategori_pengeluaran,id',
            'laporan_keuangan_id' => 'required|integer|exists:laporan_keuangan,id',
            'jumlah' => 'required|numeric',
            'tanggal_pengeluaran' => 'required|date',
            'nama_pengeluaran' => 'required|string|max:255',
            'keterangan' => 'nullable|string',
        ]);

        $pengeluaran = Pengeluaran::create($validated);

        return response()->json($pengeluaran, 201);
    }

    // Tampilkan pengeluaran berdasarkan id
    public function show($id)
    {
        $pengeluaran = Pengeluaran::findOrFail($id);
        return response()->json($pengeluaran);
    }

    // Update pengeluaran berdasarkan id
    public function update(Request $request, $id)
    {
        $pengeluaran = Pengeluaran::findOrFail($id);

        $validated = $request->validate([
            'pengeluaran_id' => 'nullable|string|max:255',
            'proyek_id' => 'sometimes|required|integer|exists:proyek,id',
            'penginput_id' => 'sometimes|required|integer|exists:users,id',
            'kategori_pengeluaran_id' => 'sometimes|required|integer|exists:kategori_pengeluaran,id',
            'laporan_keuangan_id' => 'sometimes|required|integer|exists:laporan_keuangan,id',
            'jumlah' => 'sometimes|required|numeric',
            'tanggal_pengeluaran' => 'sometimes|required|date',
            'nama_pengeluaran' => 'sometimes|required|string|max:255',
            'keterangan' => 'nullable|string',
        ]);

        $pengeluaran->update($validated);

        return response()->json($pengeluaran);
    }

    // Hapus pengeluaran berdasarkan id
    public function destroy($id)
    {
        $pengeluaran = Pengeluaran::findOrFail($id);
        $pengeluaran->delete();

        return response()->json(null, 204);
    }
}
