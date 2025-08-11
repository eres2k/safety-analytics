import React from 'react';
import { usePWA } from '../../contexts/PWAContext';

export default function InstallPrompt() {
  const { isInstallable, isInstalled, installApp, dismissInstall, isIOS, showIOSPrompt } = usePWA();

  // Don't show if already installed
  if (isInstalled) return null;

  // iOS custom prompt
  if (isIOS && showIOSPrompt) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-2xl p-6 z-50 animate-slide-up">
        <div className="max-w-md mx-auto">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-amazon-orange rounded-xl flex items-center justify-center">
                <span className="text-2xl">📱</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-1">Install Safety Analytics</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Install this app on your iPhone for quick access and offline use.
              </p>
              <div className="text-sm space-y-2">
                <p>1. Tap the <span className="inline-block px-1">⬆️</span> Share button</p>
                <p>2. Scroll down and tap "Add to Home Screen"</p>
                <p>3. Tap "Add" to install</p>
              </div>
            </div>
            <button
              onClick={dismissInstall}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Chrome/Edge install prompt
  if (isInstallable) {
    return (
      <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-6 z-50 animate-slide-in max-w-sm">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-amazon-orange rounded-xl flex items-center justify-center">
              <span className="text-2xl">💻</span>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">Install App</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Install Safety Analytics for quick access and offline use
            </p>
            <div className="flex gap-2">
              <button
                onClick={installApp}
                className="px-4 py-2 bg-amazon-orange text-white rounded-lg hover:bg-amazon-orange/90 transition-colors text-sm font-medium"
              >
                Install Now
              </button>
              <button
                onClick={dismissInstall}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
