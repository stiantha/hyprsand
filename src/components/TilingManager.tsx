import React, { useCallback, useMemo } from 'react';
import { Tile as TileType, TileDirection } from '../hooks/useTilingManager';
import { Tile } from './Tile';
import { KeybindingHandler } from '../handlers/KeybindingHandler';
import { KeyBinding } from '../hooks/useKeyBindings';
import { useTilingManager } from '../hooks/useTilingManager';

interface TilingManagerProps {
  children?: React.ReactNode;
}

export function TilingManager({ children }: TilingManagerProps) {
  const {
    nodes,
    focusedId,
    computeLayout,
    addTile,
    closeTile,
    focusTile,
    splitTile,
    focusNextTile,
    focusPreviousTile,
  } = useTilingManager();
  
  // Demo content creation function
  const createRandomContent = useCallback(() => {
    const tileTypes = [
      { title: 'Terminal', content: <div className="font-mono">$ _</div> },
      { title: 'Browser', content: <div className="min-h-[300px]"><span className="text-blue-500 underline">https://example.com</span></div> },
      { title: 'Text Editor', content: <div className="font-mono">Welcome to Hyprfolio Text Editor</div> },
      { title: 'File Explorer', content: <div className="space-y-2"><div className="flex items-center gap-2"><span>📁</span> Documents</div><div className="flex items-center gap-2"><span>📁</span> Pictures</div><div className="flex items-center gap-2"><span>📄</span> README.md</div></div> },
    ];
    
    const randomType = tileTypes[Math.floor(Math.random() * tileTypes.length)];
    
    addTile({
      type: 'tile',
      title: `${randomType.title} - ${Math.floor(Math.random() * 1000)}`,
      content: randomType.content,
    });
  }, [addTile]);
  
  // Split tile handlers
  const handleSplitHorizontal = useCallback((id: string) => {
    const direction: TileDirection = 'horizontal';
    splitTile(id, direction);
  }, [splitTile]);
  
  const handleSplitVertical = useCallback((id: string) => {
    const direction: TileDirection = 'vertical';
    splitTile(id, direction);
  }, [splitTile]);
  
  // Define keybindings
  const keyBindings = useMemo<KeyBinding[]>(() => [
    {
      key: 'w',
      action: createRandomContent,
      description: 'Open a new tile',
    },
    {
      key: 'Shift+Space',
      action: focusNextTile,
      description: 'Focus next tile',
    },
    {
      key: 'Ctrl+Space',
      action: focusPreviousTile,
      description: 'Focus previous tile',
    },
    {
      key: 'Alt+h',
      action: () => {
        if (focusedId) {
          handleSplitHorizontal(focusedId);
        }
      },
      description: 'Split focused tile horizontally',
    },
    {
      key: 'Alt+v',
      action: () => {
        if (focusedId) {
          handleSplitVertical(focusedId);
        }
      },
      description: 'Split focused tile vertically',
    },
    {
      key: 'q',
      action: () => {
        if (focusedId) {
          closeTile(focusedId);
        }
      },
      description: 'Close focused tile',
    },

  ], [
    createRandomContent,
    focusNextTile,
    focusPreviousTile,
    focusedId,
    handleSplitHorizontal,
    handleSplitVertical,
    closeTile,
  ]);
  
  // Compute the layout for all tiles
  const tileLayouts = computeLayout();
  
  // Filter for tile nodes
  const tileNodes = Object.values(nodes).filter(
    node => node.type === 'tile'
  ) as TileType[];
  
  return (
    <KeybindingHandler keyBindings={keyBindings}>
      <div className="relative h-[95vh] w-full overflow-hidden z-10 bg-transparent">
        {tileNodes.map(tile => (
          <Tile
            key={tile.id}
            tile={tile}
            layout={tileLayouts[tile.id] || { x: 0, y: 0, width: 100, height: 100 }}
            onFocus={focusTile}
            onClose={closeTile}
            onSplitHorizontal={handleSplitHorizontal}
            onSplitVertical={handleSplitVertical}
          />
        ))}
        {children}
      </div>
    </KeybindingHandler>
  );
} 