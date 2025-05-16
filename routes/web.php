<?php

use App\Http\Controllers\BarangayController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

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

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
