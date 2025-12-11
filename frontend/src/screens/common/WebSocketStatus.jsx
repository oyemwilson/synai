import React from 'react';
import { useWebSocketContext } from '../../contexts/WebSocketContext';

export const WebSocketStatus = () => {
  const { connectionState } = useWebSocketContext();

  const statusConfig = {
    connecting: { color: 'bg-yellow-500', text: 'Connecting...' },
    connected: { color: 'bg-green-500', text: 'Live' },
    disconnected: { color: 'bg-gray-500', text: 'Disconnected' },
    error: { color: 'bg-red-500', text: 'Connection Error' },
    failed: { color: 'bg-red-700', text: 'Connection Failed' }
  };

  const config = statusConfig[connectionState] || statusConfig.disconnected;

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-2 h-2 rounded-full ${config.color} animate-pulse`} />
      <span className="text-sm text-gray-600">{config.text}</span>
    </div>
  );
};