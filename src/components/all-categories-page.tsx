import { Car, Building, Wrench, Monitor, Briefcase, Shirt, Heart as HeartPet, Code, GraduationCap, Music, DollarSign, ShoppingCart, Dumbbell, ChefHat, Plane, Calculator, Scale, Stethoscope, CreditCard, UtensilsCrossed, Scissors, Palette, Languages, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { useLanguage } from './hooks/useLanguage';

interface NavigateFunction {
  (page: 'home' | 'login' | 'ad-detail' | 'post-ad' | 'messages' | 'chat' | 'admin' | 'my-ads' | 'vehicles' | 'digital-goods' | 'real-estate' | 'commercial-property' | 'jobs' | 'services' | 'fashion' | 'pets' | 'it-web-services' | 'courses-training' | 'driving-lessons' | 'music-lessons' | 'currency-exchange' | 'supermarket-wholesalers' | 'fitness-coach' | 'food-catering' | 'travel-agency' | 'accountancy' | 'legal' | 'medical' | 'visa' | 'restaurant-equipment' | 'barber-hairdresser' | 'tattoo-services' | 'interpreter-translation' | 'support-info' | 'terms-conditions' | 'security-safety' | 'user-guide' | 'about-us' | 'privacy', params?: { adId?: string; chatId?: string }): void;
}

interface AllCategoriesPageProps {
  onNavigate: NavigateFunction;
}

interface Category {
  id: string;
  name: string;
  namePersian: string;
  icon: React.ComponentType<any>;
  description: string;
  descriptionPersian: string;
}

const allCategories: Category[] = [
  { 
    id: 'vehicles', 
    name: 'Vehicles', 
    namePersian: 'خودرو', 
    icon: Car,
    description: 'Cars, motorcycles, boats and more',
    descriptionPersian: 'خودرو، موتورسیکلت، قایق و بیشتر'
  },
  { 
    id: 'real-estate', 
    name: 'Real Estate', 
    namePersian: 'املاک', 
    icon: Building,
    description: 'Houses, apartments, land for rent or sale',
    descriptionPersian: 'خانه، آپارتمان، زمین برای اجاره یا فروش'
  },
  { 
    id: 'jobs', 
    name: 'Jobs', 
    namePersian: 'شغل', 
    icon: Briefcase,
    description: 'Job opportunities and career listings',
    descriptionPersian: 'فرصت‌های شغلی و فهرست مشاغل'
  },
  { 
    id: 'services', 
    name: 'Services', 
    namePersian: 'خدمات', 
    icon: Wrench,
    description: 'Professional services and repairs',
    descriptionPersian: 'خدمات حرفه‌ای و تعمیرات'
  },
  { 
    id: 'digital-goods', 
    name: 'Digital Goods', 
    namePersian: 'کالای دیجیتال', 
    icon: Monitor,
    description: 'Electronics, computers, phones',
    descriptionPersian: 'الکترونیک، کامپیوتر، تلفن'
  },
  { 
    id: 'fashion', 
    name: 'Fashion', 
    namePersian: 'پوشاک', 
    icon: Shirt,
    description: 'Clothing, shoes, accessories',
    descriptionPersian: 'لباس، کفش، لوازم جانبی'
  },
  { 
    id: 'pets', 
    name: 'Pets & Animals', 
    namePersian: 'حیوانات خانگی', 
    icon: HeartPet,
    description: 'Pets, pet supplies, animal services',
    descriptionPersian: 'حیوانات خانگی، لوازم حیوانات، خدمات حیوانی'
  },
  { 
    id: 'it-web-services', 
    name: 'IT & Web Services', 
    namePersian: 'خدمات IT و وب', 
    icon: Code,
    description: 'Web development, programming, tech support',
    descriptionPersian: 'توسعه وب، برنامه نویسی، پشتیبانی فنی'
  },
  { 
    id: 'courses-training', 
    name: 'Courses & Training', 
    namePersian: 'دوره‌ها و آموزش', 
    icon: GraduationCap,
    description: 'Educational courses and training programs',
    descriptionPersian: 'دوره‌های آموزشی و برنامه‌های تربیتی'
  },
  { 
    id: 'driving-lessons', 
    name: 'Driving Lessons', 
    namePersian: 'آموزش رانندگی', 
    icon: Car,
    description: 'Learn to drive with professional instructors',
    descriptionPersian: 'یادگیری رانندگی با مربیان حرفه‌ای'
  },
  { 
    id: 'music-lessons', 
    name: 'Music Lessons', 
    namePersian: 'آموزش موسیقی', 
    icon: Music,
    description: 'Music teachers and instrument lessons',
    descriptionPersian: 'معلمان موسیقی و آموزش ساز'
  },
  { 
    id: 'currency-exchange', 
    name: 'Currency Exchange', 
    namePersian: 'صرافی', 
    icon: DollarSign,
    description: 'Money exchange and financial services',
    descriptionPersian: 'تبدیل ارز و خدمات مالی'
  },
  { 
    id: 'supermarket-wholesalers', 
    name: 'Supermarket & Wholesalers', 
    namePersian: 'سوپرمارکت و عمده فروشی', 
    icon: ShoppingCart,
    description: 'Groceries, wholesale goods, bulk buying',
    descriptionPersian: 'مواد غذایی، کالاهای عمده، خرید انبوه'
  },
  { 
    id: 'fitness-coach', 
    name: 'Fitness Coach', 
    namePersian: 'مربی ورزش', 
    icon: Dumbbell,
    description: 'Personal trainers and fitness services',
    descriptionPersian: 'مربیان شخصی و خدمات تناسب اندام'
  },
  { 
    id: 'food-catering', 
    name: 'Food & Catering', 
    namePersian: 'غذا و پذیرایی', 
    icon: ChefHat,
    description: 'Catering services and food delivery',
    descriptionPersian: 'خدمات پذیرایی و تحویل غذا'
  },
  { 
    id: 'travel-agency', 
    name: 'Travel Agency', 
    namePersian: 'آژانس مسافرتی', 
    icon: Plane,
    description: 'Travel planning and booking services',
    descriptionPersian: 'برنامه ریزی سفر و خدمات رزرو'
  },
  { 
    id: 'accountancy', 
    name: 'Accountancy', 
    namePersian: 'حسابداری', 
    icon: Calculator,
    description: 'Accounting and bookkeeping services',
    descriptionPersian: 'خدمات حسابداری و دفترداری'
  },
  { 
    id: 'legal', 
    name: 'Solicitor & Legal Services', 
    namePersian: 'خدمات حقوقی', 
    icon: Scale,
    description: 'Legal advice and representation',
    descriptionPersian: 'مشاوره حقوقی و نمایندگی'
  },
  { 
    id: 'medical', 
    name: 'Doctors & Beauty Clinics', 
    namePersian: 'پزشکان و کلینیک‌های زیبایی', 
    icon: Stethoscope,
    description: 'Medical services and beauty treatments',
    descriptionPersian: 'خدمات پزشکی و درمان‌های زیبایی'
  },
  { 
    id: 'visa', 
    name: 'Visa Services', 
    namePersian: 'خدمات ویزا', 
    icon: CreditCard,
    description: 'Immigration and visa consultation',
    descriptionPersian: 'مشاوره مهاجرت و ویزا'
  },
  { 
    id: 'restaurant-equipment', 
    name: 'Takeaway & Restaurant Equipment', 
    namePersian: 'تجهیزات رستوران و بیرون‌بر', 
    icon: UtensilsCrossed,
    description: 'Restaurant supplies and equipment',
    descriptionPersian: 'لوازم و تجهیزات رستوران'
  },
  { 
    id: 'barber-hairdresser', 
    name: 'Barber & Hairdresser', 
    namePersian: 'آرایشگاه', 
    icon: Scissors,
    description: 'Hair styling and grooming services',
    descriptionPersian: 'خدمات آرایش مو و پیرایش'
  },
  { 
    id: 'tattoo-services', 
    name: 'Tattoo Services', 
    namePersian: 'خدمات تاتو', 
    icon: Palette,
    description: 'Tattoo artists and body art',
    descriptionPersian: 'هنرمندان تاتو و هنر بدن'
  },
  { 
    id: 'interpreter-translation', 
    name: 'Interpreter & Translation Services', 
    namePersian: 'خدمات ترجمه', 
    icon: Languages,
    description: 'Translation and interpretation services',
    descriptionPersian: 'خدمات ترجمه و تفسیر'
  }
];

export function AllCategoriesPage({ onNavigate }: AllCategoriesPageProps) {
  const { currentLanguage, t } = useLanguage();

  const handleCategoryClick = (categoryId: string) => {
    onNavigate(categoryId as any);
  };

  return (
    <div className={`min-h-screen bg-background ${currentLanguage === 'fa' ? 'rtl' : 'ltr'}`} dir={currentLanguage === 'fa' ? 'rtl' : 'ltr'}>
      <div className="flex-grow overflow-y-auto pb-20">
        {/* Header */}
        <header className="sticky top-0 bg-white shadow-sm z-50 border-b border-gray-100">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              {/* Back Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onNavigate('home')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{currentLanguage === 'en' ? 'Back' : 'بازگشت'}</span>
              </Button>
            </div>
            
            <div className="text-center">
              <h1 className="text-lg font-semibold text-gray-900">
                {currentLanguage === 'en' ? 'All Categories' : 'همه دسته‌بندی‌ها'}
              </h1>
            </div>
            
            <div className="w-20"></div> {/* Spacer for centering */}
          </div>
        </header>

        {/* Categories Grid */}
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className="flex items-start gap-4 p-4 bg-white rounded-lg border border-gray-200 hover:border-primary hover:bg-primary hover:bg-opacity-5 transition-colors text-left"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <category.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 mb-1">
                    {currentLanguage === 'en' ? category.name : category.namePersian}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {currentLanguage === 'en' ? category.description : category.descriptionPersian}
                  </p>
                </div>
              </button>
            ))}
          </div>
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
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            <span className="text-xs mt-1">
              {currentLanguage === 'en' ? 'Home' : 'خانه'}
            </span>
          </button>

          {/* Favorites */}
          <button
            onClick={() => onNavigate('home')}
            className="flex flex-col items-center p-2 text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span className="text-xs mt-1">
              {currentLanguage === 'en' ? 'Favorites' : 'علاقه‌مندی‌ها'}
            </span>
          </button>

          {/* Post Ad */}
          <button
            onClick={() => onNavigate('post-ad')}
            className="flex flex-col items-center p-2"
          >
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-xs mt-1 text-primary">
              {currentLanguage === 'en' ? 'Post Ad' : 'ثبت آگهی'}
            </span>
          </button>

          {/* Messages */}
          <button
            onClick={() => onNavigate('messages')}
            className="flex flex-col items-center p-2 text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="text-xs mt-1">
              {currentLanguage === 'en' ? 'Messages' : 'پیام‌ها'}
            </span>
          </button>

          {/* My Ads */}
          <button
            onClick={() => onNavigate('my-ads')}
            className="flex flex-col items-center p-2 text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-xs mt-1">
              {currentLanguage === 'en' ? 'My Ads' : 'آگهی‌های من'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}