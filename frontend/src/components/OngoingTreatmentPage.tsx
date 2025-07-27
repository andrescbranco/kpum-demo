import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, User, Pill, Calendar, CheckCircle, AlertCircle, Activity } from 'lucide-react';
import { Patient, Treatment } from '../types';

interface OngoingTreatmentPageProps {
  patient: Patient;
  treatment: Treatment;
  onBack: () => void;
}

interface FollowUp {
  id: number;
  scheduled_date: string;
  type: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

const OngoingTreatmentPage: React.FC<OngoingTreatmentPageProps> = ({ patient, treatment, onBack }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [treatmentProgress, setTreatmentProgress] = useState(65); // Percentage
  const [followUps, setFollowUps] = useState<FollowUp[]>([
    {
      id: 1,
      scheduled_date: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
      type: 'Vital Signs Check',
      status: 'scheduled',
      notes: 'Monitor blood pressure and heart rate response'
    },
    {
      id: 2,
      scheduled_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
      type: 'Follow-up Assessment',
      status: 'scheduled',
      notes: 'Comprehensive evaluation of treatment effectiveness'
    },
    {
      id: 3,
      scheduled_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      type: 'Outpatient Consultation',
      status: 'scheduled',
      notes: 'Review long-term treatment plan'
    }
  ]);

  // Update current time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Simulate treatment progress
  useEffect(() => {
    const interval = setInterval(() => {
      setTreatmentProgress(prev => {
        if (prev < 100) {
          return prev + Math.random() * 2;
        }
        return prev;
      });
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'text-blue-600 bg-blue-100';
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Clock className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getTimeUntil = (dateString: string) => {
    const date = new Date(dateString);
    const diff = date.getTime() - currentTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diff < 0) {
      return 'Overdue';
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Ongoing Treatment</h1>
          <p className="text-gray-600">Treatment tracking for {patient.name}</p>
        </div>
        
        {/* Patient Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-green-600" />
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
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-600">
                <Pill className="w-4 h-4 mr-1" />
                Treatment Active
              </div>
            </div>
          </div>
        </div>

        {/* Treatment Progress */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-blue-600" />
            Treatment Progress
          </h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Progress</span>
                <span className="text-sm font-medium text-gray-900">{Math.round(treatmentProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${treatmentProgress}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">Started</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{formatTime(treatment.timestamp)}</p>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">Status</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{treatment.decision}</p>
              </div>

              <div className="p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-gray-900">Prescribed By</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{treatment.prescribed_by}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Treatment Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Current Treatment */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Treatment</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Treatment Type</label>
                <p className="mt-1 text-sm text-gray-900">{treatment.treatment_type}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="mt-1 text-sm text-gray-900">{treatment.treatment_description}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Decision</label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  treatment.decision === 'accepted' ? 'bg-green-100 text-green-800' :
                  treatment.decision === 'modified' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {treatment.decision.toUpperCase()}
                </span>
              </div>

              {treatment.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notes</label>
                  <p className="mt-1 text-sm text-gray-900">{treatment.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Expected Outcomes */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Expected Outcomes</h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Short-term (24-48 hours)</h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Stabilization of vital signs</li>
                  <li>• Reduction in symptoms</li>
                  <li>• Improved patient comfort</li>
                </ul>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Medium-term (1-2 weeks)</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Resolution of acute symptoms</li>
                  <li>• Return to baseline function</li>
                  <li>• Preparation for discharge</li>
                </ul>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">Long-term (1-3 months)</h4>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>• Complete recovery</li>
                  <li>• Prevention of recurrence</li>
                  <li>• Lifestyle modifications</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Follow-up Schedule */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            Follow-up Schedule
          </h3>
          
          <div className="space-y-4">
            {followUps.map((followUp) => (
              <div key={followUp.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${getStatusColor(followUp.status)}`}>
                    {getStatusIcon(followUp.status)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{followUp.type}</h4>
                    <p className="text-sm text-gray-600">{formatTime(followUp.scheduled_date)}</p>
                    {followUp.notes && (
                      <p className="text-sm text-gray-500 mt-1">{followUp.notes}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(followUp.status)}`}>
                    {followUp.status}
                  </span>
                  <p className="text-sm text-gray-600 mt-1">
                    {getTimeUntil(followUp.scheduled_date)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OngoingTreatmentPage; 