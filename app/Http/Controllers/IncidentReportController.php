<?php

namespace App\Http\Controllers;

use App\Models\Incident;
use App\Models\Barangay;
use App\Models\IncidentReport;
use Inertia\Inertia;
use Illuminate\Http\Request;
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
        return Inertia::render('incidents/show', [
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
}
