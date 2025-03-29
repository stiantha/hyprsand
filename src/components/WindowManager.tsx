import React, { useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useWindowState } from '../hooks/useWindowState';
import { Window } from './Window';
import { KeybindingHandler } from './KeybindingHandler';
import { KeyBinding } from '../hooks/useKeyBindings';

interface WindowManagerProps {
  children?: React.ReactNode;
}

export const WindowManager: React.FC<WindowManagerProps> = ({ children }) => {
  const {
    windows,
    focusedWindowId,
    createWindow,
    closeWindow,
    focusWindow,
    moveWindow,
    resizeWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    focusNextWindow,
    focusPreviousWindow,
  } = useWindowState();
  
  // Demo content creation function
  const createRandomContent = useCallback(() => {
    const windowTypes = [
      { title: 'Terminal', content: <div className="font-mono">$ _</div> },
      { title: 'Browser', content: <div className="min-h-[300px]"><span className="text-blue-500 underline">https://example.com</span></div> },
      { title: 'Text Editor', content: <div className="font-mono">Welcome to Hyprfolio Text Editor</div> },
      { title: 'File Explorer', content: <div className="space-y-2"><div className="flex items-center gap-2"><span>📁</span> Documents</div><div className="flex items-center gap-2"><span>📁</span> Pictures</div><div className="flex items-center gap-2"><span>📄</span> README.md</div></div> },
    ];
    
    const randomType = windowTypes[Math.floor(Math.random() * windowTypes.length)];
    
    createWindow({
      id: uuidv4(),
      title: `${randomType.title} - ${Math.floor(Math.random() * 1000)}`,
      content: randomType.content,
      position: {
        x: 50 + Math.random() * 100,
        y: 50 + Math.random() * 100,
      },
      size: {
        width: 400,
        height: 300,
      },
    });
  }, [createWindow]);
  
  // Move focused window by offset
  const moveFocusedWindow = useCallback((offsetX: number, offsetY: number) => {
    if (!focusedWindowId) return;
    
    const window = windows.find(w => w.id === focusedWindowId);
    if (!window) return;
    
    moveWindow(focusedWindowId, {
      x: window.position.x + offsetX,
      y: window.position.y + offsetY,
    });
  }, [focusedWindowId, windows, moveWindow]);
  
  // Resize focused window by offset
  const resizeFocusedWindow = useCallback((offsetWidth: number, offsetHeight: number) => {
    if (!focusedWindowId) return;
    
    const window = windows.find(w => w.id === focusedWindowId);
    if (!window) return;
    
    resizeWindow(focusedWindowId, {
      width: Math.max(200, window.size.width + offsetWidth),
      height: Math.max(150, window.size.height + offsetHeight),
    });
  }, [focusedWindowId, windows, resizeWindow]);
  
  // Define keybindings
  const keyBindings = useMemo<KeyBinding[]>(() => [
    {
      key: 'Ctrl+O',
      action: createRandomContent,
      description: 'Open a new window',
    },
    {
      key: 'Alt+Tab',
      action: focusNextWindow,
      description: 'Focus next window',
    },
    {
      key: 'Alt+Shift+Tab',
      action: focusPreviousWindow,
      description: 'Focus previous window',
    },
    {
      key: 'Alt+ArrowUp',
      action: () => moveFocusedWindow(0, -20),
      description: 'Move window up',
    },
    {
      key: 'Alt+ArrowDown',
      action: () => moveFocusedWindow(0, 20),
      description: 'Move window down',
    },
    {
      key: 'Alt+ArrowLeft',
      action: () => moveFocusedWindow(-20, 0),
      description: 'Move window left',
    },
    {
      key: 'Alt+ArrowRight',
      action: () => moveFocusedWindow(20, 0),
      description: 'Move window right',
    },
    {
      key: 'Ctrl+Alt+ArrowUp',
      action: () => resizeFocusedWindow(0, -20),
      description: 'Decrease height',
    },
    {
      key: 'Ctrl+Alt+ArrowDown',
      action: () => resizeFocusedWindow(0, 20),
      description: 'Increase height',
    },
    {
      key: 'Ctrl+Alt+ArrowLeft',
      action: () => resizeFocusedWindow(-20, 0),
      description: 'Decrease width',
    },
    {
      key: 'Ctrl+Alt+ArrowRight',
      action: () => resizeFocusedWindow(20, 0),
      description: 'Increase width',
    },
    {
      key: 'Alt+w',
      action: () => {
        if (focusedWindowId) {
          closeWindow(focusedWindowId);
        }
      },
      description: 'Close focused window',
    },
    {
      key: 'Alt+m',
      action: () => {
        if (focusedWindowId) {
          maximizeWindow(focusedWindowId);
        }
      },
      description: 'Maximize focused window',
    },
    {
      key: 'Alt+r',
      action: () => {
        if (focusedWindowId) {
          restoreWindow(focusedWindowId);
        }
      },
      description: 'Restore focused window',
    },
  ], [
    createRandomContent,
    focusNextWindow,
    focusPreviousWindow,
    moveFocusedWindow,
    resizeFocusedWindow,
    focusedWindowId,
    closeWindow,
    maximizeWindow,
    restoreWindow,
  ]);
  
  return (
    <KeybindingHandler keyBindings={keyBindings}>
      <div className="waybar h-[5vh] w-full">
        <div className="text-sm">Hyprfolio</div>
        <div className="flex items-center gap-4">
          <span>Press F1 for help</span>
          <button 
            onClick={createRandomContent}
            className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
          >
            New Window
          </button>
        </div>
      </div>
      
      <div className="relative h-[95vh] w-full bg-gray-100 dark:bg-gray-900 overflow-hidden">
        {windows.map(window => (
          <Window
            key={window.id}
            window={window}
            onFocus={focusWindow}
            onClose={closeWindow}
            onMove={moveWindow}
            onResize={resizeWindow}
            onMinimize={minimizeWindow}
            onMaximize={maximizeWindow}
            onRestore={restoreWindow}
          />
        ))}
        {children}
      </div>
    </KeybindingHandler>
  );
}; 