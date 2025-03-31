import React, { useEffect, useState } from 'react';
import { Command, Zap, Wifi, HardDrive } from 'lucide-react';

/* interface WaybarProps {
  focusedId: string | null;
} */

// Define the types for our metrics
interface PageMetrics {
  loadTime: string;
}

interface NetworkMetrics {
  status: 'online' | 'offline';
  latency: string;
}

interface MemoryUsage {
  used: number;
  total: number;
  percentage: number;
}

// Type definitions for non-standard browser APIs
interface PerformanceMemory {
  usedJSHeapSize: number;
  jsHeapSizeLimit: number;
}

// Extend Performance interface to include non-standard APIs
interface PerformanceWithMemory extends Performance {
  memory?: PerformanceMemory;
}

export const Waybar: React.FC = () => {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [dayOfWeek, setDayOfWeek] = useState<string>('');
  const [pageMetrics, setPageMetrics] = useState<PageMetrics | null>(null);
  const [network, setNetwork] = useState<NetworkMetrics>({ status: navigator.onLine ? 'online' : 'offline', latency: '---' });
  const [memory, setMemory] = useState<MemoryUsage | null>(null);
  
  // Time update effect
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', {
        hour12: true,
        hour: 'numeric',
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
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Page load metrics effect
  useEffect(() => {
    if ('performance' in window) {
      const updateMetrics = () => {
        let loadTime = 0;
        
        // Try to get timing using newer API first
        if (performance.getEntriesByType && performance.getEntriesByType('navigation').length > 0) {
          const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          loadTime = navEntry.duration;
        } 
        // Fall back to older API
        else if (performance.timing) {
          loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        }
        
        setPageMetrics({
          loadTime: loadTime > 0 ? `${Math.round(loadTime)}ms` : 'calculating...'
        });
      };
      
      updateMetrics();
      
      // Update metrics periodically
      const interval = setInterval(updateMetrics, 5000);
      return () => clearInterval(interval);
    }
  }, []);
  
  // Network status & latency effect
  useEffect(() => {
    const updateNetworkStatus = () => {
      setNetwork(prev => ({
        ...prev,
        status: navigator.onLine ? 'online' : 'offline'
      }));
    };

    const checkLatency = async () => {
      if (!navigator.onLine) return;
      
      const start = performance.now();
      try {
        await fetch('https://www.google.com/favicon.ico', { 
          mode: 'no-cors',
          cache: 'no-store'
        });
        const end = performance.now();
        const latency = end - start;
        
        setNetwork(prev => ({
          ...prev,
          latency: `${Math.round(latency)}ms`
        }));
      } catch {
        setNetwork(prev => ({
          ...prev,
          latency: 'error'
        }));
      }
    };
    
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    
    // Check latency initially and periodically
    checkLatency();
    const interval = setInterval(checkLatency, 10000);
    
    return () => {
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
      clearInterval(interval);
    };
  }, []);
  
  // Memory usage effect
  useEffect(() => {
    const perf = performance as PerformanceWithMemory;
    
    const updateMemory = () => {
      if (perf.memory) {
        const used = Math.round(perf.memory.usedJSHeapSize / (1024 * 1024));
        const total = Math.round(perf.memory.jsHeapSizeLimit / (1024 * 1024));
        const percentage = Math.round((used / total) * 100);
        
        setMemory({ used, total, percentage });
      }
    };
    
    if (perf.memory) {
      updateMemory();
      const interval = setInterval(updateMemory, 2000);
      return () => clearInterval(interval);
    }
  }, []);
  
  return (
    <div className="waybar bg-black/80 backdrop-blur-sm text-white font-mono text-sm border-b border-white/10 h-[5vh] w-full z-10 grid grid-cols-3 p-1">
      {/* Left section */}
      <div className="flex items-center">
        <div className="workspace active bg-white/20 px-2 rounded">1</div>
        <div className="workspace px-2 hover:bg-white/10 rounded">2</div>
        <div className="workspace px-2 hover:bg-white/10 rounded">3</div>
        <div className="workspace px-2 hover:bg-white/10 rounded">4</div>
        <div className="workspace px-2 hover:bg-white/10 rounded">5</div>
      </div>

      {/* Middle section - using grid for perfect centering */}
      <div className="grid grid-cols-5 items-center max-w-md mx-auto">
        <div className="day text-white flex justify-end items-center pr-2">
          <span className="day-display text-[#9ece6a]">{dayOfWeek}</span>
        </div>
        <div className="date text-white flex justify-end items-center pr-2">
          <span className="date-display">{date}</span>
        </div>
        <div className="flex justify-center items-center">
          <Command size={18} />
        </div>
        <div className="time-hours text-white flex items-center pl-2">
          <span>{time.split(' ')[0]}</span>
        </div>
        <div className="time-ampm text-white flex items-center pl-1">
          <span className="text-[#9ece6a]">{time.split(' ')[1]}</span>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center justify-end gap-4">        
        {/* Page Load Time */}
        {pageMetrics && (
          <div className="page-metrics flex items-center bg-black/30 backdrop-blur-sm px-3 py-1 rounded border border-white/10">
            <Zap size={14} className="mr-1 text-[#ff9e64]" />
            <span className="load-time text-[#ff9e64]">{pageMetrics.loadTime}</span>
          </div>
        )}
        {/* Memory Usage */}
        {memory && (
          <div className="memory-metrics flex items-center bg-black/30 backdrop-blur-sm px-3 py-1 rounded border border-white/10">
            <HardDrive size={14} className="mr-1 text-[#0cc9bf]" />
            <span className="memory-usage text-[#0cc9bf]">{memory.used}MB ({memory.percentage}%)</span>
          </div>
        )}
        
        {/* Network Status */}
        <div className="network-metrics flex items-center bg-black/30 backdrop-blur-sm px-3 py-1 rounded border border-white/10">
          <Wifi size={14} className={`mr-1 ${network.status === 'online' ? 'text-[#9ece6a]' : 'text-[#f7768e]'}`} />
          <span className={`network-status ${network.status === 'online' ? 'text-[#9ece6a]' : 'text-[#f7768e]'}`}>
            {network.latency}
          </span>
        </div>
      </div>
    </div>
  );
}; 