import React, { createContext, useContext, ReactNode } from 'react';
import { useTilingManager } from '../hooks/useTilingManager';

// Create the context with a default empty value
const TilingContext = createContext<ReturnType<typeof useTilingManager> | null>(null);

// Provider component
export const TilingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const tilingManager = useTilingManager();
  
  return (
    <TilingContext.Provider value={tilingManager}>
      {children}
    </TilingContext.Provider>
  );
};

// Custom hook to use the context
export const useTiling = () => {
  const context = useContext(TilingContext);
  
  if (!context) {
    throw new Error('useTiling must be used within a TilingProvider');
  }
  
  return context;
}; 