import  {ReactNode } from 'react';
import { Waybar } from '../components/Waybar';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {

  return (
    <div className="w-screen h-screen overflow-hidden bg-black dark:bg-black/90 text-gray-900 dark:text-white">
      <Waybar 
      />  
      {children}
    </div>
  );
}; 