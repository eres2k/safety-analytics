import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface PWAContextType {
  isInstallable: boolean;
  isInstalled: boolean;
  installPrompt: any;
  installApp: () => Promise<void>;
  dismissInstall: () => void;
  isIOS: boolean;
  isAndroid: boolean;
  showIOSPrompt: boolean;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

export function PWAProvider({ children }: { children: ReactNode }) {
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const isAndroid = /Android/.test(navigator.userAgent);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      console.log('App is running in standalone mode');
    } else {
      setIsInstalled(false);
    }

    // Handle install prompt for Chrome/Edge
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
      setIsInstallable(true);
      console.log('App is installable');
      
      // Show install prompt after 5 seconds on first visit
      const hasSeenPrompt = localStorage.getItem('pwa-install-prompted');
      if (!hasSeenPrompt) {
        setTimeout(() => {
          if (window.confirm('📱 Install Safety Analytics as a desktop app for quick access and offline use?')) {
            installApp();
          }
          localStorage.setItem('pwa-install-prompted', 'true');
        }, 5000);
      }
    };

    // Handle successful installation
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
      console.log('App was installed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check for iOS and show custom prompt
    if (isIOS && !window.matchMedia('(display-mode: standalone)').matches) {
      const hasSeenIOSPrompt = localStorage.getItem('ios-install-prompted');
      if (!hasSeenIOSPrompt) {
        setTimeout(() => {
          setShowIOSPrompt(true);
        }, 3000);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [isIOS]);

  const installApp = async () => {
    if (!installPrompt) return;

    try {
      const result = await installPrompt.prompt();
      console.log('Install prompt result:', result);
      
      if (result.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
    } catch (error) {
      console.error('Error installing app:', error);
    }
    
    setInstallPrompt(null);
    setIsInstallable(false);
  };

  const dismissInstall = () => {
    setIsInstallable(false);
    setShowIOSPrompt(false);
    localStorage.setItem('pwa-install-prompted', 'true');
    localStorage.setItem('ios-install-prompted', 'true');
  };

  return (
    <PWAContext.Provider value={{
      isInstallable,
      isInstalled,
      installPrompt,
      installApp,
      dismissInstall,
      isIOS,
      isAndroid,
      showIOSPrompt
    }}>
      {children}
    </PWAContext.Provider>
  );
}

export function usePWA() {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
}
