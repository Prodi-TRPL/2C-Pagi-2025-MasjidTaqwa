<?php

namespace App\Http\Controllers;

use App\Models\ProyekPembangunan;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;

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
            'gambar' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:1024', // 1MB max
        ]);

        $proyek = new ProyekPembangunan();
        $proyek->proyek_id = (string) Str::uuid();
        $proyek->admin_id = $request->user()->id ?? null; // sesuaikan jika ada admin login
        $proyek->nama_item = $request->nama_item;
        $proyek->deskripsi = $request->deskripsi;
        $proyek->target_dana = $request->target_dana;
        $proyek->dana_terkumpul = 0;
        $proyek->created_at = now();
        
        // Handle image upload if present
        if ($request->hasFile('gambar') && $request->file('gambar')->isValid()) {
            $imagePath = $this->processImage($request->file('gambar'));
            $proyek->gambar = $imagePath;
        }
        
        $proyek->save();

        return response()->json($proyek, 201);
    }

    public function show($id)
    {
        $proyek = ProyekPembangunan::with(['pengeluaran', 'pengeluaran.kategori'])->find($id);
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
            'gambar' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:1024', // 1MB max
        ]);

        $proyek->nama_item = $request->nama_item;
        $proyek->deskripsi = $request->deskripsi;
        $proyek->target_dana = $request->target_dana;
        
        // Handle image upload if present
        if ($request->hasFile('gambar') && $request->file('gambar')->isValid()) {
            // Delete old image if it exists
            if ($proyek->gambar) {
                Storage::disk('public')->delete($proyek->gambar);
            }
            
            $imagePath = $this->processImage($request->file('gambar'));
            $proyek->gambar = $imagePath;
        }
        
        $proyek->save();

        return response()->json($proyek);
    }

    public function destroy($id)
    {
        $proyek = ProyekPembangunan::find($id);
        if (!$proyek) {
            return response()->json(['message' => 'Proyek tidak ditemukan'], 404);
        }
        
        // Delete image if it exists
        if ($proyek->gambar) {
            Storage::disk('public')->delete($proyek->gambar);
        }
        
        $proyek->delete();
        return response()->json(['message' => 'Proyek berhasil dihapus']);
    }
    
    /**
     * Process and save the uploaded image
     *
     * @param \Illuminate\Http\UploadedFile $image
     * @return string
     */
    private function processImage($image)
    {
        // Generate a unique filename
        $filename = 'proyek_' . Str::random(10) . '_' . time() . '.' . $image->getClientOriginalExtension();
        $path = 'progress/' . $filename;
        
        // Create image manager with GD driver
        $manager = new ImageManager(new Driver());
        
        // Load image
        $img = $manager->read($image);
        
        // Resize to width 800px while maintaining aspect ratio
        $img->scale(width: 800);
        
        // Save the processed image
        Storage::disk('public')->put($path, $img->toJpeg());
        
        return $path;
    }
}
