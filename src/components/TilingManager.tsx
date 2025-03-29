import React, { useCallback, useMemo } from 'react';
import { useTilingManager, TileWindow, TileDirection } from '../hooks/useTilingManager';
import { TiledWindow } from './TiledWindow';
import { KeybindingHandler } from './KeybindingHandler';
import { KeyBinding } from '../hooks/useKeyBindings';

interface TilingManagerProps {
  children?: React.ReactNode;
}

export const TilingManager: React.FC<TilingManagerProps> = ({ children }) => {
  const {
    nodes,
    focusedId,
    layout: layoutMode,
    computeLayout,
    addWindow,
    closeWindow,
    focusWindow,
    splitWindow,
    toggleLayout,
    focusNextWindow,
    focusPreviousWindow,
  } = useTilingManager();
  
  // Demo content creation function
  const createRandomContent = useCallback(() => {
    const windowTypes = [
      { title: 'Terminal', content: <div className="font-mono">$ _</div> },
      { title: 'Browser', content: <div className="min-h-[300px]"><span className="text-blue-500 underline">https://example.com</span></div> },
      { title: 'Text Editor', content: <div className="font-mono">Welcome to Hyprfolio Text Editor</div> },
      { title: 'File Explorer', content: <div className="space-y-2"><div className="flex items-center gap-2"><span>📁</span> Documents</div><div className="flex items-center gap-2"><span>📁</span> Pictures</div><div className="flex items-center gap-2"><span>📄</span> README.md</div></div> },
    ];
    
    const randomType = windowTypes[Math.floor(Math.random() * windowTypes.length)];
    
    addWindow({
      type: 'window',
      title: `${randomType.title} - ${Math.floor(Math.random() * 1000)}`,
      content: randomType.content,
    });
  }, [addWindow]);
  
  // Split window handlers
  const handleSplitHorizontal = useCallback((id: string) => {
    const direction: TileDirection = 'horizontal';
    splitWindow(id, direction);
  }, [splitWindow]);
  
  const handleSplitVertical = useCallback((id: string) => {
    const direction: TileDirection = 'vertical';
    splitWindow(id, direction);
  }, [splitWindow]);
  
  // Define keybindings
  const keyBindings = useMemo<KeyBinding[]>(() => [
    {
      key: 'Ctrl+o',
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
      key: 'Alt+h',
      action: () => {
        if (focusedId) {
          handleSplitHorizontal(focusedId);
        }
      },
      description: 'Split focused window horizontally',
    },
    {
      key: 'Alt+v',
      action: () => {
        if (focusedId) {
          handleSplitVertical(focusedId);
        }
      },
      description: 'Split focused window vertically',
    },
    {
      key: 'Alt+w',
      action: () => {
        if (focusedId) {
          closeWindow(focusedId);
        }
      },
      description: 'Close focused window',
    },
    {
      key: 'Alt+t',
      action: toggleLayout,
      description: 'Toggle between tiling and floating layouts',
    },
  ], [
    createRandomContent,
    focusNextWindow,
    focusPreviousWindow,
    focusedId,
    handleSplitHorizontal,
    handleSplitVertical,
    closeWindow,
    toggleLayout,
  ]);
  
  // Compute the layout for all windows
  const windowLayouts = computeLayout();
  
  // Filter for window nodes
  const windowNodes = Object.values(nodes).filter(
    node => node.type === 'window'
  ) as TileWindow[];
  
  return (
    <KeybindingHandler keyBindings={keyBindings}>
      <div className="waybar h-[5vh] w-full z-10 relative">
        <div className="text-sm">Hyprfolio - Tiling Window Manager</div>
        <div className="flex items-center gap-2">
          <span>Layout: {layoutMode === 'tiling' ? 'Tiled' : 'Floating'}</span>
          <button 
            onClick={createRandomContent}
            className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
          >
            New Window
          </button>
          <button 
            onClick={toggleLayout}
            className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
          >
            Toggle Layout
          </button>
          <button 
            onClick={focusNextWindow}
            className="bg-green-500 text-white px-2 py-1 rounded text-xs"
          >
            Next Window
          </button>
          {focusedId && (
            <>
              <button 
                onClick={() => handleSplitHorizontal(focusedId)}
                className="bg-green-500 text-white px-2 py-1 rounded text-xs"
              >
                Split H
              </button>
              <button 
                onClick={() => handleSplitVertical(focusedId)}
                className="bg-green-500 text-white px-2 py-1 rounded text-xs"
              >
                Split V
              </button>
              <button 
                onClick={() => closeWindow(focusedId)}
                className="bg-red-500 text-white px-2 py-1 rounded text-xs"
              >
                Close
              </button>
            </>
          )}
          <span className="text-xs ml-2">Press F1 for help</span>
        </div>
      </div>
      
      <div className="relative h-[95vh] w-full bg-gray-100 dark:bg-gray-900 overflow-hidden z-10">
        {windowNodes.map(window => (
          <TiledWindow
            key={window.id}
            window={window}
            layout={windowLayouts[window.id] || { x: 0, y: 0, width: 100, height: 100 }}
            onFocus={focusWindow}
            onClose={closeWindow}
            onSplitHorizontal={handleSplitHorizontal}
            onSplitVertical={handleSplitVertical}
          />
        ))}
        {children}
      </div>
    </KeybindingHandler>
  );
}; 