import React from 'react';
import { TileWindow } from '../hooks/useTilingManager';

interface TiledWindowProps {
  window: TileWindow;
  layout: { x: number; y: number; width: number; height: number };
  onFocus: (id: string) => void;
  onClose: (id: string) => void;
  onSplitHorizontal: (id: string) => void;
  onSplitVertical: (id: string) => void;
}

export const TiledWindow: React.FC<TiledWindowProps> = ({
  window,
  layout,
  onFocus,
  onClose,
  onSplitHorizontal,
  onSplitVertical,
}) => {
  const { id, title, content, isFocused } = window;
  
  const handleMouseDown = () => {
    if (!isFocused) {
      onFocus(id);
    }
  };
  
  // Convert percentage values to pixel positions with appropriate sizing
  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${layout.x}%`,
    top: `${layout.y}%`,
    width: `${layout.width}%`,
    height: `${layout.height}%`,
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.2s ease-in-out',
  };
  
  const windowClasses = `window animate-window-fade-in rounded-lg shadow-lg border-2 ${isFocused ? 'window-focused border-blue-500 dark:border-blue-400' : 'border-gray-300 dark:border-gray-600'}`;
  
  return (
    <div
      className={windowClasses}
      style={style}
      onMouseDown={handleMouseDown}
      data-testid={`window-${id}`}
    >
      <div className="window-title-bar select-none rounded-t-lg flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
        <div className="text-gray-900 dark:text-white font-medium truncate">{title}</div>
        <div className="flex space-x-2">
          <button
            onClick={() => onSplitHorizontal(id)}
            className="flex items-center justify-center w-5 h-5 text-xs rounded hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none"
            aria-label="Split horizontally"
            title="Split horizontally"
          >
            ⬌
          </button>
          <button
            onClick={() => onSplitVertical(id)}
            className="flex items-center justify-center w-5 h-5 text-xs rounded hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none"
            aria-label="Split vertically"
            title="Split vertically"
          >
            ⬍
          </button>
          <button 
            onClick={() => onClose(id)}
            className="w-4 h-4 bg-red-500 rounded-full hover:bg-red-600 focus:outline-none"
            aria-label="Close"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-b-lg">
        {content}
      </div>
    </div>
  );
}; 