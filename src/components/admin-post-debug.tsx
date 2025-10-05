import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { RefreshCw, User, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { realDataService } from './services/real-data-service';
import { toast } from 'sonner';

interface AdminPostDebugProps {
  onNavigate: (page: string) => void;
}

export function AdminPostDebug({ onNavigate }: AdminPostDebugProps) {
  const { user: currentUser, loading: authLoading, isAuthenticated, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [testAdResult, setTestAdResult] = useState<any>(null);

  const runDiagnostics = async () => {
    setLoading(true);
    try {
      // Get current user from service
      const serviceUser = realDataService.getCurrentUser();
      
      // Get localStorage data
      const localStorageUser = localStorage.getItem('currentUser');
      const accessToken = localStorage.getItem('accessToken');
      const demoAds = JSON.parse(localStorage.getItem('demo_ads') || '[]');
      
      const info = {
        authHook: {
          user: currentUser,
          isAuthenticated,
          isAdmin,
          loading: authLoading
        },
        service: {
          user: serviceUser,
          hasAccessToken: !!realDataService.getAccessToken()
        },
        localStorage: {
          user: localStorageUser ? JSON.parse(localStorageUser) : null,
          hasAccessToken: !!accessToken,
          totalAds: demoAds.length,
          userAds: demoAds.filter((ad: any) => ad.userEmail === currentUser?.email).length
        },
        adminChecks: {
          isAdminRole: currentUser?.role === 'admin',
          isAdminEmail: currentUser?.email?.toLowerCase() === 'ommzadeh@gmail.com',
          shouldAutoApprove: (currentUser?.role === 'admin' || currentUser?.email?.toLowerCase() === 'ommzadeh@gmail.com')
        }
      };
      
      setDebugInfo(info);
      console.log('🔍 Admin Post Debug Info:', info);
      
    } catch (error) {
      console.error('Error running diagnostics:', error);
      toast.error('Failed to run diagnostics');
    } finally {
      setLoading(false);
    }
  };

  const testAdCreation = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing ad creation for admin...');
      
      const testAdData = {
        title: 'Test Admin Ad',
        titlePersian: 'آگهی آزمایشی ادمین',
        description: 'This is a test ad to debug admin posting issues.',
        descriptionPersian: 'این یک آگهی آزمایشی برای عیب‌یابی مشکلات پست ادمین است.',
        price: 100,
        priceType: 'fixed' as const,
        currency: 'USD',
        category: 'digital-goods',
        subcategory: 'phones',
        location: { country: 'United Kingdom', city: 'London' },
        images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300'],
        contactInfo: { 
          email: currentUser?.email || 'test@test.com',
          phone: '+44 123 456 789'
        }
      };
      
      console.log('📝 Creating test ad with data:', testAdData);
      const result = await realDataService.createAd(testAdData);
      
      setTestAdResult({
        success: true,
        ad: result,
        message: 'Test ad created successfully!'
      });
      
      console.log('✅ Test ad created:', result);
      toast.success('Test ad created successfully!');
      
      // Refresh diagnostics to show updated data
      await runDiagnostics();
      
    } catch (error) {
      console.error('❌ Test ad creation failed:', error);
      setTestAdResult({
        success: false,
        error: error.message,
        message: 'Test ad creation failed'
      });
      toast.error(`Test ad creation failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearTestAds = () => {
    try {
      const demoAds = JSON.parse(localStorage.getItem('demo_ads') || '[]');
      const filteredAds = demoAds.filter((ad: any) => !ad.title.includes('Test Admin Ad'));
      localStorage.setItem('demo_ads', JSON.stringify(filteredAds));
      
      toast.success('Test ads cleared');
      runDiagnostics();
    } catch (error) {
      console.error('Error clearing test ads:', error);
      toast.error('Failed to clear test ads');
    }
  };

  useEffect(() => {
    if (!authLoading) {
      runDiagnostics();
    }
  }, [authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Post Debug</h1>
            <p className="text-muted-foreground">Debug admin ad posting issues</p>
          </div>
          <Button onClick={() => onNavigate('admin')} variant="outline">
            Back to Admin
          </Button>
        </div>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Debug Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button 
                onClick={runDiagnostics}
                disabled={loading}
                variant="outline"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Run Diagnostics
              </Button>
              <Button 
                onClick={testAdCreation}
                disabled={loading}
                className="bg-primary hover:bg-primary/90"
              >
                Test Ad Creation
              </Button>
              <Button 
                onClick={clearTestAds}
                disabled={loading}
                variant="destructive"
              >
                Clear Test Ads
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Debug Information */}
        {debugInfo && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Auth Hook Info */}
            <Card>
              <CardHeader>
                <CardTitle>Auth Hook Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Authenticated:</span>
                  <Badge variant={debugInfo.authHook.isAuthenticated ? "default" : "destructive"}>
                    {debugInfo.authHook.isAuthenticated ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Is Admin:</span>
                  <Badge variant={debugInfo.authHook.isAdmin ? "default" : "secondary"}>
                    {debugInfo.authHook.isAdmin ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div><strong>Email:</strong> {debugInfo.authHook.user?.email || 'None'}</div>
                  <div><strong>Role:</strong> {debugInfo.authHook.user?.role || 'None'}</div>
                  <div><strong>ID:</strong> {debugInfo.authHook.user?.id || 'None'}</div>
                </div>
              </CardContent>
            </Card>

            {/* Service Info */}
            <Card>
              <CardHeader>
                <CardTitle>Data Service Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Has User:</span>
                  <Badge variant={debugInfo.service.user ? "default" : "destructive"}>
                    {debugInfo.service.user ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Has Token:</span>
                  <Badge variant={debugInfo.service.hasAccessToken ? "default" : "destructive"}>
                    {debugInfo.service.hasAccessToken ? 'Yes' : 'No'}
                  </Badge>
                </div>
                {debugInfo.service.user && (
                  <div className="space-y-1">
                    <div><strong>Service Email:</strong> {debugInfo.service.user.email}</div>
                    <div><strong>Service Role:</strong> {debugInfo.service.user.role || 'None'}</div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* LocalStorage Info */}
            <Card>
              <CardHeader>
                <CardTitle>LocalStorage Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>User Stored:</span>
                  <Badge variant={debugInfo.localStorage.user ? "default" : "destructive"}>
                    {debugInfo.localStorage.user ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Total Ads:</span>
                  <Badge variant="secondary">
                    {debugInfo.localStorage.totalAds}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Your Ads:</span>
                  <Badge variant="secondary">
                    {debugInfo.localStorage.userAds}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Admin Checks */}
            <Card>
              <CardHeader>
                <CardTitle>Admin Validation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Admin Role:</span>
                  <Badge variant={debugInfo.adminChecks.isAdminRole ? "default" : "secondary"}>
                    {debugInfo.adminChecks.isAdminRole ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Admin Email:</span>
                  <Badge variant={debugInfo.adminChecks.isAdminEmail ? "default" : "secondary"}>
                    {debugInfo.adminChecks.isAdminEmail ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Should Auto-Approve:</span>
                  <Badge variant={debugInfo.adminChecks.shouldAutoApprove ? "default" : "destructive"}>
                    {debugInfo.adminChecks.shouldAutoApprove ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Test Result */}
        {testAdResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {testAdResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                Test Ad Creation Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Status:</span>
                  <Badge variant={testAdResult.success ? "default" : "destructive"}>
                    {testAdResult.success ? 'Success' : 'Failed'}
                  </Badge>
                </div>
                <div>
                  <strong>Message:</strong> {testAdResult.message}
                </div>
                {testAdResult.error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded">
                    <strong>Error:</strong> {testAdResult.error}
                  </div>
                )}
                {testAdResult.ad && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded">
                    <div><strong>Ad ID:</strong> {testAdResult.ad.id}</div>
                    <div><strong>Status:</strong> {testAdResult.ad.status}</div>
                    <div><strong>Payment Status:</strong> {testAdResult.ad.paymentStatus}</div>
                    <div><strong>User Email:</strong> {testAdResult.ad.userEmail}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button onClick={() => onNavigate('post-ad')} variant="outline">
                Try Post Ad Page
              </Button>
              <Button onClick={() => onNavigate('my-ads')} variant="outline">
                View My Ads
              </Button>
              <Button onClick={() => onNavigate('admin-quick')} variant="outline">
                Admin Quick Actions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}