import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { RefreshCw, Eye, User, Home, Database } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { realDataService, type Ad } from './services/real-data-service';
import { toast } from 'sonner';

interface AdminAdsDebuggerProps {
  onNavigate: (page: string) => void;
}

export function AdminAdsDebugger({ onNavigate }: AdminAdsDebuggerProps) {
  const { user: currentUser, isAuthenticated, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [localStorageAds, setLocalStorageAds] = useState<any[]>([]);
  const [userAds, setUserAds] = useState<Ad[]>([]);
  const [homepageAds, setHomepageAds] = useState<Ad[]>([]);
  const [debugInfo, setDebugInfo] = useState<any>({});

  const debugEverything = async () => {
    if (!isAuthenticated || !currentUser) {
      toast.error('Please login first');
      return;
    }

    setLoading(true);
    try {
      // 1. Check localStorage directly
      const localAds = JSON.parse(localStorage.getItem('demo_ads') || '[]');
      console.log('🔍 Debug: Raw localStorage ads:', localAds);
      setLocalStorageAds(localAds);

      // 2. Check what getUserAds returns
      const userAdsResult = await realDataService.getUserAds();
      console.log('🔍 Debug: getUserAds result:', userAdsResult);
      setUserAds(userAdsResult);

      // 3. Check what getAds (homepage) returns
      const homepageResult = await realDataService.getAds();
      console.log('🔍 Debug: getAds (homepage) result:', homepageResult);
      setHomepageAds(homepageResult.ads || []);

      // 4. Generate debug info
      const info = {
        currentUser: {
          id: currentUser.id,
          email: currentUser.email,
          role: currentUser.role,
          isAdmin: isAdmin,
          isAdminEmail: currentUser.email?.toLowerCase() === 'ommzadeh@gmail.com'
        },
        localStorage: {
          totalAds: localAds.length,
          userAds: localAds.filter((ad: any) => ad.userId === currentUser.id || ad.userEmail === currentUser.email).length,
          approvedUserAds: localAds.filter((ad: any) => (ad.userId === currentUser.id || ad.userEmail === currentUser.email) && ad.status === 'approved').length,
          pendingUserAds: localAds.filter((ad: any) => (ad.userId === currentUser.id || ad.userEmail === currentUser.email) && ad.status === 'pending').length
        },
        getUserAds: {
          totalReturned: userAdsResult.length,
          approved: userAdsResult.filter(ad => ad.status === 'approved').length,
          pending: userAdsResult.filter(ad => ad.status === 'pending').length
        },
        homepage: {
          totalReturned: homepageResult.ads?.length || 0,
          fromThisUser: (homepageResult.ads || []).filter((ad: any) => ad.userId === currentUser.id || ad.userEmail === currentUser.email).length
        }
      };
      
      setDebugInfo(info);
      console.log('🔍 Complete debug info:', info);
      
      toast.success('Debug complete - check console for details');
    } catch (error) {
      console.error('Debug error:', error);
      toast.error('Debug failed');
    } finally {
      setLoading(false);
    }
  };

  const forceApproveMyAds = async () => {
    if (!isAuthenticated || !currentUser) {
      toast.error('Please login first');
      return;
    }

    try {
      const localAds = JSON.parse(localStorage.getItem('demo_ads') || '[]');
      let approved = 0;
      
      const updatedAds = localAds.map((ad: any) => {
        if ((ad.userId === currentUser.id || ad.userEmail === currentUser.email) && ad.status !== 'approved') {
          console.log('✅ Force approving ad:', ad.title);
          approved++;
          return {
            ...ad,
            status: 'approved',
            paymentStatus: 'completed'
          };
        }
        return ad;
      });

      localStorage.setItem('demo_ads', JSON.stringify(updatedAds));
      
      if (approved > 0) {
        toast.success(`✅ Force approved ${approved} of your ads!`);
        await debugEverything(); // Refresh debug info
      } else {
        toast.info('ℹ️ All your ads are already approved');
      }
    } catch (error) {
      console.error('Force approve error:', error);
      toast.error('Failed to force approve ads');
    }
  };

  const createTestAd = async () => {
    if (!isAuthenticated || !currentUser) {
      toast.error('Please login first');
      return;
    }

    try {
      const testAd = {
        title: `Test Ad ${Date.now()}`,
        titlePersian: `آگهی تست ${Date.now()}`,
        description: 'This is a test ad created by the admin debugger',
        descriptionPersian: 'این یک آگهی تست ایجاد شده توسط دیباگر ادمین است',
        price: 100,
        priceType: 'fixed' as const,
        currency: 'USD',
        category: 'digital-goods',
        subcategory: 'software',
        location: { country: 'United Kingdom', city: 'London' },
        images: ['https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500'],
        contactInfo: { email: currentUser.email }
      };

      const result = await realDataService.createAd(testAd);
      console.log('✅ Test ad created:', result);
      toast.success('✅ Test ad created successfully!');
      
      // Refresh debug info
      await debugEverything();
    } catch (error) {
      console.error('Create test ad error:', error);
      toast.error('Failed to create test ad');
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Ads Debugger</h1>
            <p className="text-gray-600 mt-2">
              Debug admin ad posting and visibility issues
            </p>
          </div>
          <Button onClick={() => onNavigate('home')} variant="outline">
            Back to Home
          </Button>
        </div>

        {/* Debug Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Debug Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              <Button 
                onClick={debugEverything}
                disabled={loading}
                className="bg-primary hover:bg-primary/90"
              >
                <Eye className="w-4 h-4 mr-2" />
                Run Full Debug Analysis
              </Button>
              
              <Button 
                onClick={forceApproveMyAds}
                disabled={loading}
                variant="outline"
              >
                Force Approve My Ads
              </Button>
              
              <Button 
                onClick={createTestAd}
                disabled={loading}
                variant="outline"
              >
                Create Test Ad
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Current User Info */}
        {debugInfo.currentUser && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Current User Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{debugInfo.currentUser.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <Badge variant={debugInfo.currentUser.isAdmin ? "default" : "secondary"}>
                    {debugInfo.currentUser.role || 'user'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Is Admin</p>
                  <Badge variant={debugInfo.currentUser.isAdmin ? "default" : "destructive"}>
                    {debugInfo.currentUser.isAdmin ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Admin Email</p>
                  <Badge variant={debugInfo.currentUser.isAdminEmail ? "default" : "destructive"}>
                    {debugInfo.currentUser.isAdminEmail ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Storage Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* LocalStorage */}
          {debugInfo.localStorage && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  LocalStorage Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Total Ads:</span>
                  <Badge variant="outline">{debugInfo.localStorage.totalAds}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Your Ads:</span>
                  <Badge variant="outline">{debugInfo.localStorage.userAds}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Your Approved:</span>
                  <Badge variant="default">{debugInfo.localStorage.approvedUserAds}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Your Pending:</span>
                  <Badge variant="secondary">{debugInfo.localStorage.pendingUserAds}</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* getUserAds */}
          {debugInfo.getUserAds && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  My Ads (getUserAds)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Total Returned:</span>
                  <Badge variant="outline">{debugInfo.getUserAds.totalReturned}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Approved:</span>
                  <Badge variant="default">{debugInfo.getUserAds.approved}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Pending:</span>
                  <Badge variant="secondary">{debugInfo.getUserAds.pending}</Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Homepage */}
          {debugInfo.homepage && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  Homepage (getAds)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Total Ads:</span>
                  <Badge variant="outline">{debugInfo.homepage.totalReturned}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Your Ads Visible:</span>
                  <Badge variant={debugInfo.homepage.fromThisUser > 0 ? "default" : "destructive"}>
                    {debugInfo.homepage.fromThisUser}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Recent LocalStorage Ads */}
        {localStorageAds.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent LocalStorage Ads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {localStorageAds.slice(0, 10).map((ad: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{ad.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        By: {ad.userEmail} | Created: {new Date(ad.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={ad.status === 'approved' ? 'default' : ad.status === 'pending' ? 'secondary' : 'destructive'}>
                        {ad.status}
                      </Badge>
                      {(ad.userId === currentUser?.id || ad.userEmail === currentUser?.email) && (
                        <Badge variant="outline">YOURS</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}