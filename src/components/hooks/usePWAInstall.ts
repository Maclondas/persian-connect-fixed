import { useState, useEffect } from 'react';

interface UsePWAInstallReturn {
  showInstallPrompt: boolean;
  canInstall: boolean;
  isInstalled: boolean;
  dismissPrompt: () => void;
}

export function usePWAInstall(): UsePWAInstallReturn {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    const checkInstallStatus = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      const installed = isStandalone || isInWebAppiOS;
      setIsInstalled(installed);
      return installed;
    };

    // Check if user has seen prompt before
    const checkPromptStatus = () => {
      const hasSeenPrompt = localStorage.getItem('pwa-install-prompt-seen');
      const laterTimestamp = localStorage.getItem('pwa-install-prompt-later');
      
      // If user clicked "Later", check if enough time has passed
      if (laterTimestamp) {
        const laterDate = new Date(laterTimestamp);
        const now = new Date();
        if (now < laterDate) {
          return false; // Still within "later" period
        } else {
          // Clear the "later" timestamp as it has expired
          localStorage.removeItem('pwa-install-prompt-later');
        }
      }
      
      return !hasSeenPrompt;
    };

    const installed = checkInstallStatus();
    const shouldShow = checkPromptStatus();

    // Only show if not installed and user hasn't seen it (or "later" period expired)
    if (!installed && shouldShow) {
      // Delay showing the prompt to let the page load and user engage
      const timer = setTimeout(() => {
        setShowInstallPrompt(true);
      }, 5000); // Show after 5 seconds for better UX

      return () => clearTimeout(timer);
    }

    // Listen for install event
    const handleAppInstalled = () => {
      console.log('✅ PWA was installed');
      setIsInstalled(true);
      setShowInstallPrompt(false);
      localStorage.setItem('pwa-install-prompt-seen', 'true');
    };

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('📱 PWA: beforeinstallprompt event fired');
      e.preventDefault();
      setCanInstall(true);
    };

    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check for installation status changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleDisplayModeChange = () => {
      setIsInstalled(mediaQuery.matches);
    };
    
    mediaQuery.addListener(handleDisplayModeChange);

    return () => {
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      mediaQuery.removeListener(handleDisplayModeChange);
    };
  }, []);

  const dismissPrompt = () => {
    setShowInstallPrompt(false);
  };

  return {
    showInstallPrompt,
    canInstall,
    isInstalled,
    dismissPrompt
  };
}