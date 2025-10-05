import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'fa';

interface LanguageContextType {
  currentLanguage: Language;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const translations = {
  en: {
    // Header
    'header.location': 'Location',
    'header.login': 'Login',
    'header.detecting': 'Detecting...',
    
    // Search
    'search.placeholder': 'Search in all categories',
    
    // Categories
    'categories.vehicles': 'Vehicles',
    'categories.real-estate': 'Real Estate',
    'categories.commercial-property': 'Commercial Property',
    'categories.jobs': 'Recruitments & Jobs',
    'categories.services': 'Services',
    'categories.fashion': 'Fashion',
    'categories.digital-goods': 'Electronics',
    'categories.pets': 'Pets & Animals',
    'categories.events': 'Events',
    'categories.it-web': 'IT & Web Services',
    'categories.education': 'Education & Learning',
    'categories.fitness': 'Fitness Coach',
    'categories.food-catering': 'Food & Catering',
    'categories.travel': 'Travel Agency',
    'categories.accountancy': 'Accountancy',
    'categories.legal': 'Legal Services',
    'categories.medical': 'Medical & Beauty',
    'categories.visa': 'Visa Services',
    'categories.currency': 'Currency Exchange',
    'categories.restaurant-equipment': 'Restaurant Equipment',
    'categories.wholesale': 'Supermarkets & Wholesalers',
    'categories.barber': 'Barber & Hairdresser',
    'categories.tattoo': 'Tattoo Services',
    'categories.translation': 'Translation Services',
    'categories.courses': 'Courses & Training',
    'categories.driving': 'Driving Lessons',
    'categories.music': 'Music Lessons',
    'categories.other': 'Other',
    'categories.viewAll': 'View All',
    'categories.showLess': 'Show Less',
    
    // Featured Ads
    'featured.title': 'Featured Ads',
    'featured.justNow': 'Just now',
    'featured.hourAgo': '1 hour ago',
    'featured.hoursAgo': '2 hours ago',
    
    // Navigation
    'nav.home': 'Home',
    'nav.favorites': 'Favorites',
    'nav.messages': 'Messages',
    'nav.myAds': 'My Ads',
    'nav.postAd': 'Post Ad',
    'nav.admin': 'Admin',
    
    // Location Picker
    'location.title': 'Select Location',
    'location.useCurrentLocation': 'Use Current Location',
    'location.autoDetect': 'Auto-detect your location',
    'location.detect': 'Detect',
    'location.detecting': 'Detecting...',
    'location.searchPlaceholder': 'Search for a city...',
    'location.noCitiesFound': 'No cities found matching',
    
    // Location notifications
    'location.detected': 'Location detected',
    'location.deniedByUser': 'Location access denied by user',
    'location.unavailable': 'Location information unavailable',
    'location.timeout': 'Location request timed out',
    'location.failed': 'Failed to detect location',
    'location.geocodingFailed': 'Failed to get location details',
    
    // App name
    'app.name': 'PERSIAN CONNECT',
    
    // Ad Titles
    'ads.luxury_villa': 'Luxury Villa',
    'ads.gaming_laptop': 'Gaming Laptop',
    'ads.brand_new_sedan': 'Brand New Sedan',
    'ads.modern_apartment': 'Modern Apartment',
    'ads.vintage_bicycle': 'Vintage Bicycle',
    'ads.leather_sofa': 'Leather Sofa',
    'ads.dining_table': 'Dining Table',
    'ads.office_desk': 'Office Desk',
    'ads.bookshelf': 'Bookshelf',

    // Time stamps
    'time.just_now': 'Just now',
    'time.hour_ago': '1 hour ago',
    'time.today': 'Today',
    'time.yesterday': 'Yesterday',
    'time.days_ago_2': '2 days ago',
    'time.days_ago_3': '3 days ago',
    'time.days_ago_4': '4 days ago',
    'time.days_ago_5': '5 days ago',

    // Labels
    'labels.urgent': 'URGENT',
    'labels.negotiable': 'NEGOTIABLE',

    // Search and filtering
    'search.searching_for': 'Searching for:',
    'search.sort': 'Sort',
    'filter.newest': 'Newest',
    'filter.oldest': 'Oldest',
    'filter.lowest_price': 'Lowest Price',
    'filter.highest_price': 'Highest Price',
    'filter.urgent': 'Urgent',
    'filter.negotiable': 'Negotiable',

    // My Ads Page
    'myAds.title': 'My Account',
    'myAds.myAdsSection': 'My Ads',
    'myAds.myAds': 'My Ads',
    'myAds.drafts': 'Drafts',
    'myAds.inactive': 'Inactive Ads',
    'myAds.sold': 'Sold',
    'myAds.expired': 'Expired',
    'myAds.rejected': 'Rejected',
    'myAds.recentVisits': 'Recent Visits',
    'myAds.downloadApp': 'Download App',
    'myAds.helpSupport': 'Help & Support',
    'myAds.userGuide': 'User Guide',
    'myAds.termsConditions': 'Terms & Conditions',
    'myAds.contactUs': 'Contact Us',
    'myAds.aboutUs': 'About Us',
    'myAds.privacySecurity': 'Privacy & Security',
    'myAds.logout': 'Logout',
    'myAds.adsCount': 'ads',
  },
  fa: {
    // Header
    'header.location': 'مکان',
    'header.login': 'ورود',
    'header.detecting': 'در حال تشخیص...',
    
    // Search
    'search.placeholder': 'جستجو در همه دسته‌بندی‌ها',
    
    // Categories
    'categories.vehicles': 'وسایل نقلیه',
    'categories.real-estate': 'املاک',
    'categories.commercial-property': 'املاک تجاری',
    'categories.jobs': 'استخدام و کار',
    'categories.services': 'خدمات',
    'categories.fashion': 'مد و پوشاک',
    'categories.digital-goods': 'لوازم الکترونیکی',
    'categories.pets': 'حیوانات خانگی',
    'categories.events': 'رویدادها',
    'categories.it-web': 'خدمات IT و وب',
    'categories.education': 'آموزش و یادگیری',
    'categories.fitness': 'مربی تناسب اندام',
    'categories.food-catering': 'غذا و تشریفات',
    'categories.travel': 'آژانس مسافرتی',
    'categories.accountancy': 'حسابداری',
    'categories.legal': 'خدمات حقوقی',
    'categories.medical': 'پزشکی و زیبایی',
    'categories.visa': 'خدمات ویزا',
    'categories.currency': 'صرافی',
    'categories.restaurant-equipment': 'تجهیزات رستوران',
    'categories.wholesale': 'سوپرمارکت و عمده فروشی',
    'categories.barber': 'آرایشگاه و سلمانی',
    'categories.tattoo': 'خدمات تتو',
    'categories.translation': 'ترجمه و تفسیر',
    'categories.courses': 'دوره‌ها و آموزش',
    'categories.driving': 'آموزش رانندگی',
    'categories.music': 'آموزش موسیقی',
    'categories.other': 'سایر',
    'categories.viewAll': 'همه دسته‌ها',
    'categories.showLess': 'کمتر نمایش بده',
    
    // Featured Ads
    'featured.title': 'آگهی‌های ویژه',
    'featured.justNow': 'همین الان',
    'featured.hourAgo': '۱ ساعت پیش',
    'featured.hoursAgo': '۲ ساعت پیش',
    
    // Navigation
    'nav.home': 'خانه',
    'nav.favorites': 'علاقه‌مندی‌ها',
    'nav.messages': 'پیام‌ها',
    'nav.myAds': 'آگهی‌های من',
    'nav.postAd': 'ثبت آگهی',
    'nav.admin': 'مدیر',
    
    // Location Picker
    'location.title': 'انتخاب موقعیت',
    'location.useCurrentLocation': 'استفاده از موقعیت فعلی',
    'location.autoDetect': 'تشخیص خودکار موقعیت شما',
    'location.detect': 'تشخیص',
    'location.detecting': 'در حال تشخیص...',
    'location.searchPlaceholder': 'جستجوی شهر...',
    'location.noCitiesFound': 'شهری با این نام یافت نشد',
    
    // Location notifications
    'location.detected': 'موقعیت تشخیص داده شد',
    'location.deniedByUser': 'دسترسی به موقعیت توسط کاربر رد شد',
    'location.unavailable': 'اطلاعات موقعیت در دسترس نیست',
    'location.timeout': 'زمان درخواست موقعیت به پایان رسید',
    'location.failed': 'تشخیص موقعیت با شکست مواجه شد',
    'location.geocodingFailed': 'دریافت جزئیات موقعیت با شکست مواجه شد',
    
    // App name
    'app.name': 'PERSIAN CONNECT',
    
    // Ad Titles  
    'ads.luxury_villa': 'ویلای لوکس',
    'ads.gaming_laptop': 'لپ‌تاپ گیمینگ',
    'ads.brand_new_sedan': 'سدان کاملاً نو',
    'ads.modern_apartment': 'آپارتمان مدرن',
    'ads.vintage_bicycle': 'دوچرخه قدیمی',
    'ads.leather_sofa': 'مبل چرمی',
    'ads.dining_table': 'میز ناهارخوری',
    'ads.office_desk': 'میز اداری',
    'ads.bookshelf': 'قفسه کتاب',

    // Time stamps
    'time.just_now': 'همین الان',
    'time.hour_ago': '۱ ساعت پیش',
    'time.today': 'امروز',
    'time.yesterday': 'دیروز',
    'time.days_ago_2': '۲ روز پیش',
    'time.days_ago_3': '۳ روز پیش',
    'time.days_ago_4': '۴ روز پیش',
    'time.days_ago_5': '۵ روز پیش',

    // Labels
    'labels.urgent': 'فوری',
    'labels.negotiable': 'قابل مذاکره',

    // Search and filtering
    'search.searching_for': 'جستجو برای:',
    'search.sort': 'مرتب‌سازی',
    'filter.newest': 'جدیدترین',
    'filter.oldest': 'قدیمی‌ترین',
    'filter.lowest_price': 'کمترین قیمت',
    'filter.highest_price': 'بیشترین قیمت',
    'filter.urgent': 'فوری',
    'filter.negotiable': 'قابل مذاکره',

    // My Ads Page
    'myAds.title': 'حساب من',
    'myAds.myAdsSection': 'آگهی‌های من',
    'myAds.myAds': 'آگهی‌های من',
    'myAds.drafts': 'پیش‌نویس‌ها',
    'myAds.inactive': 'آگهی‌های غیرفعال',
    'myAds.sold': 'فروخته شده',
    'myAds.expired': 'منقضی شده',
    'myAds.rejected': 'رد شده',
    'myAds.recentVisits': 'بازدیدهای اخیر',
    'myAds.downloadApp': 'دانلود اپلیکیشن',
    'myAds.helpSupport': 'راهنما و پشتیبانی',
    'myAds.userGuide': 'راهنمای کاربر',
    'myAds.termsConditions': 'شرایط و قوانین',
    'myAds.contactUs': 'تماس با ما',
    'myAds.aboutUs': 'درباره ما',
    'myAds.privacySecurity': 'امنیت و حریم خصوصی',
    'myAds.logout': 'خروج از حساب',
    'myAds.adsCount': 'آگهی',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Get saved language from localStorage or default to Persian
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'fa';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
    
    // Update document direction and lang attribute
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  const isRTL = language === 'fa';

  // Set initial direction
  useEffect(() => {
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language, isRTL]);

  return (
    <LanguageContext.Provider value={{ currentLanguage: language, language, setLanguage, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}