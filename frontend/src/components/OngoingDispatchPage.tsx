import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Clock, Phone, Car, User, Navigation } from 'lucide-react';
import { Patient, Dispatch } from '../types';
import FallbackMap from './FallbackMap';

interface OngoingDispatchPageProps {
  patient: Patient;
  dispatch: Dispatch;
  onBack: () => void;
}

interface GPSLocation {
  lat: number;
  lng: number;
  timestamp: string;
}

const OngoingDispatchPage: React.FC<OngoingDispatchPageProps> = ({ patient, dispatch, onBack }) => {
  const [ambulanceLocation, setAmbulanceLocation] = useState<GPSLocation>({
    lat: 35.0116, // Kyoto coordinates
    lng: 135.7681,
    timestamp: new Date().toISOString()
  });
  const [eta, setEta] = useState<string>('8 minutes');
  const [status, setStatus] = useState<'en_route' | 'arriving' | 'on_scene'>('en_route');

  // Simulate ambulance movement
  useEffect(() => {
    const interval = setInterval(() => {
      setAmbulanceLocation(prev => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.001, // Small random movement
        lng: prev.lng + (Math.random() - 0.5) * 0.001,
        timestamp: new Date().toISOString()
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Simulate ETA updates
  useEffect(() => {
    const interval = setInterval(() => {
      const currentEta = parseInt(eta.split(' ')[0]);
      if (currentEta > 1) {
        setEta(`${currentEta - 1} minutes`);
      } else {
        setEta('Arriving now');
        setStatus('arriving');
      }
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [eta]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'en_route':
        return 'text-blue-600 bg-blue-100';
      case 'arriving':
        return 'text-orange-600 bg-orange-100';
      case 'on_scene':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'en_route':
        return 'En Route';
      case 'arriving':
        return 'Arriving';
      case 'on_scene':
        return 'On Scene';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Ongoing Dispatch</h1>
          <p className="text-gray-600">Ambulance tracking for {patient.name}</p>
        </div>
        
        {/* Patient Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{patient.name}</h2>
                <p className="text-sm text-gray-600">Room {patient.room_id} • {patient.age} y/o {patient.sex}</p>
                {patient.medical_conditions && (
                  <p className="text-sm text-red-600 font-medium mt-1">
                    Diagnosis: {patient.medical_conditions}
                  </p>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                <Car className="w-4 h-4 mr-1" />
                {getStatusText(status)}
              </div>
            </div>
          </div>
        </div>

        {/* Dispatch Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Ambulance Tracking */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Navigation className="w-5 h-5 mr-2 text-blue-600" />
              Ambulance Location
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">GPS Coordinates</p>
                    <p className="text-sm text-gray-600">
                      {ambulanceLocation.lat.toFixed(6)}, {ambulanceLocation.lng.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Estimated Arrival</p>
                    <p className="text-sm text-gray-600">{eta}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-gray-900">Ambulance ID</p>
                    <p className="text-sm text-gray-600">AMB-{dispatch.id.toString().padStart(4, '0')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dispatch Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Dispatch Details</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Dispatch Type</label>
                <p className="mt-1 text-sm text-gray-900">{dispatch.dispatch_type}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Destination</label>
                <p className="mt-1 text-sm text-gray-900">{dispatch.destination}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  dispatch.priority === 'high' ? 'bg-red-100 text-red-800' :
                  dispatch.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {dispatch.priority.toUpperCase()}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Reason</label>
                <p className="mt-1 text-sm text-gray-900">{dispatch.reason}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Confirmed By</label>
                <p className="mt-1 text-sm text-gray-900">{dispatch.confirmed_by}</p>
              </div>

              {dispatch.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <p className="mt-1 text-sm text-gray-900">{dispatch.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Live Map View */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Map View</h3>
          <FallbackMap 
            ambulanceLocation={ambulanceLocation}
            hospitalLocation={{ lat: 35.0116, lng: 135.7681, timestamp: new Date().toISOString() }}
            patientLocation={{ lat: 35.0116, lng: 135.7681, timestamp: new Date().toISOString() }}
          />
        </div>
      </div>
    </div>
  );
};

export default OngoingDispatchPage; 