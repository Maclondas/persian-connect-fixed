import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { AdminSetupScript } from './admin-setup-script';

interface AdminSetupPageProps {
  onNavigate: (page: string) => void;
}

export function AdminSetupPage({ onNavigate }: AdminSetupPageProps) {
  const [email, setEmail] = useState('ommzadeh@gmail.com');
  const [password, setPassword] = useState('admin123456');
  const [name, setName] = useState('Admin User');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);

  // Capture console logs
  const originalLog = console.log;
  const addLog = (message: string) => {
    setLogs(prev => [...prev.slice(-10), `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  console.log = (...args) => {
    originalLog(...args);
    addLog(args.join(' '));
  };

  const handleSetupAdmin = async () => {
    setIsLoading(true);
    setResult(null);
    setLogs([]);
    
    try {
      addLog('🚀 Starting admin setup process...');
      const setupResult = await AdminSetupScript.setupAdminAccess(email, password, name);
      setResult(setupResult);
      
      if (setupResult.success) {
        addLog('✅ Admin setup successful!');
        setTimeout(() => {
          onNavigate('admin');
        }, 2000);
      }
    } catch (error) {
      addLog(`❌ Setup failed: ${(error as Error).message}`);
      setResult({ success: false, error: (error as Error).message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSetup = async () => {
    setIsLoading(true);
    addLog('⚡ Quick admin setup...');
    
    try {
      const result = await AdminSetupScript.createManualAdmin(email);
      addLog('✅ Quick setup complete!');
      setTimeout(() => {
        onNavigate('admin');
      }, 1000);
    } catch (error) {
      addLog(`❌ Quick setup failed: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestAccess = () => {
    const testResult = AdminSetupScript.testAdminAccess();
    setResult({ testResult, isTest: true });
  };

  const handleClearAuth = () => {
    AdminSetupScript.clearAllAuth();
    setResult(null);
    setLogs([]);
    addLog('🧹 Authentication data cleared');
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🔧 Admin Setup Tool
              <Badge variant="outline">Emergency Access</Badge>
            </CardTitle>
            <CardDescription>
              Setup admin access when normal signup is not working. This bypasses the CORS issue.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button 
            onClick={handleQuickSetup}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            ⚡ Quick Setup
          </Button>
          
          <Button 
            onClick={handleSetupAdmin}
            disabled={isLoading}
            variant="outline"
          >
            🔧 Full Setup
          </Button>
          
          <Button 
            onClick={handleTestAccess}
            variant="outline"
          >
            🧪 Test Access
          </Button>
          
          <Button 
            onClick={handleClearAuth}
            variant="destructive"
          >
            🧹 Clear Auth
          </Button>
        </div>

        {/* Setup Form */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Credentials</CardTitle>
            <CardDescription>
              Configure your admin account details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block mb-2">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@domain.com"
              />
            </div>
            
            <div>
              <label className="block mb-2">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
              />
            </div>
            
            <div>
              <label className="block mb-2">Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
              />
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {result.success ? '✅' : '❌'} Setup Result
              </CardTitle>
            </CardHeader>
            <CardContent>
              {result.success ? (
                <div className="space-y-2">
                  <Alert>
                    <AlertDescription>
                      ✅ Admin access granted! Redirecting to admin dashboard...
                    </AlertDescription>
                  </Alert>
                  <div className="text-sm text-muted-foreground">
                    <p><strong>Method:</strong> {result.method}</p>
                    <p><strong>Can Access Admin:</strong> {result.adminAccess?.canAccessAdmin ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              ) : result.isTest ? (
                <div className="space-y-2">
                  <p><strong>Admin Test Results:</strong></p>
                  <div className="text-sm space-y-1">
                    <p>Is Admin: {result.testResult.isAdmin ? '✅' : '❌'}</p>
                    <p>Has Token: {result.testResult.hasToken ? '✅' : '❌'}</p>
                    <p>Has User Data: {result.testResult.hasUserData ? '✅' : '❌'}</p>
                    <p>Can Access Admin: {result.testResult.canAccessAdmin ? '✅' : '❌'}</p>
                  </div>
                  {result.testResult.canAccessAdmin && (
                    <Button 
                      onClick={() => onNavigate('admin')}
                      className="mt-2"
                    >
                      🎯 Go to Admin
                    </Button>
                  )}
                </div>
              ) : (
                <Alert variant="destructive">
                  <AlertDescription>
                    ❌ Setup failed: {result.error}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Console Logs */}
        {logs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Setup Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-black text-green-400 p-4 rounded-md font-mono text-sm max-h-40 overflow-y-auto">
                {logs.map((log, index) => (
                  <div key={index}>{log}</div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>⚡ Quick Setup:</strong> Creates manual admin instantly (recommended)</p>
            <p><strong>🔧 Full Setup:</strong> Tries multiple authentication methods</p>
            <p><strong>🧪 Test Access:</strong> Checks if admin access is working</p>
            <p><strong>🧹 Clear Auth:</strong> Removes all authentication data</p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}