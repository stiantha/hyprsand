import { useState } from 'react';
import { useKeyBindings, KeyBinding } from '../hooks/useKeyBindings';

interface KeybindingHandlerProps {
  keyBindings: KeyBinding[];
  children: React.ReactNode;
}

export const KeybindingHandler: React.FC<KeybindingHandlerProps> = ({ keyBindings, children }) => {
  const [isHelpVisible, setIsHelpVisible] = useState<boolean>(false);
  
  // Just call the hook without destructuring its return value
  useKeyBindings([
    ...keyBindings,
    {
      key: 'F1',
      action: () => setIsHelpVisible(prev => !prev),
      description: 'Toggle keybinding help',
    },
  ]);

  // Create full list of keybindings including F1
  const allKeybindings = [
    ...keyBindings, 
    { key: 'F1', description: 'Toggle keybinding help', action: () => {} }
  ];

  return (
    <div className="relative w-full h-full">
      {/* Background keybinding text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="text-white dark:text-white text-opacity-5 dark:text-opacity-10 font-bold select-none text-center transform scale-125">
          <div className="text-[120px] mb-8 tracking-widest">HYPRWORLD</div>
          <div className="gap-4 text-[18px] opacity-70 px-8">
            {allKeybindings.map((binding, i) => (
              <div key={i} className="flex items-center justify-start">
                <span className="font-mono bg-opacity-10 dark:bg-opacity-10 px-2 py-1 rounded mr-2 min-w-[90px] text-left">{binding.key}</span> 
                <span>{binding.description}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      {children}
      
      {/* Help popup (only shown when F1 is pressed) */}
      {isHelpVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Keyboard Shortcuts</h2>
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              You can use these keyboard shortcuts to control the tiling window manager. 
              Press F1 at any time to show this help again.
            </p>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left py-2 px-4 text-gray-900 dark:text-white">Key</th>
                  <th className="text-left py-2 px-4 text-gray-900 dark:text-white">Description</th>
                </tr>
              </thead>
              <tbody>
                {allKeybindings.map((binding, index) => (
                  <tr key={index} className="border-b dark:border-gray-700">
                    <td className="py-2 px-4 font-mono bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white">{binding.key}</td>
                    <td className="py-2 px-4 text-gray-700 dark:text-gray-300">{binding.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 flex justify-end">
              <button 
                onClick={() => setIsHelpVisible(false)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 