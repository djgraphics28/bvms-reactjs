import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { GoogleMap, LoadScript, Polyline, Marker } from '@react-google-maps/api';
import { useState, useEffect } from 'react';
import axios from 'axios';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Vehicles',
        href: '/vehicles',
    },
    {
        title: 'Real-Time Location',
        href: '/vehicles/location',
    }
];

const GOOGLE_MAPS_API_KEY = 'AIzaSyC_WZ0T_FCfAV_G1yfuBGozFa2zOX9l82c';
interface VehicleLocation {
    id: number;
    latitude: number;
    longitude: number;
    timestamp: string;
    vehicle_id: number;
}

interface Props {
    vehicle: {
        id: number;
        name: string;
    };
}

export default function Location({ vehicle }: Props) {
    const [locations, setLocations] = useState<VehicleLocation[]>([]);
    const [center, setCenter] = useState({ lat: 15.9061, lng: 120.5853 }); // Villasis

    const mapContainerStyle = {
        width: '100%',
        height: '100%'
    };

    const options = {
        strokeColor: '#FF0000',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: '#FF0000',
        fillOpacity: 0.35,
        clickable: false,
        draggable: false,
        editable: false,
        visible: true,
        zIndex: 1
    };

    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const response = await axios.get(`/vehicles/${vehicle.id}/get-location`);
                setLocations(response.data);

                // Set center to the latest location if available
                if (response.data.length > 0) {
                    const latest = response.data[response.data.length - 1];
                    setCenter({ lat: latest.latitude, lng: latest.longitude });
                }
            } catch (error) {
                console.error('Error fetching locations:', error);
            }
        };

        fetchLocations();
        const interval = setInterval(fetchLocations, 5000); // Update every 5 seconds

        return () => clearInterval(interval);
    }, [vehicle.id]);

    const path = locations.map(location => ({
        lat: location.latitude,
        lng: location.longitude
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Real-Time Location" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border bg-white dark:bg-gray-800 p-4 shadow-sm">
                        <div className="flex flex-col h-full justify-between">
                            <div className="w-full h-32 mb-4">
                                <img
                                    src="/placeholder-vehicle.png"
                                    alt={`${vehicle.brand} ${vehicle.model}`}
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">Vehicle Description</div>
                            <div className="text-xl font-semibold text-gray-900 dark:text-white">
                                {vehicle.plate_number} • {vehicle.brand} {vehicle.model} • {vehicle.color}
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                <span className="text-sm text-green-600 dark:text-green-400">Active</span>
                            </div>
                        </div>
                    </div>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border bg-white dark:bg-gray-800 p-4 shadow-sm">
                        <div className="flex flex-col h-full justify-between">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Current Location</div>
                            <div className="text-xl font-semibold text-gray-900 dark:text-white">
                                {locations.length > 0 ?
                                    `${locations[locations.length - 1].latitude.toFixed(4)}, ${locations[locations.length - 1].longitude.toFixed(4)}`
                                    : 'No Data'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {locations.length > 0 ?
                                    new Date(locations[locations.length - 1].timestamp).toLocaleTimeString()
                                    : '--:--'}
                            </div>
                        </div>
                    </div>
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border bg-white dark:bg-gray-800 p-4 shadow-sm">
                        <div className="flex flex-col h-full justify-between">
                            <div className="text-sm text-gray-500 dark:text-gray-400">Trip Statistics</div>
                            <div>
                                <div className="text-xl font-semibold text-gray-900 dark:text-white">{locations.length}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">Total Waypoints</div>
                            </div>
                            <div className="text-sm text-blue-500">View Details →</div>
                        </div>
                    </div>
                </div>
                <div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min">
                    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
                        <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            center={center}
                            zoom={18}
                        >
                            <Polyline
                                path={path}
                                options={{
                                    strokeColor: '#0000FF',
                                    strokeOpacity: 1,
                                    strokeWeight: 4,
                                    fillColor: '#0000FF',
                                    fillOpacity: 0.35,
                                    clickable: false,
                                    draggable: false,
                                    editable: false,
                                    visible: true,
                                    zIndex: 1
                                }}
                            />
                            {/* Current position marker with animation */}
                            {locations.length > 0 && (
                                <Marker
                                    position={{
                                        lat: locations[locations.length - 1].latitude,
                                        lng: locations[locations.length - 1].longitude
                                    }}
                                    icon={{
                                        url: "https://maps.google.com/mapfiles/kml/shapes/cabs.png",
                                        scaledSize: new window.google.maps.Size(32, 32)
                                    }}
                                    animation={window.google.maps.Animation.BOUNCE}
                                />
                            )}
                        </GoogleMap>
                    </LoadScript>
                </div>
            </div>
        </AppLayout>
    );
}
