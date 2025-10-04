import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ArrowLeft, RefreshCw, User, LogIn, LogOut, TestTube, AlertTriangle, Zap } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import realDataService from './services/real-data-service';
import { toast } from 'sonner@2.0.3';
import { AuthTestComponent } from './auth-test-component';
import { LoginDebugTool } from './login-debug-tool';
import { LoginTroubleshootGuide } from './login-troubleshoot-guide';
import { AuthQuickFix } from './auth-quick-fix';
import { LoginTestDebug } from './login-test-debug';

interface NavigateFunction {
  (page: 'home' | 'login'): void;
}

interface AuthDebugPageProps {
  onNavigate: NavigateFunction;
}

export function AuthDebugPage({ onNavigate }: AuthDebugPageProps) {
  const { user, isAuthenticated, loading, authChecked, refreshAuth, signOut } = useAuth();
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const updateAuthStatus = () => {
    const status = realDataService.getAuthStatus();
    const localStorageInfo = {
      currentUser: localStorage.getItem('currentUser') ? 'present' : 'missing',
      accessToken: localStorage.getItem('accessToken') ? 'present' : 'missing',
      pc_current_user: localStorage.getItem('pc_current_user') ? 'present' : 'missing',
      pc_access_token: localStorage.getItem('pc_access_token') ? 'present' : 'missing',
    };
    
    setAuthStatus({
      ...status,
      localStorageInfo,
      useAuthState: {
        hasUser: !!user,
        userEmail: user?.email,
        isAuthenticated,
        loading,
        authChecked
      }
    });
  };

  useEffect(() => {
    updateAuthStatus();
  }, [user, isAuthenticated, loading, authChecked]);

  const handleClearCache = async () => {
    try {
      // Clear localStorage
      localStorage.clear();
      
      // Clear service worker cache
      if ('serviceWorker' in navigator && 'caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }
      
      toast.success('Cache cleared! Please refresh the page.');
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('Error clearing cache:', error);
      toast.error('Failed to clear cache');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const refreshedUser = await refreshAuth();
      updateAuthStatus();
      if (refreshedUser) {
        toast.success(`Session refreshed for ${refreshedUser.email}`);
      } else {
        toast.info('No valid session found');
      }
    } catch (error) {
      toast.error('Failed to refresh session');
    } finally {
      setRefreshing(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      updateAuthStatus();
      toast.success('Signed out successfully');
    } catch (error) {
      toast.error('Sign out failed');
    }
  };

  const handleTestLogin = async () => {
    try {
      // Navigate to login page for testing
      onNavigate('login');
    } catch (error) {
      toast.error('Failed to navigate to login');
    }
  };

  const handleTestGoogleOAuth = async () => {
    try {
      console.log('🧪 Testing Google OAuth directly...');
      
      // Import the client directly for testing
      const { getSupabaseClient } = await import('../../utils/supabase/client');
      const supabase = getSupabaseClient();
      
      if (!supabase) {
        toast.error('Supabase client not available');
        return;
      }
      
      console.log('📍 Current URL:', window.location.href);
      console.log('📍 Origin:', window.location.origin);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      console.log('📊 Direct OAuth test result:', { data, error });
      
      if (error) {
        console.error('❌ Direct OAuth test error:', error);
        toast.error(`OAuth Error: ${error.message}`);
        
        // Show specific error details
        if (error.message.includes('provider not enabled')) {
          toast.error('Google provider is not enabled in Supabase');
        } else if (error.message.includes('Invalid provider')) {
          toast.error('Google provider configuration is invalid');
        } else if (error.message.includes('redirect_uri_mismatch')) {
          toast.error('Redirect URI mismatch - check Google Console and Supabase settings');
        }
      } else {
        toast.success('OAuth initiated - should redirect to Google');
      }
    } catch (error: any) {
      console.error('🔥 Direct OAuth test failed:', error);
      toast.error(`Test failed: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-2xl font-bold">Authentication Debug</h1>
        </div>

        {/* Quick Fix Tools */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Fix Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AuthQuickFix />
          </CardContent>
        </Card>

        {/* Current Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Current Authentication Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Is Authenticated:</span>
                <span className={isAuthenticated ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                  {isAuthenticated ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>User Email:</span>
                <span className="font-mono">{user?.email || 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span>User Role:</span>
                <span>{user?.role || 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span>Auth Provider:</span>
                <span>{user?.authProvider || 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span>Loading:</span>
                <span>{loading ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span>Auth Checked:</span>
                <span>{authChecked ? 'Yes' : 'No'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Google OAuth Configuration */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Google OAuth Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>Current Domain:</span>
                <span className="font-mono text-sm">{window.location.origin}</span>
              </div>
              <div className="flex justify-between">
                <span>Expected Redirect URL:</span>
                <span className="font-mono text-sm">{window.location.origin}/</span>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Required Supabase Settings:</p>
                <ul className="text-xs space-y-1 bg-muted p-3 rounded">
                  <li>• Site URL: <code>{window.location.origin}</code></li>
                  <li>• Redirect URLs: <code>{window.location.origin}/**</code></li>
                  <li>• Google Provider: Enabled</li>
                </ul>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Required Google Console Settings:</p>
                <ul className="text-xs space-y-1 bg-muted p-3 rounded">
                  <li>• Authorized origins: <code>{window.location.origin}</code></li>
                  <li>• Authorized redirect URIs: <code>https://tnnaitaovinhtgoqtuvs.supabase.co/auth/v1/callback</code></li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Detailed Authentication Status</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded-md overflow-auto">
              {JSON.stringify(authStatus, null, 2)}
            </pre>
          </CardContent>
        </Card>

        {/* Backend Connection Test */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Backend Connection Test
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AuthTestComponent />
          </CardContent>
        </Card>

        {/* Login Debug Tool */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogIn className="h-5 w-5" />
              Comprehensive Login Debug
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LoginDebugTool />
          </CardContent>
        </Card>

        {/* Troubleshooting Guide */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Step-by-Step Troubleshooting
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LoginTroubleshootGuide />
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={handleRefresh} 
                disabled={refreshing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh Auth
              </Button>
              
              <Button 
                onClick={handleTestLogin}
                variant="outline"
                className="flex items-center gap-2"
              >
                <LogIn className="h-4 w-4" />
                Test Login
              </Button>
              
              <Button 
                onClick={handleClearCache}
                variant="destructive"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Clear Cache & Reload
              </Button>
              
              <Button 
                onClick={handleTestGoogleOAuth}
                variant="outline"
                className="flex items-center gap-2 bg-blue-500 text-white hover:bg-blue-600"
              >
                <User className="h-4 w-4" />
                Test Google OAuth
              </Button>
              
              {isAuthenticated && (
                <Button 
                  onClick={handleSignOut}
                  variant="destructive"
                  className="flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Login Test Debug Tool */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Login Test & Debug Tool
            </CardTitle>
          </CardHeader>
          <CardContent>
            <LoginTestDebug />
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Troubleshooting Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• If you see "Invalid email or password", make sure you're using the correct credentials</li>
              <li>• If authentication persists after login, try refreshing the page</li>
              <li>• Check the browser console for detailed error messages</li>
              <li>• Try clearing browser cache and local storage if issues persist</li>
              <li>• For demo mode, any email/password combination should work</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}