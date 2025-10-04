import { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowLeft, Search, Plane, MapPin, Car, Truck, Package, Heart, MessageCircle, User, PlusSquare, Check, Home } from 'lucide-react';
import { useLanguage } from './hooks/useLanguage';
import { toast } from 'sonner@2.0.3';
import { realDataService, Ad } from './services/real-data-service';

interface TravelAgencyPageProps {
  onNavigate: (page: string) => void;
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
  { icon: Plane, name: 'Travel Agencies', namePersian: 'آژانس‌های مسافرتی', color: 'bg-blue-500' },
  { icon: MapPin, name: 'Tour Guides', namePersian: 'راهنمای تور', color: 'bg-green-500' },
  { icon: Car, name: 'Airport Pickup & Drop-off', namePersian: 'انتقال فرودگاهی', color: 'bg-purple-500' },
  { icon: Truck, name: 'Moving & Relocation Services', namePersian: 'خدمات اسباب‌کشی', color: 'bg-orange-500' },
  { icon: Package, name: 'Shipping & Cargo', namePersian: 'حمل و نقل بار', color: 'bg-red-500' }
];

export function TravelAgencyPage({ onNavigate }: TravelAgencyPageProps) {
  const { currentLanguage } = useLanguage();
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('newest');
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [travelAds, setTravelAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTravelAds = async () => {
      try {
        setIsLoading(true);
        const ads = await realDataService.getAdsByCategory('travel-agency');
        setTravelAds(ads);
      } catch (error) {
        console.error('Failed to load travel agency ads:', error);
        toast.error('Failed to load travel agency ads');
      } finally {
        setIsLoading(false);
      }
    };

    loadTravelAds();
  }, []);

  const getSortedTravelServices = () => {
    return [...travelAds].sort((a, b) => {
      switch (selectedFilter) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'lowest-price':
          return (a.price || 0) - (b.price || 0);
        case 'highest-price':
          return (b.price || 0) - (a.price || 0);
        case 'urgent':
          return (b.isUrgent ? 1 : 0) - (a.isUrgent ? 1 : 0);
        case 'negotiable':
          return (b.negotiable ? 1 : 0) - (a.negotiable ? 1 : 0);
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
            {currentLanguage === 'en' ? 'Travel Agency' : 'آژانس مسافرتی'}
          </h1>
          
          <div className="w-10" />
        </div>
        
        {/* Search Bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className={`absolute top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 ${currentLanguage === 'fa' ? 'right-3' : 'left-3'}`} />
            <Input
              placeholder={currentLanguage === 'en' ? 'Search travel services...' : 'جستجوی خدمات مسافرتی...'}
              className={`w-full bg-gray-50 border-0 ${currentLanguage === 'fa' ? 'pr-10 text-right' : 'pl-10'} h-11 rounded-full`}
            />
          </div>
        </div>
      </div>

      {/* Subcategories Grid */}
      <div className="px-4 py-6 bg-gray-50">
        <h2 className="text-lg font-semibold mb-4">
          {currentLanguage === 'en' ? 'Browse Travel Categories' : 'مرور دسته‌بندی خدمات مسافرتی'}
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
            {currentLanguage === 'en' ? 'Featured Travel Services' : 'خدمات مسافرتی ویژه'}
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

        {/* Featured Travel Services Grid */}
        <div className="px-4 py-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : getSortedTravelServices().length === 0 ? (
            <div className="text-center py-12">
              <Plane className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">
                {currentLanguage === 'en' 
                  ? 'No travel agency services found' 
                  : 'هیچ سرویس آژانس مسافرتی یافت نشد'
                }
              </p>
              <p className="text-sm text-gray-400">
                {currentLanguage === 'en' 
                  ? 'Be the first to post a travel agency service!' 
                  : 'اولین نفری باشید که سرویس آژانس مسافرتی ارسال می‌کنید!'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {getSortedTravelServices().map((service) => (
                <div 
                  key={service.id} 
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onNavigate('ad-detail', { adId: service.id })}
                >
                  <div className="flex">
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <ImageWithFallback
                        src={service.imageUrl || '/placeholder-ad.jpg'}
                        alt={currentLanguage === 'en' ? service.title : service.titlePersian}
                        className="w-full h-full object-cover"
                      />
                      {service.isUrgent && (
                        <div className="absolute top-1 left-1 bg-red-500 text-white px-1 py-0.5 rounded text-xs font-semibold">
                          {currentLanguage === 'en' ? 'URGENT' : 'فوری'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm mb-1 line-clamp-1">
                            {currentLanguage === 'en' ? service.title : service.titlePersian}
                          </h3>
                          <p className="text-xs text-gray-600 mb-1">{service.contact?.name || 'N/A'}</p>
                          <p className="text-xs text-gray-500 mb-1">
                            {service.location?.city ? `${service.location.city}, ${service.location.country}` : 'Location not specified'}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{service.category}</span>
                            {service.createdAt && (
                              <>
                                <span>•</span>
                                <span>{new Date(service.createdAt).toLocaleDateString()}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                          <Heart className="h-4 w-4 text-gray-600" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#0ac2af]">
                            {service.price ? `£${service.price}` : 'Contact for price'}
                          </span>
                          {service.negotiable && (
                            <div className="bg-green-500 text-white px-2 py-0.5 rounded text-xs font-semibold">
                              {currentLanguage === 'en' ? 'NEGOTIABLE' : 'قابل مذاکره'}
                            </div>
                          )}
                        </div>
                        <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
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