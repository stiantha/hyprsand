import { ReactNode, useState } from 'react';
import { useKeyBindings, KeyBinding } from '../hooks/useKeyBindings';
import { KeybindingContext } from './KeybindingContext';

export const KeybindingProvider = ({ children }: { children: ReactNode }) => {
  const [keyBindings, setKeyBindings] = useState<KeyBinding[]>([]);
  const [isHelpVisible, setIsHelpVisible] = useState(false);

  const addKeyBinding = (binding: KeyBinding) => {
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

  const allBindings = [
    ...keyBindings,
    {
      key: 'F1',
      action: toggleHelp,
      description: 'Toggle keybinding help',
      priority: 1
    }
  ];

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