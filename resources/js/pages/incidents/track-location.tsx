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
  // Add other fields as necessary
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

const MapComponent: React.FC<Props> = ({ incident }) => {
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [distance, setDistance] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [path, setPath] = useState<google.maps.LatLngLiteral[]>([]);

  const incidentLocation = {
    lat: parseFloat(incident.latitude),
    lng: parseFloat(incident.longitude),
  };

  // Get user's current location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error('Error getting user location:', error);
      }
    );
  }, []);

  // Calculate route from user location to incident location
  useEffect(() => {
    if (userLocation) {
      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        {
          origin: userLocation,
          destination: incidentLocation,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            setDirections(result);
            const leg = result.routes[0].legs[0];
            setDistance(leg.distance?.text || '');
            setDuration(leg.duration?.text || '');

            // Extract path for polyline
            const pathPoints: google.maps.LatLngLiteral[] = [];
            result.routes[0].overview_path.forEach(point => {
              pathPoints.push({
                lat: point.lat(),
                lng: point.lng()
              });
            });
            setPath(pathPoints);
          } else {
            console.error('Directions request failed due to ' + status);
          }
        }
      );
    }
  }, [userLocation, incidentLocation]);

  return (
     <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Incidents Management" />
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={userLocation || incidentLocation}
        zoom={14}
      >
        {/* User's location marker */}
        {userLocation && (
          <Marker
            position={userLocation}
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

        {/* Render directions - you can choose to use either DirectionsRenderer or Polyline */}
        {directions && (
          <>
            {/* Option 1: Using DirectionsRenderer (shows full route with turns) */}
            <DirectionsRenderer directions={directions} />

            {/* Option 2: Using Polyline (simpler line) */}
            {/* <Polyline
              path={path}
              options={polylineOptions}
            /> */}
          </>
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
          <p>Distance: {distance}</p>
          <p>Estimated Travel Time: {duration}</p>
        </div>
      )}
    </LoadScript>
    </AppLayout>
  );
};

export default MapComponent;
