import { ReactNode } from 'react';
import wallpaper from '../assets/wallpaper/nature.jpg';

interface BackgroundProps {
  children: ReactNode;
}

export function Background({ children }: BackgroundProps) {
  return (
    <div 
      className="h-screen w-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${wallpaper})` }}
    >
      {children}
    </div>
  );
} 