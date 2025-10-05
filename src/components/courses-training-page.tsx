import { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowLeft, Search, Monitor, Sparkles, Scissors, Palette, Wrench, Zap, Flame, Home as HomeIcon, Wind, Car, Hammer, Code, TrendingUp, Building, Clipboard, Shield, ChefHat, Camera, Music, Languages, Heart, MessageCircle, User, PlusSquare, Check, Home, Paintbrush } from 'lucide-react';
import { useLanguage } from './hooks/useLanguage';
import { toast } from 'sonner';
import { realDataService, Ad } from './services/real-data-service';

interface CoursesTrainingPageProps {
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
  { icon: Monitor, name: 'Online Courses', namePersian: 'دوره‌های آنلاین', color: 'bg-blue-500' },
  { icon: Sparkles, name: 'Nail & Beauty Courses', namePersian: 'دوره‌های ناخن و زیبایی', color: 'bg-pink-500' },
  { icon: Scissors, name: 'Barber Courses', namePersian: 'دوره‌های آرایشگری مردانه', color: 'bg-gray-500' },
  { icon: Scissors, name: 'Hairdresser Courses', namePersian: 'دوره‌های آرایشگری زنانه', color: 'bg-purple-500' },
  { icon: Palette, name: 'Makeup Artistry Courses', namePersian: 'دوره‌های آرایش هنری', color: 'bg-red-500' },
  { icon: Wrench, name: 'Plumbing Courses', namePersian: 'دوره‌های لوله‌کشی', color: 'bg-blue-600' },
  { icon: Zap, name: 'Electrical Courses', namePersian: 'دوره‌های برق', color: 'bg-yellow-500' },
  { icon: Flame, name: 'Gas Engineering Courses', namePersian: 'دوره‌های مهندسی گاز', color: 'bg-orange-500' },
  { icon: HomeIcon, name: 'Flooring Installation Courses', namePersian: 'دوره‌های نصب کف‌پوش', color: 'bg-amber-600' },
  { icon: Wind, name: 'HVAC Courses', namePersian: 'دوره‌های تهویه مطبوع', color: 'bg-cyan-500' },
  { icon: Car, name: 'Automotive Mechanic Courses', namePersian: 'دوره‌های مکانیک خودرو', color: 'bg-gray-600' },
  { icon: Hammer, name: 'Welding Courses', namePersian: 'دوره‌های جوشکاری', color: 'bg-red-600' },
  { icon: Code, name: 'Software Development & Coding Bootcamps', namePersian: 'دوره‌های برنامه‌نویسی', color: 'bg-green-500' },
  { icon: TrendingUp, name: 'Digital Marketing & SEO Courses', namePersian: 'دوره‌های بازاریابی دیجیتال', color: 'bg-indigo-500' },
  { icon: Building, name: 'Business & Entrepreneurship Courses', namePersian: 'دوره‌های کسب‌وکار', color: 'bg-teal-500' },
  { icon: Clipboard, name: 'Project Management Courses', namePersian: 'دوره‌های مدیریت پروژه', color: 'bg-slate-500' },
  { icon: Shield, name: 'Health & Safety / First Aid Courses', namePersian: 'دوره‌های ایمنی و کمک‌های اولیه', color: 'bg-emerald-500' },
  { icon: ChefHat, name: 'Cooking & Culinary Arts', namePersian: 'دوره‌های آشپزی و هنرهای آشپزی', color: 'bg-orange-600' },
  { icon: Camera, name: 'Photography & Videography Courses', namePersian: 'دوره‌های عکاسی و فیلمبرداری', color: 'bg-violet-500' },
  { icon: Music, name: 'Music Lessons', namePersian: 'آموزش موسیقی', color: 'bg-rose-500' },
  { icon: Paintbrush, name: 'Crafts & DIY Workshops', namePersian: 'کارگاه‌های صنایع دستی', color: 'bg-amber-500' },
  { icon: Languages, name: 'Language Courses', namePersian: 'دوره‌های زبان', color: 'bg-lime-500' }
];

export function CoursesTrainingPage({ onNavigate }: CoursesTrainingPageProps) {
  const { currentLanguage } = useLanguage();
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('newest');
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const [courseAds, setCourseAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCourseAds = async () => {
      try {
        setIsLoading(true);
        const ads = await realDataService.getAdsByCategory('courses-training');
        setCourseAds(ads);
      } catch (error) {
        console.error('Failed to load course ads:', error);
        toast.error('Failed to load course ads');
      } finally {
        setIsLoading(false);
      }
    };

    loadCourseAds();
  }, []);

  const getSortedCourses = () => {
    const courses = [...courseAds];
    
    switch (selectedFilter) {
      case 'newest':
        return courses.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'oldest':
        return courses.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'lowest-price':
        return courses.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'highest-price':
        return courses.sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'urgent':
        return courses.sort((a, b) => (b.isUrgent ? 1 : 0) - (a.isUrgent ? 1 : 0));
      case 'negotiable':
        return courses.sort((a, b) => (b.negotiable ? 1 : 0) - (a.negotiable ? 1 : 0));
      default:
        return courses;
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
            {currentLanguage === 'en' ? 'Courses & Training' : 'دوره‌ها و آموزش'}
          </h1>
          
          <div className="w-10" />
        </div>
        
        {/* Search Bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className={`absolute top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 ${currentLanguage === 'fa' ? 'right-3' : 'left-3'}`} />
            <Input
              placeholder={currentLanguage === 'en' ? 'Search courses & training...' : 'جستجوی دوره‌ها و آموزش...'}
              className={`w-full bg-gray-50 border-0 ${currentLanguage === 'fa' ? 'pr-10 text-right' : 'pl-10'} h-11 rounded-full`}
            />
          </div>
        </div>
      </div>

      {/* Subcategories Grid */}
      <div className="px-4 py-6 bg-gray-50">
        <h2 className="text-lg font-semibold mb-4">
          {currentLanguage === 'en' ? 'Browse Training Categories' : 'مرور دسته‌بندی‌های آموزشی'}
        </h2>
        <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
          {subcategories.map((category, index) => {
            const IconComponent = category.icon;
            return (
              <button
                key={index}
                onClick={() => {
                  toast.info(
                    currentLanguage === 'en' 
                      ? `Browsing: ${category.name}` 
                      : `مرور: ${category.namePersian}`
                  );
                }}
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
            {currentLanguage === 'en' ? 'Featured Courses & Training' : 'دوره‌ها و آموزش‌های ویژه'}
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

        {/* Featured Courses Grid */}
        <div className="px-4 py-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : getSortedCourses().length === 0 ? (
            <div className="text-center py-12">
              <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">
                {currentLanguage === 'en' 
                  ? 'No courses found' 
                  : 'هیچ دوره‌ای یافت نشد'
                }
              </p>
              <p className="text-sm text-gray-400">
                {currentLanguage === 'en' 
                  ? 'Be the first to post courses & training!' 
                  : 'اولین نفری باشید که دوره آموزشی ارسال می‌کنید!'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {getSortedCourses().map((course) => (
                <div 
                  key={course.id} 
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => onNavigate('ad-detail', { adId: course.id })}
                >
                  <div className="flex">
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <ImageWithFallback
                        src={course.imageUrl || '/placeholder-ad.jpg'}
                        alt={currentLanguage === 'en' ? course.title : course.titlePersian}
                        className="w-full h-full object-cover"
                      />
                      {course.isUrgent && (
                        <div className="absolute top-1 left-1 bg-red-500 text-white px-1 py-0.5 rounded text-xs font-semibold">
                          {currentLanguage === 'en' ? 'URGENT' : 'فوری'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm mb-1 line-clamp-1">
                            {currentLanguage === 'en' ? course.title : course.titlePersian}
                          </h3>
                          <p className="text-xs text-gray-600 mb-1">{course.contact?.name || 'N/A'}</p>
                          <p className="text-xs text-gray-500 mb-1">
                            {course.location?.city ? `${course.location.city}, ${course.location.country}` : 'Location not specified'}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{course.category}</span>
                            {course.createdAt && (
                              <>
                                <span>•</span>
                                <span>{new Date(course.createdAt).toLocaleDateString()}</span>
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
                            {course.price ? `£${course.price}` : 'Contact for price'}
                          </span>
                          {course.negotiable && (
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