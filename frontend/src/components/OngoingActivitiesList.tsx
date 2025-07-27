import React from 'react';
import { Car, Pill, User, Clock, MapPin } from 'lucide-react';
import { Patient, Treatment, Dispatch } from '../types';

interface OngoingActivitiesListProps {
  ongoingTreatments: { patient: Patient; treatment: Treatment }[];
  ongoingDispatches: { patient: Patient; dispatch: Dispatch }[];
  onSelectTreatment: (treatment: { patient: Patient; treatment: Treatment }) => void;
  onSelectDispatch: (dispatch: { patient: Patient; dispatch: Dispatch }) => void;
}

const OngoingActivitiesList: React.FC<OngoingActivitiesListProps> = ({
  ongoingTreatments,
  ongoingDispatches,
  onSelectTreatment,
  onSelectDispatch
}) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Ongoing Treatments */}
      {ongoingTreatments.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Pill className="w-5 h-5 mr-2 text-green-600" />
            Ongoing Treatments ({ongoingTreatments.length})
          </h2>
          
          <div className="space-y-3">
            {ongoingTreatments.map((item, index) => (
              <div 
                key={`treatment-${item.treatment.id}`}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onSelectTreatment(item)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{item.patient.name}</h3>
                      <p className="text-sm text-gray-600">Room {item.patient.room_id}</p>
                      <p className="text-xs text-gray-500">{item.treatment.treatment_type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      <Clock className="w-4 h-4 inline mr-1" />
                      {formatTime(item.treatment.timestamp)}
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {item.treatment.decision}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ongoing Dispatches */}
      {ongoingDispatches.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Car className="w-5 h-5 mr-2 text-red-600" />
            Ongoing Dispatches ({ongoingDispatches.length})
          </h2>
          
          <div className="space-y-3">
            {ongoingDispatches.map((item, index) => (
              <div 
                key={`dispatch-${item.dispatch.id}`}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onSelectDispatch(item)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{item.patient.name}</h3>
                      <p className="text-sm text-gray-600">Room {item.patient.room_id}</p>
                      <p className="text-xs text-gray-500">{item.dispatch.dispatch_type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      {item.dispatch.destination}
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.dispatch.priority === 'high' ? 'bg-red-100 text-red-800' :
                      item.dispatch.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {item.dispatch.priority}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Activities */}
      {ongoingTreatments.length === 0 && ongoingDispatches.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="text-gray-400 mb-4">
            <Car className="w-12 h-12 mx-auto mb-2" />
            <Pill className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Ongoing Activities</h3>
          <p className="text-gray-600">
            Start a treatment or dispatch from the dashboard to see ongoing activities here.
          </p>
        </div>
      )}
    </div>
  );
};

export default OngoingActivitiesList; 