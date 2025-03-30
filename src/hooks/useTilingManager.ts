import { useReducer } from 'react';
import { v4 as uuidv4 } from 'uuid';

export type TileDirection = 'horizontal' | 'vertical';
export type TileNodeType = 'container' | 'window';

export interface BaseTileNode {
  id: string;
  type: TileNodeType;
  parent: string | null;
}

export interface TileWindow extends BaseTileNode {
  type: 'window';
  title: string;
  content: React.ReactNode;
  isFocused: boolean;
}

export interface TileContainer extends BaseTileNode {
  type: 'container';
  direction: TileDirection;
  children: string[];
  ratio: number;
}

export type TileNode = TileWindow | TileContainer;

export interface TilingState {
  nodes: Record<string, TileNode>;
  rootId: string | null;
  focusedId: string | null;
  layout: 'tiling' | 'floating';
  lastSplitDirection: TileDirection;
}

type TilingAction = 
  | { type: 'ADD_WINDOW'; window: Omit<TileWindow, 'id' | 'parent' | 'isFocused'> }
  | { type: 'CLOSE_WINDOW'; id: string }
  | { type: 'FOCUS_WINDOW'; id: string }
  | { type: 'SPLIT_WINDOW'; id: string; direction: TileDirection }
  | { type: 'ADJUST_RATIO'; id: string; ratio: number }
  | { type: 'TOGGLE_LAYOUT' };

// Create a default root container that splits the screen horizontally
const createInitialState = (): TilingState => {
  const rootId = uuidv4();
  
  return {
    nodes: {
      [rootId]: {
        id: rootId,
        type: 'container',
        direction: 'horizontal',
        children: [],
        parent: null,
        ratio: 0.5,
      } as TileContainer,
    },
    rootId,
    focusedId: null,
    layout: 'tiling',
    lastSplitDirection: 'vertical',
  };
};

const tilingReducer = (state: TilingState, action: TilingAction): TilingState => {
  switch (action.type) {
    case 'ADD_WINDOW': {
      const windowId = uuidv4();
      const newWindow: TileWindow = {
        ...action.window,
        id: windowId,
        parent: null,
        isFocused: true,
      };

      // If there's no root, create a new container as root
      if (!state.rootId) {
        const rootId = uuidv4();
        const rootContainer: TileContainer = {
          id: rootId,
          type: 'container',
          direction: 'horizontal',
          children: [windowId],
          parent: null,
          ratio: 0.5,
        };

        // Set parent of the window
        newWindow.parent = rootId;

        return {
          ...state,
          nodes: {
            [rootId]: rootContainer,
            [windowId]: newWindow,
          },
          rootId: rootId,
          focusedId: windowId,
        };
      }

      // Add window to existing layout
      const rootNode = state.nodes[state.rootId] as TileContainer;
      
      // If there are no windows yet, add it to the root
      if (rootNode.children.length === 0) {
        newWindow.parent = rootNode.id;
        
        return {
          ...state,
          nodes: {
            ...state.nodes,
            [rootNode.id]: {
              ...rootNode,
              children: [windowId],
              direction: 'horizontal',
            },
            [windowId]: newWindow,
          },
          focusedId: windowId,
        };
      }

      // If there's a focused window, create a new container and split
      if (state.focusedId) {
        const focusedNode = state.nodes[state.focusedId];
        
        if (focusedNode.type === 'window') {
          const parentNode = focusedNode.parent 
            ? state.nodes[focusedNode.parent] as TileContainer
            : null;
            
          if (!parentNode) return state;
          
          // Toggle split direction - changed to start with horizontal first
          const nextDirection = state.lastSplitDirection === 'vertical' ? 'horizontal' : 'vertical';
          
          // Create a new container for the focused window and new window
          const newContainerId = uuidv4();
          const newContainer: TileContainer = {
            id: newContainerId,
            type: 'container',
            direction: nextDirection,
            children: [focusedNode.id, windowId],
            parent: parentNode.id,
            ratio: 0.5,
          };
          
          // Update parent's children
          const parentChildren = [...parentNode.children];
          const focusedIndex = parentChildren.indexOf(focusedNode.id);
          parentChildren.splice(focusedIndex, 1, newContainerId);
          
          // Update parent references
          newWindow.parent = newContainerId;
          
          return {
            ...state,
            nodes: {
              ...state.nodes,
              [parentNode.id]: {
                ...parentNode,
                children: parentChildren,
              },
              [focusedNode.id]: {
                ...focusedNode,
                parent: newContainerId,
                isFocused: false,
              },
              [newContainerId]: newContainer,
              [windowId]: newWindow,
            },
            focusedId: windowId,
            lastSplitDirection: nextDirection,
          };
        }
      }
      
      // If no window is focused or focused node is a container, add to root
      const updatedRoot = {
        ...rootNode,
        children: [...rootNode.children, windowId],
      };
      
      newWindow.parent = rootNode.id;
      
      return {
        ...state,
        nodes: {
          ...state.nodes,
          [rootNode.id]: updatedRoot,
          [windowId]: newWindow,
        },
        focusedId: windowId,
      };
    }
    
    case 'CLOSE_WINDOW': {
      if (!state.nodes[action.id]) return state;
      
      const nodeToRemove = state.nodes[action.id];
      
      if (nodeToRemove.type !== 'window') return state;
      
      // If node has no parent, just remove it
      if (!nodeToRemove.parent) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [action.id]: _, ...remainingNodes } = state.nodes;
        
        // Find a new window to focus
        const windowNodeIds = Object.keys(remainingNodes).filter(
          id => remainingNodes[id].type === 'window'
        );
        
        return {
          ...state,
          nodes: remainingNodes,
          focusedId: windowNodeIds.length > 0 ? windowNodeIds[0] : null,
        };
      }
      
      // Get parent container
      const parentContainer = state.nodes[nodeToRemove.parent] as TileContainer;
      
      // If this is the only child, remove parent too if it's not the root
      if (parentContainer.children.length === 1) {
        if (parentContainer.id === state.rootId) {
          // If it's the root with only one child, just remove the child but keep the root
          // Reset the root container to its initial state for proper new window positioning
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [action.id]: _, ...remainingNodes } = state.nodes;
          
          return {
            ...state,
            nodes: {
              ...remainingNodes,
              [parentContainer.id]: {
                ...parentContainer,
                children: [],
                direction: 'horizontal',
                ratio: 0.5,
              },
            },
            focusedId: null,
          };
        }
        
        // Otherwise remove both the parent and child
        const grandparentId = parentContainer.parent;
        if (!grandparentId) return state;
        
        const grandparent = state.nodes[grandparentId] as TileContainer;
        const parentIndex = grandparent.children.indexOf(parentContainer.id);
        
        if (parentIndex === -1) return state;
        
        const updatedGrandparentChildren = [...grandparent.children];
        updatedGrandparentChildren.splice(parentIndex, 1);
        
        // Remove both nodes without creating unused variables
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [action.id]: _, [parentContainer.id]: __, ...remainingNodes } = state.nodes;
        
        // Find a new window to focus
        const windowNodeIds = Object.keys(remainingNodes).filter(
          id => remainingNodes[id].type === 'window'
        );
        
        return {
          ...state,
          nodes: {
            ...remainingNodes,
            [grandparentId]: {
              ...grandparent,
              children: updatedGrandparentChildren,
            },
          },
          focusedId: windowNodeIds.length > 0 ? windowNodeIds[0] : null,
        };
      }
      
      // If there are multiple children, just remove this one from the parent
      const childIndex = parentContainer.children.indexOf(action.id);
      if (childIndex === -1) return state;
      
      const updatedChildren = [...parentContainer.children];
      updatedChildren.splice(childIndex, 1);
      
      // Use proper destructuring to avoid unused variable warning
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [action.id]: _, ...remainingNodes } = state.nodes;
      
      // Find next window to focus (prioritize siblings)
      const nextSibling = updatedChildren.length > 0
        ? findFirstWindowInSubtree(updatedChildren, remainingNodes)
        : null;
      
      return {
        ...state,
        nodes: {
          ...remainingNodes,
          [parentContainer.id]: {
            ...parentContainer,
            children: updatedChildren,
          },
        },
        focusedId: nextSibling,
      };
    }
    
    case 'FOCUS_WINDOW': {
      const nodeToFocus = state.nodes[action.id];
      if (!nodeToFocus || nodeToFocus.type !== 'window') return state;
      
      // Unfocus all windows and focus the target
      const updatedNodes = Object.keys(state.nodes).reduce((acc, nodeId) => {
        const node = state.nodes[nodeId];
        if (node.type === 'window') {
          acc[nodeId] = {
            ...node,
            isFocused: nodeId === action.id,
          };
        } else {
          acc[nodeId] = node;
        }
        return acc;
      }, {} as Record<string, TileNode>);
      
      return {
        ...state,
        nodes: updatedNodes,
        focusedId: action.id,
      };
    }
    
    case 'SPLIT_WINDOW': {
      const nodeToSplit = state.nodes[action.id];
      if (!nodeToSplit || nodeToSplit.type !== 'window') return state;
      
      // Create a new window
      const newWindowId = uuidv4();
      const newWindow: TileWindow = {
        id: newWindowId,
        type: 'window',
        title: 'New Window',
        content: null,
        parent: null,
        isFocused: true,
      };
      
      // Create a new container
      const newContainerId = uuidv4();
      const newContainer: TileContainer = {
        id: newContainerId,
        type: 'container',
        direction: action.direction,
        children: [nodeToSplit.id, newWindowId],
        parent: nodeToSplit.parent,
        ratio: 0.5,
      };
      
      // Update parent references
      newWindow.parent = newContainerId;
      
      // If node has a parent, update parent's children
      if (nodeToSplit.parent) {
        const parentContainer = state.nodes[nodeToSplit.parent] as TileContainer;
        const nodeIndex = parentContainer.children.indexOf(nodeToSplit.id);
        if (nodeIndex === -1) return state;
        
        const updatedParentChildren = [...parentContainer.children];
        updatedParentChildren.splice(nodeIndex, 1, newContainerId);
        
        return {
          ...state,
          nodes: {
            ...state.nodes,
            [nodeToSplit.id]: {
              ...nodeToSplit,
              parent: newContainerId,
              isFocused: false,
            },
            [newContainerId]: newContainer,
            [newWindowId]: newWindow,
            [parentContainer.id]: {
              ...parentContainer,
              children: updatedParentChildren,
            },
          },
          focusedId: newWindowId,
          lastSplitDirection: action.direction,
        };
      } else {
        // If node has no parent (is the root), make new container the root
        return {
          ...state,
          nodes: {
            ...state.nodes,
            [nodeToSplit.id]: {
              ...nodeToSplit,
              parent: newContainerId,
              isFocused: false,
            },
            [newContainerId]: newContainer,
            [newWindowId]: newWindow,
          },
          rootId: newContainerId,
          focusedId: newWindowId,
          lastSplitDirection: action.direction,
        };
      }
    }
    
    case 'ADJUST_RATIO': {
      const container = state.nodes[action.id];
      if (!container || container.type !== 'container') return state;
      
      return {
        ...state,
        nodes: {
          ...state.nodes,
          [action.id]: {
            ...container,
            ratio: Math.max(0.1, Math.min(0.9, action.ratio)),
          },
        },
      };
    }
    
    case 'TOGGLE_LAYOUT': {
      return {
        ...state,
        layout: state.layout === 'tiling' ? 'floating' : 'tiling',
      };
    }
    
    default:
      return state;
  }
};

// Helper function to find the first window node in a subtree
function findFirstWindowInSubtree(
  nodeIds: string[],
  nodes: Record<string, TileNode>
): string | null {
  for (const nodeId of nodeIds) {
    const node = nodes[nodeId];
    if (!node) continue;
    
    if (node.type === 'window') {
      return node.id;
    } else if (node.type === 'container') {
      const windowId = findFirstWindowInSubtree(node.children, nodes);
      if (windowId) return windowId;
    }
  }
  
  return null;
}

export function useTilingManager() {
  const [state, dispatch] = useReducer(tilingReducer, null, createInitialState);
  
  const addWindow = (window: Omit<TileWindow, 'id' | 'parent' | 'isFocused'>) => {
    dispatch({ type: 'ADD_WINDOW', window });
  };
  
  const closeWindow = (id: string) => {
    dispatch({ type: 'CLOSE_WINDOW', id });
  };
  
  const focusWindow = (id: string) => {
    dispatch({ type: 'FOCUS_WINDOW', id });
  };
  
  const splitWindow = (id: string, direction: TileDirection) => {
    dispatch({ type: 'SPLIT_WINDOW', id, direction });
  };
  
  const adjustRatio = (id: string, ratio: number) => {
    dispatch({ type: 'ADJUST_RATIO', id, ratio });
  };
  
  const toggleLayout = () => {
    dispatch({ type: 'TOGGLE_LAYOUT' });
  };
  
  // Compute window positions and sizes based on the tree structure
  const computeLayout = () => {
    const layout: Record<string, { x: number; y: number; width: number; height: number }> = {};
    // Define gap size in percentage - consistent for all sides
    const GAP_SIZE = 1.0; // 1.0% gap between windows and at the edges
    
    if (!state.rootId) return layout;
    
    // Calculate layout recursively with consistent gaps
    const calculateNodeLayout = (
      nodeId: string,
      x: number,
      y: number,
      width: number,
      height: number
    ) => {
      const node = state.nodes[nodeId];
      
      if (!node) return;
      
      if (node.type === 'window') {
        // For window nodes, store the layout exactly as passed
        layout[nodeId] = { x, y, width, height };
      } else if (node.type === 'container') {
        if (node.children.length === 0) return;
        
        if (node.children.length === 1) {
          // Pass through for single child (maintain the same coordinates)
          calculateNodeLayout(node.children[0], x, y, width, height);
          return;
        }
        
        // For containers with two children, calculate split with gap
        const isHorizontal = node.direction === 'horizontal';
        
        if (isHorizontal) {
          // Horizontal split
          const firstChildWidth = (width - GAP_SIZE) * node.ratio;
          const secondChildWidth = width - firstChildWidth - GAP_SIZE;
          
          calculateNodeLayout(
            node.children[0],
            x,
            y,
            firstChildWidth,
            height
          );
          
          calculateNodeLayout(
            node.children[1],
            x + firstChildWidth + GAP_SIZE,
            y,
            secondChildWidth,
            height
          );
        } else {
          // Vertical split
          const firstChildHeight = (height - GAP_SIZE) * node.ratio;
          const secondChildHeight = height - firstChildHeight - GAP_SIZE;
          
          calculateNodeLayout(
            node.children[0],
            x,
            y,
            width,
            firstChildHeight
          );
          
          calculateNodeLayout(
            node.children[1],
            x,
            y + firstChildHeight + GAP_SIZE,
            width,
            secondChildHeight
          );
        }
      }
    };
    
    // Add uniform outer gap to the entire workspace
    const rootX = GAP_SIZE;
    const rootY = GAP_SIZE;
    const rootWidth = 100 - (GAP_SIZE * 2);
    const rootHeight = 100 - (GAP_SIZE * 2);
    
    calculateNodeLayout(state.rootId, rootX, rootY, rootWidth, rootHeight);
    
    return layout;
  };
  
  const focusNextWindow = () => {
    const windowNodes = Object.values(state.nodes).filter(
      node => node.type === 'window'
    ) as TileWindow[];
    
    if (windowNodes.length <= 1) return;
    
    const currentIndex = windowNodes.findIndex(w => w.id === state.focusedId);
    const nextIndex = (currentIndex + 1) % windowNodes.length;
    
    focusWindow(windowNodes[nextIndex].id);
  };
  
  const focusPreviousWindow = () => {
    const windowNodes = Object.values(state.nodes).filter(
      node => node.type === 'window'
    ) as TileWindow[];
    
    if (windowNodes.length <= 1) return;
    
    const currentIndex = windowNodes.findIndex(w => w.id === state.focusedId);
    const prevIndex = (currentIndex - 1 + windowNodes.length) % windowNodes.length;
    
    focusWindow(windowNodes[prevIndex].id);
  };
  
  return {
    nodes: state.nodes,
    rootId: state.rootId,
    focusedId: state.focusedId,
    layout: state.layout,
    computeLayout,
    addWindow,
    closeWindow,
    focusWindow,
    splitWindow,
    adjustRatio,
    toggleLayout,
    focusNextWindow,
    focusPreviousWindow,
  };
} 