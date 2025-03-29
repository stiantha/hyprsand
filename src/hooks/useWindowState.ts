import { useReducer } from 'react';

export interface WindowState {
  id: string;
  title: string;
  content: React.ReactNode;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  isFocused: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
}

type WindowAction =
  | { type: 'CREATE_WINDOW'; window: Omit<WindowState, 'zIndex' | 'isFocused'> }
  | { type: 'CLOSE_WINDOW'; id: string }
  | { type: 'FOCUS_WINDOW'; id: string }
  | { type: 'MOVE_WINDOW'; id: string; position: { x: number; y: number } }
  | { type: 'RESIZE_WINDOW'; id: string; size: { width: number; height: number } }
  | { type: 'MINIMIZE_WINDOW'; id: string }
  | { type: 'MAXIMIZE_WINDOW'; id: string }
  | { type: 'RESTORE_WINDOW'; id: string };

interface WindowsState {
  windows: WindowState[];
  focusedWindowId: string | null;
  highestZIndex: number;
}

const initialState: WindowsState = {
  windows: [],
  focusedWindowId: null,
  highestZIndex: 0,
};

function windowsReducer(state: WindowsState, action: WindowAction): WindowsState {
  switch (action.type) {
    case 'CREATE_WINDOW': {
      const newZIndex = state.highestZIndex + 1;
      const newWindow: WindowState = {
        ...action.window,
        zIndex: newZIndex,
        isFocused: true,
        isMinimized: false,
        isMaximized: false,
      };
      
      return {
        ...state,
        windows: [
          ...state.windows.map(w => ({ ...w, isFocused: false })),
          newWindow,
        ],
        focusedWindowId: newWindow.id,
        highestZIndex: newZIndex,
      };
    }
    
    case 'CLOSE_WINDOW': {
      const updatedWindows = state.windows.filter(w => w.id !== action.id);
      const newFocusedId = state.focusedWindowId === action.id
        ? updatedWindows.length > 0
          ? updatedWindows[updatedWindows.length - 1].id
          : null
        : state.focusedWindowId;
          
      return {
        ...state,
        windows: updatedWindows.map(w => ({
          ...w,
          isFocused: w.id === newFocusedId,
        })),
        focusedWindowId: newFocusedId,
      };
    }
    
    case 'FOCUS_WINDOW': {
      if (!state.windows.find(w => w.id === action.id)) {
        return state;
      }
      
      const newZIndex = state.highestZIndex + 1;
      
      return {
        ...state,
        windows: state.windows.map(w => ({
          ...w,
          isFocused: w.id === action.id,
          zIndex: w.id === action.id ? newZIndex : w.zIndex,
        })),
        focusedWindowId: action.id,
        highestZIndex: newZIndex,
      };
    }
    
    case 'MOVE_WINDOW': {
      return {
        ...state,
        windows: state.windows.map(w => 
          w.id === action.id
            ? { ...w, position: action.position }
            : w
        ),
      };
    }
    
    case 'RESIZE_WINDOW': {
      return {
        ...state,
        windows: state.windows.map(w => 
          w.id === action.id
            ? { ...w, size: action.size }
            : w
        ),
      };
    }
    
    case 'MINIMIZE_WINDOW': {
      return {
        ...state,
        windows: state.windows.map(w => 
          w.id === action.id
            ? { ...w, isMinimized: true, isMaximized: false }
            : w
        ),
      };
    }
    
    case 'MAXIMIZE_WINDOW': {
      return {
        ...state,
        windows: state.windows.map(w => 
          w.id === action.id
            ? { ...w, isMaximized: true, isMinimized: false }
            : w
        ),
      };
    }
    
    case 'RESTORE_WINDOW': {
      return {
        ...state,
        windows: state.windows.map(w => 
          w.id === action.id
            ? { ...w, isMaximized: false, isMinimized: false }
            : w
        ),
      };
    }
    
    default:
      return state;
  }
}

export function useWindowState() {
  const [state, dispatch] = useReducer(windowsReducer, initialState);
  
  const createWindow = (window: Omit<WindowState, 'zIndex' | 'isFocused' | 'isMinimized' | 'isMaximized'>) => {
    dispatch({ type: 'CREATE_WINDOW', window });
  };
  
  const closeWindow = (id: string) => {
    dispatch({ type: 'CLOSE_WINDOW', id });
  };
  
  const focusWindow = (id: string) => {
    dispatch({ type: 'FOCUS_WINDOW', id });
  };
  
  const moveWindow = (id: string, position: { x: number; y: number }) => {
    dispatch({ type: 'MOVE_WINDOW', id, position });
  };
  
  const resizeWindow = (id: string, size: { width: number; height: number }) => {
    dispatch({ type: 'RESIZE_WINDOW', id, size });
  };
  
  const minimizeWindow = (id: string) => {
    dispatch({ type: 'MINIMIZE_WINDOW', id });
  };
  
  const maximizeWindow = (id: string) => {
    dispatch({ type: 'MAXIMIZE_WINDOW', id });
  };
  
  const restoreWindow = (id: string) => {
    dispatch({ type: 'RESTORE_WINDOW', id });
  };
  
  const focusNextWindow = () => {
    const { windows, focusedWindowId } = state;
    if (windows.length <= 1) return;
    
    const currentIndex = windows.findIndex(w => w.id === focusedWindowId);
    const nextIndex = (currentIndex + 1) % windows.length;
    focusWindow(windows[nextIndex].id);
  };
  
  const focusPreviousWindow = () => {
    const { windows, focusedWindowId } = state;
    if (windows.length <= 1) return;
    
    const currentIndex = windows.findIndex(w => w.id === focusedWindowId);
    const previousIndex = (currentIndex - 1 + windows.length) % windows.length;
    focusWindow(windows[previousIndex].id);
  };
  
  return {
    windows: state.windows,
    focusedWindowId: state.focusedWindowId,
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
  };
} 