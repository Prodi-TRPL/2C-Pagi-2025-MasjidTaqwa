<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ProfileController extends Controller
{
    /**
     * Menampilkan data profil donatur yang sedang login.
     */
    public function getProfile(Request $request)
    {
        $user = $request->user();
        
        if (!$user || $user->role !== 'donatur') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json([
            'nama' => $user->nama,
            'email' => $user->email,
            'nomor_hp' => $user->nomor_hp,
            'created_at' => $user->created_at,
            'alamat' => $user->alamat ?? 'Jl. Kenanga No. 15, Bandung, Jawa Barat',
            'profile_image' => $user->profile_image ?? '/img/user/admin.jpeg',
        ]);
    }

    /**
     * Memperbarui nama donatur.
     */
    public function update(Request $request)
    {
        $user = $request->user();

        if (!$user || $user->role !== 'donatur') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'nama' => 'required|string|min:3|max:255',
        ]);

        $user->nama = $validated['nama'];
        $user->save();

        return response()->json([
            'message' => 'Profil berhasil diperbarui',
            'user' => [
                'nama' => $user->nama,
                'email' => $user->email,
            ],
        ]);
    }
}
