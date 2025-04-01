import { useState } from 'react';

export const Browser = () => {
  const [url, setUrl] = useState('https://example.com');

  return (
    <div className="h-full bg-white flex flex-col">
      <div className="flex items-center gap-2 p-2 bg-gray-100 border-b">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1 px-2 py-1 border rounded text-sm"
          placeholder="Enter URL..."
        />
        <button 
          className="px-2 py-1 bg-blue-500 text-white rounded text-sm"
          onClick={() => {/* Implement navigation */}}
        >
          Go
        </button>
      </div>
      <div className="flex-1 bg-white">
        {/* Implement iframe or browser view here */}
        <div className="h-full flex items-center justify-center text-gray-400">
          Browser content will be displayed here
        </div>
      </div>
    </div>
  );
}; 