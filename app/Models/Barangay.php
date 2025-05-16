<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Barangay extends Model
{
    protected $guarded = [];

    // Barangay.php
    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function drivers()
    {
        return $this->hasMany(Driver::class);
    }

    public function vehicles()
    {
        return $this->hasMany(Vehicle::class);
    }
}
