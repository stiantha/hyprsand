import React, { createContext, ReactNode, useState } from 'react';
import { useKeyBindings, KeyBinding } from '../hooks/useKeyBindings';

interface KeybindingContextType {
  keyBindings: KeyBinding[];
  addKeyBinding: (binding: KeyBinding) => void;
  removeKeyBinding: (key: string) => void;
  isHelpVisible: boolean;
  toggleHelp: () => void;
}

export const KeybindingContext = createContext<KeybindingContextType | null>(null);

export const KeybindingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [keyBindings, setKeyBindings] = useState<KeyBinding[]>([]);
  const [isHelpVisible, setIsHelpVisible] = useState(false);

  const addKeyBinding = (binding: KeyBinding) => {
    // Ensure the binding has a very high priority
    const bindingWithPriority = {
      ...binding,
    };
    console.log('Adding keybinding:', bindingWithPriority);
    setKeyBindings(prev => [...prev, bindingWithPriority]);
  };

  const removeKeyBinding = (key: string) => {
    console.log('Removing keybinding:', key);
    setKeyBindings(prev => prev.filter(b => b.key !== key));
  };

  const toggleHelp = () => setIsHelpVisible(prev => !prev);

  // Add F1 help toggle with low priority
  const allBindings = [
    ...keyBindings,
    {
      key: 'F1',
      action: toggleHelp,
      description: 'Toggle keybinding help',
      priority: 1
    }
  ];

  // Use the keybindings hook
  useKeyBindings(allBindings);

  return (
    <KeybindingContext.Provider value={{
      keyBindings: allBindings,
      addKeyBinding,
      removeKeyBinding,
      isHelpVisible,
      toggleHelp
    }}>
      {children}
    </KeybindingContext.Provider>
  );
}; 