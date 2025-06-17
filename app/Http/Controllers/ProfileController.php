<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

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

    public function updatePassword(Request $request)
    {
        $user = $request->user();

        if (!$user || $user->role !== 'donatur') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:8|confirmed',
        ]);

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Password lama tidak sesuai.'],
            ]);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json(['message' => 'Password berhasil diubah']);
    }
}
