import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, Polyline, DirectionsRenderer } from '@react-google-maps/api';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { type BreadcrumbItem } from '@/types';

interface Incident {
  latitude: string;
  longitude: string;
  title: string;
  description: string;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Incidents',
        href: '/incident-reports',
    },
     {
        title: 'Track Location',
        href: '/track-location',
    }
];

interface Props {
  incident: Incident;
}

const GOOGLE_MAPS_API_KEY = 'AIzaSyC_WZ0T_FCfAV_G1yfuBGozFa2zOX9l82c';

const mapContainerStyle = {
  width: '100%',
  height: '100vh',
};

const polylineOptions = {
  strokeColor: '#FF0000',
  strokeOpacity: 1.0,
  strokeWeight: 3,
};

interface LatLngLiteral {
  lat: number;
  lng: number;
}

const MapComponent: React.FC<Props> = ({ incident }) => {
  const [userLocation, setUserLocation] = useState<LatLngLiteral | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [distance, setDistance] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [path, setPath] = useState<LatLngLiteral[]>([]);
  const [currentPosition, setCurrentPosition] = useState<LatLngLiteral | null>(null);
  const [progressPath, setProgressPath] = useState<LatLngLiteral[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  const incidentLocation = {
    lat: parseFloat(incident.latitude),
    lng: parseFloat(incident.longitude),
  };

  // Get user's current location and start watching position
  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(newPosition);
        setCurrentPosition(newPosition);
        setProgressPath(prev => [...prev, newPosition]);
      },
      (error) => {
        console.error('Error tracking location:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // Calculate route and update in real-time
  useEffect(() => {
    if (currentPosition && mapLoaded) {
      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        {
          origin: currentPosition,
          destination: incidentLocation,
          travelMode: google.maps.TravelMode.DRIVING,
          provideRouteAlternatives: false,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            setDirections(result);
            const leg = result.routes[0].legs[0];
            setDistance(leg.distance?.text || '');
            setDuration(leg.duration?.text || '');

            // Extract detailed path including all steps
            const pathPoints: LatLngLiteral[] = [];
            result.routes[0].overview_path.forEach(point => {
              pathPoints.push({
                lat: point.lat(),
                lng: point.lng()
              });
            });
            setPath(pathPoints);
          } else {
            console.error('Directions request failed:', status);
          }
        }
      );
    }
  }, [currentPosition, incidentLocation, mapLoaded]);

  const handleLoad = (map: google.maps.Map) => {
    setMapLoaded(true);
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Incidents Management" />
      <LoadScript
        googleMapsApiKey={GOOGLE_MAPS_API_KEY}
        libraries={["places", "geometry"]}
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={currentPosition || incidentLocation}
          zoom={14}
          onLoad={handleLoad}
        >
          {/* Current location marker */}
          {currentPosition && (
            <Marker
              position={currentPosition}
              label="You"
              icon={{
                url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              }}
            />
          )}

          {/* Incident location marker */}
          <Marker
            position={incidentLocation}
            label="Incident"
            icon={{
              url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
            }}
          />

          {/* Show traveled path */}
          <Polyline
            path={progressPath}
            options={{
              strokeColor: '#4285F4',
              strokeOpacity: 1.0,
              strokeWeight: 4,
            }}
          />

          {/* Show route using DirectionsRenderer */}
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                suppressMarkers: true,
                preserveViewport: true,
                polylineOptions: {
                  strokeColor: '#FF0000',
                  strokeOpacity: 0.8,
                  strokeWeight: 6
                }
              }}
            />
          )}
        </GoogleMap>

        {/* Display distance and duration */}
        {distance && duration && (
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            backgroundColor: 'white',
            padding: '10px',
            borderRadius: '5px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            zIndex: 1
          }}>
            <h3>Route Information</h3>
            <p>Distance Remaining: {distance}</p>
            <p>Estimated Time: {duration}</p>
          </div>
        )}
      </LoadScript>
    </AppLayout>
  );
};

export default MapComponent;
