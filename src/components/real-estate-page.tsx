import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { FeaturedAdsSection } from './featured-ads-section';
import { AdCard } from './ad-card';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowLeft, Search, Building, Building2, Home, Crown, BedDouble, MapPin, Heart, MessageCircle, User, PlusSquare, Check } from 'lucide-react';
import { useLanguage } from './hooks/useLanguage';
import { realDataService as dataService, Ad } from './services/real-data-service';
import { toast } from 'sonner@2.0.3';

interface NavigateFunction {
  (page: 'home' | 'login' | 'ad-detail' | 'post-ad' | 'messages' | 'chat' | 'admin' | 'my-ads' | 'real-estate', params?: { adId?: string; chatId?: string }): void;
}

interface RealEstatePageProps {
  onNavigate: NavigateFunction;
}

interface RealEstateSubcategory {
  icon: React.ComponentType<any>;
  name: string;
  namePersian: string;
  color: string;
}

type FilterOption = 'newest' | 'oldest' | 'lowest-price' | 'highest-price' | 'urgent' | 'negotiable';

const subcategories = [
  { icon: Building, name: 'Apartments for Rent', namePersian: 'آپارتمان برای اجاره', color: 'bg-blue-500' },
  { icon: Home, name: 'Houses for Rent', namePersian: 'خانه برای اجاره', color: 'bg-green-500' },
  { icon: Crown, name: 'Villas for Rent', namePersian: 'ویلا برای اجاره', color: 'bg-orange-500' },
  { icon: Building2, name: 'Studios for Rent', namePersian: 'استودیو برای اجاره', color: 'bg-purple-500' },
  { icon: BedDouble, name: 'Rooms for Rent', namePersian: 'اتاق برای اجاره', color: 'bg-red-500' },
  { icon: Building, name: 'Apartments for Sale', namePersian: 'آپارتمان برای فروش', color: 'bg-indigo-500' },
  { icon: Home, name: 'Houses for Sale', namePersian: 'خانه برای فروش', color: 'bg-yellow-500' },
  { icon: Crown, name: 'Villas for Sale', namePersian: 'ویلا برای فروش', color: 'bg-teal-500' },
  { icon: MapPin, name: 'Land & Plots', namePersian: 'زمین و قطعه', color: 'bg-gray-500' }
];

const filterOptions = [
  { id: 'newest' as FilterOption, name: 'Newest', namePersian: 'جدیدترین' },
  { id: 'oldest' as FilterOption, name: 'Oldest', namePersian: 'قدیمی‌ترین' },
  { id: 'lowest-price' as FilterOption, name: 'Lowest Price', namePersian: 'کمترین قیمت' },
  { id: 'highest-price' as FilterOption, name: 'Highest Price', namePersian: 'بیشترین قیمت' },
  { id: 'urgent' as FilterOption, name: 'Urgent', namePersian: 'فوری' },
  { id: 'negotiable' as FilterOption, name: 'Negotiable', namePersian: 'قابل مذاکره' }
];

export function RealEstatePage({ onNavigate }: RealEstatePageProps) {
  const { currentLanguage } = useLanguage();
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('newest');
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [realEstateAds, setRealEstateAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRealEstateAds();
  }, []);

  const loadRealEstateAds = async () => {
    try {
      setIsLoading(true);
      
      // Get ads filtered for real estate category
      const response = await dataService.getAds({
        category: 'real-estate'
      });
      const realEstateAds = response.ads.filter(ad => 
        ad.status === 'approved' &&
        new Date(ad.expiresAt || ad.created_at) > new Date()
      );
      
      setRealEstateAds(realEstateAds);
    } catch (error) {
      console.error('Failed to load real estate ads:', error);
      toast.error('Failed to load property listings');
    } finally {
      setIsLoading(false);
    }
  };

  const getSortedProperties = () => {
    const properties = [...realEstateAds];
    
    switch (selectedFilter) {
      case 'newest':
        return properties.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'oldest':
        return properties.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'lowest-price':
        return properties.sort((a, b) => a.price - b.price);
      case 'highest-price':
        return properties.sort((a, b) => b.price - a.price);
      case 'urgent':
        return properties.sort((a, b) => (b.urgent ? 1 : 0) - (a.urgent ? 1 : 0));
      case 'negotiable':
        return properties.sort((a, b) => (b.priceType === 'negotiable' ? 1 : 0) - (a.priceType === 'negotiable' ? 1 : 0));
      default:
        return properties;
    }
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
            {currentLanguage === 'en' ? 'Real Estate' : 'املاک'}
          </h1>
          
          <div className="w-10" />
        </div>
        
        {/* Search Bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className={`absolute top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 ${currentLanguage === 'fa' ? 'right-3' : 'left-3'}`} />
            <Input
              placeholder={currentLanguage === 'en' ? 'Search properties...' : 'جستجوی املاک...'}
              className={`w-full bg-gray-50 border-0 ${currentLanguage === 'fa' ? 'pr-10 text-right' : 'pl-10'} h-11 rounded-full`}
            />
          </div>
        </div>
      </div>

      {/* Subcategories Grid */}
      <div className="px-4 py-6 bg-gray-50">
        <h2 className="text-lg font-semibold mb-4">
          {currentLanguage === 'en' ? 'Browse Property Categories' : 'مرور دسته‌بندی املاک'}
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

      {/* Listings Section Header with Filter */}
      <div className="bg-white">
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold">
            {currentLanguage === 'en' ? 'Property Listings' : 'فهرست املاک'}
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

        {/* Filter Options Dropdown */}
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

        {/* Featured Ads Section */}
        <FeaturedAdsSection 
          category="real-estate" 
          onNavigate={onNavigate}
          variant="list"
          maxAds={5}
        />

        {/* Property Listings */}
        <div className="px-4 py-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-gray-500">
                {currentLanguage === 'en' ? 'Loading property listings...' : 'در حال بارگذاری فهرست املاک...'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {getSortedProperties().map((property) => (
                <AdCard
                  key={property.id}
                  ad={property}
                  onNavigate={onNavigate}
                  variant="list"
                  showViewCount={true}
                />
              ))}
              {realEstateAds.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {currentLanguage === 'en' ? 'No property listings found' : 'فهرست املاکی یافت نشد'}
                </div>
              )}
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
            <Home className="h-6 w-6 text-gray-400" />
            <span className="text-xs text-gray-600">
              {currentLanguage === 'en' ? 'Home' : 'خانه'}
            </span>
          </button>
          
          <button className="flex flex-col items-center gap-1 p-2">
            <Heart className="h-6 w-6 text-gray-400" />
            <span className="text-xs text-gray-600">
              {currentLanguage === 'en' ? 'Saved' : 'ذخیره شده'}
            </span>
          </button>
          
          <button 
            onClick={() => onNavigate('post-ad')}
            className="flex flex-col items-center gap-1 p-2"
          >
            <PlusSquare className="h-6 w-6 text-[#dc2626]" />
            <span className="text-xs text-[#dc2626] font-medium">
              {currentLanguage === 'en' ? 'Post Ad' : 'آگهی'}
            </span>
          </button>
          
          <button 
            onClick={() => onNavigate('messages')}
            className="flex flex-col items-center gap-1 p-2"
          >
            <MessageCircle className="h-6 w-6 text-gray-400" />
            <span className="text-xs text-gray-600">
              {currentLanguage === 'en' ? 'Messages' : 'پیام‌ها'}
            </span>
          </button>
          
          <button 
            onClick={() => onNavigate('my-ads')}
            className="flex flex-col items-center gap-1 p-2"
          >
            <User className="h-6 w-6 text-gray-400" />
            <span className="text-xs text-gray-600">
              {currentLanguage === 'en' ? 'Account' : 'حساب'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}