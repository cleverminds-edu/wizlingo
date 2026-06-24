'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    }

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    // For iOS, show instructions
    if (isIOSDevice && !window.matchMedia('(display-mode: standalone)').matches) {
      setShowIOSInstructions(true);
    }

    // Listen for install prompt (Android)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setShowIOSInstructions(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setShowInstallPrompt(false);
    }
  };

  // Don't show if already installed
  if (isInstalled) {
    return null;
  }

  // iOS Instructions
  if (showIOSInstructions && isIOS) {
    return (
      <div className="fixed bottom-4 left-4 right-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-lg p-4 z-50">
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h3 className="text-white font-bold text-sm">📱 Add WizLingo to Home Screen</h3>
              <p className="text-white/90 text-xs mt-1">Tap the Share button below, then "Add to Home Screen"</p>
              <div className="text-white/80 text-xs mt-2 space-y-1">
                <p>1️⃣ Tap Share (↑)</p>
                <p>2️⃣ Scroll & tap "Add to Home Screen"</p>
                <p>3️⃣ Confirm the name</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setShowIOSInstructions(false)}
            className="w-full bg-white text-blue-600 px-3 py-2 rounded-lg font-bold text-sm hover:bg-gray-100 transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    );
  }

  // Android Install Prompt
  if (showInstallPrompt && !isIOS) {
    return (
      <div className="fixed bottom-4 left-4 right-4 bg-gradient-to-r from-orange-500 to-purple-600 rounded-lg shadow-lg p-4 z-50">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <h3 className="text-white font-bold">Install WizLingo</h3>
            <p className="text-white/80 text-sm">Get instant access on your home screen</p>
          </div>
          <button
            onClick={handleInstall}
            className="bg-white text-orange-600 px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition-colors whitespace-nowrap"
          >
            Install
          </button>
          <button
            onClick={() => setShowInstallPrompt(false)}
            className="text-white hover:text-gray-200 text-xl"
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  return null;
}
