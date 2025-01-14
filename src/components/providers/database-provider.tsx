'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNotification } from './notification-provider';
import { azureQueryService } from '../../services/azure-query.service';

interface DatabaseContextType {
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  executeQuery: (query: string) => Promise<any>;
  onConnected: (callback: () => void) => void;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const { showNotification } = useNotification();
  const [connectionCallbacks, setConnectionCallbacks] = useState<(() => void)[]>([]);

  const onConnected = useCallback((callback: () => void) => {
    setConnectionCallbacks(prev => [...prev, callback]);
  }, []);

  const connect = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/db`);
      const data = await response.json();
      
      if (!response.ok || data.status === 'error') {
        throw new Error(data.message || 'Database connection failed');
      }
      
      setIsConnected(true);
      showNotification('Database connected successfully', 'success');
      connectionCallbacks.forEach(callback => callback());
    } catch (error) {
      setIsConnected(false);
      showNotification(error instanceof Error ? error.message : 'Database connection failed', 'error');
      console.error('Database connection error:', error);
      throw error;
    }
  };

  const disconnect = async () => {
    setIsConnected(false);
  };

  const executeQuery = async (query: string) => {
    try {
      const result = await azureQueryService.executeSqlQuery(query);
      return result;
    } catch (error) {
      showNotification('Query execution failed', 'error');
      throw error;
    }
  };

  // Add auto-connect effect
  useEffect(() => {
    if (!isConnected) {
      connect();
    }
  }, [isConnected]);

  return (
    <DatabaseContext.Provider value={{
      isConnected,
      connect,
      disconnect,
      executeQuery,
      onConnected
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
