<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Driver;
use App\Models\Vehicle;
use Inertia\Inertia;
use App\Models\Barangay;
use Illuminate\Http\Request;

class BarangayController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('barangays/index', [
            'barangays' => Barangay::all()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        Barangay::create($validated);

        return redirect()->back();
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
        ]);

        $barangay = Barangay::findOrFail($id);
        $barangay->update($validated);

        return redirect()->back();
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        Barangay::findOrFail($id)->delete();

        return redirect()->back();
    }


    public function info(string $id)
    {
        $barangay = Barangay::with(['users', 'drivers', 'vehicles'])->findOrFail($id);

        return Inertia::render('barangays/info', [
            'barangay' => $barangay,
            'users' => $barangay->users,
            'drivers' => $barangay->drivers,
            'vehicles' => $barangay->vehicles,
        ]);
    }

    // Admin Users methods
    public function storeAdminUser(Request $request, string $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'is_active' => 'boolean',
        ]);

        $barangay = Barangay::findOrFail($id);
        $user = $barangay->users()->create(array_merge($validated, [
            'user_type' => 'barangay_admin',
            'password' => bcrypt($validated['password']),
            'is_active' => $validated['is_active'] ?? true,
        ]));

        return redirect()->back()->with('users', $barangay->fresh()->users);
    }

    public function updateAdminUser(Request $request, string $barangayId, string $userId)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $userId,
            'password' => 'nullable|string|min:8',
            'is_active' => 'boolean',
        ]);

        $user = User::where('barangay_id', $barangayId)->findOrFail($userId);

        if ($request->password) {
            $validated['password'] = bcrypt($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return redirect()->back()->with('users', Barangay::find($barangayId)->fresh()->users);
    }

    public function destroyAdminUser(string $barangayId, string $userId)
    {
        $user = User::where('barangay_id', $barangayId)->findOrFail($userId);
        $user->delete();

        return redirect()->back()->with('users', Barangay::find($barangayId)->fresh()->users);
    }

    // Driver methods
    public function storeDriver(Request $request, string $id)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'drivers_license_number' => 'required|string|max:255|unique:drivers',
            'contact_number' => 'nullable|string|max:20',
        ]);

        $barangay = Barangay::findOrFail($id);

        // Create user account first
        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => bcrypt($validated['password']),
            'user_type' => 'driver',
            'barangay_id' => $barangay->id,
            'is_active' => true,
        ]);

        // Then create driver with the user_id
        $driver = $barangay->drivers()->create([
            'name' => $validated['name'],
            'drivers_license_number' => $validated['drivers_license_number'],
            'contact_number' => $validated['contact_number'],
            'user_id' => $user->id,
        ]);

        return redirect()->back()->with([
            'drivers' => $barangay->fresh()->drivers,
            'users' => $barangay->fresh()->users,
        ]);
    }

    public function updateDriver(Request $request, string $barangayId, string $driverId)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $request->user_id,
            'password' => 'nullable|string|min:8',
            'drivers_license_number' => 'required|string|max:255|unique:drivers,drivers_license_number,' . $driverId,
            'contact_number' => 'nullable|string|max:20',
        ]);

        $driver = Driver::where('barangay_id', $barangayId)->findOrFail($driverId);

        // Update user account
        $userData = [
            'name' => $validated['name'],
            'email' => $validated['email'],
        ];

        if ($request->password) {
            $userData['password'] = bcrypt($validated['password']);
        }

        if ($driver->user) {
            $driver->user->update($userData);
        }

        // Update driver
        $driver->update([
            'name' => $validated['name'],
            'drivers_license_number' => $validated['drivers_license_number'],
            'contact_number' => $validated['contact_number'],
        ]);

        return redirect()->back()->with([
            'drivers' => Barangay::find($barangayId)->fresh()->drivers,
            'users' => Barangay::find($barangayId)->fresh()->users,
        ]);
    }

    public function destroyDriver(string $barangayId, string $driverId)
    {
        $driver = Driver::where('barangay_id', $barangayId)->findOrFail($driverId);
        $driver->delete();

        return redirect()->back()->with('drivers', Barangay::find($barangayId)->fresh()->drivers);
    }

    // Vehicle methods
    public function storeVehicle(Request $request, string $id)
    {
        $validated = $request->validate([
            'plate_number' => 'required|string|max:50|unique:vehicles',
            'vehicle_type' => 'required|string|max:50',
            'brand' => 'nullable|string|max:100',
            'model' => 'nullable|string|max:100',
            'code' => 'nullable|string|max:100',
        ]);

        $barangay = Barangay::findOrFail($id);
        $vehicle = $barangay->vehicles()->create($validated);

        return redirect()->back()->with('vehicles', $barangay->fresh()->vehicles);
    }

    public function updateVehicle(Request $request, string $barangayId, string $vehicleId)
    {
        $validated = $request->validate([
            'plate_number' => 'required|string|max:50|unique:vehicles,plate_number,' . $vehicleId,
            'vehicle_type' => 'required|string|max:50',
            'brand' => 'nullable|string|max:100',
            'model' => 'nullable|string|max:100',
        ]);

        $vehicle = Vehicle::where('barangay_id', $barangayId)->findOrFail($vehicleId);
        $vehicle->update($validated);

        return redirect()->back()->with('vehicles', Barangay::find($barangayId)->fresh()->vehicles);
    }

    public function destroyVehicle(string $barangayId, string $vehicleId)
    {
        $vehicle = Vehicle::where('barangay_id', $barangayId)->findOrFail($vehicleId);
        $vehicle->delete();

        return redirect()->back()->with('vehicles', Barangay::find($barangayId)->fresh()->vehicles);
    }
}
