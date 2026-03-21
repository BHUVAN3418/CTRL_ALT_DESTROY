import React, { useState, useEffect } from 'react';
import './index.css';
import LoginPage from './pages/Login';
import Dashboard from './pages/Dashboard';
import PayoutNotification from './pages/PayoutNotification';

// Rain background animation
function RainBackground() {
  const drops = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 3}s`,
    duration: `${0.8 + Math.random() * 1.5}s`,
    height: `${60 + Math.random() * 80}px`,
    opacity: 0.15 + Math.random() * 0.25,
  }));

  return (
    <div className="rain-bg">
      {drops.map(d => (
        <div key={d.id} className="rain-drop" style={{
          left: d.left,
          height: d.height,
          opacity: d.opacity,
          animationDelay: d.delay,
          animationDuration: d.duration,
        }} />
      ))}
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState('login');   // 'login' | 'dashboard' | 'payout'
  const [worker, setWorker]   = useState(null);
  const [lastPayout, setLastPayout] = useState(null);

  const handleLogin = (workerData) => {
    setWorker(workerData);
    setPage('dashboard');
  };

  const handleTrigger = (payoutData) => {
    setLastPayout(payoutData);
    setPage('payout');
  };

  const handleBack = () => setPage('dashboard');

  return (
    <div className="app">
      <RainBackground />
      {page === 'login'     && <LoginPage onLogin={handleLogin} />}
      {page === 'dashboard' && <Dashboard worker={worker} onTrigger={handleTrigger} />}
      {page === 'payout'    && <PayoutNotification payout={lastPayout} worker={worker} onBack={handleBack} />}
    </div>
  );
}
