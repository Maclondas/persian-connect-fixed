import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from './ui/breadcrumb';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ArrowLeft, MessageCircle, Heart, Share, MapPin, Calendar, Tag, Shield, User, RefreshCw } from 'lucide-react';
import realDataService, { Ad } from './services/real-data-service';
import { useLanguage } from './hooks/useLanguage';
import { useAuth } from './hooks/useAuth';
import { toast } from 'sonner';
import { ChatAuthFix } from './chat-auth-fix';
import { ChatFixGuide } from './chat-fix-guide';
import { AdDetailDebug } from './ad-detail-debug';

interface NavigateFunction {
  (page: 'home' | 'login' | 'ad-detail' | 'post-ad' | 'messages' | 'chat' | 'admin', params?: { adId?: string; chatId?: string }): void;
}

interface AdDetailPageProps {
  adId: string | null;
  onNavigate: NavigateFunction;
}

// Mock ad data
const mockAd = {
  id: '1',
  title: 'Modern 2BR Apartment in Downtown',
  price: '$1,200',
  currency: 'USD',
  negotiable: true,
  images: [
    'https://images.unsplash.com/photo-1662454419622-a41092ecd245?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBsaXZpbmclMjByb29tfGVufDF8fHx8MTc1ODI3NzA4N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBsaXZpbmclMjByb29tfGVufDF8fHx8MTc1ODI3NzA4N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBhcGFydG1lbnQlMjBsaXZpbmclMjByb29tfGVufDF8fHx8MTc1ODI3NzA4N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
  ],
  location: 'New York, NY',
  category: 'Real Estate',
  condition: 'Excellent',
  description: `Beautiful modern 2-bedroom apartment located in the heart of downtown. This stunning unit features:

• Open concept living and dining area
• Modern kitchen with stainless steel appliances
• Two spacious bedrooms with large windows
• Updated bathroom with modern fixtures
• In-unit washer and dryer
• Hardwood floors throughout
• Central air conditioning and heating
• Building amenities include gym and rooftop terrace

Perfect for professionals or couples looking for a prime downtown location. Walking distance to restaurants, shopping, and public transportation. Available for immediate move-in.

Contact me for more details or to schedule a viewing!`,
  seller: {
    username: 'downtown_realtor',
    joinDate: 'March 2023',
    avatar: null
  },
  postedDate: '2 days ago',
  featured: false
};

export function AdDetailPage({ adId, onNavigate }: AdDetailPageProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const { t, currentLanguage } = useLanguage();
  const { user: currentUser, isAuthenticated } = useAuth();

  useEffect(() => {
    const loadAd = async () => {
      if (!adId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('🔍 Loading ad details for ID:', adId);
        const adData = await realDataService.getAdById(adId);
        
        if (adData) {
          console.log('✅ Ad data loaded successfully:', {
            id: adData.id,
            title: adData.title,
            source: 'backend/supabase/localStorage'
          });
          setAd(adData);
          
          // Show success toast if ad was found
          toast.success('Ad loaded successfully!', {
            duration: 2000
          });
        } else {
          console.log('❌ Ad not found in any source for ID:', adId);
          toast.error('Ad not found in database', {
            description: 'The ad may have been deleted or moved. Use debug below to check.',
            duration: 6000
          });
          setAd(null);
        }
      } catch (error) {
        console.error('❌ Critical error loading ad:', error);
        setAd(null);
        
        // More detailed error handling
        if (error instanceof Error) {
          toast.error('Failed to load ad details', {
            description: error.message.length > 100 ? 'Network or server error' : error.message,
            duration: 5000
          });
        } else {
          toast.error('Failed to load ad details', {
            description: 'Unknown error occurred. Check console for details.',
            duration: 5000
          });
        }
      } finally {
        setLoading(false);
      }
    };

    loadAd();
  }, [adId]);

  if (!adId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2>{currentLanguage === 'en' ? 'Ad not found' : 'آگهی یافت نشد'}</h2>
          <Button onClick={() => onNavigate('home')} className="mt-4">
            {currentLanguage === 'en' ? 'Back to Home' : 'بازگشت به خانه'}
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-xl font-medium mb-4">
              {currentLanguage === 'en' ? 'Ad not found' : 'آگهی یافت نشد'}
            </h2>
            <div className="flex justify-center gap-3 mb-6">
              <Button 
                onClick={() => window.location.reload()} 
                variant="default" 
                className="bg-primary hover:bg-primary/90"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {currentLanguage === 'en' ? 'Try Again' : 'تلاش مجدد'}
              </Button>
              <Button onClick={() => onNavigate('home')} variant="outline">
                {currentLanguage === 'en' ? 'Back to Home' : 'بازگشت به خانه'}
              </Button>
            </div>
            
            <div className="text-sm text-muted-foreground mb-4">
              {currentLanguage === 'en' 
                ? 'The ad may be loading from the server. Try refreshing or check the debug info below.' 
                : 'آگهی ممکن است در حال بارگذاری از سرور باشد. صفحه را تازه کنید یا اطلاعات دیباگ زیر را بررسی کنید.'}
            </div>
          </div>
          
          {/* Debug information */}
          <AdDetailDebug adId={adId} />
        </div>
      </div>
    );
  }

  const handleChatWithSeller = async () => {
    console.log('🎯 Chat button clicked - checking authentication:', {
      isAuthenticated,
      currentUser: currentUser ? { id: currentUser.id, email: currentUser.email } : null,
      adId,
      ad: ad ? { userId: ad.userId, username: ad.username } : null
    });

    if (!currentUser) {
      console.log('🚫 User not authenticated, redirecting to login');
      toast.error('Please login to chat with seller');
      onNavigate('login');
      return;
    }

    if (!ad) {
      toast.error('Ad not found');
      return;
    }

    // Check if user owns the ad
    if (currentUser.id === ad.userId || currentUser.email === ad.userEmail || currentUser.email === ad.username) {
      console.log('🚫 User owns this ad, cannot chat with self');
      toast.error('You cannot chat with yourself');
      return;
    }

    try {
      console.log('💬 Starting Supabase chat with seller:', {
        adId,
        sellerId: ad.userId,
        currentUserId: currentUser.id
      });

      // Show loading state
      toast.info('Starting chat...');

      // Create or get existing chat room using Supabase
      const chatRoomId = await realDataService.createOrGetSupabaseChat(ad, currentUser);
      
      console.log('✅ Chat room created/found:', chatRoomId);
      
      // Show success message
      toast.success('Chat started successfully!');
      
      // Navigate to the chat
      onNavigate('chat', { chatId: chatRoomId });
      
    } catch (error) {
      console.error('❌ Failed to start chat:', error);
      toast.error('Failed to start chat. Please try again.');
    }
  };

  const isOwnerOfAd = () => {
    if (!currentUser || !ad) return false;
    // Check if the current user is the owner by comparing userIds or userEmails
    return currentUser.id === ad.userId || 
           currentUser.email === ad.userEmail || 
           currentUser.email === ad.username;
  };

  const isUserAuthenticated = () => {
    const authResult = isAuthenticated && currentUser && currentUser.id;
    console.log('🔍 Authentication check:', {
      isAuthenticated,
      hasCurrentUser: !!currentUser,
      hasUserId: !!(currentUser?.id),
      authResult,
      currentUserEmail: currentUser?.email
    });
    return authResult;
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return currentLanguage === 'en' ? 'Just now' : 'همین الان';
    if (diffHours < 24) return currentLanguage === 'en' ? `${diffHours} hours ago` : `${diffHours} ساعت پیش`;
    if (diffDays === 1) return currentLanguage === 'en' ? 'Yesterday' : 'دیروز';
    return currentLanguage === 'en' ? `${diffDays} days ago` : `${diffDays} روز پیش`;
  };

  const isFeatured = ad.featured && ad.featuredUntil && new Date(ad.featuredUntil) > new Date();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onNavigate('home')}
              className="flex items-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {currentLanguage === 'en' ? 'Back' : 'بازگشت'}
            </Button>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFavorited(!isFavorited)}
              >
                <Heart className={`h-5 w-5 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button variant="ghost" size="icon">
                <Share className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => onNavigate('home')} className="cursor-pointer">
                {currentLanguage === 'en' ? 'Home' : 'خانه'}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink className="cursor-pointer">{ad.category}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{currentLanguage === 'en' ? ad.title : ad.titlePersian}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="aspect-video">
                <ImageWithFallback
                  src={ad.images?.[selectedImageIndex] || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'}
                  alt={currentLanguage === 'en' ? ad.title : ad.titlePersian}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Image Thumbnails */}
              {ad.images && ad.images.length > 1 && (
                <div className="p-4">
                  <div className="flex space-x-2 overflow-x-auto">
                    {ad.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImageIndex === index ? 'border-primary' : 'border-gray-200'
                      }`}
                    >
                      <ImageWithFallback
                        src={image}
                        alt={`${currentLanguage === 'en' ? ad.title : ad.titlePersian} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
                </div>
              )}
            </div>

            {/* Ad Details */}
            <div className="bg-white rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{currentLanguage === 'en' ? ad.title : ad.titlePersian}</h1>
                  <div className="flex items-center space-x-4 text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {ad.location.city}, {ad.location.country}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatTimeAgo(ad.createdAt)}
                    </div>
                  </div>
                </div>
                {isFeatured && (
                  <Badge className="bg-orange-500 text-white">
                    {currentLanguage === 'en' ? 'Featured' : 'ویژه'}
                  </Badge>
                )}
              </div>

              <div className="mb-6">
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-bold text-primary">${ad.price.toLocaleString()}</span>
                  <span className="text-gray-600">{ad.currency}</span>
                  {ad.priceType === 'negotiable' && (
                    <Badge variant="secondary">{currentLanguage === 'en' ? 'Negotiable' : 'قابل مذاکره'}</Badge>
                  )}
                </div>
              </div>

              {/* Key Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {ad.condition && (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Shield className="h-5 w-5 text-gray-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">{currentLanguage === 'en' ? 'Condition' : 'وضعیت'}</p>
                      <p className="font-medium">{ad.condition}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Tag className="h-5 w-5 text-gray-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">{currentLanguage === 'en' ? 'Category' : 'دسته‌بندی'}</p>
                    <p className="font-medium">{ad.category}</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-gray-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">{currentLanguage === 'en' ? 'Location' : 'مکان'}</p>
                    <p className="font-medium">{ad.location.city}, {ad.location.country}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-xl font-semibold mb-3">{currentLanguage === 'en' ? 'Description' : 'توضیحات'}</h3>
                <div className="prose max-w-none">
                  {(currentLanguage === 'en' ? ad.description : ad.descriptionPersian).split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-3 text-gray-700 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Seller / Your Ad */}
            <Card>
              <CardContent className="p-6">
                {isOwnerOfAd() ? (
                  <>
                    <div className="w-full bg-gray-100 text-gray-700 border border-gray-200 rounded-lg p-4 mb-4 flex items-center justify-center">
                      <User className="h-5 w-5 mr-2" />
                      {currentLanguage === 'en' ? 'Your Ad' : 'آگهی شما'}
                    </div>
                    
                    <p className="text-sm text-gray-600 text-center">
                      {currentLanguage === 'en' ? 'This is your advertisement. You can edit it from My Ads section.' : 'این آگهی متعلق به شماست. می‌توانید آن را از بخش آگهی‌های من ویرایش کنید.'}
                    </p>
                  </>
                ) : (
                  <>
                    <Button 
                      onClick={handleChatWithSeller}
                      className="w-full bg-primary hover:bg-primary/90 text-white mb-4"
                      size="lg"
                    >
                      <MessageCircle className="h-5 w-5 mr-2" />
                      {currentLanguage === 'en' ? 'Chat with Seller' : 'چت با فروشنده'}
                    </Button>
                    
                    <p className="text-sm text-gray-600 text-center">
                      {currentLanguage === 'en' ? 'Get instant responses and ask questions directly' : 'پاسخ فوری دریافت کنید و سوالات خود را مستقیماً بپرسید'}
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Seller Info */}
            <Card>
              <CardHeader>
                <CardTitle>{currentLanguage === 'en' ? 'Seller Information' : 'اطلاعات فروشنده'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 mb-4">
                  <Avatar>
                    <AvatarImage src={undefined} />
                    <AvatarFallback>
                      {ad.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{ad.username}</p>
                    <p className="text-sm text-gray-600">{currentLanguage === 'en' ? 'Member since' : 'عضو از'} {formatTimeAgo(ad.createdAt)}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Response rate</span>
                    <span className="font-medium">98%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Response time</span>
                    <span className="font-medium">Within 2 hours</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total ads</span>
                    <span className="font-medium">24</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Safety Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Safety Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                  <p className="text-sm text-gray-700">Meet in a public place for exchanges</p>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                  <p className="text-sm text-gray-700">Inspect the item before payment</p>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                  <p className="text-sm text-gray-700">Use secure payment methods</p>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                  <p className="text-sm text-gray-700">Trust your instincts</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}