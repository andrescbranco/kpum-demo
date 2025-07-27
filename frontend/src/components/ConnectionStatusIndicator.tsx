import React from 'react';
import { Wifi, WifiOff, Loader } from 'lucide-react';
import { ConnectionStatus } from '../types';

interface ConnectionStatusIndicatorProps {
  status: ConnectionStatus;
}

const ConnectionStatusIndicator: React.FC<ConnectionStatusIndicatorProps> = ({ status }) => {
  const getStatusConfig = (status: ConnectionStatus) => {
    switch (status) {
      case 'connected':
        return {
          icon: Wifi,
          className: 'connection-connected',
          text: 'Connected'
        };
      case 'connecting':
        return {
          icon: Loader,
          className: 'connection-connecting',
          text: 'Connecting...'
        };
      case 'disconnected':
        return {
          icon: WifiOff,
          className: 'connection-disconnected',
          text: 'Disconnected'
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <div className={`connection-status ${config.className}`}>
      <div className="flex items-center space-x-2">
        <Icon className="w-4 h-4" />
        <span>{config.text}</span>
      </div>
    </div>
  );
};

export default ConnectionStatusIndicator; 