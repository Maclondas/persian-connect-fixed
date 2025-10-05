import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { toast } from 'sonner';
import { Loader2, CheckCircle, XCircle, AlertCircle, RefreshCw, Database, Server, Eye } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import realDataService from './services/real-data-service';
import { useAuth } from './hooks/useAuth';

interface NavigateFunction {
  (page: 'home'): void;
}

interface BackendConnectionTesterProps {
  onNavigate: NavigateFunction;
}

export function BackendConnectionTester({ onNavigate }: BackendConnectionTesterProps) {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    backendHealth: 'success' | 'error' | 'loading' | null;
    backendHealthDetails: any;
    adsFetch: 'success' | 'error' | 'loading' | null;
    adsDetails: any;
    localStorage: 'success' | 'error' | 'loading' | null;
    localStorageDetails: any;
    recommendation: string;
  }>({
    backendHealth: null,
    backendHealthDetails: null,
    adsFetch: null,
    adsDetails: null,
    localStorage: null,
    localStorageDetails: null,
    recommendation: ''
  });

  const { user: currentUser, isAdmin } = useAuth();

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    setLoading(true);
    setResults(prev => ({
      ...prev,
      backendHealth: 'loading',
      adsFetch: 'loading',
      localStorage: 'loading'
    }));

    // 1. Test backend health
    try {
      console.log('🔍 Testing backend health...');
      const healthUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e5dee741/health`;
      const healthResponse = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
      });

      const healthData = await healthResponse.json();
      console.log('✅ Backend health response:', healthData);

      setResults(prev => ({
        ...prev,
        backendHealth: healthResponse.ok ? 'success' : 'error',
        backendHealthDetails: {
          status: healthResponse.status,
          data: healthData,
          url: healthUrl
        }
      }));
    } catch (error) {
      console.error('❌ Backend health check failed:', error);
      setResults(prev => ({
        ...prev,
        backendHealth: 'error',
        backendHealthDetails: {
          error: error.message,
          type: 'network_error'
        }
      }));
    }

    // 2. Test ads fetch
    try {
      console.log('🔍 Testing ads fetch...');
      const adsUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e5dee741/ads`;
      const adsResponse = await fetch(adsUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
      });

      const adsData = await adsResponse.json();
      console.log('📦 Backend ads response:', adsData);

      setResults(prev => ({
        ...prev,
        adsFetch: adsResponse.ok ? 'success' : 'error',
        adsDetails: {
          status: adsResponse.status,
          data: adsData,
          totalAds: adsData?.ads?.length || 0,
          approvedAds: adsData?.ads?.filter((ad: any) => ad.status === 'approved')?.length || 0
        }
      }));
    } catch (error) {
      console.error('❌ Ads fetch failed:', error);
      setResults(prev => ({
        ...prev,
        adsFetch: 'error',
        adsDetails: {
          error: error.message,
          type: 'network_error'
        }
      }));
    }

    // 3. Check localStorage
    try {
      const localAds = JSON.parse(localStorage.getItem('demo_ads') || '[]');
      const approvedLocalAds = localAds.filter((ad: any) => ad.status === 'approved');
      console.log('💾 Local storage check:', {
        total: localAds.length,
        approved: approvedLocalAds.length,
        sample: localAds.slice(0, 2)
      });

      setResults(prev => ({
        ...prev,
        localStorage: 'success',
        localStorageDetails: {
          totalAds: localAds.length,
          approvedAds: approvedLocalAds.length,
          pendingAds: localAds.filter((ad: any) => ad.status === 'pending').length,
          isUsingDemo: realDataService.isDemoMode()
        }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        localStorage: 'error',
        localStorageDetails: { error: error.message }
      }));
    }

    // Generate recommendation
    setTimeout(() => {
      generateRecommendation();
      setLoading(false);
    }, 1000);
  };

  const generateRecommendation = () => {
    const { backendHealth, adsFetch, localStorage: localCheck } = results;
    
    let recommendation = '';
    
    if (backendHealth === 'success' && adsFetch === 'success') {
      recommendation = '✅ Backend is working! Your app should use the real database instead of localStorage. Consider forcing backend mode.';
    } else if (backendHealth === 'error' || adsFetch === 'error') {
      recommendation = '⚠️ Backend is not accessible. App is using localStorage demo mode. Ads are only visible in your browser session.';
    } else {
      recommendation = '🔄 Still testing...';
    }

    setResults(prev => ({ ...prev, recommendation }));
  };

  const forceBackendMode = async () => {
    try {
      setLoading(true);
      toast.info('Forcing backend connection...');
      
      // Clear demo mode flag if it exists
      localStorage.removeItem('force_demo_mode');
      
      // Test the service again
      const testResult = await realDataService.getAds();
      console.log('🔄 Force backend test result:', testResult);
      
      if (testResult && !realDataService.isDemoMode()) {
        toast.success('✅ Successfully connected to backend!');
        setTimeout(() => onNavigate('home'), 1500);
      } else {
        toast.error('❌ Backend connection still not working');
      }
    } catch (error) {
      console.error('Error forcing backend mode:', error);
      toast.error('Failed to connect to backend');
    } finally {
      setLoading(false);
    }
  };

  const migrateLocalAdsToBackend = async () => {
    if (!currentUser || !isAdmin) {
      toast.error('Admin access required for migration');
      return;
    }

    try {
      setLoading(true);
      toast.info('Migrating local ads to backend...');
      
      const localAds = JSON.parse(localStorage.getItem('demo_ads') || '[]');
      let migrated = 0;
      let errors = 0;

      for (const ad of localAds) {
        try {
          // Try to create the ad in the backend
          const backendUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e5dee741/ads`;
          const response = await fetch(backendUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(ad)
          });

          if (response.ok) {
            migrated++;
          } else {
            errors++;
          }
        } catch (error) {
          errors++;
        }
      }

      if (migrated > 0) {
        toast.success(`✅ Migrated ${migrated} ads to backend! ${errors > 0 ? `(${errors} failed)` : ''}`);
        // Clear local storage after successful migration
        if (errors === 0) {
          localStorage.removeItem('demo_ads');
        }
      } else {
        toast.error('❌ No ads were migrated successfully');
      }
    } catch (error) {
      console.error('Migration error:', error);
      toast.error('Failed to migrate ads');
    } finally {
      setLoading(false);
    }
  };

  const StatusIcon = ({ status }: { status: 'success' | 'error' | 'loading' | null }) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'loading': return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl">Backend Connection Diagnostics</h1>
          <p className="text-muted-foreground">
            Diagnosing why your ads aren't visible to other users
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Backend Health */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Backend Health
                <StatusIcon status={results.backendHealth} />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {results.backendHealthDetails && (
                <div className="text-sm space-y-1">
                  <div>Status: <Badge variant={results.backendHealth === 'success' ? 'default' : 'destructive'}>
                    {results.backendHealthDetails.status || 'Error'}
                  </Badge></div>
                  {results.backendHealthDetails.data && (
                    <div className="text-xs text-muted-foreground">
                      KV Available: {results.backendHealthDetails.data.kv_available ? '✅' : '❌'}
                    </div>
                  )}
                  {results.backendHealthDetails.error && (
                    <div className="text-xs text-red-500">
                      Error: {results.backendHealthDetails.error}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ads Fetch */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Ads Database
                <StatusIcon status={results.adsFetch} />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {results.adsDetails && (
                <div className="text-sm space-y-1">
                  {results.adsDetails.totalAds !== undefined && (
                    <>
                      <div>Total Ads: <Badge>{results.adsDetails.totalAds}</Badge></div>
                      <div>Approved Ads: <Badge variant="secondary">{results.adsDetails.approvedAds}</Badge></div>
                    </>
                  )}
                  {results.adsDetails.error && (
                    <div className="text-xs text-red-500">
                      Error: {results.adsDetails.error}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Local Storage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Local Storage (Demo Mode)
                <StatusIcon status={results.localStorage} />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {results.localStorageDetails && (
                <div className="text-sm space-y-1">
                  <div>Demo Mode: <Badge variant={results.localStorageDetails.isUsingDemo ? 'destructive' : 'default'}>
                    {results.localStorageDetails.isUsingDemo ? 'Active' : 'Inactive'}
                  </Badge></div>
                  <div>Local Ads: <Badge>{results.localStorageDetails.totalAds || 0}</Badge></div>
                  <div>Approved: <Badge variant="secondary">{results.localStorageDetails.approvedAds || 0}</Badge></div>
                  <div>Pending: <Badge variant="outline">{results.localStorageDetails.pendingAds || 0}</Badge></div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recommendation */}
          <Card>
            <CardHeader>
              <CardTitle>Recommendation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {results.recommendation || 'Running diagnostics...'}
              </p>
            </CardContent>
          </Card>
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg">Actions</h3>
          <div className="flex flex-wrap gap-3">
            <Button onClick={runDiagnostics} disabled={loading} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Re-run Diagnostics
            </Button>
            
            {results.backendHealth === 'success' && (
              <Button onClick={forceBackendMode} disabled={loading}>
                Force Backend Connection
              </Button>
            )}
            
            {currentUser && isAdmin && results.localStorageDetails?.totalAds > 0 && (
              <Button onClick={migrateLocalAdsToBackend} disabled={loading} variant="secondary">
                Migrate Local Ads to Backend
              </Button>
            )}
            
            <Button onClick={() => onNavigate('home')} variant="outline">
              Back to Home
            </Button>
          </div>
        </div>

        {/* Technical Details */}
        <Card>
          <CardHeader>
            <CardTitle>Technical Details</CardTitle>
            <CardDescription>For debugging purposes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div><strong>Project ID:</strong> {projectId}</div>
            <div><strong>Current User:</strong> {currentUser?.email || 'Not logged in'}</div>
            <div><strong>Is Admin:</strong> {isAdmin ? 'Yes' : 'No'}</div>
            <div><strong>Backend URL:</strong> https://{projectId}.supabase.co/functions/v1/make-server-e5dee741</div>
            <div><strong>Demo Mode:</strong> {realDataService.isDemoMode() ? 'Active' : 'Inactive'}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}