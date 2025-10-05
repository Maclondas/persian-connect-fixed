import { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowLeft, Search, FileText, Briefcase, GraduationCap, Users, Building, UserCheck, TrendingUp, MapPin, RotateCcw, MessageSquare, FileCheck, AlertCircle, Zap, Heart, MessageCircle, User, PlusSquare, Check, Home } from 'lucide-react';
import { useLanguage } from './hooks/useLanguage';
import { toast } from 'sonner';
import { realDataService } from './services/real-data-service';

interface VisaServicesPageProps {
  onNavigate: (page: string) => void;
}

interface Ad {
  id: string;
  title: string;
  price: string;
  description: string;
  location: string;
  contactInfo: string;
  category: string;
  subcategory?: string;
  images: string[];
  postedAt: string;
  isActive: boolean;
  isFeatured: boolean;
  isBoosted: boolean;
  userId: string;
  viewCount: number;
  status: 'active' | 'sold' | 'expired';
}

type FilterOption = 'newest' | 'oldest' | 'lowest-price' | 'highest-price' | 'urgent' | 'negotiable';

const filterOptions = [
  { id: 'newest' as const, name: 'Newest First', namePersian: 'جدیدترین اول' },
  { id: 'oldest' as const, name: 'Oldest First', namePersian: 'قدیمی‌ترین اول' },
  { id: 'lowest-price' as const, name: 'Lowest Price', namePersian: 'کم‌ترین قیمت' },
  { id: 'highest-price' as const, name: 'Highest Price', namePersian: 'بیش‌ترین قیمت' },
  { id: 'urgent' as const, name: 'Urgent First', namePersian: 'فوری‌ها اول' },
  { id: 'negotiable' as const, name: 'Negotiable First', namePersian: 'قابل مذاکره اول' }
];

const subcategories = [
  { icon: FileText, name: 'Tourist Visa Applications', namePersian: 'درخواست ویزای توریستی', color: 'bg-blue-500' },
  { icon: Briefcase, name: 'Work Visa Applications', namePersian: 'درخواست ویزای کار', color: 'bg-green-500' },
  { icon: GraduationCap, name: 'Student Visa Assistance', namePersian: 'کمک ویزای تحصیلی', color: 'bg-purple-500' },
  { icon: Users, name: 'Family & Dependent Visa', namePersian: 'ویزای خانوادگی', color: 'bg-pink-500' },
  { icon: Building, name: 'Business Visa', namePersian: 'ویزای تجاری', color: 'bg-orange-500' },
  { icon: UserCheck, name: 'Skilled Worker Visa', namePersian: 'ویزای کارگر ماهر', color: 'bg-teal-500' },
  { icon: TrendingUp, name: 'Investor & Entrepreneur Visa', namePersian: 'ویزای سرمایه‌گذار', color: 'bg-red-500' },
  { icon: MapPin, name: 'Permanent Residency Applications', namePersian: 'درخواست اقامت دائم', color: 'bg-indigo-500' },
  { icon: RotateCcw, name: 'Visa Extensions & Renewals', namePersian: 'تمدید ویزا', color: 'bg-yellow-500' },
  { icon: MessageSquare, name: 'Immigration Consultation', namePersian: 'مشاوره مهاجرت', color: 'bg-cyan-500' },
  { icon: FileCheck, name: 'Sponsorship & Employment Permits', namePersian: 'اسپانسرشیپ و مجوز کار', color: 'bg-lime-500' },
  { icon: AlertCircle, name: 'Appeal & Rejected Visa Support', namePersian: 'پشتیبانی ویزای رد شده', color: 'bg-rose-500' },
  { icon: Zap, name: 'Fast-Track / Priority Visa Services', namePersian: 'خدمات ویزای فوری', color: 'bg-amber-500' }
];

export function VisaServicesPage({ onNavigate }: VisaServicesPageProps) {
  const { currentLanguage } = useLanguage();
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('newest');
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAds();
  }, []);

  const loadAds = async () => {
    try {
      setLoading(true);
      console.log('🔄 VisaServices: Loading ads...');
      
      // Get ads for the "Visa Services" category
      const categoryAds = await realDataService.getAdsByCategory('Visa Services');
      console.log('📋 VisaServices: Loaded ads:', categoryAds?.length || 0);
      
      setAds(categoryAds || []);
    } catch (error) {
      console.error('❌ VisaServices: Error loading ads:', error);
      toast.error(
        currentLanguage === 'en' 
          ? 'Failed to load visa services' 
          : 'خطا در بارگذاری خدمات ویزا'
      );
      setAds([]);
    } finally {
      setLoading(false);
    }
  };

  const getSortedAds = () => {
    if (!ads || ads.length === 0) return [];
    
    return [...ads].sort((a, b) => {
      switch (selectedFilter) {
        case 'newest':
          return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
        case 'oldest':
          return new Date(a.postedAt).getTime() - new Date(b.postedAt).getTime();
        case 'lowest-price':
          const priceA = parseFloat(a.price.replace(/[^\d.]/g, '')) || 0;
          const priceB = parseFloat(b.price.replace(/[^\d.]/g, '')) || 0;
          return priceA - priceB;
        case 'highest-price':
          const priceA2 = parseFloat(a.price.replace(/[^\d.]/g, '')) || 0;
          const priceB2 = parseFloat(b.price.replace(/[^\d.]/g, '')) || 0;
          return priceB2 - priceA2;
        case 'urgent':
          return (b.isBoosted ? 1 : 0) - (a.isBoosted ? 1 : 0);
        case 'negotiable':
          const negotiableA = a.description.toLowerCase().includes('negotiable') || a.price.toLowerCase().includes('nego');
          const negotiableB = b.description.toLowerCase().includes('negotiable') || b.price.toLowerCase().includes('nego');
          return (negotiableB ? 1 : 0) - (negotiableA ? 1 : 0);
        default:
          return 0;
      }
    });
  };

  const getFilterDisplayName = () => {
    const option = filterOptions.find(opt => opt.id === selectedFilter);
    return option ? (currentLanguage === 'en' ? option.name : option.namePersian) : 'Sort';
  };

  const handleFilterSelect = (filterId: FilterOption) => {
    setSelectedFilter(filterId);
    setShowFilterOptions(false);
    const option = filterOptions.find(opt => opt.id === filterId);
    if (option) {
      toast.success(
        currentLanguage === 'en' 
          ? `Sorted by: ${option.name}` 
          : `مرتب شده بر اساس: ${option.namePersian}`
      );
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(currentLanguage === 'en' ? 'en-GB' : 'fa-IR');
    } catch {
      return dateString;
    }
  };

  const handleAdClick = (adId: string) => {
    onNavigate(`ad-detail?id=${adId}`);
  };

  return (
    <div className="min-h-screen bg-white text-black" dir={currentLanguage === 'fa' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <button 
            onClick={() => onNavigate('home')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className={`h-6 w-6 text-gray-700 ${currentLanguage === 'fa' ? 'rotate-180' : ''}`} />
          </button>
          
          <h1 className="text-lg font-semibold text-center flex-1 mx-4">
            {currentLanguage === 'en' ? 'Visa Services' : 'خدمات ویزا'}
          </h1>
          
          <div className="w-10" />
        </div>
        
        {/* Search Bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className={`absolute top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 ${currentLanguage === 'fa' ? 'right-3' : 'left-3'}`} />
            <Input
              placeholder={currentLanguage === 'en' ? 'Search visa services...' : 'جستجوی خدمات ویزا...'}
              className={`w-full bg-gray-50 border-0 ${currentLanguage === 'fa' ? 'pr-10 text-right' : 'pl-10'} h-11 rounded-full`}
            />
          </div>
        </div>
      </div>

      {/* Subcategories Grid */}
      <div className="px-4 py-6 bg-gray-50">
        <h2 className="text-lg font-semibold mb-4">
          {currentLanguage === 'en' ? 'Browse Visa Service Categories' : 'مرور دسته‌بندی خدمات ویزا'}
        </h2>
        <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
          {subcategories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <button
                key={index}
                className="flex flex-col items-center p-3 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 active:scale-95"
              >
                <div className={`p-2 rounded-full ${category.color} mb-2`}>
                  <IconComponent className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs font-medium text-center leading-tight">
                  {currentLanguage === 'en' ? category.name : category.namePersian}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Featured Section Header with Filter */}
      <div className="bg-white">
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold">
            {currentLanguage === 'en' ? 'Featured Visa Services' : 'خدمات ویزای ویژه'}
          </h2>
          
          {/* Filter Button */}
          <button
            onClick={() => setShowFilterOptions(!showFilterOptions)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <span className="text-sm font-bold leading-normal tracking-[0.015em]">
              {currentLanguage === 'en' ? 'Filter' : 'فیلتر'}
            </span>
            <span className="text-xs text-gray-600">
              ({getFilterDisplayName()})
            </span>
          </button>
        </div>

        {/* Filter Options Dropdown - Smaller Size */}
        {showFilterOptions && (
          <div className="px-4 pb-3">
            <div className="bg-[#363636] rounded-md border border-[#4d4d4d] overflow-hidden max-w-xs mx-auto">
              {filterOptions.map((option) => (
                <button
                  key={option.id}
                  className="w-full flex items-center justify-between px-3 py-2 text-left rtl:text-right hover:bg-[#4d4d4d] transition-colors border-b border-[#4d4d4d] last:border-b-0"
                  onClick={() => handleFilterSelect(option.id)}
                >
                  <span className="text-white text-xs font-normal leading-tight">
                    {currentLanguage === 'en' ? option.name : option.namePersian}
                  </span>
                  {selectedFilter === option.id && (
                    <Check className="h-3 w-3 text-[#0ac2af] flex-shrink-0 ml-2 rtl:ml-0 rtl:mr-2" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Featured Visa Services Grid */}
        <div className="px-4 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : ads.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                {currentLanguage === 'en' 
                  ? 'No visa services available at the moment.' 
                  : 'در حال حاضر خدمات ویزایی موجود نیست.'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {getSortedAds().map((ad) => (
                <div 
                  key={ad.id} 
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handleAdClick(ad.id)}
                >
                  <div className="flex">
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <ImageWithFallback
                        src={ad.images?.[0] || '/api/placeholder/96/96'}
                        alt={ad.title}
                        className="w-full h-full object-cover"
                      />
                      {ad.isBoosted && (
                        <div className="absolute top-1 left-1 bg-red-500 text-white px-1 py-0.5 rounded text-xs font-semibold">
                          {currentLanguage === 'en' ? 'URGENT' : 'فوری'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm mb-1 line-clamp-1">{ad.title}</h3>
                          <p className="text-xs text-gray-600 mb-1">{ad.location}</p>
                          <p className="text-xs text-gray-500 mb-1">{formatDate(ad.postedAt)}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{ad.subcategory || ad.category}</span>
                            {ad.viewCount > 0 && (
                              <>
                                <span>•</span>
                                <span>{ad.viewCount} views</span>
                              </>
                            )}
                          </div>
                        </div>
                        <button 
                          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle favorite toggle
                          }}
                        >
                          <Heart className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#0ac2af]">{ad.price}</span>
                          {(ad.description.toLowerCase().includes('negotiable') || ad.price.toLowerCase().includes('nego')) && (
                            <div className="bg-green-500 text-white px-2 py-0.5 rounded text-xs font-semibold">
                              {currentLanguage === 'en' ? 'NEGOTIABLE' : 'قابل مذاکره'}
                            </div>
                          )}
                        </div>
                        <button 
                          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle message
                          }}
                        >
                          <MessageCircle className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-around">
          <button 
            onClick={() => onNavigate('home')}
            className="flex flex-col items-center gap-1 p-2"
          >
            <Home className="h-5 w-5 text-gray-400" />
            <span className="text-xs text-gray-600">
              {currentLanguage === 'en' ? 'Home' : 'خانه'}
            </span>
          </button>
          <button 
            onClick={() => onNavigate('post-ad')}
            className="flex flex-col items-center gap-1 p-2"
          >
            <PlusSquare className="h-5 w-5 text-[#dc2626]" />
            <span className="text-xs text-[#dc2626] font-medium">
              {currentLanguage === 'en' ? 'Post Ad' : 'ثبت آگهی'}
            </span>
          </button>
          <button 
            onClick={() => onNavigate('messages')}
            className="flex flex-col items-center gap-1 p-2"
          >
            <MessageCircle className="h-5 w-5 text-gray-400" />
            <span className="text-xs text-gray-600">
              {currentLanguage === 'en' ? 'Messages' : 'پیام‌ها'}
            </span>
          </button>
          <button 
            onClick={() => onNavigate('my-ads')}
            className="flex flex-col items-center gap-1 p-2"
          >
            <User className="h-5 w-5 text-gray-400" />
            <span className="text-xs text-gray-600">
              {currentLanguage === 'en' ? 'My Ads' : 'آگهی‌های من'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}