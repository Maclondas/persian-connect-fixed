import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { AdCard } from './ad-card';
import { DomainBranding, ContactInfo, SocialLinks } from './domain-branding';
import { Search, MapPin, Globe, Plus, Heart, MessageCircle, User, Home, Menu, Star, Car, Building, Wrench, Monitor, Dog, Sofa, Shirt, MoreHorizontal, ChevronDown, LogIn, Navigation, Building2, Briefcase, Smartphone, Calendar, Code, GraduationCap, Dumbbell, ChefHat, Plane, Calculator, Scale, Stethoscope, CreditCard, DollarSign, UtensilsCrossed, ShoppingCart, Scissors, Palette, Languages, BookOpen, Car as CarIcon, Music, PlusCircle, Grid3X3, ChevronUp, Check, Filter, Shield, ChevronRight, HelpCircle, FileText, Phone, Info, Users, Lock, ShieldAlert, X } from 'lucide-react';
import svgPaths from '../imports/svg-dfs7jxxdxv';
import { useLocation, LocationData } from './hooks/useLocation';
import { useLanguage } from './hooks/useLanguage';
import { LocationPicker } from './location-picker';
import { LocationPickerModal } from './location-picker-modal';
import { isUserAdmin } from './admin-dashboard';
import realDataService, { Ad as DataAd } from './services/real-data-service';
import { publicAnonKey } from '../utils/supabase/info';
import { useAuth } from './hooks/useAuth';
import { toast } from 'sonner@2.0.3';
import { PWADebug } from './pwa-debug';

interface NavigateFunction {
  (page: 'home' | 'login' | 'ad-detail' | 'post-ad' | 'messages' | 'chat' | 'admin' | 'my-ads' | 'all-categories' | 'vehicles' | 'digital-goods' | 'real-estate' | 'commercial-property' | 'jobs' | 'services' | 'fashion' | 'pets' | 'it-web-services' | 'courses-training' | 'driving-lessons' | 'music-lessons' | 'currency-exchange' | 'supermarket-wholesalers' | 'fitness-coach' | 'food-catering' | 'travel-agency' | 'accountancy' | 'legal' | 'medical' | 'visa' | 'restaurant-equipment' | 'barber-hairdresser' | 'tattoo-services' | 'interpreter-translation' | 'support-info' | 'terms-conditions' | 'security-safety' | 'user-guide' | 'about-us' | 'privacy' | 'ad-posting-fix' | 'ultra-simple-db', params?: { adId?: string; chatId?: string }): void;
}

interface HomepageProps {
  onNavigate: NavigateFunction;
}

interface Category {
  id: string;
  name: string;
  namePersian: string;
  icon: React.ComponentType<any>;
}

interface Ad {
  id: string;
  titleKey: string;
  price: string;
  priceValue: number;
  location?: string;
  image: string;
  featured?: boolean;
  timeKey: string;
  datePosted: Date;
  category: string;
  isUrgent?: boolean;
  isNegotiable?: boolean;
}

// Main categories (8 shown in the grid as per original design)
const mainCategories: Category[] = [
  { id: 'vehicles', name: 'Vehicles', namePersian: 'خودرو', icon: Car },
  { id: 'real-estate', name: 'Real Estate', namePersian: 'املاک', icon: Building },
  { id: 'services', name: 'Services', namePersian: 'خدمات', icon: Wrench },
  { id: 'digital-goods', name: 'Digital Goods', namePersian: 'کالای دیجیتال', icon: Monitor },
  { id: 'jobs', name: 'Jobs', namePersian: 'شغل', icon: Briefcase },
  { id: 'fashion', name: 'Fashion', namePersian: 'پوشاک', icon: Shirt },
  { id: 'pets', name: 'Pets & Animals', namePersian: 'حیوانات خانگی', icon: Dog },
  { id: 'all-categories', name: 'All Categories', namePersian: 'همه دسته‌بندی‌ها', icon: Grid3X3 }
];

type FilterOption = 'newest' | 'oldest' | 'lowest-price' | 'highest-price' | 'urgent' | 'negotiable';

export function Homepage({ onNavigate }: HomepageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('newest');
  const [ads, setAds] = useState<DataAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);

  const { location: selectedLocation, setManualLocation } = useLocation();
  const { currentLanguage, setLanguage, t } = useLanguage();
  const { user: currentUser, isAuthenticated, loading: authLoading, isAdmin } = useAuth();

  // Store user data in localStorage for compatibility
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      if (currentUser.username) {
        localStorage.setItem('username', currentUser.username);
      }
    }
  }, [currentUser]);

  // Load ads
  useEffect(() => {
    loadAds();
  }, [selectedLocation, searchQuery, selectedFilter]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.login-dropdown-container')) {
        setShowLoginDropdown(false);
      }
      if (!target.closest('.filter-dropdown-container')) {
        setShowFilterOptions(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const loadAds = async () => {
    try {
      setLoading(true);
      
      // Try the new async method first, fall back to server method
      let allAds;
      try {
        allAds = await realDataService.getAllAdsAsync();
        console.log('📊 Homepage: Loaded ads from getAllAdsAsync:', allAds.length);
      } catch (error) {
        console.warn('⚠️ getAllAdsAsync failed, trying server method:', error);
        const result = await realDataService.getAds();
        allAds = result?.ads || [];
        console.log('📊 Homepage: Loaded ads from server getAds:', allAds.length);
      }
      
      // Ensure we have a valid array
      const validAds = Array.isArray(allAds) ? allAds : [];
      
      // Filter by location if selected
      let filteredAds = validAds;
      if (selectedLocation?.city && selectedLocation.city !== 'All Cities') {
        filteredAds = validAds.filter(ad => 
          ad.location?.city?.toLowerCase().includes(selectedLocation.city.toLowerCase()) ||
          ad.location?.country?.toLowerCase().includes(selectedLocation.city.toLowerCase())
        );
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filteredAds = filteredAds.filter(ad =>
          ad.title?.toLowerCase().includes(query) ||
          ad.titlePersian?.toLowerCase().includes(query) ||
          ad.description?.toLowerCase().includes(query) ||
          ad.descriptionPersian?.toLowerCase().includes(query) ||
          ad.category?.toLowerCase().includes(query)
        );
      }

      setAds(filteredAds);
      
      // Debug info
      console.log('🔍 Demo mode check:', realDataService.isDemoMode());
      console.log('🔍 Project ID:', 'tnnaitaovinhtgoqtuvs');
      console.log('🔍 Has anon key:', !!publicAnonKey);
      
      // Clear any previous demo notices since we're no longer using demo mode
      localStorage.removeItem('demo_notice_shown');
      
      // Show demo mode notice once when first loading
      if (realDataService.isDemoMode() && !localStorage.getItem('demo_notice_shown')) {
        toast.info('🎭 Welcome to Persian Connect Demo!', { 
          description: 'Working offline with sample data. Your ads will sync when online.',
          duration: 5000 
        });
        localStorage.setItem('demo_notice_shown', 'true');
      }
      
    } catch (error) {
      console.error('Error loading ads:', error);
      // Don't show error in demo mode, just log it
      if (!realDataService.isDemoMode()) {
        toast.error('Unable to load ads. Please check your connection.');
      }
      // Ensure ads is always an array even on error
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  // Admin function to approve pending ads
  const handleApproveAllPendingAds = async () => {
    if (!currentUser || (!isAdmin && !currentUser.email?.toLowerCase().includes('ommzadeh@gmail.com'))) {
      toast.error('Access denied. Admin privileges required.');
      return;
    }

    try {
      console.log('🔧 Admin: Approving all pending ads...');
      
      // First, let's debug what ads are in storage
      const localAds = JSON.parse(localStorage.getItem('demo_ads') || '[]');
      console.log('📦 Current ads in storage:', localAds.length);
      console.log('📦 Ad statuses:', localAds.map(ad => ({ 
        id: ad.id, 
        title: ad.title, 
        status: ad.status, 
        userEmail: ad.userEmail 
      })));
      
      const result = await realDataService.approveAllPendingAdsForAdmin();
      
      if (result.approved > 0) {
        toast.success(`✅ Approved ${result.approved} pending ads! They are now visible to all users.`);
        // Reload ads to show the updated status
        await loadAds();
      } else {
        toast.info('ℹ️ No pending ads found to approve.');
      }
    } catch (error) {
      console.error('Error approving ads:', error);
      toast.error('Failed to approve ads. Please try again.');
    }
  };

  const filterOptions = [
    { id: 'newest', nameKey: 'filter.newest' },
    { id: 'oldest', nameKey: 'filter.oldest' },
    { id: 'lowest-price', nameKey: 'filter.lowest_price' },
    { id: 'highest-price', nameKey: 'filter.highest_price' },
    { id: 'urgent', nameKey: 'filter.urgent' },
    { id: 'negotiable', nameKey: 'filter.negotiable' }
  ] as const;

  const handleLocationSelect = (country: string, city: string) => {
    const locationData: LocationData = { country, city };
    setManualLocation(locationData);
    setShowLocationModal(false);
    
    toast.success(
      currentLanguage === 'en' 
        ? `Location set to ${city}, ${country}`
        : `مکان به ${city}، ${country} تنظیم شد`
    );
  };

  const handleSearch = () => {
    loadAds();
    if (searchQuery.trim()) {
      toast.success(`${t('search.searching_for')} "${searchQuery}"`);
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    onNavigate(categoryId as any);
  };

  const handleFilterSelect = (filter: FilterOption) => {
    setSelectedFilter(filter);
    setShowFilterOptions(false);
    toast.success(`${t('search.filter_applied')}: ${t(filterOptions.find(f => f.id === filter)?.nameKey || 'filter.newest')}`);
  };

  const getFilterDisplayName = () => {
    const option = filterOptions.find(f => f.id === selectedFilter);
    return option ? t(option.nameKey) : t('filter.newest');
  };

  const handleGoogleSignIn = async () => {
    try {
      console.log('🔄 Starting Google OAuth flow...');
      
      localStorage.setItem('google_signin_loading', 'true');
      
      toast.info(
        currentLanguage === 'en' 
          ? 'Redirecting to Google...' 
          : 'انتقال به گوگل...'
      );
      
      realDataService.signInWithGoogle().catch(error => {
        console.error('❌ Google sign-in error:', error);
        localStorage.removeItem('google_signin_loading');
        toast.error(
          currentLanguage === 'en' 
            ? 'Failed to sign in with Google. Please try again.' 
            : 'ورود با گوگل ناموفق بود. لطفاً دوباره تلاش کنید.'
        );
      });
      
    } catch (error: any) {
      console.error('❌ Google sign-in error:', error);
      localStorage.removeItem('google_signin_loading');
      toast.error(
        currentLanguage === 'en' 
          ? 'Failed to sign in with Google. Please try again.' 
          : 'ورود با گوگل ناموفق بود. لطفاً دوباره تلاش کنید.'
      );
    }
  };

  const sortedAds = [...(ads || [])].sort((a, b) => {
    switch (selectedFilter) {
      case 'newest':
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case 'oldest':
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case 'lowest-price':
        return (a.price_value || 0) - (b.price_value || 0);
      case 'highest-price':
        return (b.price_value || 0) - (a.price_value || 0);
      case 'urgent':
        return (b.is_urgent ? 1 : 0) - (a.is_urgent ? 1 : 0);
      case 'negotiable':
        return (b.is_negotiable ? 1 : 0) - (a.is_negotiable ? 1 : 0);
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  return (
    <div className={`min-h-screen bg-background ${currentLanguage === 'fa' ? 'rtl' : 'ltr'}`} dir={currentLanguage === 'fa' ? 'rtl' : 'ltr'}>
      
      {/* Demo Mode Notice */}
      {realDataService.isDemoMode() && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
          <p className="text-sm text-yellow-800 text-center">
            🎭 <strong>{currentLanguage === 'en' ? 'Demo Mode' : 'حالت نمایشی'}:</strong> {currentLanguage === 'en' ? 'Working offline with sample data' : 'کار آفلاین با داده‌های نمونه'}
          </p>
        </div>
      )}
      



      
      <div className="flex-grow overflow-y-auto pb-20">
        {/* Header */}
        <header className="sticky top-0 bg-white shadow-sm z-50 border-b border-gray-100">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              {/* Location Picker */}
              <button 
                onClick={() => setShowLocationModal(true)}
                className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors min-w-0"
              >
                <MapPin className="h-5 w-5 flex-shrink-0" />
                <span className="text-sm flex flex-col items-start leading-tight">
                  {selectedLocation ? (
                    <>
                      <span className="text-xs opacity-90">
                        {selectedLocation.country}
                      </span>
                      <span className="text-sm font-medium">
                        {selectedLocation.city}
                      </span>
                    </>
                  ) : (
                    <span>{currentLanguage === 'en' ? 'Location' : 'مکان'}</span>
                  )}
                </span>
              </button>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Login/User Button */}
              {isAuthenticated && currentUser ? (
                <div className="relative login-dropdown-container">
                  <button 
                    onClick={() => setShowLoginDropdown(!showLoginDropdown)}
                    className="flex items-center gap-2 text-gray-600 hover:bg-gray-100 rounded-lg px-3 py-2 transition-colors"
                  >
                    <User className="h-4 w-4" />
                    <span className="text-sm hidden sm:inline">
                      {currentUser.username || currentUser.email?.split('@')[0] || 'User'}
                    </span>
                  </button>
                  
                  {/* User Dropdown */}
                  {showLoginDropdown && (
                    <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <div className="p-2">
                        <button
                          onClick={() => {
                            onNavigate('my-ads');
                            setShowLoginDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center gap-2"
                        >
                          <Heart className="h-4 w-4" />
                          {currentLanguage === 'en' ? 'My Ads' : 'آگهی‌های من'}
                        </button>
                        <button
                          onClick={() => {
                            onNavigate('messages');
                            setShowLoginDropdown(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center gap-2"
                        >
                          <MessageCircle className="h-4 w-4" />
                          {currentLanguage === 'en' ? 'Messages' : 'پیام‌ها'}
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => {
                              onNavigate('admin');
                              setShowLoginDropdown(false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center gap-2"
                          >
                            <Shield className="h-4 w-4" />
                            {currentLanguage === 'en' ? 'Admin Panel' : 'پنل مدیریت'}
                          </button>
                        )}
                        
                        {/* Development only admin access */}
                        {(window.location.hostname === 'localhost' || window.location.hostname.includes('figma')) && (
                          <button
                            onClick={() => {
                              onNavigate('admin-test');
                              setShowLoginDropdown(false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 rounded-md flex items-center gap-2"
                          >
                            <Shield className="h-4 w-4" />
                            {currentLanguage === 'en' ? '🔧 Dev: Admin Test' : '🔧 توسعه: تست مدیر'}
                          </button>
                        )}
                        
                        <div className="border-t border-gray-200 my-1"></div>
                        <button
                          onClick={async () => {
                            try {
                              console.log('🚪 Logout button clicked');
                              await realDataService.signOut();
                              setShowLoginDropdown(false);
                              toast.success(currentLanguage === 'en' ? 'Signed out successfully' : 'با موفقیت خارج شدید');
                              // Don't reload - let the App.tsx handle the logout event
                            } catch (error) {
                              console.error('Logout error:', error);
                              toast.error(currentLanguage === 'en' ? 'Failed to sign out' : 'خروج ناموفق بود');
                            }
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md flex items-center gap-2"
                        >
                          <LogIn className="h-4 w-4 rotate-180" />
                          {currentLanguage === 'en' ? 'Sign Out' : 'خروج'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  onClick={() => onNavigate('login')}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <LogIn className="h-4 w-4" />
                  <span>
                    {currentLanguage === 'en' ? 'Login' : 'ورود'}
                  </span>
                </Button>
              )}

              {/* Language Switcher */}
              <button 
                className="flex items-center gap-1 text-gray-600 hover:bg-gray-100 rounded-lg px-2 py-1 transition-colors"
                onClick={() => setLanguage(currentLanguage === 'en' ? 'fa' : 'en')}
              >
                <Languages className="h-4 w-4" />
                <span className="text-sm">{currentLanguage === 'en' ? 'فا' : 'EN'}</span>
              </button>
              
              {/* Hamburger Menu Button */}
              <button 
                className="flex items-center justify-center w-11 h-11 text-foreground hover:text-primary hover:bg-primary/10 active:bg-primary/20 rounded-xl transition-all duration-200 border border-border hover:border-primary/30 shadow-sm hover:shadow-md"
                onClick={() => setShowMobileMenu(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
          
          {/* Mobile Menu Overlay */}
          {showMobileMenu && (
            <div className="fixed inset-0 z-50">
              {/* Backdrop */}
              <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setShowMobileMenu(false)}
              />
              
              {/* Menu Panel */}
              <div className="absolute top-0 right-0 h-full w-80 bg-background shadow-2xl border-l border-border/20">
                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-center justify-between p-6 border-b border-border/10">
                    <h2 className="text-foreground text-lg font-semibold">
                      {currentLanguage === 'en' ? 'Menu' : 'منو'}
                    </h2>
                    <button 
                      onClick={() => setShowMobileMenu(false)}
                      className="text-muted-foreground hover:text-foreground hover:bg-muted p-2 rounded-xl transition-all duration-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  {/* Menu Content */}
                  <div className="flex-1 overflow-y-auto">
                    {/* Support & Information Section */}
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <HelpCircle className="w-4 h-4 text-primary" />
                        </div>
                        <h3 className="text-foreground font-semibold text-base">
                          {currentLanguage === 'en' ? 'Support & Information' : 'پشتیبانی و اطلاعات'}
                        </h3>
                      </div>
                      
                      <div className="space-y-1">
                        {/* Support */}
                        <button
                          onClick={() => {
                            onNavigate('support-info');
                            setShowMobileMenu(false);
                          }}
                          className="flex items-center gap-4 w-full p-3 text-left hover:bg-muted/50 rounded-lg transition-all duration-200 group"
                        >
                          <div className="w-8 h-8 bg-blue-50 dark:bg-blue-950 rounded-lg flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900 transition-colors">
                            <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="text-foreground text-sm font-medium flex-1">
                            {currentLanguage === 'en' ? 'Support' : 'پشتیبانی'}
                          </span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </button>
                        
                        {/* User Guide */}
                        <button
                          onClick={() => {
                            onNavigate('user-guide');
                            setShowMobileMenu(false);
                          }}
                          className="flex items-center gap-4 w-full p-3 text-left hover:bg-muted/50 rounded-lg transition-all duration-200 group"
                        >
                          <div className="w-8 h-8 bg-green-50 dark:bg-green-950 rounded-lg flex items-center justify-center group-hover:bg-green-100 dark:group-hover:bg-green-900 transition-colors">
                            <BookOpen className="w-4 h-4 text-green-600 dark:text-green-400" />
                          </div>
                          <span className="text-foreground text-sm font-medium flex-1">
                            {currentLanguage === 'en' ? 'User Guide' : 'راهنمای کاربر'}
                          </span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </button>
                        
                        {/* Login Status Debug - Debug Tool */}
                        <button
                          onClick={() => {
                            onNavigate('login-debug');
                            setShowMobileMenu(false);
                          }}
                          className="flex items-center gap-4 w-full p-3 text-left hover:bg-muted/50 rounded-lg transition-all duration-200 group"
                        >
                          <div className="w-8 h-8 bg-purple-50 dark:bg-purple-950 rounded-lg flex items-center justify-center group-hover:bg-purple-100 dark:group-hover:bg-purple-900 transition-colors">
                            <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <span className="text-foreground text-sm font-medium flex-1">
                            {currentLanguage === 'en' ? 'Login & Debug Tools' : 'ابزارهای ورود و عیب‌یابی'}
                          </span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </button>

                        {/* Ad Posting Fix - Debug Tool */}
                        <button
                          onClick={() => {
                            onNavigate('ad-posting-fix');
                            setShowMobileMenu(false);
                          }}
                          className="flex items-center gap-4 w-full p-3 text-left hover:bg-muted/50 rounded-lg transition-all duration-200 group"
                        >
                          <div className="w-8 h-8 bg-orange-50 dark:bg-orange-950 rounded-lg flex items-center justify-center group-hover:bg-orange-100 dark:group-hover:bg-orange-900 transition-colors">
                            <Shield className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                          </div>
                          <span className="text-foreground text-sm font-medium flex-1">
                            {currentLanguage === 'en' ? 'Fix Ad Posting Issues' : 'رفع مشکلات ثبت آگهی'}
                          </span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground transition-colors" />
                        </button>
                        
                        {/* Terms & Conditions */}
                        <button
                          onClick={() => {
                            onNavigate('terms-conditions');
                            setShowMobileMenu(false);
                          }}
                          className="flex items-center gap-4 w-full p-3 text-left hover:bg-muted/50 rounded-lg transition-all duration-200 group"
                        >
                          <div className="w-8 h-8 bg-purple-50 dark:bg-purple-950 rounded-lg flex items-center justify-center group-hover:bg-purple-100 dark:group-hover:bg-purple-900 transition-colors">
                            <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <span className="text-foreground text-sm font-medium flex-1">
                            {currentLanguage === 'en' ? 'Terms & Conditions' : 'شرایط و ضوابط'}
                          </span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </button>
                        
                        {/* Contact Us */}
                        <button
                          onClick={() => {
                            onNavigate('support-info');
                            setShowMobileMenu(false);
                          }}
                          className="flex items-center gap-4 w-full p-3 text-left hover:bg-muted/50 rounded-lg transition-all duration-200 group"
                        >
                          <div className="w-8 h-8 bg-orange-50 dark:bg-orange-950 rounded-lg flex items-center justify-center group-hover:bg-orange-100 dark:group-hover:bg-orange-900 transition-colors">
                            <Phone className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                          </div>
                          <span className="text-foreground text-sm font-medium flex-1">
                            {currentLanguage === 'en' ? 'Contact Us' : 'تماس با ما'}
                          </span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </button>
                        
                        {/* About Persian Connect */}
                        <button
                          onClick={() => {
                            onNavigate('about-us');
                            setShowMobileMenu(false);
                          }}
                          className="flex items-center gap-4 w-full p-3 text-left hover:bg-muted/50 rounded-lg transition-all duration-200 group"
                        >
                          <div className="w-8 h-8 bg-teal-50 dark:bg-teal-950 rounded-lg flex items-center justify-center group-hover:bg-teal-100 dark:group-hover:bg-teal-900 transition-colors">
                            <Info className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                          </div>
                          <span className="text-foreground text-sm font-medium flex-1">
                            {currentLanguage === 'en' ? 'About Persian Connect' : 'درباره پرشین کانکت'}
                          </span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </button>
                        
                        {/* Security & Safety */}
                        <button
                          onClick={() => {
                            onNavigate('security-safety');
                            setShowMobileMenu(false);
                          }}
                          className="flex items-center gap-4 w-full p-3 text-left hover:bg-muted/50 rounded-lg transition-all duration-200 group"
                        >
                          <div className="w-8 h-8 bg-red-50 dark:bg-red-950 rounded-lg flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-900 transition-colors">
                            <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </div>
                          <span className="text-foreground text-sm font-medium flex-1">
                            {currentLanguage === 'en' ? 'Security & Safety' : 'امنیت و ایمنی'}
                          </span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </button>
                        
                        {/* Privacy */}
                        <button
                          onClick={() => {
                            onNavigate('privacy');
                            setShowMobileMenu(false);
                          }}
                          className="flex items-center gap-4 w-full p-3 text-left hover:bg-muted/50 rounded-lg transition-all duration-200 group"
                        >
                          <div className="w-8 h-8 bg-gray-50 dark:bg-gray-950 rounded-lg flex items-center justify-center group-hover:bg-gray-100 dark:group-hover:bg-gray-900 transition-colors">
                            <Lock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </div>
                          <span className="text-foreground text-sm font-medium flex-1">
                            {currentLanguage === 'en' ? 'Privacy' : 'حریم خصوصی'}
                          </span>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Divider */}
                    <div className="h-px bg-border/20 mx-6" />
                    
                    {/* User/Account Section */}
                    <div className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <h3 className="text-foreground font-semibold text-base">
                          {currentLanguage === 'en' ? 'Account' : 'حساب کاربری'}
                        </h3>
                      </div>
                      
                      {isAuthenticated && currentUser ? (
                        <div className="space-y-1">
                          {/* User Info */}
                          <div className="flex items-center gap-4 px-3 py-4 bg-muted/30 rounded-lg border border-border/10">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="text-foreground font-semibold text-sm">
                                {currentUser.username || currentUser.email?.split('@')[0] || 'User'}
                              </p>
                              <p className="text-muted-foreground text-xs">{currentUser.email}</p>
                            </div>
                          </div>
                          
                          {/* My Ads */}
                          <button
                            onClick={() => {
                              onNavigate('my-ads');
                              setShowMobileMenu(false);
                            }}
                            className="flex items-center gap-4 w-full p-3 text-left hover:bg-muted/50 rounded-lg transition-all duration-200 group"
                          >
                            <div className="w-8 h-8 bg-pink-50 dark:bg-pink-950 rounded-lg flex items-center justify-center group-hover:bg-pink-100 dark:group-hover:bg-pink-900 transition-colors">
                              <Heart className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                            </div>
                            <span className="text-foreground text-sm font-medium flex-1">
                              {currentLanguage === 'en' ? 'My Ads' : 'آگهی‌های من'}
                            </span>
                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                          </button>
                          
                          {/* Messages */}
                          <button
                            onClick={() => {
                              onNavigate('messages');
                              setShowMobileMenu(false);
                            }}
                            className="flex items-center gap-4 w-full p-3 text-left hover:bg-muted/50 rounded-lg transition-all duration-200 group"
                          >
                            <div className="w-8 h-8 bg-blue-50 dark:bg-blue-950 rounded-lg flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900 transition-colors">
                              <MessageCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="text-foreground text-sm font-medium flex-1">
                              {currentLanguage === 'en' ? 'Messages' : 'پیام‌ها'}
                            </span>
                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                          </button>
                          
                          {/* Admin Panel (if admin) */}
                          {isAdmin && (
                            <button
                              onClick={() => {
                                onNavigate('admin');
                                setShowMobileMenu(false);
                              }}
                              className="flex items-center gap-4 w-full p-3 text-left hover:bg-muted/50 rounded-lg transition-all duration-200 group"
                            >
                              <div className="w-8 h-8 bg-yellow-50 dark:bg-yellow-950 rounded-lg flex items-center justify-center group-hover:bg-yellow-100 dark:group-hover:bg-yellow-900 transition-colors">
                                <Shield className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                              </div>
                              <span className="text-foreground text-sm font-medium flex-1">
                                {currentLanguage === 'en' ? 'Admin Panel' : 'پنل مدیریت'}
                              </span>
                              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                            </button>
                          )}
                          
                          {/* Sign Out */}
                          <button
                            onClick={async () => {
                              try {
                                console.log('🚪 Mobile logout button clicked');
                                await realDataService.signOut();
                                setShowMobileMenu(false);
                                toast.success(currentLanguage === 'en' ? 'Signed out successfully' : 'با موفقیت خارج شدید');
                                // Don't reload - let the App.tsx handle the logout event
                              } catch (error) {
                                console.error('Mobile logout error:', error);
                                toast.error(currentLanguage === 'en' ? 'Failed to sign out' : 'خروج ناموفق بود');
                              }
                            }}
                            className="flex items-center gap-4 w-full p-3 text-left hover:bg-red-50/50 dark:hover:bg-red-950/50 rounded-lg transition-all duration-200 group mt-2"
                          >
                            <div className="w-8 h-8 bg-red-50 dark:bg-red-950 rounded-lg flex items-center justify-center group-hover:bg-red-100 dark:group-hover:bg-red-900 transition-colors">
                              <LogIn className="w-4 h-4 text-red-600 dark:text-red-400 rotate-180" />
                            </div>
                            <span className="text-red-600 dark:text-red-400 text-sm font-medium flex-1">
                              {currentLanguage === 'en' ? 'Sign Out' : 'خروج'}
                            </span>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {/* Login Button */}
                          <button
                            onClick={() => {
                              onNavigate('login');
                              setShowMobileMenu(false);
                            }}
                            className="flex items-center gap-4 w-full p-4 text-left bg-primary/5 hover:bg-primary/10 rounded-lg transition-all duration-200 border-2 border-primary/20 hover:border-primary/30 group"
                          >
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                              <LogIn className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-primary text-sm font-semibold flex-1">
                              {currentLanguage === 'en' ? 'Login / Sign Up' : 'ورود / ثبت نام'}
                            </span>
                            <ChevronRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Footer */}
                  <div className="p-6 border-t border-border/10">
                    <div className="text-center">
                      <p className="text-muted-foreground text-xs">
                        {currentLanguage === 'en' ? 'Persian Connect' : 'پرشین کانکت'}
                      </p>
                      <p className="text-muted-foreground text-xs opacity-60">
                        {currentLanguage === 'en' ? 'Version 1.0' : 'نسخه ۱.۰'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="px-4 pb-4">
            {/* Search Bar */}
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 rtl:left-auto rtl:right-3" />
                <Input
                  type="text"
                  placeholder={currentLanguage === 'en' ? 'Search in all categories' : 'جستجو در همه دسته‌بندی‌ها'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-md border-gray-200 bg-gray-100 py-2 pl-10 pr-4 rtl:pl-4 rtl:pr-10 text-gray-800 placeholder:text-gray-500 focus:border-primary focus:ring-primary"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button 
                onClick={handleSearch}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary hover:bg-opacity-90"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Filter Section */}
            <div className="flex items-center justify-between relative filter-dropdown-container">
              <h3 className="text-sm font-medium text-gray-700">
                {currentLanguage === 'en' ? 'Browse Ads' : 'مرور آگهی‌ها'}
              </h3>
              
              {/* Filter Button */}
              <button
                onClick={() => setShowFilterOptions(!showFilterOptions)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Filter className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {currentLanguage === 'en' ? 'Filter' : 'فیلتر'}
                </span>
                <span className="text-xs text-gray-500">
                  ({getFilterDisplayName()})
                </span>
              </button>

              {/* Filter Options Dropdown */}
              {showFilterOptions && (
                <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-40 min-w-[200px]">
                  <div className="p-2">
                    {filterOptions.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleFilterSelect(option.id)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                          selectedFilter === option.id 
                            ? 'bg-primary text-white' 
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        {t(option.nameKey)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Black Hero Section */}
        <div className="bg-black px-4 py-8">
          <div className="text-center text-white">
            <h1 className="text-xl font-bold mb-2">
              {currentLanguage === 'en' 
                ? 'FIND EVERYTHING IN THE PERSIAN COMMUNITY' 
                : 'همه چیز را در جامعه ایرانی بیابید'
              }
            </h1>
            <p className="text-gray-300">
              {currentLanguage === 'en' 
                ? 'Thousands of ads and jobs are waiting for you!' 
                : 'هزاران آگهی و شغل منتظر شما هستند!'
              }
            </p>
          </div>
          
          {/* Categories Grid */}
          <div className="mt-8 grid grid-cols-4 gap-4 max-w-lg mx-auto">
            {mainCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className="flex flex-col items-center gap-2 p-3 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <div className="w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                  <category.icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-white text-xs text-center leading-tight">
                  {currentLanguage === 'en' ? category.name : category.namePersian}
                </span>
              </button>
            ))}
          </div>
        </div>



        {/* Ads Content or Loading */}
        <div className="text-center py-8">
          {loading ? (
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-gray-500">
                {currentLanguage === 'en' ? 'Loading ads...' : 'در حال بارگذاری آگهی‌ها...'}
              </p>
            </div>
          ) : sortedAds.length === 0 ? (
            <p className="text-gray-500">
              {currentLanguage === 'en' ? 'No ads found' : 'آگهی‌ای یافت نشد'}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
              {sortedAds.slice(0, 12).map((ad) => (
                <AdCard 
                  key={ad.id}
                  ad={ad}
                  onNavigate={onNavigate}
                  currentLanguage={currentLanguage}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex items-center justify-around py-2">
          {/* Home */}
          <button
            onClick={() => onNavigate('home')}
            className="flex flex-col items-center p-2 text-primary"
          >
            <Home className="h-6 w-6" />
            <span className="text-xs mt-1">
              {currentLanguage === 'en' ? 'Home' : 'خانه'}
            </span>
          </button>

          {/* Favorites */}
          <button
            onClick={() => toast.info(currentLanguage === 'en' ? 'Favorites feature coming soon!' : 'قابلیت علاقه‌مندی‌ها به زودی!')}
            className="flex flex-col items-center p-2 text-gray-600"
          >
            <Heart className="h-6 w-6" />
            <span className="text-xs mt-1">
              {currentLanguage === 'en' ? 'Favorites' : 'علاقه‌مندی‌ها'}
            </span>
          </button>

          {/* Post Ad */}
          <button
            onClick={() => {
              console.log('🎯 Post Ad clicked - Anonymous posting enabled');
              onNavigate('post-ad');
            }}
            className="flex flex-col items-center p-2"
          >
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <Plus className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs mt-1 text-primary">
              {currentLanguage === 'en' ? 'Post Ad' : 'ثبت آگهی'}
            </span>
          </button>

          {/* Messages */}
          <button
            onClick={() => {
              if (authLoading) return; // Don't navigate while auth is loading
              return isAuthenticated ? onNavigate('messages') : onNavigate('login');
            }}
            className={`flex flex-col items-center p-2 text-gray-600 ${authLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <MessageCircle className="h-6 w-6" />
            <span className="text-xs mt-1">
              {currentLanguage === 'en' ? 'Messages' : 'پیام‌ها'}
            </span>
          </button>

          {/* My Ads */}
          <button
            onClick={() => {
              if (authLoading) return; // Don't navigate while auth is loading
              return isAuthenticated ? onNavigate('my-ads') : onNavigate('login');
            }}
            className={`flex flex-col items-center p-2 text-gray-600 ${authLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <User className="h-6 w-6" />
            <span className="text-xs mt-1">
              {currentLanguage === 'en' ? 'My Ads' : 'آگهی‌های من'}
            </span>
          </button>
        </div>
      </div>

      {/* Location Picker Modal */}
      {showLocationModal && (
        <LocationPickerModal
          isOpen={showLocationModal}
          onClose={() => setShowLocationModal(false)}
          onLocationSelect={handleLocationSelect}
        />
      )}
      
      {/* PWA Debug - Temporary floating button */}

    </div>
  );
}