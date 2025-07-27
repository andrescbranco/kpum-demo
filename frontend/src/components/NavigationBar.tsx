import React from 'react';
import { Home, Car, Pill, Activity } from 'lucide-react';

interface NavigationBarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  ongoingDispatchCount: number;
  ongoingTreatmentCount: number;
}

const NavigationBar: React.FC<NavigationBarProps> = ({ 
  currentPage, 
  onNavigate, 
  ongoingDispatchCount, 
  ongoingTreatmentCount 
}) => {
  const getActiveClass = (page: string) => {
    return currentPage === page 
      ? 'bg-blue-700 text-white' 
      : 'text-gray-300 hover:bg-blue-600 hover:text-white';
  };

  return (
    <nav className="bg-blue-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <h1 className="text-white text-xl font-bold">KPUM Hospital</h1>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors ${getActiveClass('dashboard')}`}
            >
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => onNavigate('ongoing-dispatch')}
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors ${getActiveClass('ongoing-dispatch')}`}
            >
              <Car className="w-4 h-4" />
              <span>Dispatch</span>
              {ongoingDispatchCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {ongoingDispatchCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onNavigate('ongoing-treatment')}
              className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors ${getActiveClass('ongoing-treatment')}`}
            >
              <Pill className="w-4 h-4" />
              <span>Treatment</span>
              {ongoingTreatmentCount > 0 && (
                <span className="bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {ongoingTreatmentCount}
                </span>
              )}
            </button>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm font-medium">Live</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar; 