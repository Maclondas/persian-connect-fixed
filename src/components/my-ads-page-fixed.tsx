import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { ArrowLeft, ArrowRight, Star, Eye, Clock, DollarSign, MessageCircle, Edit, Trash2, MoreHorizontal, Calendar, Heart, Home, User, Plus, TestTube } from 'lucide-react';
import { useLanguage } from './hooks/useLanguage';
import { useAuth } from './hooks/useAuth';
import { realDataService as dataService, type Ad, type Payment } from './services/real-data-service';
import { stripeService, StripeService } from './services/stripe-service';
import { toast } from 'sonner@2.0.3';

interface MyAdsPageProps {
  onNavigate: (page: string, params?: { adId?: string }) => void;
}

export function MyAdsPage({ onNavigate }: MyAdsPageProps) {
  const { t, isRTL } = useLanguage();
  const { user: currentUser, loading: authLoading, isAuthenticated } = useAuth();
  const [userAds, setUserAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'expired' | 'rejected'>('active');

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadUserAds();
    } else if (!authLoading && !isAuthenticated) {
      toast.error('Please login to view your ads');
      onNavigate('login');
    }
  }, [authLoading, isAuthenticated]);

  // Auto-refresh to check for expired boosts every minute
  useEffect(() => {
    if (!isAuthenticated || isLoading) return;

    const interval = setInterval(() => {
      // Check if any currently boosted ads have expired
      const hasExpiredBoosts = userAds.some(ad => 
        ad.featured && ad.featuredUntil && new Date(ad.featuredUntil) <= new Date()
      );
      
      if (hasExpiredBoosts) {
        console.log('🔄 Auto-refreshing ads due to expired boosts');
        loadUserAds();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [isAuthenticated, isLoading, userAds]);

  const loadUserAds = async () => {
    try {
      setIsLoading(true);
      
      // Check authentication using the auth hook
      if (!isAuthenticated || !currentUser) {
        toast.error('Please login to view your ads');
        onNavigate('login');
        return;
      }
      
      // User is already available from useAuth hook
      
      // Get user's ads
      const ads = await dataService.getUserAds();
      
      // Check for expired featured ads
      dataService.checkExpiredFeaturedAds();
      
      setUserAds(ads);
    } catch (error) {
      console.error('Failed to load user ads:', error);
      toast.error('Failed to load your ads');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBoostAd = async (ad: Ad) => {
    if (!currentUser) {
      toast.error('Please login first');
      return;
    }

    if (ad.featured && ad.featuredUntil && new Date(ad.featuredUntil) > new Date()) {
      toast.error('This ad is already boosted');
      return;
    }

    try {
      toast.loading('Preparing boost payment...');

      // Create payment for boost
      const payment = await dataService.createPayment({
        userId: currentUser.id,
        adId: ad.id,
        amount: 10.00, // $10 boost fee
        currency: 'USD',
        type: 'ad_boost',
        status: 'pending'
      });

      // Store context for payment verification
      localStorage.setItem('paymentId', payment.id);
      localStorage.setItem('adId', ad.id);

      // Create Stripe checkout session for boost
      const session = await stripeService.createBoostCheckoutSession(ad.id, ad.title);
      
      // Store session ID for verification
      localStorage.setItem('paymentSessionId', session.sessionId);
      
      // Redirect to Stripe checkout
      await stripeService.redirectToCheckout(session.url, session.sessionId);
      
    } catch (error) {
      console.error('Failed to initiate boost payment:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('Please sign in')) {
          toast.error('Please sign in to boost your ad.');
          onNavigate('login');
        } else if (error.message.includes('temporarily unavailable')) {
          toast.error('Boost payment service temporarily unavailable. Please try again later.');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error('Failed to start boost payment. Please try again.');
      }
    }
  };

  const getFilteredAds = () => {
    switch (activeTab) {
      case 'active':
        return userAds.filter(ad => ad.status === 'approved' && new Date(ad.expiresAt) > new Date());
      case 'pending':
        return userAds.filter(ad => ad.status === 'pending' || ad.status === 'under_review');
      case 'expired':
        return userAds.filter(ad => ad.status === 'expired' || new Date(ad.expiresAt) <= new Date());
      case 'rejected':
        return userAds.filter(ad => ad.status === 'rejected');
      default:
        return userAds;
    }
  };

  const getAdStatusColor = (ad: Ad) => {
    if (ad.featured && ad.featuredUntil && new Date(ad.featuredUntil) > new Date()) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
    switch (ad.status) {
      case 'approved':
        return new Date(ad.expiresAt) > new Date() ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'under_review':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'expired':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAdStatusText = (ad: Ad) => {
    if (ad.featured && ad.featuredUntil && new Date(ad.featuredUntil) > new Date()) {
      return 'Featured';
    }
    switch (ad.status) {
      case 'approved':
        return new Date(ad.expiresAt) > new Date() ? 'Active' : 'Expired';
      case 'pending':
        return 'Pending Payment';
      case 'under_review':
        return 'Under Review';
      case 'rejected':
        return 'Rejected';
      case 'expired':
        return 'Expired';
      default:
        return ad.status;
    }
  };

  const canBoostAd = (ad: Ad) => {
    return ad.status === 'approved' && 
           new Date(ad.expiresAt) > new Date() &&
           (!ad.featured || !ad.featuredUntil || new Date(ad.featuredUntil) <= new Date());
  };

  const isCurrentlyBoosted = (ad: Ad) => {
    return ad.featured && ad.featuredUntil && new Date(ad.featuredUntil) > new Date();
  };

  const getRemainingFeaturedTime = (ad: Ad) => {
    if (!ad.featured || !ad.featuredUntil) return null;
    
    const now = new Date();
    const until = new Date(ad.featuredUntil);
    
    if (until <= now) return null;
    
    const diffMs = until.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays > 1) {
      return `${diffDays} days remaining`;
    } else {
      const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
      return `${diffHours} hours remaining`;
    }
  };

  const tabs = [
    { key: 'active' as const, label: 'Active', count: userAds.filter(ad => ad.status === 'approved' && new Date(ad.expiresAt) > new Date()).length },
    { key: 'pending' as const, label: 'Pending', count: userAds.filter(ad => ad.status === 'pending' || ad.status === 'under_review').length },
    { key: 'expired' as const, label: 'Expired', count: userAds.filter(ad => ad.status === 'expired' || new Date(ad.expiresAt) <= new Date()).length },
    { key: 'rejected' as const, label: 'Rejected', count: userAds.filter(ad => ad.status === 'rejected').length }
  ];

  const filteredAds = getFilteredAds();

  // Show loading state while auth is being checked
  if (authLoading) {
    return (
      <div className="flex flex-col h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onNavigate('home')}
          >
            {isRTL ? (
              <ArrowRight className="h-5 w-5" />
            ) : (
              <ArrowLeft className="h-5 w-5" />
            )}
          </Button>
          <h1 className="text-lg font-medium">My Ads</h1>
          <div className="flex gap-2">
            {/* Featured Test Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('featured-test')}
              className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
            >
              <TestTube className="h-4 w-4 mr-1" />
              Test
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onNavigate('post-ad')}
            >
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="sticky top-16 z-10 bg-background border-b border-border">
        <div className="flex space-x-1 p-2 overflow-x-auto">
          {tabs.map((tab) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? "default" : "ghost"}
              size="sm"
              className="whitespace-nowrap"
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label} ({tab.count})
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="flex-grow overflow-y-auto p-4 pb-24">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredAds.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No ads found</h3>
            <p className="text-gray-600 mb-4">
              {activeTab === 'active' && "You don't have any active ads yet."}
              {activeTab === 'pending' && "No ads are currently pending review."}
              {activeTab === 'expired' && "You don't have any expired ads."}
              {activeTab === 'rejected' && "No ads have been rejected."}
            </p>
            {activeTab === 'active' && (
              <Button onClick={() => onNavigate('post-ad')}>
                <Plus className="h-4 w-4 mr-2" />
                Post Your First Ad
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAds.map((ad) => (
              <Card key={ad.id} className="relative overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {ad.images && ad.images.length > 0 && (
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={ad.images[0]}
                          alt={ad.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="flex-grow min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-medium text-gray-900 truncate">{ad.title}</h3>
                        <Badge className={`text-xs ${getAdStatusColor(ad)}`}>
                          {ad.featured && ad.featuredUntil && new Date(ad.featuredUntil) > new Date() && (
                            <Star className="h-3 w-3 mr-1" />
                          )}
                          {getAdStatusText(ad)}
                        </Badge>
                      </div>
                      
                      <p className="text-lg font-semibold text-primary mb-2">
                        ${ad.price} {ad.currency}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          {ad.views} views
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(ad.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      {ad.featured && ad.featuredUntil && new Date(ad.featuredUntil) > new Date() && (
                        <div className="mb-3">
                          <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            <Star className="h-3 w-3 mr-1" />
                            {getRemainingFeaturedTime(ad)}
                          </Badge>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onNavigate('ad-detail', { adId: ad.id })}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        
                        {isCurrentlyBoosted(ad) ? (
                          <div className="flex flex-col items-start">
                            <Button
                              size="sm"
                              variant="outline"
                              className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100 cursor-default"
                              disabled
                            >
                              <Star className="h-4 w-4 mr-1 fill-green-500 text-green-500" />
                              {t('myAds.boosted', 'Boosted')}
                            </Button>
                            {getRemainingFeaturedTime(ad) && (
                              <span className="text-xs text-green-600 mt-1">
                                {getRemainingFeaturedTime(ad)}
                              </span>
                            )}
                          </div>
                        ) : canBoostAd(ad) && (
                          <Button
                            size="sm"
                            className="bg-yellow-500 hover:bg-yellow-600 text-white"
                            onClick={() => handleBoostAd(ad)}
                          >
                            <Star className="h-4 w-4 mr-1" />
                            {t('myAds.boost', 'Boost $10')}
                          </Button>
                        )}
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem 
                              onClick={() => onNavigate('edit-ad', { adId: ad.id })}
                              className="flex items-center gap-2"
                            >
                              <Edit className="h-4 w-4" />
                              Edit Ad
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => onNavigate('ad-detail', { adId: ad.id })}
                              className="flex items-center gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {isCurrentlyBoosted(ad) ? (
                              <DropdownMenuItem 
                                disabled
                                className="flex items-center gap-2 opacity-50"
                              >
                                <Star className="h-4 w-4 fill-green-500 text-green-500" />
                                {t('myAds.boosted', 'Boosted')} ({getRemainingFeaturedTime(ad)})
                              </DropdownMenuItem>
                            ) : canBoostAd(ad) && (
                              <DropdownMenuItem 
                                onClick={() => handleBoostAd(ad)}
                                className="flex items-center gap-2"
                              >
                                <Star className="h-4 w-4" />
                                {t('myAds.boostFor', 'Boost for $10')}
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 bg-background border-t border-border">
        <nav className="flex justify-around p-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary"
            onClick={() => onNavigate('home')}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs">Home</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary"
          >
            <Heart className="h-5 w-5" />
            <span className="text-xs">Favorites</span>
          </Button>

          <Button
            onClick={() => onNavigate('post-ad')}
            size="sm"
            className="flex flex-col items-center gap-1 text-primary hover:text-primary/80 -mt-1"
          >
            <Plus className="h-8 w-8" />
            <span className="text-xs font-medium">Post Ad</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary"
            onClick={() => onNavigate('messages')}
          >
            <MessageCircle className="h-5 w-5" />
            <span className="text-xs">Messages</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex flex-col items-center gap-1 text-primary"
          >
            <User className="h-5 w-5 fill-current" />
            <span className="text-xs font-medium">My Ads</span>
          </Button>
        </nav>
      </footer>
    </div>
  );
}