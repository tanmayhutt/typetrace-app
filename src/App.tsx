import { useState, useEffect } from 'react';
import { LayoutDashboard, Type } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { TypingTest } from './components/TypingTest';
import './App.css';

// Type definitions for window API exposed by preload
declare global {
  interface Window {
    api: {
      onTypingStats: (callback: (data: any) => void) => void;
      getHistoricalData: () => Promise<any>;
      saveHistoricalData: (data: any) => void;
    }
  }
}

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'practice'>('dashboard');
  const [stats, setStats] = useState({
    currentWPM: 0,
    fastestWPM: 0,
    totalKeystrokes: 0,
  });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (window.api) {
      window.api.onTypingStats((data) => {
        setStats({
          currentWPM: data.currentWPM,
          fastestWPM: data.fastestWPM,
          totalKeystrokes: data.totalKeystrokes
        });

        setChartData(prev => {
          const newData = [...prev, { time: new Date(data.timestamp).toLocaleTimeString([], {minute: '2-digit', second:'2-digit'}), wpm: data.currentWPM }];
          if (newData.length > 60) newData.shift();
          return newData;
        });
      });
    }
  }, []);

  return (
    <div className="layout">
      <aside className="sidebar">
        <div style={{ padding: '0 8px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '1.2rem' }}>
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
            <path d="M4 16 L14 4 L18 4 L12 14 L28 14 L18 28 L14 28 L20 18 L4 18 Z" fill="url(#logoGradient)" />
          </svg> TypeTrace
        </div>
        
        <button 
          className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
          onClick={() => setCurrentView('dashboard')}
        >
          <LayoutDashboard size={20} />
          Dashboard
        </button>
        
        <button 
          className={`nav-item ${currentView === 'practice' ? 'active' : ''}`}
          onClick={() => setCurrentView('practice')}
        >
          <Type size={20} />
          Practice
        </button>
      </aside>

      <main className="main-content">
        <header className="header">
          <h1>{currentView === 'dashboard' ? 'Global Stats' : 'Typing Test'}</h1>
          <div className="status-badge">
            <div className="dot"></div>
            Monitoring
          </div>
        </header>
        
        <div className="app-container" style={{ marginTop: '16px' }}>
          {currentView === 'dashboard' ? (
            <Dashboard stats={stats} chartData={chartData} />
          ) : (
            <TypingTest />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
