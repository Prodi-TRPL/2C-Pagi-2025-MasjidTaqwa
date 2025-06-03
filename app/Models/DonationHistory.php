<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DonationHistory extends Model
{
   // database/migrations/xxxx_xx_xx_create_donations_table.php
public function up()
{
    Schema::create('donations', function (Blueprint $table) {
        $table->id();
        $table->string('donatur');
        $table->date('tanggal');
        $table->decimal('jumlah', 15, 2);
        $table->string('metode_pembayaran');
        $table->timestamps();
    });
}

}
