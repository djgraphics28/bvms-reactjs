<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Driver;
use App\Models\Barangay;
use Illuminate\Http\Request;

class DriverController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('drivers/index', [
            'drivers' => Driver::with(['barangay', 'user'])->get(),
            'barangays' => Barangay::all(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'drivers_license_number' => 'required|string|max:255',
            'contact_number' => 'nullable|string|max:255',
            'user_id' => 'nullable|exists:users,id',
            'barangay_id' => 'required|exists:barangays,id',
        ]);

        Driver::create($validated);

        return redirect()->back();
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'drivers_license_number' => 'required|string|max:255',
            'contact_number' => 'nullable|string|max:255',
            'user_id' => 'nullable|exists:users,id',
            'barangay_id' => 'required|exists:barangays,id',
        ]);

        $driver = Driver::findOrFail($id);
        $driver->update($validated);

        return redirect()->back();
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        Driver::findOrFail($id)->delete();

        return redirect()->back();
    }
}
