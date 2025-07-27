import React from 'react';
import { MapPin, Navigation, Car, User, Building } from 'lucide-react';

interface GPSLocation {
  lat: number;
  lng: number;
  timestamp: string;
}

interface FallbackMapProps {
  ambulanceLocation: GPSLocation;
  hospitalLocation?: GPSLocation;
  patientLocation?: GPSLocation;
}

const FallbackMap: React.FC<FallbackMapProps> = ({ 
  ambulanceLocation, 
  hospitalLocation = { lat: 35.0116, lng: 135.7681, timestamp: new Date().toISOString() },
  patientLocation = { lat: 35.0116, lng: 135.7681, timestamp: new Date().toISOString() }
}) => {
  // Calculate relative positions for a simple visual representation
  const centerLat = ambulanceLocation.lat;
  const centerLng = ambulanceLocation.lng;
  
  const getRelativePosition = (lat: number, lng: number) => {
    const latDiff = (lat - centerLat) * 10000; // Scale for visual representation
    const lngDiff = (lng - centerLng) * 10000;
    return {
      x: 50 + lngDiff * 2, // Center at 50% and scale
      y: 50 - latDiff * 2
    };
  };

  const ambulancePos = getRelativePosition(ambulanceLocation.lat, ambulanceLocation.lng);
  const hospitalPos = getRelativePosition(hospitalLocation.lat, hospitalLocation.lng);
  const patientPos = getRelativePosition(patientLocation.lat, patientLocation.lng);

  return (
    <div className="relative">
      {/* Custom Map Background */}
      <div className="w-full h-64 rounded-lg shadow-sm bg-gradient-to-br from-blue-50 to-green-50 border-2 border-gray-200 relative overflow-hidden">
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="gray" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Hospital Marker */}
        <div 
          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
          style={{ left: `${hospitalPos.x}%`, top: `${hospitalPos.y}%` }}
          title="Kyoto Hospital"
        >
          <div className="bg-blue-500 text-white p-2 rounded-lg shadow-lg">
            <Building className="w-4 h-4" />
          </div>
        </div>

        {/* Patient Marker */}
        <div 
          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
          style={{ left: `${patientPos.x}%`, top: `${patientPos.y}%` }}
          title="Patient Location"
        >
          <div className="bg-red-500 text-white p-2 rounded-lg shadow-lg">
            <User className="w-4 h-4" />
          </div>
        </div>

        {/* Ambulance Marker */}
        <div 
          className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer animate-pulse"
          style={{ left: `${ambulancePos.x}%`, top: `${ambulancePos.y}%` }}
          title="Ambulance Location"
        >
          <div className="bg-green-500 text-white p-2 rounded-lg shadow-lg">
            <Car className="w-4 h-4" />
          </div>
        </div>

        {/* Route Line */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <line
            x1={`${ambulancePos.x}%`}
            y1={`${ambulancePos.y}%`}
            x2={`${patientPos.x}%`}
            y2={`${patientPos.y}%`}
            stroke="#10B981"
            strokeWidth="3"
            strokeDasharray="5,5"
            opacity="0.7"
          />
        </svg>

        {/* Distance Indicator */}
        <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 rounded-lg p-2 shadow-sm">
          <div className="text-xs text-gray-600">
            <div className="font-medium">Distance to Patient</div>
            <div className="text-green-600 font-bold">8.2 km</div>
          </div>
        </div>
      </div>
      
      {/* Map Legend */}
      <div className="absolute top-2 left-2 bg-white bg-opacity-90 rounded-lg p-2 shadow-sm">
        <div className="flex items-center space-x-2 text-xs">
          <Building className="w-3 h-3 text-blue-500" />
          <span>Hospital</span>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <User className="w-3 h-3 text-red-500" />
          <span>Patient</span>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <Car className="w-3 h-3 text-green-500" />
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

      {/* Status Indicator */}
      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
        <Navigation className="w-3 h-3 inline mr-1" />
        Live
      </div>

      {/* ETA Display */}
      <div className="absolute top-12 right-2 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
        <Navigation className="w-3 h-3 inline mr-1" />
        ETA: 8 min
      </div>
    </div>
  );
};

export default FallbackMap; 