import { useState } from 'react';
import { useKeyBindings, KeyBinding } from '../hooks/useKeyBindings';
import { KeybindingHelp } from '../components/KeybindingHelp';

interface KeybindingHandlerProps {
  keyBindings: KeyBinding[];
  children: React.ReactNode;
}

export function KeybindingHandler({ keyBindings, children }: KeybindingHandlerProps) {
  const [isHelpVisible, setIsHelpVisible] = useState<boolean>(false);
  
  // Register all keybindings including the help toggle
  useKeyBindings([
    ...keyBindings,
    {
      key: 'F1',
      action: () => setIsHelpVisible(prev => !prev),
      description: 'Toggle keybinding help',
    },
  ]);

  return (
    <>
      {children}
      {isHelpVisible && (
        <KeybindingHelp 
          keyBindings={[...keyBindings, { key: 'F1', description: 'Toggle keybinding help', action: () => {} }]} 
          onClose={() => setIsHelpVisible(false)} 
        />
      )}
    </>
  );
} 