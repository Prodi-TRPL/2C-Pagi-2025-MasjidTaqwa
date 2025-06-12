<?php

// app/Http/Controllers/Api/DonationController.php
namespace App\Http\Controllers;

use App\Http\Controllers;
use App\Models\DonationHistory;

class DonationController extends Controller
{
    public function index()
    {
        return response()->json(DonationHistory::all());
    }
}
