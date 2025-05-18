<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\User;
use App\Models\Vehicle;
use App\Models\Driver;
use App\Models\Barangay;
use App\Models\IncidentReport;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('dashboard', [
            'totalAdmins' => User::where('user_type', 'admin')->count(),
            'totalVehicles' => Vehicle::count(),
            'totalDrivers' => Driver::count(),
            'totalBarangays' => Barangay::count(),
            'recentIncidents' => IncidentReport::with('barangay')
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->map(function ($incident) {
                    return [
                        'id' => $incident->id,
                        'title' => $incident->title,
                        'status' => $incident->status,
                        'severity' => $incident->severity,
                        'created_at' => $incident->created_at,
                        'barangay' => [
                            'name' => $incident->barangay->name ?? 'N/A',
                        ],
                    ];
                }),
        ]);
    }
}
