import { createContext } from 'react';
import { useTilingManager } from '../hooks/useTilingManager';

export const TilingContext = createContext<ReturnType<typeof useTilingManager> | null>(null); 