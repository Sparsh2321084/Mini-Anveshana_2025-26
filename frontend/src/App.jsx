import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppShell from './layout/AppShell';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  // Use basename only in production (GitHub Pages)
  const basename = import.meta.env.PROD ? '/Mini-Anveshana_2025-26' : '/';
  
  return (
    <Router 
      basename={basename}
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <AppShell>
        <div className="App">
          <Routes>
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </div>
      </AppShell>
    </Router>
  );
}

export default App;
