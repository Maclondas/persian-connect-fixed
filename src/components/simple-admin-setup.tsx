import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';

interface SimpleAdminSetupProps {
  onNavigate: (page: string) => void;
}

export function SimpleAdminSetup({ onNavigate }: SimpleAdminSetupProps) {
  const [email, setEmail] = useState('ommzadeh@gmail.com');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const createEmergencyAdmin = () => {
    console.log('🚨 Creating emergency admin...');
    
    // Clear all existing auth data
    localStorage.clear();
    console.log('✅ Cleared existing auth data');
    
    // Create comprehensive admin user
    const adminUser = {
      id: 'emergency-admin-' + Date.now(),
      username: 'admin',
      email: email,
      name: 'Emergency Admin',
      role: 'admin',
      authProvider: 'emergency',
      createdAt: new Date().toISOString(),
      isBlocked: false,
      isEmergencyAdmin: true,
      permissions: ['read', 'write', 'delete', 'admin', 'moderate']
    };
    
    const adminToken = 'emergency-admin-token-' + Date.now();
    
    // Set all possible auth storage keys (using correct key names)
    const authData = {
      'currentUser': JSON.stringify(adminUser),
      'accessToken': adminToken, // Use correct key name
      'access_token': adminToken, // Keep for backward compatibility
      'pc_current_user': JSON.stringify(adminUser),
      'pc_access_token': adminToken,
      'username': 'admin',
      'userRole': 'admin',
      'isAuthenticated': 'true',
      'authMethod': 'emergency',
      'isAdmin': 'true',
      'hasAdminAccess': 'true'
    };
    
    // Store all auth data
    Object.entries(authData).forEach(([key, value]) => {
      localStorage.setItem(key, value);
      console.log(`✅ Set ${key}`);
    });
    
    console.log('🎉 Emergency admin created successfully!');
    console.log('👤 Admin user:', adminUser);
    
    return { user: adminUser, token: adminToken };
  };

  const testAdminAccess = () => {
    console.log('🧪 Testing admin access...');
    
    const checks = {
      currentUser: localStorage.getItem('currentUser'),
      accessToken: localStorage.getItem('accessToken') || localStorage.getItem('access_token'), // Check both keys
      userRole: localStorage.getItem('userRole'),
      isAuthenticated: localStorage.getItem('isAuthenticated')
    };
    
    let userData = null;
    try {
      userData = checks.currentUser ? JSON.parse(checks.currentUser) : null;
    } catch (e) {
      console.error('❌ Could not parse user data');
    }
    
    const results = {
      hasUser: !!userData,
      isAdmin: userData?.role === 'admin' || checks.userRole === 'admin',
      hasToken: !!checks.accessToken,
      isAuthenticated: checks.isAuthenticated === 'true',
      userData: userData
    };
    
    console.log('📊 Admin access test results:', results);
    
    const canAccess = results.hasUser && results.isAdmin && results.hasToken && results.isAuthenticated;
    console.log(canAccess ? '✅ CAN ACCESS ADMIN' : '❌ CANNOT ACCESS ADMIN');
    
    return { canAccess, ...results };
  };

  const handleEmergencySetup = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      console.log('🚀 Starting emergency admin setup...');
      
      // Create admin
      const adminResult = createEmergencyAdmin();
      
      // Test access
      const testResult = testAdminAccess();
      
      if (testResult.canAccess) {
        setResult('success');
        console.log('✅ Emergency admin setup successful!');
        
        // Auto-redirect after 2 seconds
        setTimeout(() => {
          onNavigate('admin');
        }, 2000);
      } else {
        setResult('failed');
        console.log('❌ Admin setup verification failed');
      }
      
    } catch (error) {
      console.error('❌ Emergency setup failed:', error);
      setResult('failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestAccess = () => {
    const testResult = testAdminAccess();
    if (testResult.canAccess) {
      setResult('access-confirmed');
      setTimeout(() => {
        onNavigate('admin');
      }, 1000);
    } else {
      setResult('no-access');
    }
  };

  const handleClearAuth = () => {
    localStorage.clear();
    setResult('cleared');
    console.log('🧹 All auth data cleared');
  };

  const handleGoToAdmin = () => {
    onNavigate('admin');
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🚨 Emergency Admin Access
              <Badge variant="outline">CORS Bypass</Badge>
            </CardTitle>
            <CardDescription>
              Create immediate admin access when normal signup fails due to CORS issues.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button 
            onClick={handleEmergencySetup}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            🚨 Emergency Setup
          </Button>
          
          <Button 
            onClick={handleTestAccess}
            variant="outline"
          >
            🧪 Test Access
          </Button>
          
          <Button 
            onClick={handleGoToAdmin}
            variant="outline"
          >
            🎯 Go to Admin
          </Button>
          
          <Button 
            onClick={handleClearAuth}
            variant="destructive"
          >
            🧹 Clear Data
          </Button>
        </div>

        {/* Setup Form */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Email</CardTitle>
            <CardDescription>
              Enter your admin email address
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@domain.com"
            />
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result === 'success' || result === 'access-confirmed' ? '✅' : '❌'} Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result === 'success' && (
                <Alert>
                  <AlertDescription>
                    ✅ Emergency admin access created! Redirecting to admin dashboard...
                  </AlertDescription>
                </Alert>
              )}
              
              {result === 'access-confirmed' && (
                <Alert>
                  <AlertDescription>
                    ✅ Admin access confirmed! Redirecting to admin dashboard...
                  </AlertDescription>
                </Alert>
              )}
              
              {result === 'failed' && (
                <Alert variant="destructive">
                  <AlertDescription>
                    ❌ Emergency setup failed. Check console for details.
                  </AlertDescription>
                </Alert>
              )}
              
              {result === 'no-access' && (
                <Alert variant="destructive">
                  <AlertDescription>
                    ❌ No admin access detected. Try Emergency Setup first.
                  </AlertDescription>
                </Alert>
              )}
              
              {result === 'cleared' && (
                <Alert>
                  <AlertDescription>
                    🧹 All authentication data cleared successfully.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><strong>🚨 Emergency Setup:</strong> Creates immediate admin access bypassing all authentication</div>
            <div><strong>🧪 Test Access:</strong> Checks if you already have admin privileges</div>
            <div><strong>🎯 Go to Admin:</strong> Navigate directly to admin dashboard</div>
            <div><strong>🧹 Clear Data:</strong> Removes all stored authentication data</div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}