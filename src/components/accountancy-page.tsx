import { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowLeft, Search, Calculator, FileText, TrendingUp, Receipt, Shield, Eye, Building2, PieChart, Users, BookOpen, Landmark, TrendingDown, Heart, MessageCircle, User, PlusSquare, Check, Home } from 'lucide-react';
import { useLanguage } from './hooks/useLanguage';
import { toast } from 'sonner@2.0.3';
import { realDataService, Ad } from './services/real-data-service';

interface AccountancyPageProps {
  onNavigate: (page: string, params?: { adId?: string }) => void;
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
  { icon: Calculator, name: 'Chartered Accountants', namePersian: 'حسابداران دیپلمه', color: 'bg-blue-500' },
  { icon: FileText, name: 'Certified Public Accountants (CPA)', namePersian: 'حسابداران عمومی معتمد', color: 'bg-green-500' },
  { icon: TrendingUp, name: 'Management Accountants', namePersian: 'حسابداران مدیریت', color: 'bg-purple-500' },
  { icon: Receipt, name: 'Tax Accountants', namePersian: 'حسابداران مالیاتی', color: 'bg-red-500' },
  { icon: Shield, name: 'Forensic Accountants', namePersian: 'حسابداران جنایی', color: 'bg-orange-500' },
  { icon: Eye, name: 'Auditors', namePersian: 'حسابرسان', color: 'bg-teal-500' },
  { icon: Building2, name: 'Financial Accountants', namePersian: 'حسابداران مالی', color: 'bg-indigo-500' },
  { icon: PieChart, name: 'Cost Accountants', namePersian: 'حسابداران هزینه', color: 'bg-pink-500' },
  { icon: Users, name: 'Payroll Accountants', namePersian: 'حسابداران حقوق', color: 'bg-cyan-500' },
  { icon: BookOpen, name: 'Bookkeepers', namePersian: 'دفتردار', color: 'bg-amber-500' },
  { icon: Landmark, name: 'Government Accountants', namePersian: 'حسابداران دولتی', color: 'bg-slate-500' },
  { icon: TrendingDown, name: 'Investment & Wealth Accountants', namePersian: 'حسابداران سرمایه‌گذاری', color: 'bg-emerald-500' }
];

export function AccountancyPage({ onNavigate }: AccountancyPageProps) {
  const { currentLanguage } = useLanguage();
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('newest');
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [accountancyAds, setAccountancyAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAccountancyAds = async () => {
      try {
        setIsLoading(true);
        const ads = await realDataService.getAdsByCategory('accountancy');
        setAccountancyAds(ads);
      } catch (error) {
        console.error('Failed to load accountancy ads:', error);
        toast.error('Failed to load accountancy ads');
      } finally {
        setIsLoading(false);
      }
    };

    loadAccountancyAds();
  }, []);

  const getSortedAccountancyServices = () => {
    return [...accountancyAds].sort((a, b) => {
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

  return (
    <div className="min-h-screen bg-white text-black" dir={currentLanguage === 'fa' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3">
          <button 
            onClick={() => onNavigate('home')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className={`h-5 w-5 text-gray-600 ${currentLanguage === 'fa' ? 'rotate-180' : ''}`} />
          </button>
          
          <h1 className="text-lg font-semibold">
            {currentLanguage === 'en' ? 'Accountancy' : 'حسابداری'}
          </h1>
          
          <div className="w-10" />
        </div>
        
        {/* Search Bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className={`absolute top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 ${currentLanguage === 'fa' ? 'right-3' : 'left-3'}`} />
            <Input
              type="search"
              placeholder={currentLanguage === 'en' ? 'Search accountancy services...' : 'جستجو خدمات حسابداری...'}
              className={`w-full bg-gray-100 border-none rounded-lg h-10 ${currentLanguage === 'fa' ? 'pr-10 text-right' : 'pl-10'}`}
            />
          </div>
        </div>
      </div>

      {/* Subcategories */}
      <div className="bg-white border-b border-gray-100">
        <div className="px-4 py-4">
          <div className="grid grid-cols-3 gap-3">
            {subcategories.slice(0, 6).map((subcategory) => {
              const IconComponent = subcategory.icon;
              return (
                <button 
                  key={subcategory.name}
                  className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className={`p-2 rounded-full ${subcategory.color} mb-2`}>
                    <IconComponent className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs text-center font-medium text-gray-800">
                    {currentLanguage === 'en' ? subcategory.name : subcategory.namePersian}
                  </span>
                </button>
              );
            })}
          </div>
          
          {subcategories.length > 6 && (
            <div className="grid grid-cols-3 gap-3 mt-3">
              {subcategories.slice(6).map((subcategory) => {
                const IconComponent = subcategory.icon;
                return (
                  <button 
                    key={subcategory.name}
                    className="flex flex-col items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className={`p-2 rounded-full ${subcategory.color} mb-2`}>
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xs text-center font-medium text-gray-800">
                      {currentLanguage === 'en' ? subcategory.name : subcategory.namePersian}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Featured Section Header with Filter */}
      <div className="bg-white">
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold">
            {currentLanguage === 'en' ? 'Featured Accountancy Services' : 'خدمات حسابداری ویژه'}
          </h2>
          
          <div className="relative">
            <button
              onClick={() => setShowFilterOptions(!showFilterOptions)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <span>{getFilterDisplayName()}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {showFilterOptions && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                {filterOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setSelectedFilter(option.id);
                      setShowFilterOptions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between"
                  >
                    <span>{currentLanguage === 'en' ? option.name : option.namePersian}</span>
                    {selectedFilter === option.id && <Check className="h-4 w-4 text-[#0ac2af]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Featured Accountancy Services Grid */}
        <div className="px-4 py-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : getSortedAccountancyServices().length === 0 ? (
            <div className="text-center py-12">
              <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">
                {currentLanguage === 'en' 
                  ? 'No accountancy services found' 
                  : 'هیچ سرویس حسابداری یافت نشد'
                }
              </p>
              <p className="text-sm text-gray-400">
                {currentLanguage === 'en' 
                  ? 'Be the first to post an accountancy service!' 
                  : 'اولین نفری باشید که سرویس حسابداری ارسال می‌کنید!'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {getSortedAccountancyServices().map((service) => (
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
              {currentLanguage === 'en' ? 'My Ads' : 'آگهی‌هایم'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}