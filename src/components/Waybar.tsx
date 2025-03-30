import React, { useEffect, useState } from 'react';
import { Command } from 'lucide-react';

/* interface WaybarProps {
  focusedId: string | null;
} */

export const Waybar: React.FC = () => {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [dayOfWeek, setDayOfWeek] = useState<string>('');
  
  
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
      }));
      
      setDate(now.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
      }));
      
      // Get day of week
      setDayOfWeek(now.toLocaleDateString('en-US', {
        weekday: 'short'
      }));
    };
    
    // Update immediately and then every second
    updateTime();
    
  }, []);
  


  
  return (
    <div className="waybar bg-[#1d1d1d] text-white flex justify-between items-center font-mono text-sm border-b border-[#333333] h-[5vh] w-full z-10 relative p-2">
      {/* Left section */}
      <div className="flex items-center w-[200px] text-white">
        <div className="workspace active px-2">1</div>
        <div className="workspace px-2">2</div>
        <div className="workspace px-2">3</div>
        <div className="workspace px-2">4</div>
        <div className="workspace px-2">5</div>
      </div>

      {/* Middle section */}
      <div className="middle-section absolute left-1/2 -translate-x-1/2 flex items-stretch h-6">
        <div className="day text-white flex items-center mx-2">
          <span className="day-display">{dayOfWeek}</span>
        </div>
        <div className="date text-white flex items-center mx-2">
          <span className="date-display">{date}</span>
        </div>
        <Command className="mx-2" />
        <div className="time text-white flex items-center mx-2">
          <span className="time-display">{time}</span>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-stretch h-6 justify-end">
      
        
        <div className="separator w-5 relative -mx-[10px] z-10 h-6"></div>
      </div>
    </div>
  );
}; 