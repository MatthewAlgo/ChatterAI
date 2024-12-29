'use client';

import React, { createContext, useContext, useState } from 'react';
import { useNotification } from './notification-provider';
import { azureQueryService } from '../../services/azure-query.service';

interface DatabaseContextType {
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  executeQuery: (query: string) => Promise<any>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const { showNotification } = useNotification();

  const connect = async () => {
    try {
      const response = await fetch('/api/db');
      if (!response.ok) throw new Error('Database connection failed');
      setIsConnected(true);
      showNotification('Database connected successfully', 'success');
    } catch (error) {
      showNotification('Database connection failed', 'error');
      throw error;
    }
  };

  const disconnect = async () => {
    setIsConnected(false);
  };

  const executeQuery = async (query: string) => {
    try {
      const result = await azureQueryService.executeQuery(query);
      return result;
    } catch (error) {
      showNotification('Query execution failed', 'error');
      throw error;
    }
  };

  return (
    <DatabaseContext.Provider value={{
      isConnected,
      connect,
      disconnect,
      executeQuery
    }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
