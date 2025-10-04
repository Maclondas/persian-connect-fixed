import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useAuth } from './hooks/useAuth';
import { Shield, User, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import realDataService from './services/real-data-service';

interface AdminStatusCheckerProps {
  onNavigate: (page: string) => void;
}

export function AdminStatusChecker({ onNavigate }: AdminStatusCheckerProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const [statusInfo, setStatusInfo] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    refreshStatus();
  }, [user]);

  const refreshStatus = async () => {
    setIsRefreshing(true);
    try {
      const authStatus = realDataService.getAuthStatus();
      const currentUser = realDataService.getCurrentUser();
      
      setStatusInfo({
        ...authStatus,
        user: currentUser,
        isAuthenticated,
        loading
      });
    } catch (error) {
      console.error('Error getting status:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Status Checker</h1>
          <Button
            onClick={refreshStatus}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Authentication Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {isAuthenticated ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span>Authenticated</span>
                </div>
                <div className="flex items-center gap-2">
                  {statusInfo?.hasUser ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span>Has User Data</span>
                </div>
                <div className="flex items-center gap-2">
                  {statusInfo?.hasToken ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <span>Has Auth Token</span>
                </div>
                <div className="flex items-center gap-2">
                  {statusInfo?.isDemoMode ? (
                    <Badge variant="secondary">Demo Mode</Badge>
                  ) : (
                    <Badge variant="default">Production Mode</Badge>
                  )}
                </div>
              </div>
              
              {user && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <Badge 
                      variant={user.role === 'admin' ? 'default' : 'secondary'}
                      className={user.role === 'admin' ? 'bg-yellow-500 text-black' : ''}
                    >
                      {user.role === 'admin' ? '👑 ADMIN' : 'USER'}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Provider: {user.authProvider || 'unknown'}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Username: {user.username || 'Not set'}
                  </div>
                </div>
              )}
            </div>

            {!isAuthenticated && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 font-medium">Not authenticated</p>
                <p className="text-yellow-700 text-sm mt-1">
                  Please log in to check your admin status.
                </p>
              </div>
            )}

            {user?.role === 'admin' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium">✅ Admin Access Confirmed</p>
                <p className="text-green-700 text-sm mt-1">
                  You have administrator privileges. The admin panel should be available in your user menu.
                </p>
                <Button 
                  onClick={() => onNavigate('admin')}
                  className="mt-3"
                  size="sm"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Go to Admin Panel
                </Button>
              </div>
            )}

            {user && user.role !== 'admin' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 font-medium">Regular User Account</p>
                <p className="text-blue-700 text-sm mt-1">
                  Your account: {user.email}
                </p>
                <p className="text-blue-700 text-sm">
                  Admin privileges are only available for: ommzadeh@gmail.com
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              onClick={() => onNavigate('home')}
              variant="outline"
              className="w-full justify-start"
            >
              Go to Homepage
            </Button>
            {!isAuthenticated && (
              <Button 
                onClick={() => onNavigate('login')}
                className="w-full justify-start"
              >
                Sign In / Sign Up
              </Button>
            )}
            {user?.role === 'admin' && (
              <>
                <Button 
                  onClick={() => onNavigate('admin')}
                  className="w-full justify-start bg-yellow-500 hover:bg-yellow-600 text-black"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Dashboard
                </Button>
                <Button 
                  onClick={() => onNavigate('post-ad')}
                  className="w-full justify-start"
                  variant="outline"
                >
                  Post Ad (Admin - No Payment)
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Debug Information */}
        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-60">
              {JSON.stringify(statusInfo, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}