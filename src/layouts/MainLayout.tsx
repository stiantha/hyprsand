import { ReactNode } from 'react';
import { TilingProvider } from '../contexts/TilingProvider';
import { KeybindingProvider } from '../contexts/KeybindingProvider';
import { Waybar } from '../components/Waybar';
import { TilingManager } from '../components/TilingManager';
import { Background } from '../components/Background';

interface MainLayoutProps {
  children?: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <TilingProvider>
      <KeybindingProvider>
        <Background>
          <Waybar />
          <TilingManager>
            {children}
          </TilingManager>
        </Background>
      </KeybindingProvider>
    </TilingProvider>
  );
} 