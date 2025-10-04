import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Check, X, Info } from 'lucide-react';

export function PWADebug() {
  const [pwaStatus, setPwaStatus] = useState({
    serviceWorkerSupported: false,
    serviceWorkerRegistered: false,
    manifestFound: false,
    isInstalled: false,
    canInstall: false,
    beforeInstallPromptFired: false,
    isSecure: false
  });

  useEffect(() => {
    const checkPWAStatus = async () => {
      const status = {
        serviceWorkerSupported: 'serviceWorker' in navigator,
        serviceWorkerRegistered: false,
        manifestFound: false,
        isInstalled: false,
        canInstall: false,
        beforeInstallPromptFired: false,
        isSecure: location.protocol === 'https:' || location.hostname === 'localhost'
      };

      // Check service worker registration
      if (status.serviceWorkerSupported) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          status.serviceWorkerRegistered = !!registration;
        } catch (error) {
          console.log('Service worker check failed:', error);
        }
      }

      // Check manifest
      try {
        const response = await fetch('/manifest.json');
        status.manifestFound = response.ok;
      } catch (error) {
        console.log('Manifest check failed:', error);
      }

      // Check if installed
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      status.isInstalled = isStandalone || isInWebAppiOS;

      setPwaStatus(status);
    };

    checkPWAStatus();

    // Listen for beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('PWA Debug: beforeinstallprompt fired');
      setPwaStatus(prev => ({ 
        ...prev, 
        beforeInstallPromptFired: true,
        canInstall: true 
      }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed
    const handleAppInstalled = () => {
      console.log('PWA Debug: App installed');
      setPwaStatus(prev => ({ ...prev, isInstalled: true }));
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const StatusBadge = ({ condition, label }: { condition: boolean; label: string }) => (
    <div className="flex items-center justify-between p-2 border rounded">
      <span className="text-sm">{label}</span>
      <Badge variant={condition ? "default" : "destructive"}>
        {condition ? <Check className="w-3 h-3 mr-1" /> : <X className="w-3 h-3 mr-1" />}
        {condition ? 'Yes' : 'No'}
      </Badge>
    </div>
  );

  const refreshStatus = () => {
    window.location.reload();
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="w-5 h-5" />
          PWA Status Debug
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <StatusBadge 
          condition={pwaStatus.isSecure} 
          label="HTTPS/Secure Context" 
        />
        <StatusBadge 
          condition={pwaStatus.serviceWorkerSupported} 
          label="Service Worker Supported" 
        />
        <StatusBadge 
          condition={pwaStatus.serviceWorkerRegistered} 
          label="Service Worker Registered" 
        />
        <StatusBadge 
          condition={pwaStatus.manifestFound} 
          label="Manifest Found" 
        />
        <StatusBadge 
          condition={pwaStatus.beforeInstallPromptFired} 
          label="Install Prompt Available" 
        />
        <StatusBadge 
          condition={pwaStatus.isInstalled} 
          label="Currently Installed" 
        />
        
        <div className="pt-4 space-y-2">
          <Button onClick={refreshStatus} variant="outline" className="w-full">
            Refresh Status
          </Button>
          
          {pwaStatus.isInstalled && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✅ PWA is successfully installed!
              </p>
            </div>
          )}
          
          {!pwaStatus.isSecure && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                ⚠️ PWA requires HTTPS. Try on a secure connection.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}