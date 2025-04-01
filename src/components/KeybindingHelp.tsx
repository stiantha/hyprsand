import React from 'react';
import { KeyBinding } from '../hooks/useKeyBindings';

interface KeybindingHelpProps {
  keyBindings: KeyBinding[];
  onClose: () => void;
}

function formatKey(key: string) {
  return key.split('+').map((part, i, arr) => (
    <span key={part} className="flex items-center">
      <kbd className="px-2 py-1 bg-gray-700 rounded text-sm text-white">
        {part.toUpperCase()}
      </kbd>
      {i < arr.length - 1 && (
        <span className="mx-1 text-gray-400">+</span>
      )}
    </span>
  ));
}

export function KeybindingHelp({ keyBindings, onClose }: KeybindingHelpProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-black/90 backdrop-blur-sm rounded-lg p-6 shadow-xl">
        <div className="relative flex items-center justify-center mb-6">
          <h2 className="text-xl font-semibold text-white">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="absolute right-0 text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>
        <div className="flex justify-center">
          <div className="grid grid-cols-[auto_auto_1fr] gap-x-3 gap-y-4">
            {keyBindings.map((binding, index) => (
              <React.Fragment key={index}>
                <div className="flex items-center justify-end">
                  {formatKey(binding.key)}
                </div>
                <span className="text-gray-500">|</span>
                <span className="text-gray-300">
                  {binding.description}
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 