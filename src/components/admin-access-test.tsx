import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, XCircle, Shield, RefreshCw, User, Key, Database } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { realDataService } from './services/real-data-service';
import { toast } from 'sonner@2.0.3';

interface AdminAccessTestProps {
  onNavigate: (page: string) => void;
}

export function AdminAccessTest({ onNavigate }: AdminAccessTestProps) {
  const { user, isAuthenticated, isAdmin, refreshAuth } = useAuth();
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runAdminTests = async () => {
    setLoading(true);
    console.log('🧪 Running comprehensive admin access tests...');
    
    const results = {
      timestamp: new Date().toISOString(),
      authService: {
        isAuthenticated: isAuthenticated,
        hasUser: !!user,
        userEmail: user?.email || null,
        userRole: user?.role || null,
        isAdmin: isAdmin,
        accessToken: !!realDataService.getAccessToken(),
        tokenLength: realDataService.getAccessToken()?.length || 0
      },
      localStorage: {
        currentUser: !!localStorage.getItem('currentUser'),
        accessToken: !!localStorage.getItem('accessToken'),
        oldAccessToken: !!localStorage.getItem('access_token'),
        userRole: localStorage.getItem('userRole'),
        isAuthenticated: localStorage.getItem('isAuthenticated')
      },
      adminStatus: {
        canAccessAdmin: false,
        reason: 'Unknown'
      }
    };

    // Test admin access logic
    if (!results.authService.isAuthenticated) {
      results.adminStatus.reason = 'Not authenticated';
    } else if (!results.authService.hasUser) {
      results.adminStatus.reason = 'No user data';
    } else if (!results.authService.isAdmin && user?.email !== 'ommzadeh@gmail.com') {
      results.adminStatus.reason = 'Not admin role and not admin email';
    } else if (!results.authService.accessToken) {
      results.adminStatus.reason = 'No access token';
    } else {
      results.adminStatus.canAccessAdmin = true;
      results.adminStatus.reason = 'All checks passed';
    }

    // Test backend connectivity
    try {
      const stats = await realDataService.getAdminStats();
      results.backendTest = {
        success: true,
        stats: stats
      };
    } catch (error) {
      results.backendTest = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    console.log('📊 Admin test results:', results);
    setTestResults(results);
    setLoading(false);
  };

  const createEmergencyAdmin = () => {
    console.log('🚨 Creating emergency admin account...');
    
    // Clear existing auth
    localStorage.clear();
    
    // Create admin user
    const adminUser = {
      id: 'emergency-admin-' + Date.now(),
      username: 'admin',
      email: 'ommzadeh@gmail.com',
      name: 'Emergency Admin',
      role: 'admin',
      authProvider: 'emergency',
      createdAt: new Date(),
      isBlocked: false,
      termsAccepted: {
        accepted: true,
        acceptedAt: new Date(),
        version: '1.0'
      }
    };
    
    const adminToken = 'emergency-admin-token-' + Date.now();
    
    // Store in localStorage with correct keys
    localStorage.setItem('currentUser', JSON.stringify(adminUser));
    localStorage.setItem('accessToken', adminToken);
    localStorage.setItem('access_token', adminToken); // Backward compatibility
    
    // Update real data service
    realDataService.saveCurrentUser(adminUser, adminToken);
    
    toast.success('Emergency admin account created!');
    console.log('✅ Emergency admin created:', adminUser);
    
    // Refresh auth state
    refreshAuth();
    
    // Run tests again
    setTimeout(() => runAdminTests(), 1000);
  };

  const fixAuthIssues = async () => {
    setLoading(true);
    console.log('🔧 Attempting to fix auth issues...');
    
    try {
      // Refresh authentication
      await refreshAuth();
      
      // Wait a moment then run tests
      setTimeout(() => {
        runAdminTests();
        toast.success('Auth state refreshed');
      }, 1000);
    } catch (error) {
      console.error('Failed to fix auth issues:', error);
      toast.error('Failed to fix auth issues');
      setLoading(false);
    }
  };

  useEffect(() => {
    runAdminTests();
  }, [user, isAuthenticated]);

  const StatusIcon = ({ success }: { success: boolean }) => (
    success ? <CheckCircle className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="w-8 h-8 text-primary" />
              Admin Access Test
            </h1>
            <p className="text-muted-foreground">Comprehensive admin access diagnostics</p>
          </div>
          <div className="space-x-2">
            <Button onClick={runAdminTests} disabled={loading} variant="outline">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Run Tests
            </Button>
            <Button onClick={() => onNavigate('home')} variant="ghost">
              Back to Home
            </Button>
          </div>
        </div>

        {testResults && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Auth Service Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Authentication Service
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Authenticated</span>
                  <div className="flex items-center gap-2">
                    <StatusIcon success={testResults.authService.isAuthenticated} />
                    <Badge variant={testResults.authService.isAuthenticated ? 'default' : 'destructive'}>
                      {testResults.authService.isAuthenticated ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Has User</span>
                  <div className="flex items-center gap-2">
                    <StatusIcon success={testResults.authService.hasUser} />
                    <Badge variant={testResults.authService.hasUser ? 'default' : 'destructive'}>
                      {testResults.authService.hasUser ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>User Email</span>
                  <Badge variant="outline">{testResults.authService.userEmail || 'None'}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>User Role</span>
                  <Badge variant={testResults.authService.userRole === 'admin' ? 'default' : 'secondary'}>
                    {testResults.authService.userRole || 'None'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Is Admin</span>
                  <div className="flex items-center gap-2">
                    <StatusIcon success={testResults.authService.isAdmin} />
                    <Badge variant={testResults.authService.isAdmin ? 'default' : 'destructive'}>
                      {testResults.authService.isAdmin ? 'Yes' : 'No'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Access Token</span>
                  <div className="flex items-center gap-2">
                    <StatusIcon success={testResults.authService.accessToken} />
                    <Badge variant={testResults.authService.accessToken ? 'default' : 'destructive'}>
                      {testResults.authService.tokenLength > 0 ? `${testResults.authService.tokenLength} chars` : 'None'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* LocalStorage Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5" />
                  LocalStorage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span>Current User</span>
                  <div className="flex items-center gap-2">
                    <StatusIcon success={testResults.localStorage.currentUser} />
                    <Badge variant={testResults.localStorage.currentUser ? 'default' : 'destructive'}>
                      {testResults.localStorage.currentUser ? 'Stored' : 'Missing'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Access Token</span>
                  <div className="flex items-center gap-2">
                    <StatusIcon success={testResults.localStorage.accessToken} />
                    <Badge variant={testResults.localStorage.accessToken ? 'default' : 'destructive'}>
                      {testResults.localStorage.accessToken ? 'Stored' : 'Missing'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Legacy Token</span>
                  <div className="flex items-center gap-2">
                    <StatusIcon success={testResults.localStorage.oldAccessToken} />
                    <Badge variant={testResults.localStorage.oldAccessToken ? 'default' : 'secondary'}>
                      {testResults.localStorage.oldAccessToken ? 'Present' : 'None'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Admin Access Status */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Admin Access Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert variant={testResults.adminStatus.canAccessAdmin ? 'default' : 'destructive'}>
                  <AlertDescription className="flex items-center gap-2">
                    <StatusIcon success={testResults.adminStatus.canAccessAdmin} />
                    <strong>
                      {testResults.adminStatus.canAccessAdmin ? '✅ CAN ACCESS ADMIN PANEL' : '❌ CANNOT ACCESS ADMIN PANEL'}
                    </strong>
                  </AlertDescription>
                </Alert>
                <p className="mt-2 text-sm text-muted-foreground">
                  Reason: {testResults.adminStatus.reason}
                </p>
                
                {testResults.backendTest && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Backend Connectivity</h4>
                    <Badge variant={testResults.backendTest.success ? 'default' : 'destructive'}>
                      {testResults.backendTest.success ? 'Connected' : 'Failed'}
                    </Badge>
                    {testResults.backendTest.error && (
                      <p className="text-xs text-red-500 mt-1">{testResults.backendTest.error}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 justify-center">
          <Button 
            onClick={createEmergencyAdmin} 
            variant="default" 
            size="lg"
            className="bg-primary hover:bg-primary/90"
          >
            <Shield className="w-4 h-4 mr-2" />
            Create Emergency Admin
          </Button>
          
          <Button 
            onClick={fixAuthIssues} 
            variant="outline" 
            size="lg"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Fix Auth Issues
          </Button>

          {testResults?.adminStatus.canAccessAdmin && (
            <Button 
              onClick={() => onNavigate('admin')} 
              variant="default" 
              size="lg"
              className="bg-green-600 hover:bg-green-700"
            >
              <Shield className="w-4 h-4 mr-2" />
              Access Admin Panel
            </Button>
          )}
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Fix Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>1.</strong> Click "Create Emergency Admin" to set up admin access</p>
            <p><strong>2.</strong> If that doesn't work, click "Fix Auth Issues" to refresh authentication</p>
            <p><strong>3.</strong> Once you see "CAN ACCESS ADMIN PANEL", click "Access Admin Panel"</p>
            <p><strong>4.</strong> You can also navigate directly to: <code>?page=admin</code></p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}