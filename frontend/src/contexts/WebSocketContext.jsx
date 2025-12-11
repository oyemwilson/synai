import React, { createContext, useContext } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const webSocket = useWebSocket();

  return (
    <WebSocketContext.Provider value={webSocket}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};