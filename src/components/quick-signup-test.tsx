import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface QuickSignupTestProps {
  onClose: () => void;
}

export function QuickSignupTest({ onClose }: QuickSignupTestProps) {
  const [testData, setTestData] = useState({
    email: `test${Math.random().toString(36).substr(2, 6)}@example.com`,
    password: 'password123',
    name: 'Test User'
  });
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{type: 'success' | 'error', message: string, details?: any} | null>(null);

  const runSignupTest = async () => {
    setTesting(true);
    setResult(null);

    try {
      console.log('🧪 Testing signup with data:', {
        email: testData.email,
        name: testData.name,
        hasPassword: !!testData.password
      });

      const signupData = {
        email: testData.email,
        password: testData.password,
        name: testData.name,
        username: `test_${Math.random().toString(36).substr(2, 6)}`
      };

      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e5dee741/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(signupData)
      });

      const responseData = await response.json();

      if (response.ok && responseData.user) {
        setResult({
          type: 'success',
          message: `✅ Signup successful! User created: ${responseData.user.email} - No username creation needed!`,
          details: {
            userId: responseData.user.id,
            username: responseData.user.username,
            name: responseData.user.name,
            email: responseData.user.email,
            flow: 'direct-to-homepage'
          }
        });
        
        // Generate new test email for next test
        setTestData(prev => ({
          ...prev,
          email: `test${Math.random().toString(36).substr(2, 6)}@example.com`
        }));
      } else {
        setResult({
          type: 'error',
          message: `❌ Signup failed: ${responseData.error || 'Unknown error'}`,
          details: {
            status: response.status,
            response: responseData
          }
        });
      }
    } catch (error) {
      setResult({
        type: 'error',
        message: `❌ Network/Server error: ${error}`,
        details: { error: String(error) }
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧪 Quick Signup Test
            <Badge variant="outline">Email/Password Test</Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              This will test the complete signup flow with real data to verify the fixes are working.
            </AlertDescription>
          </Alert>

          {/* Test Data Inputs */}
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium">Test Email:</label>
              <Input 
                value={testData.email} 
                onChange={(e) => setTestData(prev => ({ ...prev, email: e.target.value }))}
                disabled={testing}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Test Password:</label>
              <Input 
                value={testData.password} 
                onChange={(e) => setTestData(prev => ({ ...prev, password: e.target.value }))}
                disabled={testing}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Test Name:</label>
              <Input 
                value={testData.name} 
                onChange={(e) => setTestData(prev => ({ ...prev, name: e.target.value }))}
                disabled={testing}
              />
            </div>
          </div>

          {/* Test Button */}
          <div className="flex gap-2">
            <Button 
              onClick={runSignupTest} 
              disabled={testing}
              className="flex-1"
            >
              {testing ? 'Testing Signup...' : '🚀 Test Signup Now'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>

          {/* Results */}
          {result && (
            <div className="space-y-2">
              <Alert variant={result.type === 'error' ? 'destructive' : 'default'}>
                <AlertDescription>
                  <div className="space-y-2">
                    <p>{result.message}</p>
                    
                    {result.details && (
                      <details>
                        <summary className="cursor-pointer text-sm">View Details</summary>
                        <pre className="text-xs mt-2 p-2 bg-muted rounded overflow-x-auto">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </AlertDescription>
              </Alert>

              {result.type === 'success' && (
                <div className="text-sm text-green-600">
                  🎉 The signup fix is working! Users can now register with email/password.
                </div>
              )}

              {result.type === 'error' && (
                <div className="text-sm text-red-600">
                  💡 If you see "Missing required fields" or "Server not available", 
                  run the database setup or check server connectivity.
                </div>
              )}
            </div>
          )}

          {/* Current Configuration */}
          <Alert>
            <AlertDescription className="text-xs">
              <strong>Testing against:</strong> https://{projectId}.supabase.co/functions/v1/make-server-e5dee741/auth/signup
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}