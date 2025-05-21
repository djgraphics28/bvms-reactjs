@component('mail::message')
# 🚨 New Incident Report

**Title:** {{ $incident->title }}
**Description:** {{ $incident->description }}
**Severity:** {{ ucfirst($incident->severity) }}
**Status:** {{ ucfirst($incident->status) }}
**Creator:** {{ $incident->creator }}
**Location:** Latitude {{ $incident->latitude }}, Longitude {{ $incident->longitude }}

@if($incident->image_path)
@component('mail::button', ['url' => asset('storage/' . $incident->image_path)])
View Attached Image
@endcomponent
@endif

Thanks,
{{ config('app.name') }}
@endcomponent
