<?php

use Inertia\Inertia;
use App\Models\IncidentReport;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DriverController;
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\BarangayController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\TwoFactorController;
use App\Http\Controllers\IncidentReportController;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::middleware('auth')->group(function () {
    Route::get('/2fa/verify', [TwoFactorController::class, 'show'])->name('2fa.show');
    Route::post('/2fa/verify', [TwoFactorController::class, 'verify'])->name('2fa.verify');
});

Route::middleware(['auth', 'verified', 'twofactor'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('barangays', BarangayController::class);
    Route::get('barangays/{id}/info', [BarangayController::class, 'info'])->name('barangays.info');

    // Admin Users
    Route::post('barangay/{id}/user', [BarangayController::class, 'storeAdminUser'])->name('barangay.user.store');
    Route::put('barangay/{barangayId}/user/{userId}', [BarangayController::class, 'updateAdminUser'])->name('barangay.user.update');
    Route::delete('barangay/{barangayId}/user/{userId}', [BarangayController::class, 'destroyAdminUser'])->name('barangay.user.destroy');

    // Drivers
    Route::post('barangay/{id}/driver', [BarangayController::class, 'storeDriver'])->name('barangay.driver.store');
    Route::put('barangay/{barangayId}/driver/{driverId}', [BarangayController::class, 'updateDriver'])->name('barangay.driver.update');
    Route::delete('barangay/{barangayId}/driver/{driverId}', [BarangayController::class, 'destroyDriver'])->name('barangay.driver.destroy');

    // Vehicles
    Route::post('barangay/{id}/vehicle', [BarangayController::class, 'storeVehicle'])->name('barangay.vehicle.store');
    Route::put('barangay/{barangayId}/vehicle/{vehicleId}', [BarangayController::class, 'updateVehicle'])->name('barangay.vehicle.update');
    Route::delete('barangay/{barangayId}/vehicle/{vehicleId}', [BarangayController::class, 'destroyVehicle'])->name('barangay.vehicle.destroy');

    Route::resource('drivers', DriverController::class);
    Route::resource('vehicles', VehicleController::class);
    Route::get('vehicles/{id}/location', [VehicleController::class, 'location'])->name('vehicles.location');
    Route::get('vehicles/{id}/get-location', [VehicleController::class, 'getLocations'])->name('vehicles.getLocations');

    Route::resource('incident-reports', IncidentReportController::class);



});

Route::get('submit-incident-report', [IncidentReportController::class, 'getIncidentReportPage'])->name('submit-incident-report');
Route::post('submit-incident-report', [IncidentReportController::class, 'submitIncidentReport'])->name('submit-incident-report.store');

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
