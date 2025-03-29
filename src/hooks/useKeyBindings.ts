import { useEffect, useCallback } from 'react';

export type KeyCombination = string;
export type KeyAction = () => void;

export interface KeyBinding {
  key: KeyCombination;
  action: KeyAction;
  description: string;
}

function parseKeyCombination(combination: KeyCombination): { key: string; ctrl: boolean; shift: boolean; alt: boolean } {
  const parts = combination.split('+');
  const key = parts[parts.length - 1].toLowerCase();
  const ctrl = parts.includes('Ctrl');
  const shift = parts.includes('Shift');
  const alt = parts.includes('Alt');
  
  return { key, ctrl, shift, alt };
}

function normalizeKey(key: string): string {
  // Normalize special keys
  switch (key.toLowerCase()) {
    case 'arrowup': return 'up';
    case 'arrowdown': return 'down';
    case 'arrowleft': return 'left';
    case 'arrowright': return 'right';
    case 'control': return 'ctrl';
    case 'escape': return 'esc';
    case ' ': return 'space';
    default: return key.toLowerCase();
  }
}

export function useKeyBindings(bindings: KeyBinding[]) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't handle events when typing in input fields
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement
    ) {
      return;
    }
    
    const normalizedKey = normalizeKey(event.key);
    
    // Log for debugging
    console.log('Key pressed:', {
      normalizedKey,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey
    });
    
    for (const binding of bindings) {
      const parsedCombination = parseKeyCombination(binding.key);
      
      // For Tab, special handling is needed because browsers use it for navigation
      if (normalizedKey === 'tab') {
        if (
          (parsedCombination.key.toLowerCase() === 'tab') &&
          (event.ctrlKey === parsedCombination.ctrl) &&
          (event.shiftKey === parsedCombination.shift) &&
          (event.altKey === parsedCombination.alt)
        ) {
          event.preventDefault();
          binding.action();
          return;
        }
      } else if (
        normalizedKey === parsedCombination.key.toLowerCase() &&
        event.ctrlKey === parsedCombination.ctrl &&
        event.shiftKey === parsedCombination.shift &&
        event.altKey === parsedCombination.alt
      ) {
        event.preventDefault();
        binding.action();
        console.log('Matched keybinding:', binding.key);
        return;
      }
    }
  }, [bindings]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  
  // Return functions to programmatically trigger key actions
  const triggerAction = useCallback((keyCombination: KeyCombination) => {
    const binding = bindings.find(b => b.key === keyCombination);
    if (binding) {
      binding.action();
      return true;
    }
    return false;
  }, [bindings]);
  
  return {
    triggerAction,
    bindings,
  };
} 