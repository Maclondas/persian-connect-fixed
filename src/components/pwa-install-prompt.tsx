import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { X, Download, Smartphone, Monitor, Star } from 'lucide-react';
import { useLanguage } from './hooks/useLanguage';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface PWAInstallPromptProps {
  onClose: () => void;
}

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt({ onClose }: PWAInstallPromptProps) {
  const { t, currentLanguage } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [deviceType, setDeviceType] = useState<'mobile' | 'desktop'>('mobile');

  useEffect(() => {
    // Check if this is the first visit
    const hasSeenPrompt = localStorage.getItem('pwa-install-prompt-seen');
    const isFirstVisit = !hasSeenPrompt;
    
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInWebAppiOS = (window.navigator as any).standalone === true;
    const isInstalled = isStandalone || isInWebAppiOS;

    if (isFirstVisit && !isInstalled) {
      // Detect device type
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setDeviceType(isMobile ? 'mobile' : 'desktop');
      
      // Show prompt after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('📱 PWA Install: beforeinstallprompt event captured');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Check if install prompt is already available
    if ('serviceWorker' in navigator) {
      console.log('📱 PWA Install: Service worker supported');
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    console.log('📱 PWA Install: Install button clicked', { deferredPrompt: !!deferredPrompt });
    
    if (deferredPrompt) {
      try {
        console.log('📱 PWA Install: Triggering native install prompt');
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
          console.log('✅ PWA Install: User accepted install prompt');
        } else {
          console.log('❌ PWA Install: User dismissed install prompt');
        }
        
        setDeferredPrompt(null);
        handleClose();
      } catch (error) {
        console.error('❌ PWA Install: Error during install:', error);
        showManualInstructions();
      }
    } else {
      console.log('📱 PWA Install: No deferred prompt, showing manual instructions');
      // Manual instructions for browsers that don't support install prompt
      showManualInstructions();
    }
  };

  const showManualInstructions = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    
    let instructions = '';
    
    if (isIOS) {
      instructions = currentLanguage === 'en' 
        ? 'Tap the Share button at the bottom, then select "Add to Home Screen"'
        : 'روی دکمه اشتراک‌گذاری در پایین ضربه بزنید، سپس "افزودن به صفحه اصلی" را انتخاب کنید';
    } else if (isAndroid) {
      instructions = currentLanguage === 'en'
        ? 'Tap the menu (⋮) button, then select "Add to Home screen" or "Install app"'
        : 'روی دکمه منو (⋮) ضربه بزنید، سپس "افزودن به صفحه اصلی" یا "نصب اپلیکیشن" را انتخاب کنید';
    } else {
      instructions = currentLanguage === 'en'
        ? 'Look for the install button in your browser\'s address bar or menu'
        : 'دنبال دکمه نصب در نوار آدرس یا منوی مرورگر خود بگردید';
    }

    alert(instructions);
    handleClose();
  };

  const handleClose = () => {
    localStorage.setItem('pwa-install-prompt-seen', 'true');
    setIsVisible(false);
    onClose();
  };

  const handleLater = () => {
    // Set a shorter expiry for "Later" - show again in 3 days
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    localStorage.setItem('pwa-install-prompt-later', threeDaysFromNow.toISOString());
    setIsVisible(false);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto relative overflow-hidden border-2 border-primary/20">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          className="absolute top-2 right-2 z-10 hover:bg-gray-100"
        >
          <X className="h-4 w-4" />
        </Button>

        <CardHeader className="text-center pb-4">
          {/* App Icon/Logo */}
          <div className="mx-auto mb-4 relative">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg border-2 border-white">
              <span className="text-2xl font-bold text-white">PC</span>
            </div>
            <Badge className="absolute -top-2 -right-2 bg-yellow-500 text-yellow-900 border-yellow-400 shadow-sm">
              <Star className="w-3 h-3 mr-1" />
              {currentLanguage === 'en' ? 'NEW' : 'جدید'}
            </Badge>
          </div>

          <CardTitle className="text-xl mb-2">
            {currentLanguage === 'en' ? 'Install Persian Connect' : 'نصب پرشین کانکت'}
          </CardTitle>
          
          <p className="text-sm text-muted-foreground">
            {currentLanguage === 'en' 
              ? 'Get the full app experience with faster access and offline capabilities'
              : 'تجربه کامل اپلیکیشن را با دسترسی سریع‌تر و قابلیت آفلاین داشته باشید'
            }
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Features */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Download className="w-4 h-4 text-green-600" />
              </div>
              <span>
                {currentLanguage === 'en' ? 'Instant access from home screen' : 'دسترسی فوری از صفحه اصلی'}
              </span>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                {deviceType === 'mobile' ? <Smartphone className="w-4 h-4 text-blue-600" /> : <Monitor className="w-4 h-4 text-blue-600" />}
              </div>
              <span>
                {currentLanguage === 'en' ? 'Native app-like experience' : 'تجربه مشابه اپلیکیشن بومی'}
              </span>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Star className="w-4 h-4 text-purple-600" />
              </div>
              <span>
                {currentLanguage === 'en' ? 'Push notifications for messages' : 'اعلان‌های فوری برای پیام‌ها'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <Button 
              onClick={handleInstall}
              className="w-full bg-primary hover:bg-primary/90 text-white"
              size="lg"
            >
              <Download className="w-4 h-4 mr-2" />
              {currentLanguage === 'en' ? 'Install App' : 'نصب اپلیکیشن'}
            </Button>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleLater}
                className="flex-1"
              >
                {currentLanguage === 'en' ? 'Maybe Later' : 'بعداً'}
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={handleClose}
                className="flex-1"
              >
                {currentLanguage === 'en' ? 'No Thanks' : 'نه متشکرم'}
              </Button>
            </div>
          </div>

          {/* Device-specific hint */}
          <div className="text-xs text-center text-muted-foreground pt-2 border-t">
            {deviceType === 'mobile' && (
              <>
                {currentLanguage === 'en' 
                  ? '💡 Tip: Look for "Add to Home Screen" in your browser menu'
                  : '💡 نکته: دنبال "افزودن به صفحه اصلی" در منوی مرورگر خود بگردید'
                }
              </>
            )}
            {deviceType === 'desktop' && (
              <>
                {currentLanguage === 'en' 
                  ? '💡 Tip: Look for the install icon in your address bar'
                  : '💡 نکته: دنبال آیکون نصب در نوار آدرس خود بگردید'
                }
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}