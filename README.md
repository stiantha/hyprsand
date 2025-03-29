# Hyprfolio

A React-based tiling window manager application inspired by Hyprland OS. Hyprfolio allows users to create, organize, and manage windows in a grid-based tiling layout.

## Features

- **Tiling Window Manager**: Windows are automatically arranged in a grid layout without overlapping
- **Dynamic Splits**: Split windows horizontally or vertically
- **Keyboard Shortcuts**: Control all window operations using keyboard shortcuts
- **Dual Layouts**: Toggle between tiling and floating modes
- **Dark Mode Support**: Built-in light and dark themes
- **Waybar Integration**: System bar at the top of the screen

## Tech Stack

- **React**: For building the UI components
- **Tailwind CSS**: For styling with a utility-first approach
- **TypeScript**: For type safety and maintainable code

## Keyboard Shortcuts

| Key Combination | Action |
|----------------|--------|
| Ctrl+O | Open a new window |
| Alt+Tab | Focus next window |
| Alt+Shift+Tab | Focus previous window |
| Alt+H | Split focused window horizontally |
| Alt+V | Split focused window vertically |
| Alt+W | Close focused window |
| Alt+T | Toggle between tiling and floating layouts |
| F1 | Toggle keybinding help |

## Architecture

The application uses a tree-based structure to manage window layouts:

1. **Container Nodes**: Parent nodes that organize windows in horizontal or vertical directions
2. **Window Nodes**: Leaf nodes that display actual window content

### Core Components

1. **TilingManager**: Main component managing the tiling layout system
2. **TiledWindow**: Component for displaying window content within the tiling grid
3. **KeybindingHandler**: Handles keyboard shortcuts for window operations

### Custom Hooks

1. **useTilingManager**: Manages the tree structure for tiling windows
2. **useKeyBindings**: Handles keybinding registrations and actions

## Getting Started

To run the project locally:

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

## How It Works

1. **Tree-Based Layout**: Windows are organized in a binary tree structure
   - Container nodes split the screen horizontally or vertically
   - Window nodes display content in their allocated space

2. **Dynamic Splitting**: When you split a window:
   - A new container is created to hold the original window and the new window
   - The container determines how space is divided between its children

3. **Closing Windows**: When a window is closed:
   - The space is redistributed among other windows
   - The tree structure is optimized to minimize empty containers

## Customizing

You can customize the tiling behavior by modifying:

1. **Split Ratios**: Change the default split ratio (currently 50/50) in the useTilingManager hook
2. **Keyboard Shortcuts**: Modify the keybindings in TilingManager.tsx
3. **Window Styles**: Adjust window appearance in the global.css file
