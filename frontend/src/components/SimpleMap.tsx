import React from 'react';
import { MapPin, Navigation } from 'lucide-react';

interface GPSLocation {
  lat: number;
  lng: number;
  timestamp: string;
}

interface SimpleMapProps {
  ambulanceLocation: GPSLocation;
  hospitalLocation?: GPSLocation;
  patientLocation?: GPSLocation;
}

const SimpleMap: React.FC<SimpleMapProps> = ({ 
  ambulanceLocation, 
  hospitalLocation = { lat: 35.0116, lng: 135.7681, timestamp: new Date().toISOString() },
  patientLocation = { lat: 35.0116, lng: 135.7681, timestamp: new Date().toISOString() }
}) => {
  // Create a simple static map URL (this is a placeholder - you'd need a real static map service)
  const getStaticMapUrl = () => {
    const center = `${ambulanceLocation.lat},${ambulanceLocation.lng}`;
    const zoom = 15;
    const size = '600x400';
    const markers = [
      `markers=color:blue|label:H|${hospitalLocation.lat},${hospitalLocation.lng}`,
      `markers=color:red|label:P|${patientLocation.lat},${patientLocation.lng}`,
      `markers=color:green|label:A|${ambulanceLocation.lat},${ambulanceLocation.lng}`
    ].join('&');
    
    // Note: This is a placeholder URL - you'd need a real static map service
    return `https://maps.googleapis.com/maps/api/staticmap?center=${center}&zoom=${zoom}&size=${size}&${markers}&key=AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg`;
  };

  return (
    <div className="relative">
      {/* Static Map Image */}
      <div className="w-full h-64 rounded-lg shadow-sm overflow-hidden">
        <img 
          src={getStaticMapUrl()}
          alt="Ambulance Location Map"
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback to a simple colored background if image fails
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.parentElement!.style.backgroundColor = '#f3f4f6';
            target.parentElement!.innerHTML = `
              <div class="flex items-center justify-center h-full">
                <div class="text-center">
                  <svg class="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <p class="text-gray-600">Map View</p>
                </div>
              </div>
            `;
          }}
        />
      </div>
      
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

      {/* Status Indicator */}
      <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
        <Navigation className="w-3 h-3 inline mr-1" />
        Live
      </div>
    </div>
  );
};

export default SimpleMap; 