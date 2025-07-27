import React from 'react';
import { Activity, Users, Wifi, Clock } from 'lucide-react';

interface SystemStatusBarProps {
  status: {
    status: string;
    patients_count: number;
    active_connections: number;
    simulation_started: boolean;
    last_update: string;
  };
}

const SystemStatusBar: React.FC<SystemStatusBarProps> = ({ status }) => {
  return (
    <div className="bg-white border-b border-gray-200 py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-green-500" />
              <span>System: {status.status}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span>Patients: {status.patients_count}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Wifi className="w-4 h-4 text-purple-500" />
              <span>Connections: {status.active_connections}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                status.simulation_started ? 'bg-green-500' : 'bg-red-500'
              }`}></div>
              <span>Simulation: {status.simulation_started ? 'Running' : 'Stopped'}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>Last Update: {new Date(status.last_update).toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemStatusBar; 