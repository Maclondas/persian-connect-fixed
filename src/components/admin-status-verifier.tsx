import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { useAuth } from './hooks/useAuth';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner';
import { CheckCircle, XCircle, User, Crown, Eye, AlertTriangle } from 'lucide-react';

interface AdminStatusVerifierProps {
  onNavigate?: (page: string) => void;
}

export function AdminStatusVerifier({ onNavigate }: AdminStatusVerifierProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const [adminStatus, setAdminStatus] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  const checkAdminStatus = async () => {
    if (!isAuthenticated || !user) {
      toast.error('Please log in first');
      return;
    }

    setLoadingStatus(true);
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e5dee741/admin/debug-status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setAdminStatus(data);
      console.log('Admin status check result:', data);
      
      if (data.currentUser?.isAdmin) {
        toast.success('✅ Admin access confirmed!');
      } else {
        toast.warning('⚠️ No admin access detected');
      }
    } catch (error) {
      console.error('Admin status check error:', error);
      toast.error('Failed to check admin status: ' + error.message);
    } finally {
      setLoadingStatus(false);
    }
  };

  const promoteToAdmin = async () => {
    if (!isAuthenticated || !user) {
      toast.error('Please log in first');
      return;
    }

    try {
      // First try the automatic promotion by accessing the profile endpoint
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e5dee741/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.user?.role === 'admin') {
          toast.success('✅ Admin access activated!');
          setTimeout(() => checkAdminStatus(), 1000);
          return;
        }
      }

      // Fallback to manual promotion endpoint
      const fallbackResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e5dee741/promote-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: user.email,
          secretKey: 'TEMP_ADMIN_KEY_12345'
        })
      });

      if (!fallbackResponse.ok) {
        throw new Error(`HTTP ${fallbackResponse.status}: ${fallbackResponse.statusText}`);
      }

      const data = await fallbackResponse.json();
      toast.success('Successfully promoted to admin!');
      console.log('Promotion result:', data);
      
      // Refresh admin status
      setTimeout(() => checkAdminStatus(), 1000);
    } catch (error) {
      console.error('Promotion error:', error);
      toast.error('Failed to promote to admin: ' + error.message);
    }
  };

  const testAdminAccess = async () => {
    if (!isAuthenticated || !user) {
      toast.error('Please log in first');
      return;
    }

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e5dee741/admin/stats`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('✅ Admin dashboard access confirmed!');
        console.log('Admin stats:', data);
      } else {
        const errorData = await response.json();
        toast.error('❌ Admin access denied: ' + errorData.error);
      }
    } catch (error) {
      console.error('Admin access test error:', error);
      toast.error('Failed to test admin access: ' + error.message);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      checkAdminStatus();
    }
  }, [isAuthenticated, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please log in to check admin status.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button onClick={() => onNavigate?.('login')}>
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Admin Status Verifier</h1>
          <Button variant="outline" onClick={() => onNavigate?.('home')}>
            Back to Home
          </Button>
        </div>

        {/* Current User Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Current User Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">User ID</label>
                <p className="font-mono text-sm bg-muted p-2 rounded">{user?.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="font-mono text-sm bg-muted p-2 rounded">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Admin Status:</span>
              {adminStatus?.currentUser?.isAdmin ? (
                <Badge variant="default" className="bg-green-500">
                  <Crown className="h-3 w-3 mr-1" />
                  Admin
                </Badge>
              ) : (
                <Badge variant="secondary">
                  <User className="h-3 w-3 mr-1" />
                  Regular User
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Admin Status Details */}
        {adminStatus && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Detailed Admin Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted p-3 rounded">
                  <div className="text-sm font-medium text-muted-foreground">Role in Database</div>
                  <div className="text-lg font-semibold">{adminStatus.userData?.role || 'No role set'}</div>
                </div>
                <div className="bg-muted p-3 rounded">
                  <div className="text-sm font-medium text-muted-foreground">Total Ads</div>
                  <div className="text-lg font-semibold">{adminStatus.adAnalysis?.totalAds || 0}</div>
                </div>
                <div className="bg-muted p-3 rounded">
                  <div className="text-sm font-medium text-muted-foreground">Your Ads</div>
                  <div className="text-lg font-semibold">{adminStatus.adAnalysis?.userIdMatches || 0}</div>
                </div>
              </div>

              {adminStatus.adAnalysis?.userIdMatchingAds?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Your Ads:</h4>
                  <div className="space-y-2">
                    {adminStatus.adAnalysis.userIdMatchingAds.map((ad: any) => (
                      <div key={ad.id} className="bg-muted p-2 rounded text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{ad.title}</span>
                          <Badge variant={ad.status === 'approved' ? 'default' : 'secondary'}>
                            {ad.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">ID: {ad.id}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-3">
              <Button 
                onClick={checkAdminStatus} 
                disabled={loadingStatus}
                variant="outline"
              >
                {loadingStatus ? 'Checking...' : 'Refresh Status'}
              </Button>
              
              {!adminStatus?.currentUser?.isAdmin && (
                <Button 
                  onClick={promoteToAdmin}
                  variant="default"
                >
                  Promote to Admin
                </Button>
              )}
              
              <Button 
                onClick={testAdminAccess}
                variant="outline"
              >
                Test Admin Access
              </Button>
              
              {adminStatus?.currentUser?.isAdmin && (
                <>
                  <Button 
                    onClick={() => onNavigate?.('admin')}
                    variant="default"
                  >
                    Go to Admin Dashboard
                  </Button>
                  
                  <Button 
                    onClick={() => onNavigate?.('post-ad')}
                    variant="default"
                  >
                    Test Post Ad
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Expected Values Alert */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Expected Values for Admin Access:</strong><br/>
            • Email: ommzadeh@gmail.com<br/>
            • User ID: user_93ijk5a5h<br/>
            • Role: admin<br/>
            {user?.email === 'ommzadeh@gmail.com' && (
              <span className="text-green-600">✅ Email matches expected admin email</span>
            )}
            {user?.id === 'user_93ijk5a5h' && (
              <span className="text-green-600">✅ User ID matches expected admin ID</span>  
            )}
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}