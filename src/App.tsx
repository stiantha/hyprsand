import './styles/global.css'
import { TilingManager } from './components/TilingManager'
import { MainLayout } from './layouts'
import { TilingProvider } from './contexts/TilingContext';

function App() {
  return (
    <TilingProvider>
      <AppContent />
    </TilingProvider>
  );
}

function AppContent() {
  return (
    <MainLayout>
      <TilingManager />
    </MainLayout>
  );
}

export default App
