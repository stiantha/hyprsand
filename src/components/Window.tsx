import React, { useRef, useState, useEffect } from 'react';
import { WindowState } from '../hooks/useWindowState';

interface WindowProps {
  window: WindowState;
  onFocus: (id: string) => void;
  onClose: (id: string) => void;
  onMove: (id: string, position: { x: number; y: number }) => void;
  onResize: (id: string, size: { width: number; height: number }) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onRestore: (id: string) => void;
}

export const Window: React.FC<WindowProps> = ({
  window,
  onFocus,
  onClose,
  onMove,
  onResize,
  onMinimize,
  onMaximize,
  onRestore,
}) => {
  const { id, title, content, position, size, zIndex, isFocused, isMinimized, isMaximized } = window;
  const windowRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStartPosition, setResizeStartPosition] = useState({ x: 0, y: 0 });
  const [resizeStartSize, setResizeStartSize] = useState({ width: 0, height: 0 });

  // Handling window focus
  const handleMouseDown = () => {
    if (!isFocused) {
      onFocus(id);
    }
  };

  // Handle title bar drag to move window
  const handleTitleMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return;
    
    e.preventDefault();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  // Handle resize from corner
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return;
    
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeStartPosition({
      x: e.clientX,
      y: e.clientY,
    });
    setResizeStartSize({
      width: size.width,
      height: size.height,
    });
  };

  // Global mouse move and up handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        onMove(id, {
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });
      } else if (isResizing) {
        const newWidth = Math.max(200, resizeStartSize.width + (e.clientX - resizeStartPosition.x));
        const newHeight = Math.max(150, resizeStartSize.height + (e.clientY - resizeStartPosition.y));
        onResize(id, { width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [id, isDragging, isResizing, dragOffset, resizeStartPosition, resizeStartSize, onMove, onResize]);
  
  // Apply window state styles
  const windowStyles: React.CSSProperties = {
    position: 'absolute',
    left: isMaximized ? 0 : position.x,
    top: isMaximized ? 0 : position.y,
    width: isMaximized ? '100%' : size.width,
    height: isMaximized ? 'calc(100% - 5%)' : size.height,
    zIndex,
    display: isMinimized ? 'none' : 'flex',
    flexDirection: 'column',
    transition: 'box-shadow 0.2s ease-in-out',
  };

  const windowClasses = `window animate-window-fade-in ${isFocused ? 'window-focused' : ''}`;

  return (
    <div
      ref={windowRef}
      className={windowClasses}
      style={windowStyles}
      onMouseDown={handleMouseDown}
      data-testid={`window-${id}`}
    >
      <div 
        className="window-title-bar cursor-move select-none"
        onMouseDown={handleTitleMouseDown}
      >
        <div className="text-gray-900 dark:text-white font-medium truncate">{title}</div>
        <div className="flex space-x-2">
          {!isMinimized && (
            <button 
              onClick={() => onMinimize(id)}
              className="w-4 h-4 bg-yellow-500 rounded-full hover:bg-yellow-600 focus:outline-none"
              aria-label="Minimize"
            />
          )}
          {!isMaximized ? (
            <button 
              onClick={() => onMaximize(id)}
              className="w-4 h-4 bg-green-500 rounded-full hover:bg-green-600 focus:outline-none"
              aria-label="Maximize"
            />
          ) : (
            <button 
              onClick={() => onRestore(id)}
              className="w-4 h-4 bg-green-500 rounded-full hover:bg-green-600 focus:outline-none"
              aria-label="Restore"
            />
          )}
          <button 
            onClick={() => onClose(id)}
            className="w-4 h-4 bg-red-500 rounded-full hover:bg-red-600 focus:outline-none"
            aria-label="Close"
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-4 bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
        {content}
      </div>
      
      {!isMaximized && (
        <div 
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          onMouseDown={handleResizeMouseDown}
          style={{
            background: 'linear-gradient(135deg, transparent 50%, #cbd5e0 50%)',
          }}
        />
      )}
    </div>
  );
}; 