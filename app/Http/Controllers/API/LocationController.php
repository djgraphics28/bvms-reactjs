<?php

namespace App\Http\Controllers\API;

use App\Models\Vehicle;
use App\Models\Location;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class LocationController extends Controller
{
    public function getLocations(string $id)
    {
        // Validate the vehicle ID
        $vehicle = Vehicle::findOrFail($id);

        // Get the locations for the vehicle
        $locations = $vehicle->location()->get();

        return response()->json($locations);
    }
}
