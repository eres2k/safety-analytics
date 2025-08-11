import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { SafetyProvider } from './contexts/SafetyContext';
import { PWAProvider } from './contexts/PWAContext';
import { Toaster } from 'react-hot-toast';
import { registerSW } from 'virtual:pwa-register';

// Register service worker with auto update
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('New version available! Reload to update?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline');
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <PWAProvider>
        <SafetyProvider>
          <App />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </SafetyProvider>
      </PWAProvider>
    </BrowserRouter>
  </React.StrictMode>
);
