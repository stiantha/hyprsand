import React from 'react';

export const Terminal: React.FC = () => {
  return (
    <div className="h-full bg-black text-green-400 font-mono p-2 overflow-auto">
      <div className="flex items-center">
        <span className="text-green-500">$</span>
        <input 
          type="text"
          className="flex-1 ml-2 bg-transparent border-none outline-none text-green-400"
          placeholder="Enter command..."
        />
      </div>
    </div>
  );
}; 