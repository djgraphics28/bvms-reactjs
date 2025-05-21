import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, DirectionsRenderer, TrafficLayer } from '@react-google-maps/api';
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

const MapComponent: React.FC<Props> = ({ incident }) => {
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [distance, setDistance] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [currentPosition, setCurrentPosition] = useState<google.maps.LatLngLiteral | null>(null);
  const [travelMode, setTravelMode] = useState<google.maps.TravelMode>(google.maps.TravelMode.DRIVING);
  const [showTraffic, setShowTraffic] = useState<boolean>(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [eta, setEta] = useState<string>('');
  const [arrivalTime, setArrivalTime] = useState<string>('');

  const incidentLocation = {
    lat: parseFloat(incident.latitude),
    lng: parseFloat(incident.longitude),
  };

  // Get user's current location
  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(newPosition);
        setCurrentPosition(newPosition);

        // Pan map to new position
        if (map) {
          map.panTo(newPosition);
        }
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
  }, [map]);

  // Calculate route
  useEffect(() => {
    if (currentPosition && window.google) {
      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        {
          origin: currentPosition,
          destination: incidentLocation,
          travelMode: travelMode,
          provideRouteAlternatives: false,
          drivingOptions: {
            departureTime: new Date(),
            trafficModel: google.maps.TrafficModel.BEST_GUESS
          }
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            setDirections(result);
            const leg = result.routes[0].legs[0];
            setDistance(leg.distance?.text || '');
            setDuration(leg.duration?.text || '');

            // Calculate ETA
            if (leg.duration?.value) {
              const now = new Date();
              const arrival = new Date(now.getTime() + leg.duration.value * 1000);
              setEta(arrival.toLocaleTimeString());
              setArrivalTime(`ETA: ${arrival.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
            }
          } else {
            console.error('Directions request failed:', status);
          }
        }
      );
    }
  }, [currentPosition, incidentLocation, travelMode]);

  const handleMapLoad = (map: google.maps.Map) => {
    setMap(map);
  };

  const handleTravelModeChange = (mode: google.maps.TravelMode) => {
    setTravelMode(mode);
  };

  const toggleTraffic = () => {
    setShowTraffic(!showTraffic);
  };

  const centerMap = () => {
    if (map && currentPosition) {
      map.panTo(currentPosition);
      map.setZoom(15);
    }
  };

  return (
    <AppLayout breadcrumbs={breadcrumbs}>
      <Head title="Incidents Management" />
      <LoadScript
        googleMapsApiKey={GOOGLE_MAPS_API_KEY}
        libraries={["places", "geometry"]}
      >
        <div style={{ position: 'relative', height: '100vh' }}>
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={currentPosition || incidentLocation}
            zoom={15}
            onLoad={handleMapLoad}
            options={{
              zoomControl: true,
              mapTypeControl: true,
              scaleControl: true,
              streetViewControl: true,
              rotateControl: true,
              fullscreenControl: true
            }}
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

            {/* Show route using DirectionsRenderer */}
            {directions && (
              <DirectionsRenderer
                directions={directions}
                options={{
                  suppressMarkers: true,
                  preserveViewport: true,
                  polylineOptions: {
                    strokeColor: '#1a73e8',
                    strokeOpacity: 0.8,
                    strokeWeight: 6,
                    zIndex: 1
                  }
                }}
              />
            )}

            {/* Traffic layer */}
            {showTraffic && <TrafficLayer />}
          </GoogleMap>

          {/* Controls Panel */}
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            padding: '10px',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            <button
              onClick={() => handleTravelModeChange(google.maps.TravelMode.DRIVING)}
              style={{
                backgroundColor: travelMode === google.maps.TravelMode.DRIVING ? '#e8f0fe' : 'white',
                color: travelMode === google.maps.TravelMode.DRIVING ? '#1a73e8' : 'black',
                border: '1px solid #dadce0',
                borderRadius: '4px',
                padding: '8px 12px',
                cursor: 'pointer'
              }}
            >
              🚗 Drive
            </button>
            <button
              onClick={() => handleTravelModeChange(google.maps.TravelMode.WALKING)}
              style={{
                backgroundColor: travelMode === google.maps.TravelMode.WALKING ? '#e8f0fe' : 'white',
                color: travelMode === google.maps.TravelMode.WALKING ? '#1a73e8' : 'black',
                border: '1px solid #dadce0',
                borderRadius: '4px',
                padding: '8px 12px',
                cursor: 'pointer'
              }}
            >
              🚶 Walk
            </button>
            <button
              onClick={() => handleTravelModeChange(google.maps.TravelMode.TRANSIT)}
              style={{
                backgroundColor: travelMode === google.maps.TravelMode.TRANSIT ? '#e8f0fe' : 'white',
                color: travelMode === google.maps.TravelMode.TRANSIT ? '#1a73e8' : 'black',
                border: '1px solid #dadce0',
                borderRadius: '4px',
                padding: '8px 12px',
                cursor: 'pointer'
              }}
            >
              🚆 Transit
            </button>
            <button
              onClick={toggleTraffic}
              style={{
                backgroundColor: showTraffic ? '#e8f0fe' : 'white',
                color: showTraffic ? '#1a73e8' : 'black',
                border: '1px solid #dadce0',
                borderRadius: '4px',
                padding: '8px 12px',
                cursor: 'pointer'
              }}
            >
              🚦 Traffic
            </button>
            <button
              onClick={centerMap}
              style={{
                backgroundColor: 'white',
                border: '1px solid #dadce0',
                borderRadius: '4px',
                padding: '8px 12px',
                cursor: 'pointer'
              }}
            >
              🎯 Center
            </button>
          </div>

          {/* Route Information Panel */}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            right: '20px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
            padding: '16px',
            zIndex: 1,
            maxWidth: '400px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', color: '#1a73e8' }}>Route to Incident</h3>
                <p style={{ margin: '4px 0', fontSize: '14px', color: '#5f6368' }}>{incident.title}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>{distance}</p>
                <p style={{ margin: '4px 0 0', fontSize: '14px' }}>{duration}</p>
              </div>
            </div>

            {arrivalTime && (
              <div style={{
                backgroundColor: '#f1f3f4',
                borderRadius: '4px',
                padding: '8px',
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center'
              }}>
                <span style={{
                  backgroundColor: '#1a73e8',
                  color: 'white',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '8px'
                }}>
                  ⏱
                </span>
                <span>{arrivalTime}</span>
              </div>
            )}

            <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
              <button
                onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&origin=${currentPosition?.lat},${currentPosition?.lng}&destination=${incidentLocation.lat},${incidentLocation.lng}&travelmode=${travelMode.toLowerCase()}`, '_blank')}
                style={{
                  backgroundColor: '#1a73e8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  flex: 1
                }}
              >
                Open in Google Maps
              </button>
              <button
                onClick={() => window.open(`https://www.waze.com/ul?ll=${incidentLocation.lat}%2C${incidentLocation.lng}&navigate=yes`, '_blank')}
                style={{
                  backgroundColor: '#33ccff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  flex: 1
                }}
              >
                Open in Waze
              </button>
            </div>
          </div>
        </div>
      </LoadScript>
    </AppLayout>
  );
};

export default MapComponent;
