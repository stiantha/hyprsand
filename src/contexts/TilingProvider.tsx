import { ReactNode } from 'react';
import { useTilingManager } from '../hooks/useTilingManager';
import { TilingContext } from './TilingContext';

export const TilingProvider = ({ children }: { children: ReactNode }) => {
  const tilingManager = useTilingManager();
  
  return (
    <TilingContext.Provider value={tilingManager}>
      {children}
    </TilingContext.Provider>
  );
}; 