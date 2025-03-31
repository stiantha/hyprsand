import React, { useCallback, useMemo } from 'react';
import { TileWindow, TileDirection } from '../hooks/useTilingManager';
import { TiledWindow } from './Window';
import { KeybindingHandler } from './KeybindingHandler';
import { KeyBinding } from '../hooks/useKeyBindings';
import { useTiling } from '../contexts/TilingContext';

interface TilingManagerProps {
  children?: React.ReactNode;
}

export const TilingManager: React.FC<TilingManagerProps> = ({ children }) => {
  const {
    nodes,
    focusedId,
    computeLayout,
    addWindow,
    closeWindow,
    focusWindow,
    splitWindow,
    toggleLayout,
    focusNextWindow,
    focusPreviousWindow,
  } = useTiling();
  
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
      key: 'w',
      action: createRandomContent,
      description: 'Open a new window',
    },
    {
      key: 'Shift+Space',
      action: focusNextWindow,
      description: 'Focus next window',
    },
    {
      key: 'Ctrl+Space',
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
      key: 'q',
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
      <div className="relative h-[95vh] w-full overflow-hidden z-10 bg-transparent">
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