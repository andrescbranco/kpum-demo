import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation } from 'lucide-react';

interface GPSLocation {
  lat: number;
  lng: number;
  timestamp: string;
}

interface AmbulanceMapProps {
  ambulanceLocation: GPSLocation;
  hospitalLocation?: GPSLocation;
  patientLocation?: GPSLocation;
}

declare global {
  interface Window {
    google: any;
    routePolyline: any;
  }
}

const AmbulanceMap: React.FC<AmbulanceMapProps> = ({ 
  ambulanceLocation, 
  hospitalLocation = { lat: 35.0116, lng: 135.7681, timestamp: new Date().toISOString() },
  patientLocation = { lat: 35.0116, lng: 135.7681, timestamp: new Date().toISOString() }
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const ambulanceMarkerRef = useRef<any>(null);
  const hospitalMarkerRef = useRef<any>(null);
  const patientMarkerRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Load Google Maps script
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google) {
        setMapLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg&libraries=geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !window.google) return;

    // Ensure the DOM element is ready
    if (!mapRef.current.offsetParent) {
      // Element is not visible, try again later
      const timer = setTimeout(() => {
        if (mapRef.current && mapRef.current.offsetParent) {
          initializeMap();
        }
      }, 100);
      return () => clearTimeout(timer);
    }

    initializeMap();
  }, [mapLoaded, ambulanceLocation.lat, ambulanceLocation.lng]);

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    const mapOptions = {
      center: { lat: ambulanceLocation.lat, lng: ambulanceLocation.lng },
      zoom: 15,
      mapTypeId: window.google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    };

    try {
      mapInstanceRef.current = new window.google.maps.Map(mapRef.current, mapOptions);

    // Create markers
    const createMarkers = () => {
      try {
        // Hospital marker
        hospitalMarkerRef.current = new window.google.maps.Marker({
          position: { lat: hospitalLocation.lat, lng: hospitalLocation.lng },
          map: mapInstanceRef.current,
          title: 'Hospital',
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7V22H22V7L12 2Z" fill="#3B82F6" stroke="#1E40AF" stroke-width="2"/>
                <path d="M9 14H15V18H9V14Z" fill="white"/>
                <path d="M11 10H13V14H11V10Z" fill="white"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(24, 24),
            anchor: new window.google.maps.Point(12, 12)
          }
        });

        // Patient marker
        patientMarkerRef.current = new window.google.maps.Marker({
          position: { lat: patientLocation.lat, lng: patientLocation.lng },
          map: mapInstanceRef.current,
          title: 'Patient Location',
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" fill="#EF4444" stroke="#DC2626" stroke-width="2"/>
                <path d="M12 6V18M6 12H18" stroke="white" stroke-width="2" stroke-linecap="round"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(24, 24),
            anchor: new window.google.maps.Point(12, 12)
          }
        });

        // Ambulance marker
        ambulanceMarkerRef.current = new window.google.maps.Marker({
          position: { lat: ambulanceLocation.lat, lng: ambulanceLocation.lng },
          map: mapInstanceRef.current,
          title: 'Ambulance',
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 7H21V17H3V7Z" fill="#10B981" stroke="#059669" stroke-width="2"/>
                <path d="M7 17V21H17V17" fill="#10B981" stroke="#059669" stroke-width="2"/>
                <circle cx="7" cy="21" r="2" fill="#059669"/>
                <circle cx="17" cy="21" r="2" fill="#059669"/>
                <path d="M9 10H15V12H9V10Z" fill="white"/>
                <path d="M11 8H13V10H11V8Z" fill="white"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(32, 32),
            anchor: new window.google.maps.Point(16, 16)
          }
        });

        // Add info windows
        const hospitalInfoWindow = new window.google.maps.InfoWindow({
          content: '<div class="p-2"><strong>Kyoto Hospital</strong><br/>Emergency Department</div>'
        });

        const patientInfoWindow = new window.google.maps.InfoWindow({
          content: '<div class="p-2"><strong>Patient Location</strong><br/>Emergency pickup point</div>'
        });

        const ambulanceInfoWindow = new window.google.maps.InfoWindow({
          content: `<div class="p-2">
            <strong>Ambulance</strong><br/>
            Status: En Route<br/>
            ETA: 8 minutes<br/>
            Coordinates: ${ambulanceLocation.lat.toFixed(6)}, ${ambulanceLocation.lng.toFixed(6)}
          </div>`
        });

        // Add click listeners
        hospitalMarkerRef.current.addListener('click', () => {
          hospitalInfoWindow.open(mapInstanceRef.current, hospitalMarkerRef.current);
        });

        patientMarkerRef.current.addListener('click', () => {
          patientInfoWindow.open(mapInstanceRef.current, patientMarkerRef.current);
        });

        ambulanceMarkerRef.current.addListener('click', () => {
          ambulanceInfoWindow.open(mapInstanceRef.current, ambulanceMarkerRef.current);
        });
      } catch (error) {
        console.error('Error creating map markers:', error);
      }
    };

    createMarkers();
  } catch (error) {
    console.error('Error initializing Google Maps:', error);
  }
};

  // Update ambulance marker position
  useEffect(() => {
    if (ambulanceMarkerRef.current && mapInstanceRef.current) {
      const newPosition = { lat: ambulanceLocation.lat, lng: ambulanceLocation.lng };
      ambulanceMarkerRef.current.setPosition(newPosition);
      
      // Center map on ambulance if it's the active page
      mapInstanceRef.current.panTo(newPosition);
    }
  }, [ambulanceLocation]);

  // Draw route between ambulance and patient
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google) return;

    // Remove existing route
    if (window.routePolyline) {
      window.routePolyline.setMap(null);
    }

    // Create route
    const directionsService = new window.google.maps.DirectionsService();
    const directionsRenderer = new window.google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#10B981',
        strokeWeight: 4,
        strokeOpacity: 0.8
      }
    });

    directionsRenderer.setMap(mapInstanceRef.current);

    const request = {
      origin: { lat: ambulanceLocation.lat, lng: ambulanceLocation.lng },
      destination: { lat: patientLocation.lat, lng: patientLocation.lng },
      travelMode: window.google.maps.TravelMode.DRIVING
    };

    directionsService.route(request, (result: any, status: any) => {
      if (status === 'OK') {
        directionsRenderer.setDirections(result);
        window.routePolyline = directionsRenderer;
      }
    });
  }, [ambulanceLocation, patientLocation]);

  if (!mapLoaded) {
    return (
      <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
        <div className="text-center">
          <Navigation className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  // Fallback map if Google Maps fails to load
  if (!window.google) {
    return (
      <div className="relative">
        <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Map loading failed</p>
            <p className="text-sm text-gray-500 mt-1">
              Coordinates: {ambulanceLocation.lat.toFixed(6)}, {ambulanceLocation.lng.toFixed(6)}
            </p>
          </div>
        </div>
        
        {/* Simple coordinate display */}
        <div className="absolute bottom-2 right-2 bg-white bg-opacity-90 rounded-lg p-2 shadow-sm">
          <div className="text-xs text-gray-600">
            <div>Lat: {ambulanceLocation.lat.toFixed(6)}</div>
            <div>Lng: {ambulanceLocation.lng.toFixed(6)}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div 
        ref={mapRef} 
        className="w-full h-64 rounded-lg shadow-sm"
        style={{ minHeight: '256px' }}
      />
      
      {/* Map Legend */}
      <div className="absolute top-2 left-2 bg-white bg-opacity-90 rounded-lg p-2 shadow-sm">
        <div className="flex items-center space-x-2 text-xs">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>Hospital</span>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span>Patient</span>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Ambulance</span>
        </div>
      </div>

      {/* Coordinates Display */}
      <div className="absolute bottom-2 right-2 bg-white bg-opacity-90 rounded-lg p-2 shadow-sm">
        <div className="text-xs text-gray-600">
          <div>Lat: {ambulanceLocation.lat.toFixed(6)}</div>
          <div>Lng: {ambulanceLocation.lng.toFixed(6)}</div>
        </div>
      </div>
    </div>
  );
};

export default AmbulanceMap; 