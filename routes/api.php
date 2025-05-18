<?php

use App\Http\Controllers\API\LocationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/vehicles/{id}/get-location', [LocationController::class, 'getLocations'])->name('api.vehicles.get-location');
//store Location
Route::post('/store-location', [LocationController::class, 'storeLocation'])->name('vehicles.location.store');
