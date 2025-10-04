import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowLeft, ArrowRight, Upload, X, Search, ChevronDown, MapPin, Navigation, Loader2, Save } from 'lucide-react';
import { 
  Car, Building, Building2, Briefcase, Wrench, Shirt, Smartphone, Heart, 
  Code, GraduationCap, Dumbbell, ChefHat, Plane, Calculator, Scale, 
  Stethoscope, CreditCard as CreditCardIcon, DollarSign, UtensilsCrossed, 
  ShoppingCart, Scissors, Palette, Languages, BookOpen, Music, MoreHorizontal 
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { realDataService as dataService, type Ad } from './services/real-data-service';
import { useLanguage } from './hooks/useLanguage';
import { useAuth } from './hooks/useAuth';

interface NavigateFunction {
  (page: 'home' | 'ad-detail' | 'post-ad' | 'edit-ad' | 'messages' | 'chat' | 'admin' | 'my-ads' | 'vehicles' | 'digital-goods' | 'real-estate' | 'commercial-property' | 'jobs' | 'services' | 'fashion' | 'pets' | 'it-web-services' | 'courses-training' | 'driving-lessons' | 'fitness-coach' | 'food-catering' | 'travel-agency' | 'accountancy' | 'legal' | 'medical' | 'visa' | 'restaurant-equipment' | 'barber-hairdresser' | 'tattoo-services' | 'interpreter-translation', params?: { adId?: string; chatId?: string }): void;
}

interface EditAdPageProps {
  onNavigate: NavigateFunction;
  adId: string | null;
}

interface AdData {
  category: string;
  subcategory: string;
  title: string;
  description: string;
  urgent: boolean;
  price: string;
  currency: string;
  negotiable: boolean;
  unit: string;
  condition: string;
  country: string;
  city: string;
  images: string[];
  video: File | null;
}

// All categories from your marketplace
const categories = [
  { id: 'vehicles', name: 'Vehicles', icon: Car },
  { id: 'real-estate', name: 'Real Estate', icon: Building },
  { id: 'commercial-property', name: 'Commercial Property', icon: Building2 },
  { id: 'jobs', name: 'Recruitments & Jobs', icon: Briefcase },
  { id: 'services', name: 'Services', icon: Wrench },
  { id: 'fashion', name: 'Fashion', icon: Shirt },
  { id: 'digital-goods', name: 'Digital Goods (Electronics)', icon: Smartphone },
  { id: 'pets', name: 'Pets & Animals', icon: Heart },
  { id: 'it-web-services', name: 'IT & Web Services', icon: Code },
  { id: 'courses-training', name: 'Courses & Training', icon: BookOpen },
  { id: 'driving-lessons', name: 'Driving Lessons', icon: Car },
  { id: 'music-lessons', name: 'Music Lessons', icon: Music },
  { id: 'fitness-coach', name: 'Fitness Coach', icon: Dumbbell },
  { id: 'food-catering', name: 'Food & Catering', icon: ChefHat },
  { id: 'travel-agency', name: 'Travel Agency', icon: Plane },
  { id: 'accountancy', name: 'Accountancy', icon: Calculator },
  { id: 'legal', name: 'Solicitor & Legal Services', icon: Scale },
  { id: 'medical', name: 'Doctors & Beauty Clinics', icon: Stethoscope },
  { id: 'visa', name: 'Visa Services', icon: CreditCardIcon },
  { id: 'currency-exchange', name: 'Currency Exchange', icon: DollarSign },
  { id: 'restaurant-equipment', name: 'Takeaway & Restaurant Equipment', icon: UtensilsCrossed },
  { id: 'supermarket-wholesalers', name: 'Supermarkets & Wholesalers', icon: ShoppingCart },
  { id: 'barber-hairdresser', name: 'Barber Shop & Hairdresser', icon: Scissors },
  { id: 'tattoo-services', name: 'Tattoo Services', icon: Palette },
  { id: 'interpreter-translation', name: 'Interpreter & Translation Services', icon: Languages },
  { id: 'other', name: 'Other', icon: MoreHorizontal }
];

// Comprehensive subcategories for all categories
const subcategories = {
  'vehicles': [
    'Cars for Sale', 'Car Rentals', 'Motorcycles & Bicycles', 'Boats & Marine',
    'RVs & Campers', 'Commercial Vehicles', 'Auto Parts & Accessories', 
    'Auto Services & Repair', 'Parking Spaces', 'Other Vehicles'
  ],
  'real-estate': [
    'Apartments for Rent', 'Houses for Rent', 'Villas for Rent', 'Studios for Rent',
    'Rooms for Rent', 'Apartments for Sale', 'Houses for Sale', 'Villas for Sale',
    'Land & Plots', 'Property Management', 'Other Real Estate'
  ],
  'commercial-property': [
    'Office Spaces', 'Retail Shops', 'Warehouses', 'Restaurants & Cafes',
    'Hotels & Hospitality', 'Industrial Properties', 'Land & Commercial Plots',
    'Coworking Spaces', 'Other Commercial'
  ],
  'jobs': [
    'Full-time Positions', 'Part-time Jobs', 'Freelance & Contract', 'Internships',
    'Remote Work', 'Sales & Marketing', 'IT & Technology', 'Healthcare',
    'Education & Training', 'Customer Service', 'Management', 'Other Jobs'
  ],
  'services': [
    'Home Services', 'Cleaning Services', 'Maintenance & Repair', 'Moving & Storage',
    'Security Services', 'Event Services', 'Professional Services', 'Personal Services',
    'Garden & Landscaping', 'Other Services'
  ],
  'fashion': [
    'Men\'s Clothing', 'Women\'s Clothing', 'Children\'s Clothing', 'Shoes & Footwear',
    'Bags & Accessories', 'Jewelry & Watches', 'Traditional Wear', 'Designer Items',
    'Vintage Fashion', 'Other Fashion'
  ],
  'digital-goods': [
    'Mobile Phones', 'Laptops & Computers', 'Tablets', 'Gaming Consoles & Games',
    'Audio & Headphones', 'Cameras & Photography', 'Smart Home Devices',
    'Accessories & Cables', 'Software & Apps', 'Other Electronics'
  ],
  'pets': [
    'Dogs', 'Cats', 'Birds', 'Fish & Aquariums', 'Small Animals',
    'Pet Food & Supplies', 'Pet Services', 'Pet Accessories', 'Veterinary Services',
    'Other Pets'
  ],
  'it-web-services': [
    'Web Development', 'Mobile App Development', 'Software Development',
    'Database Management', 'IT Support', 'Cloud Services', 'Cybersecurity',
    'Digital Marketing', 'SEO Services', 'Other IT Services'
  ],
  'courses-training': [
    'Language Courses', 'Professional Training', 'Academic Tutoring',
    'Skills Development', 'Certification Programs', 'Online Courses',
    'Workshops', 'Seminars', 'Other Training'
  ],
  'driving-lessons': [
    'Car Driving Lessons', 'Motorcycle Lessons', 'Truck Driving',
    'Defensive Driving', 'Refresher Courses', 'Test Preparation',
    'Intensive Courses', 'Other Driving Services'
  ],
  'music-lessons': [
    'Piano Lessons', 'Guitar Lessons', 'Vocal Training',
    'Instrument Lessons', 'Music Theory', 'Recording',
    'Performance Coaching', 'Other Music Services'
  ],
  'fitness-coach': [
    'Personal Training', 'Group Fitness', 'Nutrition Coaching',
    'Weight Loss Programs', 'Strength Training', 'Cardio Training',
    'Yoga & Pilates', 'Sports Coaching', 'Other Fitness'
  ],
  'food-catering': [
    'Event Catering', 'Restaurant Services', 'Home Cooking',
    'Meal Preparation', 'Special Diets', 'Bakery Services',
    'Food Delivery', 'Cooking Classes', 'Other Food Services'
  ],
  'travel-agency': [
    'Flight Booking', 'Hotel Reservations', 'Tour Packages',
    'Visa Assistance', 'Travel Insurance', 'Car Rentals',
    'Cruise Bookings', 'Adventure Tours', 'Other Travel Services'
  ],
  'accountancy': [
    'Tax Preparation', 'Bookkeeping', 'Financial Planning',
    'Business Consulting', 'Payroll Services', 'Audit Services',
    'VAT Returns', 'Company Formation', 'Other Accounting'
  ],
  'legal': [
    'Immigration Law', 'Family Law', 'Business Law',
    'Property Law', 'Criminal Law', 'Employment Law',
    'Personal Injury', 'Contract Law', 'Other Legal Services'
  ],
  'medical': [
    'General Practice', 'Dental Services', 'Beauty Treatments',
    'Cosmetic Surgery', 'Mental Health', 'Physiotherapy',
    'Alternative Medicine', 'Health Checkups', 'Other Medical'
  ],
  'visa': [
    'Student Visa', 'Work Visa', 'Tourist Visa', 'Business Visa',
    'Family Visa', 'Transit Visa', 'Visa Consultation', 'Document Preparation',
    'Other Visa Services'
  ],
  'currency-exchange': [
    'USD Exchange', 'EUR Exchange', 'GBP Exchange', 'SAR Exchange',
    'AED Exchange', 'TRY Exchange', 'Money Transfer', 'Other Currencies'
  ],
  'restaurant-equipment': [
    'Kitchen Equipment', 'Dining Furniture', 'Refrigeration', 'Cooking Appliances',
    'POS Systems', 'Cleaning Equipment', 'Food Display', 'Other Equipment'
  ],
  'supermarket-wholesalers': [
    'Groceries & Food', 'Beverages', 'Household Items', 'Personal Care',
    'Bulk Supplies', 'Frozen Foods', 'Import/Export', 'Other Wholesale'
  ],
  'barber-hairdresser': [
    'Men\'s Haircuts', 'Women\'s Haircuts', 'Hair Coloring', 'Hair Treatments',
    'Beard Grooming', 'Bridal Services', 'Hair Extensions', 'Other Hair Services'
  ],
  'tattoo-services': [
    'Custom Tattoos', 'Cover-up Tattoos', 'Piercing Services', 'Tattoo Removal',
    'Henna Art', 'Tattoo Design', 'Aftercare Products', 'Other Tattoo Services'
  ],
  'interpreter-translation': [
    'Document Translation', 'Live Interpretation', 'Legal Translation',
    'Medical Translation', 'Website Localization', 'Certified Translation',
    'Voice Over Services', 'Other Translation'
  ],
  'other': [
    'Miscellaneous Items', 'Collectibles', 'Art & Crafts', 'Books & Media',
    'Sports Equipment', 'Tools & Equipment', 'Industrial Items', 'Other Services'
  ]
};

// Location data - same as post-ad-page
const COUNTRIES = [
  { id: 'all', name: 'All Countries', namePersian: 'همه کشورها' },
  { id: 'uk', name: 'United Kingdom', namePersian: 'بریتانیا' },
  { id: 'usa', name: 'United States', namePersian: 'ایالات متحده' },
  { id: 'sweden', name: 'Sweden', namePersian: 'سوئد' },
  { id: 'spain', name: 'Spain', namePersian: 'اسپانیا' },
  { id: 'italy', name: 'Italy', namePersian: 'ایتالیا' },
  { id: 'germany', name: 'Germany', namePersian: 'آلمان' },
  { id: 'netherlands', name: 'Netherlands', namePersian: 'هلند' },
  { id: 'france', name: 'France', namePersian: 'فرانسه' },
  { id: 'romania', name: 'Romania', namePersian: 'رومانی' },
  { id: 'portugal', name: 'Portugal', namePersian: 'پرتغال' },
  { id: 'uae', name: 'United Arab Emirates', namePersian: 'امارات متحده عربی' },
  { id: 'canada', name: 'Canada', namePersian: 'کانادا' },
  { id: 'qatar', name: 'Qatar', namePersian: 'قطر' },
  { id: 'kuwait', name: 'Kuwait', namePersian: 'کویت' },
  { id: 'turkey', name: 'Turkey', namePersian: 'ترکیه' },
  { id: 'thailand', name: 'Thailand', namePersian: 'تایلند' },
  { id: 'greece', name: 'Greece', namePersian: 'یونان' },
  { id: 'norway', name: 'Norway', namePersian: 'نروژ' },
  { id: 'finland', name: 'Finland', namePersian: 'فنلاند' },
  { id: 'australia', name: 'Australia', namePersian: 'استرالیا' },
  { id: 'mexico', name: 'Mexico', namePersian: 'مکزیک' }
];

const CITIES: { [key: string]: { id: string; name: string; namePersian: string }[] } = {
  all: [
    { id: 'all', name: 'All Cities', namePersian: 'همه شهرها' }
  ],
  uk: [
    { id: 'all', name: 'All Cities', namePersian: 'همه شهرها' },
    { id: 'london', name: 'London', namePersian: 'لندن' },
    { id: 'manchester', name: 'Manchester', namePersian: 'منچستر' },
    { id: 'birmingham', name: 'Birmingham', namePersian: 'بیرمنگهام' },
    { id: 'glasgow', name: 'Glasgow', namePersian: 'گلازگو' },
    { id: 'liverpool', name: 'Liverpool', namePersian: 'لیورپول' },
    { id: 'edinburgh', name: 'Edinburgh', namePersian: 'ادینبورگ' },
    { id: 'leeds', name: 'Leeds', namePersian: 'لیدز' },
    { id: 'bristol', name: 'Bristol', namePersian: 'بریستول' }
  ],
  usa: [
    { id: 'all', name: 'All Cities', namePersian: 'همه شهرها' },
    { id: 'new-york', name: 'New York', namePersian: 'نیویورک' },
    { id: 'los-angeles', name: 'Los Angeles', namePersian: 'لس آنجلس' },
    { id: 'chicago', name: 'Chicago', namePersian: 'شیکاگو' },
    { id: 'houston', name: 'Houston', namePersian: 'هیوستون' },
    { id: 'miami', name: 'Miami', namePersian: 'میامی' },
    { id: 'san-francisco', name: 'San Francisco', namePersian: 'سان فرانسیسکو' }
  ],
  sweden: [
    { id: 'all', name: 'All Cities', namePersian: 'همه شهرها' },
    { id: 'stockholm', name: 'Stockholm', namePersian: 'استکهلم' },
    { id: 'gothenburg', name: 'Gothenburg', namePersian: 'گوتنبرگ' },
    { id: 'malmo', name: 'Malmö', namePersian: 'مالمو' }
  ],
  // Add more cities for other countries as needed
};

export function EditAdPage({ onNavigate, adId }: EditAdPageProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [originalAd, setOriginalAd] = useState<Ad | null>(null);
  const { currentLanguage, t, dir } = useLanguage();
  const { user: currentUser, loading: authLoading, isAuthenticated } = useAuth();
  
  const [adData, setAdData] = useState<AdData>({
    category: '',
    subcategory: '',
    title: '',
    description: '',
    urgent: false,
    price: '',
    currency: 'USD',
    negotiable: false,
    unit: 'fixed',
    condition: '',
    country: '',
    city: '',
    images: [],
    video: null
  });

  const totalSteps = 5; // No payment step for editing
  const progress = (currentStep / totalSteps) * 100;

  // Load existing ad data
  const loadAdData = async () => {
    if (!adId) {
      toast.error('No ad ID provided');
      onNavigate('my-ads');
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔍 Loading ad data for editing:', adId);
      
      // Wait for current user to be properly loaded
      if (!currentUser?.id) {
        console.log('⏳ Current user not loaded yet, waiting...');
        toast.error('Please wait for authentication to complete');
        return;
      }
      
      const ad = await dataService.getAd(adId);
      
      if (!ad) {
        toast.error('Ad not found');
        onNavigate('my-ads');
        return;
      }

      // Check if user owns this ad or is admin
      const userData = await dataService.getCurrentUser();
      const isAdmin = userData?.role === 'admin';
      const isOwner = ad.userId === currentUser.id;
      
      console.log('🔐 Authorization check:', {
        adUserId: ad.userId,
        currentUserId: currentUser.id,
        isAdmin,
        isOwner
      });
      
      if (!isAdmin && !isOwner) {
        toast.error('You can only edit your own ads');
        onNavigate('my-ads');
        return;
      }

      setOriginalAd(ad);
      
      // Convert ad data to form format
      setAdData({
        category: ad.category,
        subcategory: ad.subcategory,
        title: ad.title,
        description: ad.description,
        urgent: false, // Reset urgent flag
        price: ad.price.toString(),
        currency: ad.currency,
        negotiable: ad.priceType === 'negotiable',
        unit: 'fixed', // Default to fixed for editing
        condition: '', // Reset condition
        country: ad.location.country,
        city: ad.location.city,
        images: ad.images || [],
        video: null
      });

      console.log('✅ Ad data loaded for editing:', ad.title);
      
    } catch (error) {
      console.error('❌ Failed to load ad data:', error);
      toast.error('Failed to load ad data');
      onNavigate('my-ads');
    } finally {
      setIsLoading(false);
    }
  };

  // Load existing ad data
  useEffect(() => {
    console.log('🔄 EditAdPage useEffect:', {
      authLoading,
      isAuthenticated,
      currentUserId: currentUser?.id,
      adId
    });
    
    if (!authLoading && isAuthenticated && currentUser?.id && adId) {
      console.log('✅ All conditions met, loading ad data...');
      loadAdData();
    } else if (!authLoading && !isAuthenticated) {
      console.log('❌ User not authenticated');
      toast.error('Please login to edit ads');
      onNavigate('login');
    } else if (!authLoading && !adId) {
      console.log('❌ No ad ID provided');
      toast.error('No ad ID provided');
      onNavigate('my-ads');
    } else {
      console.log('⏳ Waiting for auth/user data to load...');
    }
  }, [authLoading, isAuthenticated, currentUser, adId]);

  const handleNext = () => {
    // Validation for each step
    if (currentStep === 1 && !adData.category) {
      toast.error('Please select a category');
      return;
    }
    if (currentStep === 2 && !adData.subcategory) {
      toast.error('Please select a subcategory');
      return;
    }
    if (currentStep === 3) {
      if (!adData.title.trim()) {
        toast.error('Please enter a title');
        return;
      }
      if (!adData.description.trim()) {
        toast.error('Please enter a description');
        return;
      }
      if (!adData.price.trim()) {
        toast.error('Please enter a price');
        return;
      }
    }
    if (currentStep === 4) {
      if (!adData.country.trim()) {
        toast.error('Please select a country');
        return;
      }
      if (!adData.city.trim()) {
        toast.error('Please select a city');
        return;
      }
    }
    if (currentStep === 5) {
      handleSubmit();
      return;
    }
    
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onNavigate('my-ads');
    }
  };

  const handleSubmit = async () => {
    if (isSaving) return;
    
    if (!originalAd) {
      toast.error('Original ad data not found');
      return;
    }

    try {
      setIsSaving(true);
      console.log('💾 Saving ad changes...');

      const updatedAdData = {
        ...originalAd,
        category: adData.category,
        subcategory: adData.subcategory,
        title: adData.title,
        description: adData.description,
        price: parseFloat(adData.price),
        currency: adData.currency,
        priceType: adData.negotiable ? 'negotiable' : 'fixed',
        location: {
          country: adData.country,
          city: adData.city
        },
        images: adData.images,
        updatedAt: new Date()
      };

      await dataService.updateAd(originalAd.id, updatedAdData);
      
      toast.success('Ad updated successfully!');
      console.log('✅ Ad updated successfully');
      
      // Navigate back to my ads
      onNavigate('my-ads');
      
    } catch (error: any) {
      console.error('❌ Failed to update ad:', error);
      toast.error(error.message || 'Failed to update ad');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (files: FileList) => {
    const maxImages = 10;
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (adData.images.length + files.length > maxImages) {
      toast.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    const validFiles = Array.from(files).filter(file => {
      if (file.size > maxSize) {
        toast.error(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      if (!file.type.startsWith('image/')) {
        toast.error(`File ${file.name} is not an image.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setIsUploadingImages(true);
    try {
      console.log('📤 Uploading images...', validFiles.map(f => f.name));
      const uploadedUrls: string[] = [];
      const failedFiles: string[] = [];
      
      // Upload files one by one with retry logic
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        console.log(`📁 Uploading file ${i + 1}/${validFiles.length}: ${file.name} (${file.size} bytes)`);
        
        let uploadSuccess = false;
        let attempts = 0;
        const maxAttempts = 2;
        
        while (!uploadSuccess && attempts < maxAttempts) {
          attempts++;
          try {
            console.log(`🔄 Upload attempt ${attempts}/${maxAttempts} for: ${file.name}`);
            const url = await dataService.uploadFile(file, 'ad-image');
            
            if (url && url.length > 0) {
              uploadedUrls.push(url);
              console.log(`✅ Image uploaded successfully: ${file.name} -> ${url.substring(0, 50)}...`);
              uploadSuccess = true;
            } else {
              throw new Error('Upload returned empty URL');
            }
          } catch (error: any) {
            console.error(`❌ Upload attempt ${attempts} failed for ${file.name}:`, error);
            
            if (attempts === maxAttempts) {
              failedFiles.push(file.name);
              toast.error(`Failed to upload ${file.name}: ${error.message || 'Unknown error'}`);
            } else {
              // Wait before retry
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        }
      }

      // Update state with successfully uploaded images
      if (uploadedUrls.length > 0) {
        console.log(`🎉 Successfully uploaded ${uploadedUrls.length} images`);
        setAdData(prev => ({
          ...prev,
          images: [...prev.images, ...uploadedUrls]
        }));
        toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
      }

      // Report any failures
      if (failedFiles.length > 0) {
        console.warn(`⚠️ Failed to upload ${failedFiles.length} files:`, failedFiles);
        toast.error(`Failed to upload: ${failedFiles.join(', ')}`);
      }
      
    } catch (error: any) {
      console.error('❌ Image upload process error:', error);
      toast.error(`Upload failed: ${error.message || 'Unknown error'}`);
    } finally {
      setIsUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setAdData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Show loading state while loading auth or ad data
  if (authLoading || isLoading || (!currentUser?.id && isAuthenticated)) {
    const loadingMessage = authLoading 
      ? 'Loading authentication...' 
      : isLoading 
      ? 'Loading ad data...' 
      : 'Loading user data...';
      
    return (
      <div className="flex flex-col h-screen bg-background" dir={dir}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">{loadingMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Select Category</h2>
        <p className="text-gray-600 mb-6">Choose the category that best describes your item or service.</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => {
          const IconComponent = category.icon;
          const isSelected = adData.category === category.id;
          
          return (
            <button
              key={category.id}
              onClick={() => {
                setAdData(prev => ({ 
                  ...prev, 
                  category: category.id,
                  subcategory: '' // Reset subcategory when category changes
                }));
              }}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left group hover:border-primary hover:shadow-md ${
                isSelected 
                  ? 'border-primary bg-primary/10 shadow-md' 
                  : 'border-gray-200 bg-white hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg transition-colors ${
                  isSelected 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-gray-600 group-hover:bg-primary group-hover:text-white'
                }`}>
                  <IconComponent className="h-6 w-6" />
                </div>
                <div>
                  <h3 className={`font-medium transition-colors ${
                    isSelected ? 'text-primary' : 'text-gray-900'
                  }`}>
                    {category.name}
                  </h3>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderStep2 = () => {
    const availableSubcategories = adData.category ? subcategories[adData.category as keyof typeof subcategories] || [] : [];
    
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Select Subcategory</h2>
          <p className="text-gray-600 mb-6">Choose a specific subcategory for your {categories.find(c => c.id === adData.category)?.name}.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {availableSubcategories.map((subcategory) => {
            const isSelected = adData.subcategory === subcategory;
            
            return (
              <button
                key={subcategory}
                onClick={() => setAdData(prev => ({ ...prev, subcategory }))}
                className={`p-4 rounded-lg border-2 transition-all duration-200 text-left hover:border-primary hover:shadow-md ${
                  isSelected 
                    ? 'border-primary bg-primary/10 shadow-md' 
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                }`}
              >
                <h3 className={`font-medium transition-colors ${
                  isSelected ? 'text-primary' : 'text-gray-900'
                }`}>
                  {subcategory}
                </h3>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Ad Details</h2>
        <p className="text-gray-600 mb-6">Provide detailed information about your item or service.</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Title *</label>
          <Input
            type="text"
            value={adData.title}
            onChange={(e) => setAdData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter a descriptive title"
            maxLength={100}
            className="bg-input-background"
          />
          <p className="text-xs text-gray-500 mt-1">{adData.title.length}/100 characters</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description *</label>
          <Textarea
            value={adData.description}
            onChange={(e) => setAdData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Provide detailed information about your item or service..."
            rows={5}
            maxLength={1000}
            className="bg-input-background"
          />
          <p className="text-xs text-gray-500 mt-1">{adData.description.length}/1000 characters</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Price *</label>
            <Input
              type="number"
              value={adData.price}
              onChange={(e) => setAdData(prev => ({ ...prev, price: e.target.value }))}
              placeholder="0.00"
              min="0"
              step="0.01"
              className="bg-input-background"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Currency</label>
            <Select value={adData.currency} onValueChange={(value) => setAdData(prev => ({ ...prev, currency: value }))}>
              <SelectTrigger className="bg-input-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD ($)</SelectItem>
                <SelectItem value="EUR">EUR (€)</SelectItem>
                <SelectItem value="GBP">GBP (£)</SelectItem>
                <SelectItem value="SAR">SAR (ر.س)</SelectItem>
                <SelectItem value="AED">AED (د.إ)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2 pt-6">
            <Checkbox
              id="negotiable"
              checked={adData.negotiable}
              onCheckedChange={(checked) => setAdData(prev => ({ ...prev, negotiable: checked as boolean }))}
            />
            <label htmlFor="negotiable" className="text-sm font-medium cursor-pointer">
              Price negotiable
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Unit</label>
          <Select value={adData.unit} onValueChange={(value) => setAdData(prev => ({ ...prev, unit: value }))}>
            <SelectTrigger className="bg-input-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed">Fixed Price</SelectItem>
              <SelectItem value="hour">Per Hour</SelectItem>
              <SelectItem value="night">Per Night</SelectItem>
              <SelectItem value="week">Per Week</SelectItem>
              <SelectItem value="month">Per Month</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Condition (Optional)</label>
          <Select value={adData.condition} onValueChange={(value) => setAdData(prev => ({ ...prev, condition: value }))}>
            <SelectTrigger className="bg-input-background">
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="like-new">Like New</SelectItem>
              <SelectItem value="used">Used</SelectItem>
              <SelectItem value="opened">Opened</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="needs-repair">Needs Repair</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => {
    const selectedCountryData = COUNTRIES.find(c => 
      (currentLanguage === 'en' ? c.name : c.namePersian) === adData.country
    );
    const selectedCityData = selectedCountryData ? CITIES[selectedCountryData.id]?.find(c => 
      (currentLanguage === 'en' ? c.name : c.namePersian) === adData.city
    ) : null;
    const availableCities = selectedCountryData ? CITIES[selectedCountryData.id] || [] : [];

    // Filter countries based on search query
    const filteredCountries = COUNTRIES.filter(country => {
      const searchTerm = countrySearchQuery.toLowerCase();
      return country.name.toLowerCase().includes(searchTerm) || 
             country.namePersian.includes(searchTerm);
    });

    // Filter cities based on search query
    const filteredCities = availableCities.filter(city => {
      const searchTerm = citySearchQuery.toLowerCase();
      return city.name.toLowerCase().includes(searchTerm) || 
             city.namePersian.includes(searchTerm);
    });

    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Select Location</h2>
          <p className="text-gray-600 mb-6">Choose the location where your item or service is available.</p>
        </div>
        
        <div className="space-y-4">
          {/* Country Selector */}
          <div className="relative">
            <label className="block text-sm font-medium mb-2">Country *</label>
            <button
              onClick={() => {
                const newState = !showCountryDropdown;
                setShowCountryDropdown(newState);
                if (!newState) setCountrySearchQuery('');
              }}
              className="w-full bg-input-background text-foreground px-4 py-4 rounded-lg text-left flex items-center justify-between h-14 border border-border"
            >
              <span className={selectedCountryData ? 'text-foreground' : 'text-muted-foreground'}>
                {adData.country || (currentLanguage === 'en' ? 'Select Country' : 'انتخاب کشور')}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>

            {showCountryDropdown && (
              <div className="absolute top-20 left-0 right-0 bg-card border border-border rounded-lg shadow-lg z-10 max-h-60">
                {/* Country Search */}
                <div className="p-3 border-b border-border">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      value={countrySearchQuery}
                      onChange={(e) => setCountrySearchQuery(e.target.value)}
                      placeholder={currentLanguage === 'en' ? 'Search countries...' : 'جستجوی کشورها...'}
                      className="pl-10 pr-4"
                    />
                  </div>
                </div>
                
                {/* Country List */}
                <div className="max-h-40 overflow-y-auto">
                  {filteredCountries.map((country) => (
                    <button
                      key={country.id}
                      onClick={() => {
                        const countryName = currentLanguage === 'en' ? country.name : country.namePersian;
                        setAdData(prev => ({ 
                          ...prev, 
                          country: countryName,
                          city: '' // Reset city when country changes
                        }));
                        setShowCountryDropdown(false);
                        setCountrySearchQuery('');
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-accent/10 border-b border-border last:border-b-0"
                    >
                      <span className="text-foreground">
                        {currentLanguage === 'en' ? country.name : country.namePersian}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* City Selector */}
          <div className="relative">
            <label className="block text-sm font-medium mb-2">City *</label>
            <button
              onClick={() => {
                if (!selectedCountryData) {
                  toast.error('Please select a country first');
                  return;
                }
                const newState = !showCityDropdown;
                setShowCityDropdown(newState);
                if (!newState) setCitySearchQuery('');
              }}
              disabled={!selectedCountryData}
              className="w-full bg-input-background text-foreground px-4 py-4 rounded-lg text-left flex items-center justify-between h-14 border border-border disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className={selectedCityData ? 'text-foreground' : 'text-muted-foreground'}>
                {adData.city || (currentLanguage === 'en' ? 'Select City' : 'انتخاب شهر')}
              </span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>

            {showCityDropdown && selectedCountryData && (
              <div className="absolute top-20 left-0 right-0 bg-card border border-border rounded-lg shadow-lg z-10 max-h-60">
                {/* City Search */}
                <div className="p-3 border-b border-border">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      value={citySearchQuery}
                      onChange={(e) => setCitySearchQuery(e.target.value)}
                      placeholder={currentLanguage === 'en' ? 'Search cities...' : 'جستجوی شهرها...'}
                      className="pl-10 pr-4"
                    />
                  </div>
                </div>
                
                {/* City List */}
                <div className="max-h-40 overflow-y-auto">
                  {filteredCities.map((city) => (
                    <button
                      key={city.id}
                      onClick={() => {
                        const cityName = currentLanguage === 'en' ? city.name : city.namePersian;
                        setAdData(prev => ({ ...prev, city: cityName }));
                        setShowCityDropdown(false);
                        setCitySearchQuery('');
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-accent/10 border-b border-border last:border-b-0"
                    >
                      <span className="text-foreground">
                        {currentLanguage === 'en' ? city.name : city.namePersian}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderStep5 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Images & Media</h2>
        <p className="text-gray-600 mb-6">Add images to showcase your item or service. Images help attract more buyers.</p>
      </div>
      
      <div className="space-y-4">
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">Images (Max 10)</label>
          <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            isUploadingImages 
              ? 'border-primary bg-primary/5' 
              : 'border-gray-300 hover:border-primary'
          }`}>
            <input
              type="file"
              multiple
              accept="image/*"
              disabled={isUploadingImages}
              onChange={async (e) => {
                if (e.target.files) {
                  await handleImageUpload(e.target.files);
                  // Reset the input to allow uploading the same file again
                  e.target.value = '';
                }
              }}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className={`flex flex-col items-center ${
                isUploadingImages ? 'cursor-wait' : 'cursor-pointer'
              }`}
            >
              {isUploadingImages ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
              ) : (
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
              )}
              <p className="text-sm text-gray-600 mb-1">
                {isUploadingImages 
                  ? 'Uploading images...' 
                  : 'Drop your images here or click to browse'
                }
              </p>
              <p className="text-xs text-gray-500">
                Support: JPEG, PNG, GIF, WebP (Max 10MB each)
              </p>
              <p className="text-xs text-primary mt-2">
                Current: {adData.images.length}/10 images
              </p>
            </label>
          </div>
        </div>

        {/* Image Preview */}
        {adData.images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {adData.images.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <ImageWithFallback
                  src={imageUrl}
                  alt={`Ad image ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-200"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return 'Category';
      case 2: return 'Subcategory';
      case 3: return 'Details';
      case 4: return 'Location';
      case 5: return 'Media & Save';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir={dir}>
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleBack}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {currentStep === 1 ? 'Back to My Ads' : 'Back'}
            </Button>
            
            <h1 className="text-xl font-semibold">Edit Ad</h1>
            
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-gray-600">{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle>Step {currentStep}: {getStepTitle()}</CardTitle>
          </CardHeader>
          
          <CardContent>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}
            {currentStep === 5 && renderStep5()}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {currentStep === 1 ? 'Cancel' : 'Back'}
            </Button>
            
            <Button
              onClick={handleNext}
              disabled={isSaving}
              className="bg-primary hover:bg-primary/90 text-white"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  {currentStep === totalSteps ? (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}