import React, { useState } from 'react';
import { Heart, Activity, Thermometer, Droplets, Wind, User, MapPin } from 'lucide-react';
import { Patient, PatientVitals, ConnectionStatus } from '../types';
import TreatmentModal from './TreatmentModal';
import DispatchModal from './DispatchModal';

interface PatientCardProps {
  patient: Patient;
  vitals?: PatientVitals;
  connectionStatus: ConnectionStatus;
  onNavigateToOngoingTreatment?: (treatment: any) => void;
  onNavigateToOngoingDispatch?: (dispatch: any) => void;
}

const PatientCard: React.FC<PatientCardProps> = ({ patient, vitals, connectionStatus, onNavigateToOngoingTreatment, onNavigateToOngoingDispatch }) => {
  const [showTreatmentModal, setShowTreatmentModal] = useState(false);
  const [showDispatchModal, setShowDispatchModal] = useState(false);

  const status = vitals?.status || 'normal';
  const isInteractive = status === 'watch' || status === 'critical';

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-green-500 border-green-500';
      case 'watch':
        return 'bg-yellow-500 border-yellow-500';
      case 'critical':
        return 'bg-red-500 border-red-500';
      default:
        return 'bg-gray-500 border-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'normal':
        return 'Normal';
      case 'watch':
        return 'Watch';
      case 'critical':
        return 'Critical';
      default:
        return 'Unknown';
    }
  };

  const handleCardClick = () => {
    if (!isInteractive) return;
    
    if (status === 'critical') {
      setShowDispatchModal(true);
    } else if (status === 'watch') {
      setShowTreatmentModal(true);
    }
  };

  const formatVitalValue = (value: number, unit: string) => {
    if (!value || isNaN(value)) return '--';
    return `${value.toFixed(1)}${unit}`;
  };

  return (
    <>
      <div
        className={`patient-card bg-white rounded-lg shadow-md p-4 cursor-pointer ${
          isInteractive ? 'hover:shadow-lg' : ''
        } ${status} ${connectionStatus === 'disconnected' ? 'opacity-50' : ''}`}
        onClick={handleCardClick}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-gray-500" />
            <span className="font-semibold text-gray-900 truncate">
              {patient.name}
            </span>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(status)}`}>
            {getStatusText(status)}
          </div>
        </div>

        {/* Room Info */}
        <div className="flex items-center space-x-1 mb-3 text-sm text-gray-600">
          <MapPin className="w-3 h-3" />
          <span>{patient.room_id}</span>
          <span className="text-gray-400">•</span>
          <span>{patient.age} y/o {patient.sex}</span>
        </div>

        {/* Vitals Grid */}
        {vitals ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 text-red-500" />
              <div>
                <div className="vital-value text-gray-900">
                  {formatVitalValue(vitals.vitals.heart_rate, '')}
                </div>
                <div className="vital-label">HR</div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-blue-500" />
              <div>
                <div className="vital-value text-gray-900">
                  {formatVitalValue(vitals.vitals.systolic_bp, '/')}
                  {formatVitalValue(vitals.vitals.diastolic_bp, '')}
                </div>
                <div className="vital-label">BP</div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Wind className="w-4 h-4 text-green-500" />
              <div>
                <div className="vital-value text-gray-900">
                  {formatVitalValue(vitals.vitals.respiratory_rate, '')}
                </div>
                <div className="vital-label">RR</div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Droplets className="w-4 h-4 text-cyan-500" />
              <div>
                <div className="vital-value text-gray-900">
                  {formatVitalValue(vitals.vitals.oxygen_saturation, '%')}
                </div>
                <div className="vital-label">SpO₂</div>
              </div>
            </div>

            <div className="flex items-center space-x-2 col-span-2">
              <Thermometer className="w-4 h-4 text-orange-500" />
              <div>
                <div className="vital-value text-gray-900">
                  {formatVitalValue(vitals.vitals.temperature, '°C')}
                </div>
                <div className="vital-label">Temp</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            {connectionStatus === 'disconnected' ? 'No connection' : 'Loading vitals...'}
          </div>
        )}

        {/* Status Reason */}
        {vitals?.reason && status !== 'normal' && (
          <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
            {vitals.reason}
          </div>
        )}

        {/* Action Indicator */}
        {isInteractive && (
          <div className="mt-3 text-center">
            <span className="text-xs font-medium text-blue-600">
              {status === 'critical' ? '🚑 Click for dispatch' : '💊 Click for treatment'}
            </span>
          </div>
        )}
      </div>

      {/* Treatment Modal */}
      {showTreatmentModal && vitals && (
        <TreatmentModal
          patient={patient}
          vitals={vitals}
          onClose={() => setShowTreatmentModal(false)}
          onNavigateToOngoingTreatment={onNavigateToOngoingTreatment}
        />
      )}

      {/* Dispatch Modal */}
      {showDispatchModal && vitals && (
        <DispatchModal
          patient={patient}
          vitals={vitals}
          onClose={() => setShowDispatchModal(false)}
          onNavigateToOngoingDispatch={onNavigateToOngoingDispatch}
        />
      )}
    </>
  );
};

export default PatientCard; 