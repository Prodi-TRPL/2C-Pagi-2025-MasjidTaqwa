<?php

namespace App\Http\Controllers;

use App\Models\ProyekPembangunan;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use App\Traits\LogsActivity;

class ProyekPembangunanController extends Controller
{
    use LogsActivity;
    
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
            'gambar' => 'nullable|image|max:2048', // max 2MB
        ]);

        try {
            $proyek = new ProyekPembangunan();
            // Generate UUID for proyek_id
            $proyek->proyek_id = (string) Str::uuid();
            $proyek->nama_item = $request->nama_item;
            $proyek->deskripsi = $request->deskripsi;
            $proyek->target_dana = $request->target_dana;
            
            // Handle image upload if provided
            if ($request->hasFile('gambar')) {
                $image = $request->file('gambar');
                $imageName = Str::slug($request->nama_item) . '-' . time() . '.' . $image->getClientOriginalExtension();
                
                // Create image manager with GD driver
                $manager = new ImageManager(new Driver());
                
                // Process the image (resize and compress)
                $img = $manager->read($image);
                $img->cover(800, 600);
                
                // Save the processed image
                $path = 'proyek/' . $imageName;
                Storage::disk('public')->put($path, $img->toJpeg(80));
                
                $proyek->gambar = $path;
            }
            
            $proyek->save();
            
            // Log activity
            $this->logActivity('tambah_proyek', 'Menambahkan proyek pembangunan baru: ' . $proyek->nama_item);
            
            return response()->json($proyek);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
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
        $request->validate([
            'nama_item' => 'required|string|max:255',
            'deskripsi' => 'required|string',
            'target_dana' => 'required|numeric|min:0',
            'gambar' => 'nullable|image|max:2048', // max 2MB
        ]);

        try {
            $proyek = ProyekPembangunan::findOrFail($id);
            $oldName = $proyek->nama_item;
            
            $proyek->nama_item = $request->nama_item;
            $proyek->deskripsi = $request->deskripsi;
            $proyek->target_dana = $request->target_dana;
            
            // Handle image upload if provided
            if ($request->hasFile('gambar')) {
                // Delete old image if exists
                if ($proyek->gambar) {
                    Storage::disk('public')->delete($proyek->gambar);
                }
                
                $image = $request->file('gambar');
                $imageName = Str::slug($request->nama_item) . '-' . time() . '.' . $image->getClientOriginalExtension();
                
                // Create image manager with GD driver
                $manager = new ImageManager(new Driver());
                
                // Process the image (resize and compress)
                $img = $manager->read($image);
                $img->cover(800, 600);
                
                // Save the processed image
                $path = 'proyek/' . $imageName;
                Storage::disk('public')->put($path, $img->toJpeg(80));
                
                $proyek->gambar = $path;
            }
            
            $proyek->save();
            
            // Log activity
            $this->logActivity('edit_proyek', 'Mengubah proyek pembangunan: ' . $oldName . ' menjadi ' . $proyek->nama_item);
            
            return response()->json($proyek);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $proyek = ProyekPembangunan::findOrFail($id);
            $proyekName = $proyek->nama_item;
            
            // Delete image if exists
            if ($proyek->gambar) {
                Storage::disk('public')->delete($proyek->gambar);
            }
            
            $proyek->delete();
            
            // Log activity
            $this->logActivity('hapus_proyek', 'Menghapus proyek pembangunan: ' . $proyekName);
            
            return response()->json(['message' => 'Proyek berhasil dihapus']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error: ' . $e->getMessage()], 500);
        }
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
