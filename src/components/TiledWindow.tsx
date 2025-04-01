import { TileWindow } from '../hooks/useTilingManager';

interface TiledWindowProps {
  window: TileWindow;
  layout: { x: number; y: number; width: number; height: number };
  onFocus: (id: string) => void;
  onClose: (id: string) => void;
  onSplitHorizontal: (id: string) => void;
  onSplitVertical: (id: string) => void;
}

export function TiledWindow({
  window,
  layout,
  onFocus,
  onClose,
  onSplitHorizontal,
  onSplitVertical,
}: TiledWindowProps) {
  const { id, title, content, isFocused } = window;
  
  const handleMouseDown = () => {
    if (!isFocused) {
      onFocus(id);
    }
  };
  
  const style = {
    position: 'absolute' as const,
    left: `${layout.x}%`,
    top: `${layout.y}%`,
    width: `${layout.width}%`,
    height: `${layout.height}%`,
    display: 'flex',
    flexDirection: 'column' as const,
    transition: 'all 0.2s ease-in-out',
  };

  const windowClasses = `window animate-window-fade-in rounded-lg shadow-lg ${
    isFocused 
      ? 'ring-1 ring-blue-400/50 border border-white/20' 
      : 'border border-white/10'
  }`;
  
  return (
    <div
      className={windowClasses}
      style={style}
      onMouseDown={handleMouseDown}
      data-testid={`window-${id}`}
    >
      <div className="window-title-bar select-none rounded-t-lg flex items-center justify-between p-2 bg-black/80 backdrop-blur-sm border-b border-white/10 text-white">
        <div className="font-medium truncate">{title}</div>
        <div className="flex space-x-2">
          <button
            onClick={() => onSplitHorizontal(id)}
            className="flex items-center justify-center w-5 h-5 text-xs rounded hover:bg-white/10 focus:outline-none transition-colors"
            aria-label="Split horizontally"
            title="Split horizontally"
          >
            ⬌
          </button>
          <button
            onClick={() => onSplitVertical(id)}
            className="flex items-center justify-center w-5 h-5 text-xs rounded hover:bg-white/10 focus:outline-none transition-colors"
            aria-label="Split vertically"
            title="Split vertically"
          >
            ⬍
          </button>
          <button 
            onClick={() => onClose(id)}
            className="flex items-center justify-center w-5 h-5 text-xs rounded hover:bg-white/10 focus:outline-none transition-colors"
            aria-label="Close"
            title="close window"
          >
            ✕
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4 bg-black/80 backdrop-blur-sm text-white rounded-b-lg">
        {content}
      </div>
    </div>
  );
} 