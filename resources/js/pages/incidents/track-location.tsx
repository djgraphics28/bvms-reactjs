import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsRenderer } from '@react-google-maps/api';

interface Incident {
  latitude: string;
  longitude: string;
  title: string;
  description: string;
  // Add other fields as necessary
}

interface Props {
  incident: Incident;
}

const GOOGLE_MAPS_API_KEY = 'AIzaSyC_WZ0T_FCfAV_G1yfuBGozFa2zOX9l82c';

const mapContainerStyle = {
  width: '100%',
  height: '100vh',
};

const MapComponent: React.FC<Props> = ({ incident }) => {
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [distance, setDistance] = useState<string>('');
  const [duration, setDuration] = useState<string>('');

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
          } else {
            console.error('Directions request failed due to ' + status);
          }
        }
      );
    }
  }, [userLocation, incidentLocation]);

  return (
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

        {/* Render directions */}
        {directions && <DirectionsRenderer directions={directions} />}
      </GoogleMap>

      {/* Display distance and duration */}
      {distance && duration && (
        <div style={{ padding: '10px' }}>
          <h3>Route Information</h3>
          <p>Distance: {distance}</p>
          <p>Estimated Travel Time: {duration}</p>
        </div>
      )}
    </LoadScript>
  );
};

export default MapComponent;
