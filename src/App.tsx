import { useState, useEffect } from 'react'
import './styles/global.css'
import { TilingManager } from './components/TilingManager'

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize dark mode based on user preference
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
    
    if (prefersDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      <TilingManager>
        <div className="absolute bottom-4 right-4 z-50">
          <button
            onClick={toggleDarkMode}
            className="bg-gray-200 dark:bg-gray-800 p-2 rounded-full shadow-lg"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? '🌞' : '🌙'}
          </button>
        </div>
      </TilingManager>
    </div>
  )
}

export default App
