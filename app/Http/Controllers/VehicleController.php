<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Vehicle;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class VehicleController extends Controller
{
    public function index()
    {
        $vehicles = Vehicle::with('barangay')->get();
        $barangays = \App\Models\Barangay::all();

        return Inertia::render('vehicles/index', [
            'vehicles' => $vehicles,
            'barangays' => $barangays
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|max:50|unique:vehicles',
            'plate_number' => 'required|string|max:50|unique:vehicles',
            'brand' => 'nullable|string|max:100',
            'model' => 'nullable|string|max:100',
            'color' => 'nullable|string|max:50',
            'year' => 'nullable|string|max:4',
            'chassis_number' => 'nullable|string|max:100|unique:vehicles',
            'engine_number' => 'nullable|string|max:100|unique:vehicles',
            'vehicle_type' => 'nullable|string|max:50',
            'barangay_id' => 'required|exists:barangays,id',
        ]);

        $vehicle = Vehicle::create($validated);

        return redirect()->back()
            ->with('success', 'Vehicle created successfully');
    }

    public function update(Request $request, string $id)
    {
        $vehicle = Vehicle::findOrFail($id);

        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50', Rule::unique('vehicles')->ignore($id)],
            'plate_number' => ['required', 'string', 'max:50', Rule::unique('vehicles')->ignore($id)],
            'brand' => 'nullable|string|max:100',
            'model' => 'nullable|string|max:100',
            'color' => 'nullable|string|max:50',
            'year' => 'nullable|string|max:4',
            'chassis_number' => ['nullable', 'string', 'max:100', Rule::unique('vehicles')->ignore($id)],
            'engine_number' => ['nullable', 'string', 'max:100', Rule::unique('vehicles')->ignore($id)],
            'vehicle_type' => 'nullable|string|max:50',
            'barangay_id' => 'required|exists:barangays,id',
        ]);

        $vehicle->update($validated);

        return redirect()->back()
            ->with('success', 'Vehicle updated successfully');
    }

    public function destroy(string $id)
    {
        $vehicle = Vehicle::findOrFail($id);
        $vehicle->delete();

        return redirect()->back()
            ->with('success', 'Vehicle deleted successfully');
    }

    public function location(string $id)
    {
        $vehicle = Vehicle::with('barangay')->findOrFail($id);

        return Inertia::render('vehicles/location', [
            'vehicle' => $vehicle
        ]);
    }

    public function getLocations(string $id)
    {
        // Validate the vehicle ID
        $vehicle = Vehicle::findOrFail($id);

        // Get the locations for the vehicle filtered to today only
        $locations = $vehicle->location()
            ->whereDate('created_at', today())
            ->get();

        return response()->json($locations);
    }
}
