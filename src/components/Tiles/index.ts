import { Terminal } from './Terminal';
import { TextEditor } from './TextEditor';
import { Browser } from './Browser';

export type TileType = 'terminal' | 'editor' | 'browser';

export const getTileComponent = (type: TileType) => {
  switch (type) {
    case 'terminal':
      return Terminal;
    case 'editor':
      return TextEditor;
    case 'browser':
      return Browser;
    default:
      return null;
  }
}; 