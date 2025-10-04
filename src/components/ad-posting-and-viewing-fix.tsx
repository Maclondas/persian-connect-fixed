import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  CheckCircle, XCircle, AlertTriangle, RefreshCw, Database, 
  User, Eye, Trash2, Copy, TestTube, ArrowLeft 
} from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { realDataService, Ad } from './services/real-data-service';
import { toast } from 'sonner@2.0.3';

interface AdPostingAndViewingFixProps {
  onNavigate: (page: string, params?: { adId?: string }) => void;
}

export function AdPostingAndViewingFix({ onNavigate }: AdPostingAndViewingFixProps) {
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [diagnostics, setDiagnostics] = useState<any>({});
  const [localAds, setLocalAds] = useState<Ad[]>([]);
  const [userAds, setUserAds] = useState<Ad[]>([]);
  const [fixResults, setFixResults] = useState<string[]>([]);

  useEffect(() => {
    if (isAuthenticated && user) {
      runDiagnostics();
    }
  }, [isAuthenticated, user]);

  const runDiagnostics = async () => {
    setIsLoading(true);
    const results: any = {};
    const fixes: string[] = [];

    try {
      // 1. Check current user information
      results.userInfo = {
        isAuthenticated,
        userId: user?.id,
        userEmail: user?.email,
        username: user?.username || user?.name,
        userRole: user?.role
      };

      // 2. Check localStorage ads
      const localAdsRaw = localStorage.getItem('demo_ads');
      const parsedLocalAds = localAdsRaw ? JSON.parse(localAdsRaw) : [];
      results.localStorage = {
        totalAds: parsedLocalAds.length,
        hasData: !!localAdsRaw,
        dataSize: localAdsRaw?.length || 0
      };
      setLocalAds(parsedLocalAds);

      // 3. Check user-specific ads in localStorage
      const userSpecificAds = parsedLocalAds.filter((ad: Ad) => 
        ad.userId === user?.id || ad.userEmail === user?.email
      );
      results.userLocalAds = {
        count: userSpecificAds.length,
        ads: userSpecificAds.map((ad: Ad) => ({
          id: ad.id,
          title: ad.title,
          userId: ad.userId,
          userEmail: ad.userEmail,
          status: ad.status,
          paymentStatus: ad.paymentStatus,
          createdAt: ad.createdAt
        }))
      };

      // 4. Try to get user ads through service
      try {
        const serviceUserAds = await realDataService.getUserAds();
        setUserAds(serviceUserAds);
        results.serviceUserAds = {
          count: serviceUserAds.length,
          success: true,
          ads: serviceUserAds.map(ad => ({
            id: ad.id,
            title: ad.title,
            userId: ad.userId,
            userEmail: ad.userEmail,
            status: ad.status,
            paymentStatus: ad.paymentStatus
          }))
        };
      } catch (error) {
        results.serviceUserAds = {
          count: 0,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }

      // 5. Test ad detail loading for a sample ad
      if (parsedLocalAds.length > 0) {
        const testAdId = parsedLocalAds[0].id;
        try {
          const testAd = await realDataService.getAdById(testAdId);
          results.adDetailTest = {
            testAdId,
            success: !!testAd,
            adFound: !!testAd,
            adTitle: testAd?.title
          };
        } catch (error) {
          results.adDetailTest = {
            testAdId,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      } else {
        results.adDetailTest = {
          success: false,
          error: 'No ads available for testing'
        };
      }

      // 6. Check for data consistency issues
      results.dataConsistency = {
        userIdFormat: typeof user?.id,
        userIdLength: user?.id?.length || 0,
        hasConsistentUserIds: userSpecificAds.every(ad => ad.userId === user?.id),
        hasConsistentEmails: userSpecificAds.every(ad => ad.userEmail === user?.email),
        adFormats: userSpecificAds.map(ad => ({
          id: ad.id,
          hasValidId: !!ad.id && typeof ad.id === 'string',
          hasValidUserId: !!ad.userId,
          hasValidDates: !!(ad.createdAt && ad.updatedAt),
          paymentStatus: ad.paymentStatus,
          status: ad.status
        }))
      };

      setDiagnostics(results);

      // Generate fixes based on findings
      if (results.userLocalAds.count === 0 && results.localStorage.totalAds > 0) {
        fixes.push('🔧 User ID mismatch detected - ads exist but not associated with current user');
      }
      if (results.serviceUserAds.count !== results.userLocalAds.count) {
        fixes.push('🔧 Sync issue between service and localStorage detected');
      }
      if (!results.adDetailTest.success) {
        fixes.push('🔧 Ad detail loading failure detected');
      }
      if (!results.dataConsistency.hasConsistentUserIds) {
        fixes.push('🔧 Inconsistent user ID format detected');
      }

      setFixResults(fixes);

    } catch (error) {
      console.error('Diagnostics failed:', error);
      toast.error('Diagnostics failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const fixUserIdIssues = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const localAds = JSON.parse(localStorage.getItem('demo_ads') || '[]');
      let fixedCount = 0;

      // Fix ads that might belong to the current user but have incorrect user associations
      const updatedAds = localAds.map((ad: Ad) => {
        let needsUpdate = false;
        const updatedAd = { ...ad };

        // Fix missing or incorrect userId
        if (!ad.userId || ad.userId !== user.id) {
          // Check if this ad was created by current user based on email
          if (ad.userEmail === user.email) {
            updatedAd.userId = user.id;
            needsUpdate = true;
          }
        }

        // Fix missing or incorrect userEmail
        if (!ad.userEmail || ad.userEmail !== user.email) {
          if (ad.userId === user.id) {
            updatedAd.userEmail = user.email;
            needsUpdate = true;
          }
        }

        // Fix missing username
        if (!ad.username && ad.userId === user.id) {
          updatedAd.username = user.username || user.name || user.email;
          needsUpdate = true;
        }

        if (needsUpdate) {
          fixedCount++;
        }

        return updatedAd;
      });

      if (fixedCount > 0) {
        localStorage.setItem('demo_ads', JSON.stringify(updatedAds));
        toast.success(`Fixed ${fixedCount} ads with user association issues`);
        await runDiagnostics(); // Re-run diagnostics
      } else {
        toast.info('No user association issues found to fix');
      }

    } catch (error) {
      console.error('Fix failed:', error);
      toast.error('Fix failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const fixAdDetailLoading = async () => {
    try {
      setIsLoading(true);
      const localAds = JSON.parse(localStorage.getItem('demo_ads') || '[]');
      let fixedCount = 0;

      // Fix ads with invalid or missing data
      const updatedAds = localAds.map((ad: Ad) => {
        let needsUpdate = false;
        const updatedAd = { ...ad };

        // Ensure required fields exist
        if (!ad.id) {
          updatedAd.id = crypto.randomUUID();
          needsUpdate = true;
        }

        // Fix date objects that might be strings
        if (typeof ad.createdAt === 'string') {
          updatedAd.createdAt = new Date(ad.createdAt);
          needsUpdate = true;
        }
        if (typeof ad.updatedAt === 'string') {
          updatedAd.updatedAt = new Date(ad.updatedAt);
          needsUpdate = true;
        }
        if (typeof ad.expiresAt === 'string') {
          updatedAd.expiresAt = new Date(ad.expiresAt);
          needsUpdate = true;
        }

        // Fix missing status
        if (!ad.status) {
          updatedAd.status = 'approved';
          needsUpdate = true;
        }

        // Fix missing payment status
        if (!ad.paymentStatus) {
          updatedAd.paymentStatus = 'completed';
          needsUpdate = true;
        }

        if (needsUpdate) {
          fixedCount++;
        }

        return updatedAd;
      });

      if (fixedCount > 0) {
        localStorage.setItem('demo_ads', JSON.stringify(updatedAds));
        toast.success(`Fixed ${fixedCount} ads with data issues`);
        await runDiagnostics(); // Re-run diagnostics
      } else {
        toast.info('No ad data issues found to fix');
      }

    } catch (error) {
      console.error('Fix failed:', error);
      toast.error('Fix failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const forceSync = async () => {
    try {
      setIsLoading(true);
      
      // Force refresh user ads from service
      const freshUserAds = await realDataService.getUserAds();
      setUserAds(freshUserAds);
      
      // Re-run diagnostics
      await runDiagnostics();
      
      toast.success('Force sync completed');
    } catch (error) {
      console.error('Force sync failed:', error);
      toast.error('Force sync failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  const clearAndRetest = async () => {
    try {
      setIsLoading(true);
      
      // Clear caches and reload
      localStorage.removeItem('demo_ads_index');
      
      // Wait a moment then re-run diagnostics
      setTimeout(async () => {
        await runDiagnostics();
        toast.success('Cache cleared and retested');
        setIsLoading(false);
      }, 1000);
      
    } catch (error) {
      console.error('Clear and retest failed:', error);
      toast.error('Clear and retest failed');
      setIsLoading(false);
    }
  };

  const testAdDetailById = async (adId: string) => {
    try {
      const ad = await realDataService.getAdById(adId);
      if (ad) {
        toast.success(`✅ Ad found: ${ad.title}`);
        onNavigate('ad-detail', { adId });
      } else {
        toast.error(`❌ Ad not found with ID: ${adId}`);
      }
    } catch (error) {
      toast.error('Error testing ad detail: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>🔧 Ad Posting & Viewing Fix</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please log in to use this diagnostic tool.
              </AlertDescription>
            </Alert>
            <div className="mt-4">
              <Button onClick={() => onNavigate('login')}>
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button 
          variant="outline" 
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
        <h1 className="text-2xl font-bold">🔧 Ad Posting & Viewing Fix</h1>
      </div>

      <Tabs defaultValue="diagnostics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
          <TabsTrigger value="fixes">Auto Fixes</TabsTrigger>
          <TabsTrigger value="manual">Manual Testing</TabsTrigger>
          <TabsTrigger value="data">Raw Data</TabsTrigger>
        </TabsList>

        <TabsContent value="diagnostics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="h-5 w-5" />
                System Diagnostics
              </CardTitle>
              <Button 
                onClick={runDiagnostics}
                disabled={isLoading}
                className="w-fit"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Run Diagnostics
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* User Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">User Information</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <div>ID: {diagnostics.userInfo?.userId || 'N/A'}</div>
                    <div>Email: {diagnostics.userInfo?.userEmail || 'N/A'}</div>
                    <div>Role: {diagnostics.userInfo?.userRole || 'N/A'}</div>
                    <div>Authenticated: {diagnostics.userInfo?.isAuthenticated ? '✅' : '❌'}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Data Status</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <div>Total LocalStorage Ads: {diagnostics.localStorage?.totalAds || 0}</div>
                    <div>User's LocalStorage Ads: {diagnostics.userLocalAds?.count || 0}</div>
                    <div>Service User Ads: {diagnostics.serviceUserAds?.count || 0}</div>
                    <div>Ad Detail Test: {diagnostics.adDetailTest?.success ? '✅' : '❌'}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Issues Found */}
              {fixResults.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-medium mb-2">Issues Detected:</div>
                    <ul className="list-disc list-inside space-y-1">
                      {fixResults.map((fix, index) => (
                        <li key={index}>{fix}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Data Consistency */}
              {diagnostics.dataConsistency && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Data Consistency Check</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div>User ID Consistency: {diagnostics.dataConsistency.hasConsistentUserIds ? '✅' : '❌'}</div>
                        <div>Email Consistency: {diagnostics.dataConsistency.hasConsistentEmails ? '✅' : '❌'}</div>
                      </div>
                      <div>
                        <div>User ID Format: {diagnostics.dataConsistency.userIdFormat}</div>
                        <div>User ID Length: {diagnostics.dataConsistency.userIdLength}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fixes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automatic Fixes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={fixUserIdIssues}
                  disabled={isLoading}
                  className="h-20 flex flex-col items-center justify-center"
                >
                  <User className="h-6 w-6 mb-2" />
                  Fix User Association Issues
                </Button>

                <Button 
                  onClick={fixAdDetailLoading}
                  disabled={isLoading}
                  className="h-20 flex flex-col items-center justify-center"
                >
                  <Eye className="h-6 w-6 mb-2" />
                  Fix Ad Detail Loading
                </Button>

                <Button 
                  onClick={forceSync}
                  disabled={isLoading}
                  className="h-20 flex flex-col items-center justify-center"
                >
                  <RefreshCw className="h-6 w-6 mb-2" />
                  Force Sync Data
                </Button>

                <Button 
                  onClick={clearAndRetest}
                  disabled={isLoading}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center"
                >
                  <Database className="h-6 w-6 mb-2" />
                  Clear Cache & Retest
                </Button>
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  These fixes will attempt to resolve common issues with ad posting and viewing. 
                  Run diagnostics first to identify specific problems.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Manual Testing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Test Ad Detail Loading</h3>
                  <div className="space-y-2">
                    {localAds.slice(0, 5).map((ad) => (
                      <div key={ad.id} className="flex items-center gap-2 p-2 border rounded">
                        <div className="flex-1 text-sm">
                          <div className="font-medium">{ad.title}</div>
                          <div className="text-gray-500">ID: {ad.id}</div>
                        </div>
                        <Button 
                          size="sm"
                          onClick={() => testAdDetailById(ad.id)}
                        >
                          Test Load
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Quick Actions</h3>
                  <div className="flex gap-2">
                    <Button onClick={() => onNavigate('my-ads')}>
                      Go to My Ads
                    </Button>
                    <Button onClick={() => onNavigate('post-ad')}>
                      Post New Ad
                    </Button>
                    <Button onClick={() => onNavigate('home')}>
                      View Homepage
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Raw Data View</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">User's Ads ({userAds.length})</h3>
                  <div className="max-h-96 overflow-y-auto">
                    <pre className="text-xs bg-gray-100 p-4 rounded">
                      {JSON.stringify(userAds, null, 2)}
                    </pre>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Diagnostics Results</h3>
                  <div className="max-h-96 overflow-y-auto">
                    <pre className="text-xs bg-gray-100 p-4 rounded">
                      {JSON.stringify(diagnostics, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}