<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DonationSummary extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'v_donation_summary';

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'donation_month';

    /**
     * The "type" of the primary key ID.
     *
     * @var string
     */
    protected $keyType = 'string';

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

    /**
     * Get the formatted total accepted with currency
     */
    public function getFormattedTotalAcceptedAttribute()
    {
        return 'Rp ' . number_format($this->total_accepted, 0, ',', '.');
    }

    /**
     * Get the formatted total pending with currency
     */
    public function getFormattedTotalPendingAttribute()
    {
        return 'Rp ' . number_format($this->total_pending, 0, ',', '.');
    }

    /**
     * Get month name from donation_month
     */
    public function getMonthNameAttribute()
    {
        $date = \DateTime::createFromFormat('Y-m', $this->donation_month);
        return $date ? $date->format('F Y') : $this->donation_month;
    }
}
