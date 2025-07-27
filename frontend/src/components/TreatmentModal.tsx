import React, { useState } from 'react';
import { X, Check, Edit, XCircle, Heart, Activity, Thermometer, Droplets, Wind } from 'lucide-react';
import { Patient, PatientVitals } from '../types';
import { treatmentApi } from '../services/api';

interface TreatmentModalProps {
  patient: Patient;
  vitals: PatientVitals;
  onClose: () => void;
  onNavigateToOngoingTreatment?: (treatment: any) => void;
}

const TreatmentModal: React.FC<TreatmentModalProps> = ({ patient, vitals, onClose, onNavigateToOngoingTreatment }) => {
  const [decision, setDecision] = useState<'accepted' | 'modified' | 'ignored' | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDecision = async (decisionType: 'accepted' | 'modified' | 'ignored') => {
    setLoading(true);
    try {
      const treatment = await treatmentApi.create({
        patient_id: patient.id,
        treatment_type: 'medication',
        treatment_description: vitals.recommended_action || 'Standard treatment protocol',
        prescribed_by: 'Dr. Smith', // In a real app, this would come from user context
        decision: decisionType,
        notes: notes || undefined,
      });
      
      setDecision(decisionType);
      
      // If treatment was accepted, navigate to ongoing treatment page
      if (decisionType === 'accepted' && onNavigateToOngoingTreatment) {
        setTimeout(() => {
          onNavigateToOngoingTreatment(treatment);
        }, 2000);
      } else {
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Error creating treatment decision:', error);
    } finally {
      setLoading(false);
    }
  };

  const getVitalStatus = (value: number, normalRange: { min: number; max: number }) => {
    if (value < normalRange.min || value > normalRange.max) {
      return value < normalRange.min ? 'low' : 'high';
    }
    return 'normal';
  };

  const formatVitalValue = (value: number, unit: string) => {
    if (!value || isNaN(value)) return '--';
    return `${value.toFixed(1)}${unit}`;
  };

  const vitalRanges = {
    heart_rate: { min: 60, max: 100 },
    systolic_bp: { min: 90, max: 140 },
    diastolic_bp: { min: 60, max: 90 },
    respiratory_rate: { min: 12, max: 20 },
    oxygen_saturation: { min: 95, max: 100 },
    temperature: { min: 36.5, max: 37.5 },
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 modal-overlay">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto modal-content">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Treatment Decision</h2>
            <p className="text-sm text-gray-600 mt-1">
              Patient: {patient.name} • Room: {patient.room_id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Status Summary */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="font-medium text-yellow-700">Watch Status</span>
            </div>
            <p className="text-gray-700 mb-4">{vitals.reason}</p>
            
            {/* Diagnosis Information */}
            {patient.medical_conditions && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-red-900 mb-2">Diagnosis:</h3>
                <p className="text-red-800">{patient.medical_conditions}</p>
              </div>
            )}
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Recommended Action:</h3>
              <p className="text-blue-800">{vitals.recommended_action}</p>
            </div>
          </div>

          {/* Vitals Display */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-3">Current Vitals</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4 text-red-500" />
                <div>
                  <div className="font-medium">{formatVitalValue(vitals.vitals.heart_rate, '')}</div>
                  <div className={`text-xs ${
                    getVitalStatus(vitals.vitals.heart_rate, vitalRanges.heart_rate) === 'normal' 
                      ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    HR
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-blue-500" />
                <div>
                  <div className="font-medium">{formatVitalValue(vitals.vitals.systolic_bp, '/')}{formatVitalValue(vitals.vitals.diastolic_bp, '')}</div>
                  <div className={`text-xs ${
                    getVitalStatus(vitals.vitals.systolic_bp, vitalRanges.systolic_bp) === 'normal' 
                      ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    BP
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Wind className="w-4 h-4 text-green-500" />
                <div>
                  <div className="font-medium">{formatVitalValue(vitals.vitals.respiratory_rate, '')}</div>
                  <div className={`text-xs ${
                    getVitalStatus(vitals.vitals.respiratory_rate, vitalRanges.respiratory_rate) === 'normal' 
                      ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    RR
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Droplets className="w-4 h-4 text-cyan-500" />
                <div>
                  <div className="font-medium">{formatVitalValue(vitals.vitals.oxygen_saturation, '%')}</div>
                  <div className={`text-xs ${
                    getVitalStatus(vitals.vitals.oxygen_saturation, vitalRanges.oxygen_saturation) === 'normal' 
                      ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    SpO₂
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Thermometer className="w-4 h-4 text-orange-500" />
                <div>
                  <div className="font-medium">{formatVitalValue(vitals.vitals.temperature, '°C')}</div>
                  <div className={`text-xs ${
                    getVitalStatus(vitals.vitals.temperature, vitalRanges.temperature) === 'normal' 
                      ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    Temp
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Add any additional notes about this treatment decision..."
            />
          </div>

          {/* Decision Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={() => handleDecision('accepted')}
              disabled={loading}
              className="flex-1 flex items-center justify-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check className="w-4 h-4" />
              <span>Accept & Apply</span>
            </button>

            <button
              onClick={() => handleDecision('modified')}
              disabled={loading}
              className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Treatment</span>
            </button>

            <button
              onClick={() => handleDecision('ignored')}
              disabled={loading}
              className="flex-1 flex items-center justify-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <XCircle className="w-4 h-4" />
              <span>Ignore</span>
            </button>
          </div>

          {/* Success Message */}
          {decision && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-green-800 font-medium">
                Treatment decision recorded successfully!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TreatmentModal; 