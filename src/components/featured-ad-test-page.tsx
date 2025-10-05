import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Star, TestTube, Clock, Eye, ArrowLeft, CheckCircle, XCircle, RefreshCw, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from './hooks/useAuth';
import { useLanguage } from './hooks/useLanguage';

interface TestAd {
  id: string;
  title: string;
  price: number;
  currency: string;
  images: string[];
  location: { city: string; country: string };
  category: string;
  status: 'approved' | 'pending';
  featured: boolean;
  featuredUntil?: string;
  views: number;
  createdAt: string;
  expiresAt: string;
}

interface FeaturedAdTestPageProps {
  onNavigate: (page: string) => void;
}

export function FeaturedAdTestPage({ onNavigate }: FeaturedAdTestPageProps) {
  const { user: currentUser, loading: authLoading, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [testAds, setTestAds] = useState<TestAd[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [testingAdId, setTestingAdId] = useState<string | null>(null);

  // Create some mock test ads when component loads
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      initializeTestAds();
    } else if (!authLoading && !isAuthenticated) {
      toast.error('Please login to access the test page');
      onNavigate('login');
    }
  }, [authLoading, isAuthenticated]);

  const initializeTestAds = () => {
    const mockAds: TestAd[] = [
      {
        id: 'test-1',
        title: 'Test Car - BMW 320i',
        price: 25000,
        currency: 'USD',
        images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400'],
        location: { city: 'London', country: 'UK' },
        category: 'vehicles',
        status: 'approved',
        featured: false,
        views: 42,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'test-2',
        title: 'Test Apartment - 2BR London',
        price: 1800,
        currency: 'USD',
        images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400'],
        location: { city: 'London', country: 'UK' },
        category: 'real-estate',
        status: 'approved',
        featured: false,
        views: 28,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'test-3',
        title: 'Test Phone - iPhone 15 Pro',
        price: 999,
        currency: 'USD',
        images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400'],
        location: { city: 'Paris', country: 'France' },
        category: 'digital-goods',
        status: 'approved',
        featured: true,
        featuredUntil: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        views: 89,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    
    setTestAds(mockAds);
    toast.success('🧪 Test environment loaded with mock ads');
  };

  const createNewTestAd = () => {
    const newTestAd: TestAd = {
      id: `test-${Date.now()}`,
      title: `Test Ad - ${new Date().toLocaleTimeString()}`,
      price: Math.floor(Math.random() * 10000) + 100,
      currency: 'USD',
      images: ['https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'],
      location: { city: 'Test City', country: 'Test Country' },
      category: 'services',
      status: 'approved',
      featured: false,
      views: Math.floor(Math.random() * 100),
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    setTestAds(prev => [...prev, newTestAd]);
    toast.success('🆕 New test ad created!');
  };

  const isCurrentlyBoosted = (ad: TestAd) => {
    return ad.featured && ad.featuredUntil && new Date(ad.featuredUntil) > new Date();
  };

  const getRemainingTime = (ad: TestAd) => {
    if (!ad.featured || !ad.featuredUntil) return null;
    
    const now = new Date();
    const until = new Date(ad.featuredUntil);
    
    if (until <= now) return null;

    const diffMs = until.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.ceil(diffMs / (1000 * 60));
    
    if (diffDays > 1) {
      return `${diffDays} days remaining`;
    } else if (diffHours > 1) {
      return `${diffHours} hours remaining`;
    } else {
      return `${diffMinutes} minutes remaining`;
    }
  };

  const testBoostAd = async (adId: string, durationMinutes: number = 10080) => {
    try {
      setTestingAdId(adId);
      
      console.log('🌟 Testing boost for ad:', adId, 'Duration:', durationMinutes, 'minutes');
      
      // Calculate expiration time
      const featuredUntil = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString();
      
      // Update test ad locally (no server call)
      setTestAds(prev => prev.map(ad => 
        ad.id === adId 
          ? { ...ad, featured: true, featuredUntil }
          : ad
      ));
      
      const durationText = durationMinutes > 1440 
        ? `${Math.round(durationMinutes/1440)} days` 
        : durationMinutes > 60 
        ? `${Math.round(durationMinutes/60)} hours`
        : `${durationMinutes} minutes`;
      
      toast.success(`🌟 Test ad boosted! Duration: ${durationText}`);
    } catch (error: any) {
      console.error('Failed to test boost ad:', error);
      toast.error(`Failed to boost ad: ${error.message || 'Unknown error'}`);
    } finally {
      setTestingAdId(null);
    }
  };

  const testUnboostAd = async (adId: string) => {
    try {
      setTestingAdId(adId);
      
      console.log('❌ Test unboost for ad:', adId);
      
      // Update test ad locally (no server call)
      setTestAds(prev => prev.map(ad => 
        ad.id === adId 
          ? { ...ad, featured: false, featuredUntil: undefined }
          : ad
      ));
      
      toast.success('❌ Test ad featured status removed!');
    } catch (error: any) {
      console.error('Failed to test unboost ad:', error);
      toast.error(`Failed to unboost ad: ${error.message || 'Unknown error'}`);
    } finally {
      setTestingAdId(null);
    }
  };

  const presetDurations = [
    { label: '2 minutes', minutes: 2 },
    { label: '10 minutes', minutes: 10 },
    { label: '1 hour', minutes: 60 },
    { label: '6 hours', minutes: 360 },
    { label: '1 day', minutes: 1440 },
    { label: '7 days (normal)', minutes: 10080 },
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onNavigate('home')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onNavigate('my-ads')}
            >
              <Eye className="h-4 w-4 mr-2" />
              My Ads (Real)
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-6 w-6 text-blue-600" />
                Featured Ads Testing Sandbox
              </CardTitle>
              <p className="text-gray-600">
                🧪 <strong>SAFE TEST ENVIRONMENT</strong> - Test boost functionality without affecting real ads or making payments.
                This page uses mock data and doesn't connect to the real database.
              </p>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-green-900">Test Environment Active</h3>
                </div>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>✅ No real ads will be affected</li>
                  <li>✅ No payments will be processed</li>
                  <li>✅ All changes are local/temporary</li>
                  <li>✅ Perfect for testing UI behavior</li>
                </ul>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-5 w-5 text-yellow-600" />
                  <h3 className="font-semibold text-yellow-900">Testing Instructions</h3>
                </div>
                <ul className="text-sm text-yellow-800 space-y-1">
                  <li>• Use "Test Boost" buttons to mark ads as featured</li>
                  <li>• Choose different durations to test expiration behavior</li>
                  <li>• Use "Remove Featured" to instantly unboost ads</li>
                  <li>• Create new test ads with the "+" button</li>
                  <li>• Watch how buttons and badges change in real-time</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Controls */}
        <div className="mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Test Ad Management</h3>
                <div className="flex gap-2">
                  <Button
                    onClick={createNewTestAd}
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Test Ad
                  </Button>
                  <Button
                    onClick={initializeTestAds}
                    variant="outline"
                    size="sm"
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Reset Test Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Test Ads List */}
        {testAds.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <TestTube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Test Ads</h3>
              <p className="text-gray-600 mb-4">Click "Add Test Ad" to create some test ads for boost testing.</p>
              <Button onClick={createNewTestAd}>
                <Plus className="h-4 w-4 mr-2" />
                Create Test Ad
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {testAds.map((ad) => (
              <Card key={ad.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Ad Image */}
                    {ad.images && ad.images.length > 0 && (
                      <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={ad.images[0]}
                          alt={ad.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    {/* Ad Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900 mb-1">{ad.title}</h3>
                          <p className="text-lg font-semibold text-primary">${ad.price} {ad.currency}</p>
                          <p className="text-sm text-gray-600">
                            {ad.location.city}, {ad.location.country}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <Badge variant={ad.status === 'approved' ? 'default' : 'secondary'}>
                            {isCurrentlyBoosted(ad) ? (
                              <>
                                <Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />
                                FEATURED
                              </>
                            ) : (
                              ad.status.toUpperCase()
                            )}
                          </Badge>
                        </div>
                      </div>

                      {/* Featured Status */}
                      {isCurrentlyBoosted(ad) && (
                        <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <Star className="h-4 w-4 text-yellow-600 fill-current" />
                            <span className="font-semibold text-yellow-900">Currently Featured</span>
                          </div>
                          <p className="text-sm text-yellow-800">
                            {getRemainingTime(ad)} • Expires: {new Date(ad.featuredUntil!).toLocaleString()}
                          </p>
                        </div>
                      )}

                      {/* Test Controls */}
                      <div className="flex flex-wrap gap-2">
                        {isCurrentlyBoosted(ad) ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => testUnboostAd(ad.id)}
                            disabled={testingAdId === ad.id}
                          >
                            {testingAdId === ad.id ? (
                              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <XCircle className="h-4 w-4 mr-2" />
                            )}
                            Remove Featured
                          </Button>
                        ) : (
                          <>
                            {presetDurations.map((preset) => (
                              <Button
                                key={preset.minutes}
                                size="sm"
                                variant={preset.minutes === 10080 ? "default" : "outline"}
                                className={preset.minutes === 10080 ? "bg-yellow-500 hover:bg-yellow-600" : ""}
                                onClick={() => testBoostAd(ad.id, preset.minutes)}
                                disabled={testingAdId === ad.id}
                              >
                                {testingAdId === ad.id ? (
                                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Star className="h-4 w-4 mr-2" />
                                )}
                                {preset.label}
                              </Button>
                            ))}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Test Results & Validation */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              What This Tests & How to Validate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">UI Behavior Testing:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span>Button text changes: "Boost $10" ↔ "Boosted"</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span>Badge appearance: "FEATURED" with star icon</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span>Time countdown: Live remaining time display</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span>Visual styling: Yellow featured highlights</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Real System Testing:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>Go to "My Ads (Real)" to test actual boost payments</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>Check homepage for featured badge positioning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>Verify database persistence after refresh</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>Test expiration behavior with short durations</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex gap-3">
                <Button 
                  variant="outline"
                  onClick={initializeTestAds}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reset Test Data
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => onNavigate('my-ads')}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Test Real System
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => onNavigate('home')}
                >
                  Check Homepage
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}