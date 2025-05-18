<?php

namespace App\Http\Controllers\API;

use App\Models\Vehicle;
use App\Models\Location;
use Illuminate\Http\Request;
use App\Models\VehicleLocation;
use App\Http\Controllers\Controller;

class LocationController extends Controller
{
    public function storeLocation(Request $request)
    {
        // Validate the vehicle ID and location data from Arduino
        $vehicle = Vehicle::where('code', $request->code)->first();

        if (!$vehicle) {
            return response()->json([
                'success' => false,
                'message' => 'Vehicle not found'
            ], 404);
        }

        try {
            $vehicle->location()->create([
                'latitude' => $request->latitude,
                'longitude' => $request->longitude
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Location stored successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error storing location'
            ], 500);
        }
    }

    public function getLocations(string $id)
    {
        // Validate the vehicle ID
        $vehicle = Vehicle::findOrFail($id);

        // Get the locations for the vehicle
        $locations = $vehicle->location()->get();

        return response()->json([
            'success' => true,
            'data' => $locations
        ]);
    }
}
