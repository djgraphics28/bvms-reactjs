<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Barangay;
use App\Models\Incident;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Models\IncidentReport;
use Illuminate\Support\Facades\Storage;

class IncidentReportController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('incidents/index', [
            'incidents' => IncidentReport::with('barangay')->latest()->get(),
            'barangays' => Barangay::all()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'status' => 'required|in:pending,in_progress,resolved,closed',
            'severity' => 'required|in:low,medium,high,critical',
            'creator' => 'required|string|max:255',
            'barangay_id' => 'required|exists:barangays,id',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $validated['image_path'] = $request->file('image')->store('incidents', 'public');
        }

        IncidentReport::create($validated);

        return redirect()->back()->with('success', 'Incident created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        return Inertia::render('incidents/track-location', [
            'incident' => IncidentReport::with('barangay')->findOrFail($id)
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $incident = IncidentReport::findOrFail($id);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'status' => 'required|in:pending,in_progress,resolved,closed',
            'severity' => 'required|in:low,medium,high,critical',
            'creator' => 'required|string|max:255',
            'barangay_id' => 'required|exists:barangays,id',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($incident->image_path) {
                Storage::disk('public')->delete($incident->image_path);
            }
            $validated['image_path'] = $request->file('image')->store('incidents', 'public');
        }

        $incident->update($validated);

        return redirect()->back()->with('success', 'Incident updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $incident = IncidentReport::findOrFail($id);

        // Delete associated image if exists
        if ($incident->image_path) {
            Storage::disk('public')->delete($incident->image_path);
        }

        $incident->delete();

        return redirect()->back()->with('success', 'Incident deleted successfully.');
    }

    /**
     * Filter incidents by barangay and status
     */
    public function filter(Request $request)
    {
        $query = IncidentReport::with('barangay');

        if ($request->barangay_id) {
            $query->where('barangay_id', $request->barangay_id);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        return response()->json([
            'incidents' => $query->latest()->get()
        ]);
    }

    public function getIncidentReportPage()
    {
        return Inertia::render('submit-incident-report', [
            'barangays' => Barangay::all()
        ]);
    }

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

        IncidentReport::create([
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
            'message' => 'Incident report submitted successfully.'
        ], 201);
    }
}
