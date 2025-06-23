<?php

namespace App\Http\Controllers;

use App\Models\ProyekPembangunan;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProyekPembangunanController extends Controller
{
    public function index()
    {
        $proyeks = ProyekPembangunan::all();
        return response()->json($proyeks);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama_item' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'target_dana' => 'required|numeric|min:0',
        ]);

        $proyek = new ProyekPembangunan();
        $proyek->proyek_id = (string) Str::uuid();
        $proyek->admin_id = $request->user()->id ?? null; // sesuaikan jika ada admin login
        $proyek->nama_item = $request->nama_item;
        $proyek->deskripsi = $request->deskripsi;
        $proyek->target_dana = $request->target_dana;
        $proyek->dana_terkumpul = 0;
        $proyek->created_at = now();
        $proyek->save();

        return response()->json($proyek, 201);
    }

    public function show($id)
    {
        $proyek = ProyekPembangunan::find($id);
        if (!$proyek) {
            return response()->json(['message' => 'Proyek tidak ditemukan'], 404);
        }
        return response()->json($proyek);
    }

    public function update(Request $request, $id)
    {
        $proyek = ProyekPembangunan::find($id);
        if (!$proyek) {
            return response()->json(['message' => 'Proyek tidak ditemukan'], 404);
        }

        $request->validate([
            'nama_item' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'target_dana' => 'required|numeric|min:0',
        ]);

        $proyek->nama_item = $request->nama_item;
        $proyek->deskripsi = $request->deskripsi;
        $proyek->target_dana = $request->target_dana;
        $proyek->save();

        return response()->json($proyek);
    }

    public function destroy($id)
    {
        $proyek = ProyekPembangunan::find($id);
        if (!$proyek) {
            return response()->json(['message' => 'Proyek tidak ditemukan'], 404);
        }
        $proyek->delete();
        return response()->json(['message' => 'Proyek berhasil dihapus']);
    }
}
