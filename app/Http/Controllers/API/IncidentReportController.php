<?php

namespace App\Http\Controllers\API;

use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Models\IncidentReport;
use App\Http\Controllers\Controller;

class IncidentReportController extends Controller
{
    public function submitIncidentReport(Request $request)
    {
        $validated = $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'status' => 'in:pending,in_progress,resolved,closed',
            'severity' => 'in:low,medium,high,critical',
            'creator' => 'required|string|max:255',
            'image' => 'nullable|image|max:2048',
            'barangay_id' => 'nullable|exists:barangays,id',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $image = $request->file('image');
            $filename = Str::uuid() . '.' . $image->getClientOriginalExtension();
            $imagePath = $image->storeAs('incident_images', $filename, 'public');
        }

        $incident = IncidentReport::create([
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'title' => $validated['title'],
            'description' => $validated['description'],
            'status' => $validated['status'] ?? 'pending',
            'severity' => $validated['severity'] ?? 'low',
            'creator' => $validated['creator'],
            'image_path' => $imagePath,
            'barangay_id' => $validated['barangay_id'] ?? null,
        ]);

        return response()->json([
            'message' => 'Incident report submitted successfully.',
            'data' => $incident
        ], 201);
    }
}
