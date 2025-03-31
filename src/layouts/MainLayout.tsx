import  {ReactNode } from 'react';
import { Waybar } from '../components/Waybar';
import wallpaper from '../assets/wallpaper/nature.jpg';

interface MainLayoutProps {
  children: ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {

  return (
    <div className="w-screen h-screen overflow-hidden text-gray-900 dark:text-white relative">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 object-cover" 
        style={{ 
          backgroundImage: `url(${wallpaper})`,
          backgroundSize: 'stretch',
        }}
      >

      <div className="relative z-10">
        <Waybar />  
        {children}
      </div>
    </div>
    </div>
  );
}; 