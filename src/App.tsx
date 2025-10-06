import { useState, useEffect, lazy, Suspense } from 'react';
import { SEOHead } from './components/seo-head';
import { Homepage } from './components/homepage';
import LoginPage from "./components/login-page";
import { AdDetailPage } from './components/ad-detail-page';
import { PostAdPage } from './components/post-ad-page';
import { EditAdPage } from './components/edit-ad-page';
import { MessagesPage } from './components/messages-page';
import { ChatPage } from './components/chat-page';
import { SupabaseMessagesPage } from './components/supabase-messages-page';
import { SupabaseChatPage } from './components/supabase-chat-page';
import { AdminDashboard } from './components/admin-dashboard';
import { MyAdsPage } from './components/my-ads-page';
import { AllCategoriesPage } from './components/all-categories-page';
import { AuthDebugPage } from './components/auth-debug-page';
import { SimpleAdminSetup } from './components/simple-admin-setup';
import { DatabaseSetupPage } from './components/database-setup-page';
import { AdminInitializer } from './components/admin-initializer';
import { AdminAccessTest } from './components/admin-access-test';
import { AdminStatusChecker } from './components/admin-status-checker';
import { ImageUploadTester } from './components/image-upload-tester';
import { BackendConnectionTester } from './components/backend-connection-tester';
import { AdminQuickActions } from './components/admin-quick-actions';
import { AdminAdsDebugger } from './components/admin-ads-debugger';
import { AdminStatusVerifier } from './components/admin-status-verifier';
import { SyncAdsToSupabase } from './components/sync-ads-to-supabase';
import { DatabaseSchemaSetup } from './components/database-schema-setup';
import { SimpleDatabaseSetup } from './components/simple-database-setup';
import { UltraSimpleDatabaseSetup } from './components/ultra-simple-database-setup';
import { DatabaseErrorHelper } from './components/database-error-helper';
import { AdNotFoundFixGuide } from './components/ad-not-found-fix-guide';
import { AdDetailFixVerifier } from './components/ad-detail-fix-verifier';
import { SupabaseAdsSyncFix } from './components/supabase-ads-sync-fix';
import { AdPostingFix } from './components/ad-posting-fix';
import { AdPostingAndViewingFix } from './components/ad-posting-and-viewing-fix';
import { LoginStatusDebug } from './components/login-status-debug';
import { Toaster } from './components/ui/sonner';
import { AIChangeLogger } from './components/ai-change-logger';
import { LanguageProvider } from './components/hooks/useLanguage';
import { ErrorBoundary } from './components/error-boundary';
import { PWAInstallPrompt } from './components/pwa-install-prompt';
import { usePWAInstall } from './components/hooks/usePWAInstall';
import { useAuth } from './components/hooks/useAuth';

// Optimize imports - lazy load ALL category pages to reduce initial bundle
const VehiclesPage = lazy(() => import('./components/vehicles-page').then(m => ({ default: m.VehiclesPage })));
const DigitalGoodsPage = lazy(() => import('./components/digital-goods-page').then(m => ({ default: m.DigitalGoodsPage })));
const RealEstatePage = lazy(() => import('./components/real-estate-page').then(m => ({ default: m.RealEstatePage })));
const CommercialPropertyPage = lazy(() => import('./components/commercial-property-page').then(m => ({ default: m.CommercialPropertyPage })));
const JobsPage = lazy(() => import('./components/jobs-page').then(m => ({ default: m.JobsPage })));
const ServicesPage = lazy(() => import('./components/services-page').then(m => ({ default: m.ServicesPage })));
const FashionPage = lazy(() => import('./components/fashion-page').then(m => ({ default: m.FashionPage })));
const PetsPage = lazy(() => import('./components/pets-page').then(m => ({ default: m.PetsPage })));
const ITWebServicesPage = lazy(() => import('./components/it-web-services-page').then(m => ({ default: m.ITWebServicesPage })));

// Lazy load specialized pages
const FitnessCoachPage = lazy(() => import('./components/fitness-coach-page').then(m => ({ default: m.FitnessCoachPage })));
const FoodCateringPage = lazy(() => import('./components/food-catering-page').then(m => ({ default: m.FoodCateringPage })));
const TravelAgencyPage = lazy(() => import('./components/travel-agency-page').then(m => ({ default: m.TravelAgencyPage })));
const AccountancyPage = lazy(() => import('./components/accountancy-page').then(m => ({ default: m.AccountancyPage })));
const SolicitorLegalServicesPage = lazy(() => import('./components/solicitor-legal-services-page').then(m => ({ default: m.SolicitorLegalServicesPage })));
const DoctorsBeautyClinicsPage = lazy(() => import('./components/doctors-beauty-clinics-page').then(m => ({ default: m.DoctorsBeautyClinicsPage })));
const VisaServicesPage = lazy(() => import('./components/visa-services-page').then(m => ({ default: m.VisaServicesPage })));
const TakeawayRestaurantEquipmentPage = lazy(() => import('./components/takeaway-restaurant-equipment-page').then(m => ({ default: m.TakeawayRestaurantEquipmentPage })));
const BarberHairdresserPage = lazy(() => import('./components/barber-hairdresser-page').then(m => ({ default: m.BarberHairdresserPage })));
const TattooServicesPage = lazy(() => import('./components/tattoo-services-page').then(m => ({ default: m.TattooServicesPage })));
const InterpreterTranslationServicesPage = lazy(() => import('./components/interpreter-translation-services-page').then(m => ({ default: m.InterpreterTranslationServicesPage })));
const CoursesTrainingPage = lazy(() => import('./components/courses-training-page').then(m => ({ default: m.CoursesTrainingPage })));
const DrivingLessonsPage = lazy(() => import('./components/driving-lessons-page').then(m => ({ default: m.DrivingLessonsPage })));
const MusicLessonsPage = lazy(() => import('./components/music-lessons-page').then(m => ({ default: m.MusicLessonsPage })));
const CurrencyExchangePage = lazy(() => import('./components/currency-exchange-page').then(m => ({ default: m.CurrencyExchangePage })));
const SupermarketWholesalersPage = lazy(() => import('./components/supermarket-wholesalers-page').then(m => ({ default: m.SupermarketWholesalersPage })));
const PaymentSuccessPage = lazy(() => import('./components/payment-success-page').then(m => ({ default: m.PaymentSuccessPage })));
const PaymentFailedPage = lazy(() => import('./components/payment-failed-page').then(m => ({ default: m.PaymentFailedPage })));
const BoostSuccessPage = lazy(() => import('./components/boost-success-page').then(m => ({ default: m.BoostSuccessPage })));
const BoostFailedPage = lazy(() => import('./components/boost-failed-page').then(m => ({ default: m.BoostFailedPage })));
const SupportInformationPage = lazy(() => import('./components/support-information-page').then(m => ({ default: m.SupportInformationPage })));
const TermsConditionsPage = lazy(() => import('./components/terms-conditions-page').then(m => ({ default: m.TermsConditionsPage })));
const SecuritySafetyPage = lazy(() => import('./components/security-safety-page').then(m => ({ default: m.SecuritySafetyPage })));
const UserGuidePage = lazy(() => import('./components/user-guide-page').then(m => ({ default: m.UserGuidePage })));
const AboutUsPage = lazy(() => import('./components/about-us-page').then(m => ({ default: m.AboutUsPage })));
const PrivacyPage = lazy(() => import('./components/privacy-page').then(m => ({ default: m.PrivacyPage })));
const FeaturedAdTestPage = lazy(() => import('./components/featured-ad-test-page').then(m => ({ default: m.FeaturedAdTestPage })));

type Page = 'home' | 'login' | 'ad-detail' | 'post-ad' | 'edit-ad' | 'messages' | 'chat' | 'admin' | 'my-ads' | 'all-categories' | 'vehicles' | 'digital-goods' | 'real-estate' | 'commercial-property' | 'jobs' | 'services' | 'fashion' | 'pets' | 'it-web-services' | 'courses-training' | 'driving-lessons' | 'music-lessons' | 'currency-exchange' | 'supermarket-wholesalers' | 'fitness-coach' | 'food-catering' | 'travel-agency' | 'accountancy' | 'legal' | 'medical' | 'visa' | 'restaurant-equipment' | 'barber-hairdresser' | 'tattoo-services' | 'interpreter-translation' | 'payment-success' | 'payment-failed' | 'boost-success' | 'boost-failed' | 'support-info' | 'terms-conditions' | 'security-safety' | 'user-guide' | 'about-us' | 'privacy' | 'auth-debug' | 'admin-setup' | 'database-setup' | 'database-schema' | 'simple-db-setup' | 'ultra-simple-db' | 'database-error-helper' | 'admin-init' | 'admin-test' | 'admin-status' | 'image-test' | 'featured-test' | 'backend-test' | 'admin-quick' | 'admin-debug' | 'admin-verify' | 'sync-ads' | 'ad-fix-guide' | 'ad-fix-test' | 'supabase-sync-fix' | 'ad-posting-fix' | 'ad-posting-viewing-fix' | 'login-debug';

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [currentAdId, setCurrentAdId] = useState<string | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Initialize PWA install hook first (lightweight)
  const { showInstallPrompt, dismissPrompt } = usePWAInstall();

  // Check URL params on load for payment redirects - simplified
  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const page = urlParams.get('page');
      
      console.log('🔍 URL Debug - Current URL:', window.location.href);
      console.log('🔍 URL Debug - Page param:', page);
      
      if (page === 'payment-success' || page === 'payment-failed' || 
          page === 'boost-success' || page === 'boost-failed' ||
          page === 'auth-debug' || page === 'admin' || page === 'admin-setup' || 
          page === 'database-setup' || page === 'database-schema' || page === 'simple-db-setup' || page === 'ultra-simple-db' || page === 'database-error-helper' || page === 'admin-init' || page === 'admin-test' || page === 'admin-status' || page === 'image-test' || page === 'featured-test' || page === 'backend-test' || page === 'admin-quick' || page === 'admin-debug' || page === 'admin-verify' || page === 'sync-ads' || page === 'ad-fix-guide' || page === 'ad-fix-test' || page === 'supabase-sync-fix' || page === 'ad-posting-fix' || page === 'login-debug') {
        console.log('✅ URL Debug - Setting page to:', page);
        setCurrentPage(page as Page);
      } else {
        console.log('❌ URL Debug - Page not recognized, setting to home. Page was:', page);
        setCurrentPage('home');
      }
    } catch (error) {
      console.error('Error parsing URL params:', error);
      setCurrentPage('home');
    }
    
    // Always set initialized to true after URL parsing
    setIsInitialized(true);
  }, []); // Run only once on mount

  // Always call useAuth hook (required by Rules of Hooks)
  const { user: currentUser, loading: authLoading, isAuthenticated } = useAuth();

  // Listen for auth events - simplified
  useEffect(() => {
    if (!isInitialized) return;

    let mounted = true;

    const setupAuthListeners = async () => {
      try {
        const { realDataService } = await import('./components/services/real-data-service');
        
        const handleUserSignedIn = (user: any) => {
          if (!mounted) return;
          console.log('🎉 App: User signed in event:', user.email);
          if (currentPage === 'login') {
            setCurrentPage('home');
          }
        };

        const handleUserSignedOut = () => {
          if (!mounted) return;
          console.log('🚪 App: User signed out event');
          setCurrentPage('home');
        };

        realDataService.on('userSignedIn', handleUserSignedIn);
        realDataService.on('userSignedOut', handleUserSignedOut);

        return () => {
          realDataService.off('userSignedIn', handleUserSignedIn);
          realDataService.off('userSignedOut', handleUserSignedOut);
        };
      } catch (error) {
        console.error('Error setting up auth listeners:', error);
        return () => {};
      }
    };

    setupAuthListeners().then(cleanup => {
      // Store cleanup function for later use
      return () => {
        mounted = false;
        if (cleanup) cleanup();
      };
    });

    return () => {
      mounted = false;
    };
  }, [isInitialized]); // Remove currentPage dependency to prevent re-runs

  const navigateTo = (page: Page, params?: { adId?: string; chatId?: string }) => {
    console.log('🔄 App Navigation:', { page, params, currentPage });
    
    setCurrentPage(page);
    if (params?.adId) {
      console.log('📝 Setting adId:', params.adId);
      setCurrentAdId(params.adId);
    }
    if (params?.chatId) {
      console.log('💬 Setting chatId:', params.chatId);
      setCurrentChatId(params.chatId);
    }
    
    // Clear URL params when navigating
    if (window.location.search) {
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  // Lightweight loading component for lazy-loaded pages
  const PageLoader = () => (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
    </div>
  );

  const renderPage = () => {
    // Don't render anything until initialization is complete
    if (!isInitialized) {
      return <PageLoader />;
    }

    try {
      switch (currentPage) {
      case 'home':
        if (page === 'signup') return <SignupPage />;
  return <Homepage onNavigate={navigateTo} />;
      case 'login':
        return <LoginPage onNavigate={navigateTo} />;
      case 'ad-detail':
        return <AdDetailPage adId={currentAdId} onNavigate={navigateTo} />;
      case 'post-ad':
        return <PostAdPage onNavigate={navigateTo} />;
      case 'edit-ad':
        return <EditAdPage onNavigate={navigateTo} adId={currentAdId} />;
      case 'messages':
        return <SupabaseMessagesPage onNavigate={navigateTo} />;
      case 'chat':
        console.log('💬 Rendering SupabaseChatPage with chatId:', currentChatId);
        return <SupabaseChatPage chatId={currentChatId} onNavigate={navigateTo} />;
      case 'admin':
        return <AdminDashboard onNavigate={navigateTo} />;
      case 'admin-quick':
        return <AdminQuickActions onNavigate={navigateTo} />;
      case 'admin-debug':
        return <AdminAdsDebugger onNavigate={navigateTo} />;
      case 'admin-verify':
        return <AdminStatusVerifier onNavigate={navigateTo} />;
      case 'sync-ads':
        return <SyncAdsToSupabase />;
      case 'ad-fix-guide':
        return <AdNotFoundFixGuide onNavigate={navigateTo} />;
      case 'ad-fix-test':
        return <AdDetailFixVerifier />;
      case 'supabase-sync-fix':
        return <SupabaseAdsSyncFix />;
      case 'ad-posting-fix':
        console.log('🔧 Rendering AdPostingFix component');
        return <AdPostingFix onNavigate={navigateTo} />;
      case 'login-debug':
        return <LoginStatusDebug onNavigate={navigateTo} />;
      case 'my-ads':
        return <MyAdsPage onNavigate={navigateTo} />;
      case 'all-categories':
        return <AllCategoriesPage onNavigate={navigateTo} />;
      case 'auth-debug':
        return <AuthDebugPage onNavigate={navigateTo} />;
      case 'admin-setup':
        return <SimpleAdminSetup onNavigate={navigateTo} />;
      case 'database-setup':
        return <DatabaseSetupPage onNavigate={navigateTo} />;
      case 'database-schema':
        return <DatabaseSchemaSetup />;
      case 'simple-db-setup':
        return <SimpleDatabaseSetup />;
      case 'ultra-simple-db':
        return <UltraSimpleDatabaseSetup />;
      case 'database-error-helper':
        return <DatabaseErrorHelper onNavigate={navigateTo} />;
      case 'admin-init':
        return <AdminInitializer onComplete={() => navigateTo('home')} />;
      case 'admin-test':
        return <AdminAccessTest onNavigate={navigateTo} />;
      case 'admin-status':
        return <AdminStatusChecker onNavigate={navigateTo} />;
      case 'image-test':
        return <ImageUploadTester />;
      case 'featured-test':
        return <Suspense fallback={<PageLoader />}><FeaturedAdTestPage onNavigate={navigateTo} /></Suspense>;
      case 'backend-test':
        return <BackendConnectionTester onNavigate={navigateTo} />;
      
      // All category pages are lazy loaded
      case 'vehicles':
        return <Suspense fallback={<PageLoader />}><VehiclesPage onNavigate={navigateTo} /></Suspense>;
      case 'digital-goods':
        return <Suspense fallback={<PageLoader />}><DigitalGoodsPage onNavigate={navigateTo} /></Suspense>;
      case 'real-estate':
        return <Suspense fallback={<PageLoader />}><RealEstatePage onNavigate={navigateTo} /></Suspense>;
      case 'commercial-property':
        return <Suspense fallback={<PageLoader />}><CommercialPropertyPage onNavigate={navigateTo} /></Suspense>;
      case 'jobs':
        return <Suspense fallback={<PageLoader />}><JobsPage onNavigate={navigateTo} /></Suspense>;
      case 'services':
        return <Suspense fallback={<PageLoader />}><ServicesPage onNavigate={navigateTo} /></Suspense>;
      case 'fashion':
        return <Suspense fallback={<PageLoader />}><FashionPage onNavigate={navigateTo} /></Suspense>;
      case 'pets':
        return <Suspense fallback={<PageLoader />}><PetsPage onNavigate={navigateTo} /></Suspense>;
      case 'it-web-services':
        return <Suspense fallback={<PageLoader />}><ITWebServicesPage onNavigate={navigateTo} /></Suspense>;
      
      // Specialized service pages
      case 'courses-training':
        return <Suspense fallback={<PageLoader />}><CoursesTrainingPage onNavigate={navigateTo} /></Suspense>;
      case 'driving-lessons':
        return <Suspense fallback={<PageLoader />}><DrivingLessonsPage onNavigate={navigateTo} /></Suspense>;
      case 'music-lessons':
        return <Suspense fallback={<PageLoader />}><MusicLessonsPage onNavigate={navigateTo} /></Suspense>;
      case 'currency-exchange':
        return <Suspense fallback={<PageLoader />}><CurrencyExchangePage onNavigate={navigateTo} /></Suspense>;
      case 'supermarket-wholesalers':
        return <Suspense fallback={<PageLoader />}><SupermarketWholesalersPage onNavigate={navigateTo} /></Suspense>;
      case 'fitness-coach':
        return <Suspense fallback={<PageLoader />}><FitnessCoachPage onNavigate={navigateTo} /></Suspense>;
      case 'food-catering':
        return <Suspense fallback={<PageLoader />}><FoodCateringPage onNavigate={navigateTo} /></Suspense>;
      case 'travel-agency':
        return <Suspense fallback={<PageLoader />}><TravelAgencyPage onNavigate={navigateTo} /></Suspense>;
      case 'accountancy':
        return <Suspense fallback={<PageLoader />}><AccountancyPage onNavigate={navigateTo} /></Suspense>;
      case 'legal':
        return <Suspense fallback={<PageLoader />}><SolicitorLegalServicesPage onNavigate={navigateTo} /></Suspense>;
      case 'medical':
        return <Suspense fallback={<PageLoader />}><DoctorsBeautyClinicsPage onNavigate={navigateTo} /></Suspense>;
      case 'visa':
        return <Suspense fallback={<PageLoader />}><VisaServicesPage onNavigate={navigateTo} /></Suspense>;
      case 'restaurant-equipment':
        return <Suspense fallback={<PageLoader />}><TakeawayRestaurantEquipmentPage onNavigate={navigateTo} /></Suspense>;
      case 'barber-hairdresser':
        return <Suspense fallback={<PageLoader />}><BarberHairdresserPage onNavigate={navigateTo} /></Suspense>;
      case 'tattoo-services':
        return <Suspense fallback={<PageLoader />}><TattooServicesPage onNavigate={navigateTo} /></Suspense>;
      case 'interpreter-translation':
        return <Suspense fallback={<PageLoader />}><InterpreterTranslationServicesPage onNavigate={navigateTo} /></Suspense>;
      
      // Payment and info pages
      case 'payment-success':
        return <Suspense fallback={<PageLoader />}><PaymentSuccessPage onNavigate={navigateTo} /></Suspense>;
      case 'payment-failed':
        return <Suspense fallback={<PageLoader />}><PaymentFailedPage onNavigate={navigateTo} /></Suspense>;
      case 'boost-success':
        return <Suspense fallback={<PageLoader />}><BoostSuccessPage onNavigate={navigateTo} /></Suspense>;
      case 'boost-failed':
        return <Suspense fallback={<PageLoader />}><BoostFailedPage onNavigate={navigateTo} /></Suspense>;
      case 'support-info':
        return <Suspense fallback={<PageLoader />}><SupportInformationPage onNavigate={navigateTo} /></Suspense>;
      case 'terms-conditions':
        return <Suspense fallback={<PageLoader />}><TermsConditionsPage onNavigate={navigateTo} /></Suspense>;
      case 'security-safety':
        return <Suspense fallback={<PageLoader />}><SecuritySafetyPage onNavigate={navigateTo} /></Suspense>;
      case 'user-guide':
        return <Suspense fallback={<PageLoader />}><UserGuidePage onNavigate={navigateTo} /></Suspense>;
      case 'about-us':
        return <Suspense fallback={<PageLoader />}><AboutUsPage onNavigate={navigateTo} /></Suspense>;
      case 'privacy':
        return <Suspense fallback={<PageLoader />}><PrivacyPage onNavigate={navigateTo} /></Suspense>;
      
      default:
        return <Homepage onNavigate={navigateTo} />;
      }
    } catch (error) {
      console.error('❌ Error rendering page:', currentPage, error);
      return <Homepage onNavigate={navigateTo} />;
    }
  };

  // Get page-specific SEO data
  const getPageSEO = () => {
    switch (currentPage) {
      case 'login':
        return { title: 'Login & Sign Up', description: 'Sign in to your Persian Connect account or create a new account' };
      case 'vehicles':
        return { title: 'Vehicles & Cars', description: 'Buy and sell cars, motorcycles, and other vehicles' };
      case 'real-estate':
        return { title: 'Real Estate', description: 'Find apartments, houses, and properties for rent or sale' };
      case 'jobs':
        return { title: 'Jobs & Careers', description: 'Discover job opportunities and career listings' };
      case 'services':
        return { title: 'Services', description: 'Find professional services and skilled providers' };
      case 'post-ad':
        return { title: 'Post Advertisement', description: 'Create and publish your classified ad' };
      case 'edit-ad':
        return { title: 'Edit Advertisement', description: 'Edit your classified ad' };
      case 'admin':
        return { title: 'Admin Dashboard', description: 'Manage your marketplace' };
      case 'admin-quick':
        return { title: 'Admin Quick Actions', description: 'Quick admin tools for managing ads' };
      case 'support-info':
        return { title: 'Support & Information', description: 'Get help and information' };
      case 'terms-conditions':
        return { title: 'Terms & Conditions', description: 'Our terms and conditions of service' };
      case 'security-safety':
        return { title: 'Security & Safety', description: 'Our security measures and safety guidelines' };
      case 'user-guide':
        return { title: 'User Guide', description: 'Complete guide to using Persian Connect' };
      case 'about-us':
        return { title: 'About Us', description: 'Learn about Persian Connect and our mission' };
      case 'privacy':
        return { title: 'Privacy & Security', description: 'Our privacy policy and security measures' };
      case 'featured-test':
        return { title: 'Featured Ads Test', description: 'Test featured ad functionality' };
      default:
        return { title: undefined, description: undefined };
    }
  };

  const pageSEO = getPageSEO();

  return (
    <ErrorBoundary>
      <LanguageProvider>
        <SEOHead 
          title={pageSEO.title}
          description={pageSEO.description}
          path={currentPage === 'home' ? '/' : `/${currentPage}`}
        />
        <div className="min-h-screen bg-background">
          {renderPage()}
          
          {/* Only load additional components after initialization */}
          {isInitialized && (
            <>
              <AIChangeLogger />
              <Toaster />
              
              {/* PWA Install Prompt */}
              {showInstallPrompt && (
                <PWAInstallPrompt onClose={dismissPrompt} />
              )}
            </>
          )}
        </div>
      </LanguageProvider>
    </ErrorBoundary>
  );
}