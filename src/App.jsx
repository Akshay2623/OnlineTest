import React from 'react';
import { useEffect, useState } from 'react';
import Routes from './Routes.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import { getSettings } from './services/storage.js';

export default function App() {
  const [settings, setSettings] = useState(getSettings());

  useEffect(() => {
    const updateSettings = () => setSettings(getSettings());
    window.addEventListener('online-test-portal:settings-changed', updateSettings);
    return () => window.removeEventListener('online-test-portal:settings-changed', updateSettings);
  }, []);

  return (
    <div className="app-shell">
      <Header siteName={settings.siteName} />
      <main className="app-main">
        <Routes />
      </main>
      <Footer />
    </div>
  );
}
