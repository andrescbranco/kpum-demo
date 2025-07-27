import React, { useState, useEffect, useCallback } from 'react';
import { Wifi, WifiOff, Activity } from 'lucide-react';
import { Patient, PatientVitals, ConnectionStatus, Treatment, Dispatch } from '../types';
import { patientApi, systemApi, vitalsApi } from '../services/api';
import WebSocketService from '../services/websocket';
import PatientCard from './PatientCard';
import ConnectionStatusIndicator from './ConnectionStatusIndicator';
import SystemStatusBar from './SystemStatusBar';
import NavigationBar from './NavigationBar';
import OngoingTreatmentPage from './OngoingTreatmentPage';
import OngoingDispatchPage from './OngoingDispatchPage';
import OngoingActivitiesList from './OngoingActivitiesList';

const Dashboard: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientVitals, setPatientVitals] = useState<Record<number, PatientVitals>>({});
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [wsService] = useState(() => new WebSocketService());
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'ongoing-treatment' | 'ongoing-dispatch'>('dashboard');
  const [ongoingTreatments, setOngoingTreatments] = useState<{ patient: Patient; treatment: Treatment }[]>([]);
  const [ongoingDispatches, setOngoingDispatches] = useState<{ patient: Patient; dispatch: Dispatch }[]>([]);
  const [selectedTreatment, setSelectedTreatment] = useState<{ patient: Patient; treatment: Treatment } | null>(null);
  const [selectedDispatch, setSelectedDispatch] = useState<{ patient: Patient; dispatch: Dispatch } | null>(null);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [patientsData, systemData, vitalsData] = await Promise.all([
          patientApi.getAll(),
          systemApi.getStatus(),
          vitalsApi.getLatest(),
        ]);
        
        setPatients(patientsData);
        setSystemStatus(systemData);
        
        // Transform vitals data to match PatientVitals format
        const transformedVitals: Record<number, PatientVitals> = {};
        patientsData.forEach(patient => {
          const vitals = vitalsData[patient.id];
          if (vitals) {
            transformedVitals[patient.id] = {
              patient_id: patient.id,
              patient_name: patient.name,
              room_id: patient.room_id,
              vitals: {
                heart_rate: vitals.heart_rate,
                systolic_bp: vitals.systolic_bp,
                diastolic_bp: vitals.diastolic_bp,
                respiratory_rate: vitals.respiratory_rate,
                oxygen_saturation: vitals.oxygen_saturation,
                temperature: vitals.temperature,
                ekg_data: vitals.ekg_data,
              },
              status: vitals.status,
              reason: vitals.classification_reason,
              recommended_action: vitals.recommended_action,
            };
          }
        });
        
        setPatientVitals(transformedVitals);
        setLoading(false);
      } catch (error) {
        console.error('Error loading initial data:', error);
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // WebSocket connection and event handling
  useEffect(() => {
    const connectWebSocket = async () => {
      try {
        await wsService.connect();
        setConnectionStatus('connected');
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
        setConnectionStatus('disconnected');
      }
    };

    // Set up event listeners
    const handleVitalsUpdate = (data: Record<number, any>) => {
      // Transform WebSocket vitals data to match PatientVitals format
      const transformedData: Record<number, PatientVitals> = {};
      Object.keys(data).forEach(patientIdStr => {
        const patientId = parseInt(patientIdStr);
        const vitals = data[patientId];
        const patient = patients.find(p => p.id === patientId);
        
        if (patient && vitals) {
          transformedData[patientId] = {
            patient_id: patient.id,
            patient_name: patient.name,
            room_id: patient.room_id,
            vitals: {
              heart_rate: vitals.vitals.heart_rate,
              systolic_bp: vitals.vitals.systolic_bp,
              diastolic_bp: vitals.vitals.diastolic_bp,
              respiratory_rate: vitals.vitals.respiratory_rate,
              oxygen_saturation: vitals.vitals.oxygen_saturation,
              temperature: vitals.vitals.temperature,
              ekg_data: vitals.vitals.ekg_data,
            },
            status: vitals.status,
            reason: vitals.classification_reason,
            recommended_action: vitals.recommended_action,
          };
        }
      });
      
      setPatientVitals(prev => ({ ...prev, ...transformedData }));
    };

    const handleStatusChange = (data: { patient_id: number; status: string; reason?: string }) => {
      setPatientVitals(prev => ({
        ...prev,
        [data.patient_id]: {
          ...prev[data.patient_id],
          status: data.status as 'normal' | 'watch' | 'critical',
          reason: data.reason,
        }
      }));
    };

    const handleConnectionChange = (data: { status: ConnectionStatus }) => {
      setConnectionStatus(data.status);
    };

    // Register event listeners
    wsService.on('vitals_update', handleVitalsUpdate);
    wsService.on('status_change', handleStatusChange);
    wsService.on('connection', handleConnectionChange);

    // Connect to WebSocket
    connectWebSocket();
    
    // Debug: Log connection status
    console.log('WebSocket connection setup complete');

    // Cleanup
    return () => {
      wsService.off('vitals_update', handleVitalsUpdate);
      wsService.off('status_change', handleStatusChange);
      wsService.off('connection', handleConnectionChange);
      wsService.disconnect();
    };
  }, [wsService, patients]);

  // Update system status periodically
  useEffect(() => {
    const updateSystemStatus = async () => {
      try {
        const status = await systemApi.getStatus();
        setSystemStatus(status);
      } catch (error) {
        console.error('Error updating system status:', error);
      }
    };

    const interval = setInterval(updateSystemStatus, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusCounts = useCallback(() => {
    const counts = { normal: 0, watch: 0, critical: 0 };
    
    Object.values(patientVitals).forEach(patient => {
      counts[patient.status]++;
    });
    
    return counts;
  }, [patientVitals]);

  const handleNavigateToOngoingTreatment = (treatment: Treatment) => {
    const patient = patients.find(p => p.id === treatment.patient_id);
    if (patient) {
      const newTreatment = { patient, treatment };
      setOngoingTreatments(prev => [...prev, newTreatment]);
      setSelectedTreatment(newTreatment);
      setCurrentPage('ongoing-treatment');
    }
  };

  const handleNavigateToOngoingDispatch = (dispatch: Dispatch) => {
    const patient = patients.find(p => p.id === dispatch.patient_id);
    if (patient) {
      const newDispatch = { patient, dispatch };
      setOngoingDispatches(prev => [...prev, newDispatch]);
      setSelectedDispatch(newDispatch);
      setCurrentPage('ongoing-dispatch');
    }
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as 'dashboard' | 'ongoing-treatment' | 'ongoing-dispatch');
  };

  const handleSelectTreatment = (treatment: { patient: Patient; treatment: Treatment }) => {
    setSelectedTreatment(treatment);
    setCurrentPage('ongoing-treatment');
  };

  const handleSelectDispatch = (dispatch: { patient: Patient; dispatch: Dispatch }) => {
    setSelectedDispatch(dispatch);
    setCurrentPage('ongoing-dispatch');
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-hospital-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hospital monitoring system...</p>
        </div>
      </div>
    );
  }

  const statusCounts = getStatusCounts();

  // Render ongoing treatment page
  if (currentPage === 'ongoing-treatment' && selectedTreatment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationBar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          ongoingDispatchCount={ongoingDispatches.length}
          ongoingTreatmentCount={ongoingTreatments.length}
        />
        <OngoingTreatmentPage
          patient={selectedTreatment.patient}
          treatment={selectedTreatment.treatment}
          onBack={handleBackToDashboard}
        />
      </div>
    );
  }

  // Render ongoing dispatch page
  if (currentPage === 'ongoing-dispatch' && selectedDispatch) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationBar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          ongoingDispatchCount={ongoingDispatches.length}
          ongoingTreatmentCount={ongoingTreatments.length}
        />
        <OngoingDispatchPage
          patient={selectedDispatch.patient}
          dispatch={selectedDispatch.dispatch}
          onBack={handleBackToDashboard}
        />
      </div>
    );
  }

  // Render ongoing activities list (when no specific item is selected)
  if ((currentPage === 'ongoing-treatment' && !selectedTreatment) || 
      (currentPage === 'ongoing-dispatch' && !selectedDispatch)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavigationBar
          currentPage={currentPage}
          onNavigate={handleNavigate}
          ongoingDispatchCount={ongoingDispatches.length}
          ongoingTreatmentCount={ongoingTreatments.length}
        />
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {currentPage === 'ongoing-treatment' ? 'Ongoing Treatments' : 'Ongoing Dispatches'}
            </h1>
            <p className="text-gray-600">
              {currentPage === 'ongoing-treatment' 
                ? 'Select a treatment to view details' 
                : 'Select a dispatch to view details'
              }
            </p>
          </div>
          <OngoingActivitiesList
            ongoingTreatments={ongoingTreatments}
            ongoingDispatches={ongoingDispatches}
            onSelectTreatment={handleSelectTreatment}
            onSelectDispatch={handleSelectDispatch}
          />
        </div>
      </div>
    );
  }

  // Render main dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        ongoingDispatchCount={ongoingDispatches.length}
        ongoingTreatmentCount={ongoingTreatments.length}
      />
      
      {/* Connection Status */}
      <ConnectionStatusIndicator status={connectionStatus} />
      
      {/* Header */}
      <div className="dashboard-header shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">
                KPUM Hospital Monitoring
              </h1>
              <p className="text-blue-100 mt-1">
                Real-time patient vital signs monitoring
              </p>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4 text-white">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  <span className="text-sm font-medium">Normal: {statusCounts.normal}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <span className="text-sm font-medium">Watch: {statusCounts.watch}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <span className="text-sm font-medium">Critical: {statusCounts.critical}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-white">
                {connectionStatus === 'connected' ? (
                  <Wifi className="w-5 h-5 text-green-300" />
                ) : (
                  <WifiOff className="w-5 h-5 text-red-300" />
                )}
                <span className="text-sm font-medium">
                  {connectionStatus === 'connected' ? 'Live' : 'Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Status Bar */}
      {systemStatus && (
        <SystemStatusBar status={systemStatus} />
      )}

      {/* Patient Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {patients.map(patient => (
            <PatientCard
              key={patient.id}
              patient={patient}
              vitals={patientVitals[patient.id]}
              connectionStatus={connectionStatus}
              onNavigateToOngoingTreatment={handleNavigateToOngoingTreatment}
              onNavigateToOngoingDispatch={handleNavigateToOngoingDispatch}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span>Total Patients: {patients.length}</span>
              <span>Active Connections: {systemStatus?.active_connections || 0}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>Last Update: {systemStatus?.last_update ? new Date(systemStatus.last_update).toLocaleTimeString() : 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 