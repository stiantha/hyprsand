import { useContext } from 'react';
import { TilingContext } from '../contexts/TilingContext';

export const useTiling = () => {
  const context = useContext(TilingContext);
  
  if (!context) {
    throw new Error('useTiling must be used within a TilingProvider');
  }
  
  return context;
}; 