import { createContext } from 'react';
import { KeyBinding } from '../hooks/useKeyBindings';

export interface KeybindingContextType {
  keyBindings: KeyBinding[];
  addKeyBinding: (binding: KeyBinding) => void;
  removeKeyBinding: (key: string) => void;
  isHelpVisible: boolean;
  toggleHelp: () => void;
}

export const KeybindingContext = createContext<KeybindingContextType | null>(null); 