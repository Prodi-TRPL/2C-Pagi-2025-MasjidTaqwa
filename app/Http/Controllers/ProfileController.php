<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
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
            'profile_image' => $user->profile_image ?? '/img/user/admin.jpeg'
        ]);
    }
}