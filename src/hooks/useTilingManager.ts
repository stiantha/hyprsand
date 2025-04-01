import { useReducer } from 'react';
import { v4 as uuidv4 } from 'uuid';

export type TileDirection = 'horizontal' | 'vertical';
export type TileNodeType = 'container' | 'tile';

export interface BaseTileNode {
  id: string;
  type: TileNodeType;
  parent: string | null;
}

export interface Tile extends BaseTileNode {
  type: 'tile';
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

export type TileNode = Tile | TileContainer;

export interface TilingState {
  nodes: Record<string, TileNode>;
  rootId: string | null;
  focusedId: string | null;
  layout: 'tiling' | 'floating';
  lastSplitDirection: TileDirection;
}

type TilingAction = 
  | { type: 'ADD_TILE'; tile: Omit<Tile, 'id' | 'parent' | 'isFocused'> }
  | { type: 'CLOSE_TILE'; id: string }
  | { type: 'FOCUS_TILE'; id: string }
  | { type: 'SPLIT_TILE'; id: string; direction: TileDirection }
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
    case 'ADD_TILE': {
      const tileId = uuidv4();
      const newTile: Tile = {
        ...action.tile,
        id: tileId,
        parent: null,
        isFocused: true,
      };

      // If there's no root or root has no children, create a fresh root container
      if (!state.rootId || Object.values(state.nodes).filter(node => node.type === 'tile').length === 0) {
        const rootId = uuidv4();
        const rootContainer: TileContainer = {
          id: rootId,
          type: 'container',
          direction: 'horizontal',
          children: [tileId],
          parent: null,
          ratio: 0.5,
        };

        // Set parent of the tile
        newTile.parent = rootId;

        // Create a completely fresh state
        return {
          nodes: {
            [rootId]: rootContainer,
            [tileId]: newTile,
          },
          rootId: rootId,
          focusedId: tileId,
          layout: 'tiling',
          lastSplitDirection: 'vertical',
        };
      }

      // Add tile to existing layout
      const rootNode = state.nodes[state.rootId] as TileContainer;
      
      // If there's a focused tile, create a new container and split
      if (state.focusedId) {
        const focusedNode = state.nodes[state.focusedId];
        
        if (focusedNode.type === 'tile') {
          const parentNode = focusedNode.parent 
            ? state.nodes[focusedNode.parent] as TileContainer
            : null;
            
          if (!parentNode) return state;
          
          // Toggle split direction - changed to start with horizontal first
          const nextDirection = state.lastSplitDirection === 'vertical' ? 'horizontal' : 'vertical';
          
          // Create a new container for the focused tile and new tile
          const newContainerId = uuidv4();
          const newContainer: TileContainer = {
            id: newContainerId,
            type: 'container',
            direction: nextDirection,
            children: [focusedNode.id, tileId],
            parent: parentNode.id,
            ratio: 0.5,
          };
          
          // Update parent's children
          const parentChildren = [...parentNode.children];
          const focusedIndex = parentChildren.indexOf(focusedNode.id);
          parentChildren.splice(focusedIndex, 1, newContainerId);
          
          // Update parent references
          newTile.parent = newContainerId;
          
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
              [tileId]: newTile,
            },
            focusedId: tileId,
            lastSplitDirection: nextDirection,
          };
        }
      }
      
      // If no tile is focused or focused node is a container, add to root
      const updatedRoot = {
        ...rootNode,
        children: [...rootNode.children, tileId],
      };
      
      newTile.parent = rootNode.id;
      
      return {
        ...state,
        nodes: {
          ...state.nodes,
          [rootNode.id]: updatedRoot,
          [tileId]: newTile,
        },
        focusedId: tileId,
      };
    }
    
    case 'CLOSE_TILE': {
      if (!state.nodes[action.id]) return state;
      
      const nodeToRemove = state.nodes[action.id];
      if (nodeToRemove.type !== 'tile') return state;

      // Get all remaining tiles before any modifications
      const remainingTiles = Object.values(state.nodes).filter(
        node => node.type === 'tile' && node.id !== action.id
      );

      // If this is the last tile, reset to initial state
      if (remainingTiles.length === 0) {
        return createInitialState();
      }

      // Get the parent container
      const parentContainer = nodeToRemove.parent ? state.nodes[nodeToRemove.parent] as TileContainer : null;
      
      // Create a copy of nodes without the tile to remove
      const nodes = { ...state.nodes };
      delete nodes[action.id];
      const remainingNodes = nodes as Record<string, TileNode>;

      // Find next tile to focus - prioritize siblings if available
      let nextTileToFocus = state.focusedId;
      if (parentContainer) {
        // Try to find a sibling tile first
        const siblings = parentContainer.children
          .filter(id => id !== action.id)
          .map(id => remainingNodes[id])
          .filter((node): node is Tile => node?.type === 'tile');
        
        if (siblings.length > 0) {
          nextTileToFocus = siblings[0].id;
        } else {
          // If no siblings, take the first remaining tile
          nextTileToFocus = remainingTiles[0].id;
        }
      } else {
        nextTileToFocus = remainingTiles[0].id;
      }

      // If this was the only child in its parent container
      if (parentContainer && parentContainer.children.length <= 2) {
        // Get the sibling if it exists
        const siblingId = parentContainer.children.find(id => id !== action.id);
        const sibling = siblingId ? remainingNodes[siblingId] : null;

        // Remove the parent container from nodes
        if (parentContainer.id in remainingNodes) {
          delete remainingNodes[parentContainer.id];
        }

        if (sibling && siblingId) {
          // If parent had a parent, move the sibling up
          if (parentContainer.parent) {
            const grandparent = remainingNodes[parentContainer.parent] as TileContainer;
            if (grandparent) {
              // Replace the parent container with its remaining child in the grandparent
              remainingNodes[parentContainer.parent] = {
                ...grandparent,
                children: grandparent.children.map(id => 
                  id === parentContainer.id ? siblingId : id
                )
              } as TileContainer;

              // Update the sibling's parent reference
              remainingNodes[siblingId] = {
                ...sibling,
                parent: parentContainer.parent
              } as TileNode;
            }
          } else {
            // If parent was the root, make the sibling the new root's child
            const newRootId = uuidv4();
            const newRoot: TileContainer = {
              id: newRootId,
              type: 'container',
              direction: 'horizontal',
              children: [siblingId],
              parent: null,
              ratio: 0.5
            };

            return {
              ...state,
              nodes: {
                [newRootId]: newRoot,
                [siblingId]: {
                  ...sibling,
                  parent: newRootId
                }
              } as Record<string, TileNode>,
              rootId: newRootId,
              focusedId: nextTileToFocus,
              layout: state.layout,
              lastSplitDirection: state.lastSplitDirection
            };
          }
        }
      }

      return {
        ...state,
        nodes: remainingNodes,
        focusedId: nextTileToFocus
      };
    }
    
    case 'FOCUS_TILE': {
      const nodeToFocus = state.nodes[action.id];
      if (!nodeToFocus || nodeToFocus.type !== 'tile') return state;
      
      // Unfocus all tiles and focus the target
      const updatedNodes = Object.keys(state.nodes).reduce((acc, nodeId) => {
        const node = state.nodes[nodeId];
        if (node.type === 'tile') {
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
    
    case 'SPLIT_TILE': {
      const nodeToSplit = state.nodes[action.id];
      if (!nodeToSplit || nodeToSplit.type !== 'tile') return state;
      
      // Create a new tile
      const newTileId = uuidv4();
      const newTile: Tile = {
        id: newTileId,
        type: 'tile',
        title: 'New Tile',
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
        children: [nodeToSplit.id, newTileId],
        parent: nodeToSplit.parent,
        ratio: 0.5,
      };
      
      // Update parent references
      newTile.parent = newContainerId;
      
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
            [newTileId]: newTile,
            [parentContainer.id]: {
              ...parentContainer,
              children: updatedParentChildren,
            },
          },
          focusedId: newTileId,
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
            [newTileId]: newTile,
          },
          rootId: newContainerId,
          focusedId: newTileId,
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

export function useTilingManager() {
  const [state, dispatch] = useReducer(tilingReducer, null, createInitialState);
  
  const addTile = (tile: Omit<Tile, 'id' | 'parent' | 'isFocused'>) => {
    dispatch({ type: 'ADD_TILE', tile });
  };
  
  const closeTile = (id: string) => {
    dispatch({ type: 'CLOSE_TILE', id });
  };
  
  const focusTile = (id: string) => {
    dispatch({ type: 'FOCUS_TILE', id });
  };
  
  const splitTile = (id: string, direction: TileDirection) => {
    dispatch({ type: 'SPLIT_TILE', id, direction });
  };
  
  const adjustRatio = (id: string, ratio: number) => {
    dispatch({ type: 'ADJUST_RATIO', id, ratio });
  };
  
  const toggleLayout = () => {
    dispatch({ type: 'TOGGLE_LAYOUT' });
  };
  
  // Compute tile positions and sizes based on the tree structure
  const computeLayout = () => {
    const layout: Record<string, { x: number; y: number; width: number; height: number }> = {};
    // Define gap size in percentage - consistent for all sides
    const GAP_SIZE = 0.5; // 0.5% gap between tiles and at the edges
    
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
      
      if (node.type === 'tile') {
        // For tile nodes, store the layout exactly as passed
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
          // Horizontal split - calculate available space after gap
          const availableWidth = width;
          const firstChildWidth = (availableWidth * node.ratio) - (GAP_SIZE / 2);
          const secondChildWidth = availableWidth - firstChildWidth - GAP_SIZE;
          
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
          // Vertical split - calculate available space after gap
          const availableHeight = height;
          const firstChildHeight = (availableHeight * node.ratio) - (GAP_SIZE / 2);
          const secondChildHeight = availableHeight - firstChildHeight - GAP_SIZE;
          
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
  
  const focusNextTile = () => {
    const tileNodes = Object.values(state.nodes).filter(
      node => node.type === 'tile'
    ) as Tile[];
    
    if (tileNodes.length <= 1) return;
    
    const currentIndex = tileNodes.findIndex(t => t.id === state.focusedId);
    const nextIndex = (currentIndex + 1) % tileNodes.length;
    
    focusTile(tileNodes[nextIndex].id);
  };
  
  const focusPreviousTile = () => {
    const tileNodes = Object.values(state.nodes).filter(
      node => node.type === 'tile'
    ) as Tile[];
    
    if (tileNodes.length <= 1) return;
    
    const currentIndex = tileNodes.findIndex(t => t.id === state.focusedId);
    const prevIndex = (currentIndex - 1 + tileNodes.length) % tileNodes.length;
    
    focusTile(tileNodes[prevIndex].id);
  };
  
  return {
    nodes: state.nodes,
    rootId: state.rootId,
    focusedId: state.focusedId,
    layout: state.layout,
    computeLayout,
    addTile,
    closeTile,
    focusTile,
    splitTile,
    adjustRatio,
    toggleLayout,
    focusNextTile,
    focusPreviousTile,
  };
} 