import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { GoogleMap, LoadScript, Polyline, Marker } from '@react-google-maps/api';
import { useState, useEffect, useCallback } from 'react';
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
    latitude: string;
    longitude: string;
    created_at: string;
    vehicle_id: number;
}

interface Vehicle {
    id: number;
    plate_number: string;
    brand: string;
    model: string;
    color: string;
    name: string;
}

interface Props {
    vehicle: Vehicle;
}

export default function Location({ vehicle }: Props) {
    const [locations, setLocations] = useState<VehicleLocation[]>([]);
    const [center, setCenter] = useState({ lat: 15.9061, lng: 120.5853 }); // Villasis
    const [mapError, setMapError] = useState<string | null>(null);
    const [isMapLoaded, setIsMapLoaded] = useState(false);
    const [map, setMap] = useState<google.maps.Map | null>(null);

    const mapContainerStyle = {
        width: '100%',
        height: '100%'
    };

    const fetchLocations = useCallback(async () => {
        try {
            const response = await axios.get(`/vehicles/${vehicle.id}/get-location`);
            const data: VehicleLocation[] = response.data;
            setLocations(data);

            // Set center to the latest location if available
            if (data.length > 0) {
                const latest = data[data.length - 1];
                const newCenter = {
                    lat: parseFloat(latest.latitude),
                    lng: parseFloat(latest.longitude)
                };
                setCenter(newCenter);

                // Pan to new location if map is already loaded
                if (map) {
                    map.panTo(newCenter);
                }
            }
        } catch (error) {
            console.error('Error fetching locations:', error);
            setMapError('Failed to fetch location data');
        }
    }, [vehicle.id, map]);

    useEffect(() => {
        fetchLocations();
        const interval = setInterval(fetchLocations, 5000); // Update every 5 seconds

        return () => clearInterval(interval);
    }, [fetchLocations]);

    const path = locations.map(location => ({
        lat: parseFloat(location.latitude),
        lng: parseFloat(location.longitude)
    }));

    const latestLocation = locations.length > 0 ? locations[locations.length - 1] : null;

    const onMapLoad = useCallback((map: google.maps.Map) => {
        setMap(map);
    }, []);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Real-Time Location" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="border-sidebar-border/70 dark:border-sidebar-border relative aspect-video overflow-hidden rounded-xl border bg-white dark:bg-gray-800 p-4 shadow-sm">
                        <div className="flex flex-col h-full justify-between">
                            <div className="w-full h-32 mb-4">
                                {/* <img
                                    src="/placeholder-vehicle.png"
                                    alt={`${vehicle.brand} ${vehicle.model}`}
                                    className="w-full h-full object-cover rounded-lg"
                                /> */}
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
                                {latestLocation ?
                                    `${parseFloat(latestLocation.latitude).toFixed(6)}, ${parseFloat(latestLocation.longitude).toFixed(6)}`
                                    : 'No Data'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {latestLocation ?
                                    new Date(latestLocation.created_at).toLocaleString()
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
                    {mapError ? (
                        <div className="flex items-center justify-center h-full text-red-500">
                            {mapError}
                        </div>
                    ) : (
                        <LoadScript
                            googleMapsApiKey={GOOGLE_MAPS_API_KEY}
                            onLoad={() => setIsMapLoaded(true)}
                        >
                            {isMapLoaded ? (
                                <GoogleMap
                                    mapContainerStyle={mapContainerStyle}
                                    center={center}
                                    zoom={18}
                                    options={{
                                        streetViewControl: true,
                                        mapTypeControl: false,
                                        fullscreenControl: false
                                    }}
                                    onLoad={onMapLoad}
                                    onUnmount={onUnmount}
                                >
                                    <Polyline
                                        path={path}
                                        options={{
                                            strokeColor: '#0000FF',
                                            strokeOpacity: 1,
                                            strokeWeight: 4,
                                            clickable: false,
                                            draggable: false,
                                            editable: false,
                                            visible: true,
                                            zIndex: 1
                                        }}
                                    />
                                    {latestLocation && (
                                        <Marker
                                            position={{
                                                lat: parseFloat(latestLocation.latitude),
                                                lng: parseFloat(latestLocation.longitude)
                                            }}
                                            icon={{
                                                url: "https://maps.google.com/mapfiles/kml/shapes/cabs.png",
                                                scaledSize: new window.google.maps.Size(32, 32)
                                            }}
                                            animation={window.google.maps.Animation.BOUNCE}
                                        />
                                    )}
                                </GoogleMap>
                            ) : (
                                <div className="flex items-center justify-center h-full">
                                    <div className="animate-pulse text-gray-500">Loading map...</div>
                                </div>
                            )}
                        </LoadScript>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
