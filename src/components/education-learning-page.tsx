import { useState } from 'react';
import { Input } from './ui/input';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowLeft, Search, GraduationCap, BookOpen, Users, Monitor, PenTool, Heart, MessageCircle, User, PlusSquare, Check, Home } from 'lucide-react';
import { useLanguage } from './hooks/useLanguage';
import { toast } from 'sonner';

interface EducationLearningPageProps {
  onNavigate: (page: string) => void;
}

interface FeaturedEducationService {
  id: string;
  title: string;
  price: string;
  priceValue: number;
  provider: string;
  location: string;
  rating: number;
  category: string;
  deliveryTime: string;
  image: string;
  datePosted: Date;
  isUrgent: boolean;
  isNegotiable: boolean;
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

const featuredEducationServices: FeaturedEducationService[] = [
  {
    id: '1',
    title: 'Professional IELTS Preparation Course',
    price: '£45/hour',
    priceValue: 45,
    provider: 'Cambridge English Academy',
    location: 'London, UK',
    rating: 4.9,
    category: 'Tutoring',
    deliveryTime: 'Flexible schedule',
    datePosted: new Date('2024-01-15'),
    isUrgent: false,
    isNegotiable: true,
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHVkeWluZyUyMGVuZ2xpc2h8ZW58MXx8fHwxNzU4MzIzMTQzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  {
    id: '2',
    title: 'Native Persian Language Classes',
    price: '£35/hour',
    priceValue: 35,
    provider: 'Persian Heritage School',
    location: 'Manchester, UK',
    rating: 4.8,
    category: 'Persian Language Classes',
    deliveryTime: 'Weekly sessions',
    datePosted: new Date('2024-01-12'),
    isUrgent: true,
    isNegotiable: false,
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJzaWFuJTIwY2FsbGlncmFwaHl8ZW58MXx8fHwxNzU4MzIzMTQzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  {
    id: '3',
    title: 'University Entrance Preparation Course',
    price: '£180/month',
    priceValue: 180,
    provider: 'Elite Education Center',
    location: 'Birmingham, UK',
    rating: 4.7,
    category: 'University/College Prep',
    deliveryTime: '3-6 months',
    datePosted: new Date('2024-01-10'),
    isUrgent: false,
    isNegotiable: true,
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwc3R1ZGVudHN8ZW58MXx8fHwxNzU4MzIzMTQzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  {
    id: '4',
    title: 'Complete Web Development Bootcamp',
    price: '£299',
    priceValue: 299,
    provider: 'TechSkills Online',
    location: 'Online',
    rating: 4.6,
    category: 'Online Courses',
    deliveryTime: '12 weeks self-paced',
    datePosted: new Date('2024-01-08'),
    isUrgent: true,
    isNegotiable: false,
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvbmxpbmUlMjBjb3Vyc2V8ZW58MXx8fHwxNzU4MzIzMTQzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  {
    id: '5',
    title: 'Digital Marketing Workshop Series',
    price: '£120',
    priceValue: 120,
    provider: 'Business Growth Academy',
    location: 'Leeds, UK',
    rating: 4.5,
    category: 'Workshops & Training',
    deliveryTime: '2-day intensive',
    datePosted: new Date('2024-01-05'),
    isUrgent: false,
    isNegotiable: true,
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3Jrc2hvcCUyMHRyYWluaW5nfGVufDF8fHx8MTc1ODMyMzE0M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  },
  {
    id: '6',
    title: 'Mathematics A-Level Tutoring',
    price: '£40/hour',
    priceValue: 40,
    provider: 'Apex Tutoring',
    location: 'Oxford, UK',
    rating: 4.9,
    category: 'Tutoring',
    deliveryTime: 'Flexible schedule',
    datePosted: new Date('2024-01-03'),
    isUrgent: false,
    isNegotiable: false,
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXRoZW1hdGljcyUyMHR1dG9yaW5nfGVufDF8fHx8MTc1ODMyMzE0M3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  }
];

const subcategories = [
  { icon: GraduationCap, name: 'Tutoring', namePersian: 'تدریس خصوصی', color: 'bg-blue-500' },
  { icon: PenTool, name: 'Persian Language Classes', namePersian: 'کلاس‌های زبان فارسی', color: 'bg-green-500' },
  { icon: BookOpen, name: 'University/College Prep', namePersian: 'آمادگی دانشگاه', color: 'bg-purple-500' },
  { icon: Monitor, name: 'Online Courses', namePersian: 'دوره‌های آنلاین', color: 'bg-orange-500' },
  { icon: Users, name: 'Workshops & Training', namePersian: 'کارگاه‌ها و آموزش', color: 'bg-red-500' }
];

export function EducationLearningPage({ onNavigate }: EducationLearningPageProps) {
  const { currentLanguage } = useLanguage();
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('newest');
  const [showFilterOptions, setShowFilterOptions] = useState(false);

  const getSortedEducationServices = () => {
    return [...featuredEducationServices].sort((a, b) => {
      switch (selectedFilter) {
        case 'newest':
          return b.datePosted.getTime() - a.datePosted.getTime();
        case 'oldest':
          return a.datePosted.getTime() - b.datePosted.getTime();
        case 'lowest-price':
          return a.priceValue - b.priceValue;
        case 'highest-price':
          return b.priceValue - a.priceValue;
        case 'urgent':
          return (b.isUrgent ? 1 : 0) - (a.isUrgent ? 1 : 0);
        case 'negotiable':
          return (b.isNegotiable ? 1 : 0) - (a.isNegotiable ? 1 : 0);
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
            {currentLanguage === 'en' ? 'Education & Learning' : 'آموزش و یادگیری'}
          </h1>
          
          <div className="w-10" />
        </div>
        
        {/* Search Bar */}
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className={`absolute top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 ${currentLanguage === 'fa' ? 'right-3' : 'left-3'}`} />
            <Input
              placeholder={currentLanguage === 'en' ? 'Search education services...' : 'جستجوی خدمات آموزشی...'}
              className={`w-full bg-gray-50 border-0 ${currentLanguage === 'fa' ? 'pr-10 text-right' : 'pl-10'} h-11 rounded-full`}
            />
          </div>
        </div>
      </div>

      {/* Subcategories Grid */}
      <div className="px-4 py-6 bg-gray-50">
        <h2 className="text-lg font-semibold mb-4">
          {currentLanguage === 'en' ? 'Browse Education Categories' : 'مرور دسته‌بندی خدمات آموزشی'}
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
            {currentLanguage === 'en' ? 'Featured Education Services' : 'خدمات آموزشی ویژه'}
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

        {/* Featured Education Services Grid */}
        <div className="px-4 py-4">
          <div className="grid grid-cols-1 gap-3">
            {getSortedEducationServices().map((service) => (
              <div key={service.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="flex">
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <ImageWithFallback
                      src={service.image}
                      alt={service.title}
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
                        <h3 className="font-semibold text-sm mb-1 line-clamp-1">{service.title}</h3>
                        <p className="text-xs text-gray-600 mb-1">{service.provider}</p>
                        <p className="text-xs text-gray-500 mb-1">{service.location}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{service.category}</span>
                          <span>•</span>
                          <span>⭐ {service.rating}</span>
                          <span>•</span>
                          <span>{service.deliveryTime}</span>
                        </div>
                      </div>
                      <button className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                        <Heart className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#0ac2af]">{service.price}</span>
                        {service.isNegotiable && (
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