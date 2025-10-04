import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface SignupDebugToolProps {
  onClose: () => void;
}

export function SignupDebugTool({ onClose }: SignupDebugToolProps) {
  const [testEmail, setTestEmail] = useState('test@example.com');
  const [testPassword, setTestPassword] = useState('password123');
  const [testName, setTestName] = useState('Test User');
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const addResult = (step: string, status: 'success' | 'error' | 'info', message: string, data?: any) => {
    const result = {
      step,
      status,
      message,
      data,
      timestamp: new Date().toLocaleTimeString()
    };
    setResults(prev => [...prev, result]);
    console.log(`[${status.toUpperCase()}] ${step}: ${message}`, data || '');
  };

  const testDatabaseConnection = async () => {
    try {
      addResult('Database', 'info', 'Testing profiles table connection...');
      
      const response = await fetch(`https://${projectId}.supabase.co/rest/v1/profiles?select=count()`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'apikey': publicAnonKey
        }
      });

      if (response.ok) {
        addResult('Database', 'success', 'Profiles table is accessible');
        return true;
      } else {
        const error = await response.text();
        addResult('Database', 'error', `Profiles table error: ${response.status}`, error);
        return false;
      }
    } catch (error) {
      addResult('Database', 'error', 'Database connection failed', error);
      return false;
    }
  };

  const testBackendSignup = async () => {
    try {
      // First test server connectivity
      addResult('Backend', 'info', 'Testing server connectivity...');
      
      const healthUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e5dee741/health`;
      try {
        const healthResponse = await fetch(healthUrl, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        });
        
        if (!healthResponse.ok) {
          addResult('Backend', 'error', `Server health check failed: ${healthResponse.status}`);
          return { success: false, error: 'Server not responding' };
        }
        
        addResult('Backend', 'success', 'Server is online and responding');
      } catch (healthError) {
        addResult('Backend', 'error', `Cannot connect to server: ${healthError}`);
        return { success: false, error: 'Network connectivity issue' };
      }
      
      addResult('Backend', 'info', 'Testing backend signup endpoint...');
      
      const signupData = {
        email: testEmail,
        password: testPassword,
        name: testName,
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
        addResult('Backend', 'success', 'Backend signup successful', responseData.user);
        return { success: true, user: responseData.user };
      } else {
        addResult('Backend', 'error', `Backend signup failed: ${response.status}`, responseData);
        return { success: false, error: responseData };
      }
    } catch (error) {
      addResult('Backend', 'error', 'Backend signup request failed', error);
      return { success: false, error };
    }
  };

  const testSupabaseDirectSignup = async () => {
    try {
      addResult('Supabase', 'info', 'Testing direct Supabase signup...');
      
      const { getSupabaseClient } = await import('../utils/supabase/client');
      const supabase = getSupabaseClient();
      
      if (!supabase) {
        addResult('Supabase', 'error', 'Supabase client not available');
        return { success: false };
      }

      const testUsername = `test_${Math.random().toString(36).substr(2, 6)}`;
      const { data, error } = await supabase.auth.signUp({
        email: `test_${Math.random().toString(36).substr(2, 6)}@example.com`,
        password: testPassword,
        options: {
          data: {
            full_name: testName,
            name: testName,
            username: testUsername
          }
        }
      });

      if (error) {
        addResult('Supabase', 'error', `Supabase signup error: ${error.message}`, error);
        return { success: false, error };
      }

      if (data.user) {
        addResult('Supabase', 'success', 'Supabase direct signup successful', data.user);
        return { success: true, user: data.user };
      } else {
        addResult('Supabase', 'error', 'No user returned from Supabase');
        return { success: false };
      }
    } catch (error) {
      addResult('Supabase', 'error', 'Supabase direct signup failed', error);
      return { success: false, error };
    }
  };

  const checkTriggerFunction = async () => {
    try {
      addResult('Trigger', 'info', 'Checking database trigger function...');
      
      const response = await fetch(`https://${projectId}.supabase.co/rest/v1/rpc/handle_new_user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'apikey': publicAnonKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });

      if (response.status === 404) {
        addResult('Trigger', 'error', 'Trigger function not found - database setup needed');
        return false;
      } else {
        addResult('Trigger', 'success', 'Trigger function exists');
        return true;
      }
    } catch (error) {
      addResult('Trigger', 'error', 'Trigger check failed', error);
      return false;
    }
  };

  const runFullTest = async () => {
    setTesting(true);
    setResults([]);

    addResult('System', 'info', 'Starting comprehensive signup debug test...');
    
    // Test 1: Database connection
    const dbOk = await testDatabaseConnection();
    
    // Test 2: Trigger function
    const triggerOk = await checkTriggerFunction();
    
    // Test 3: Backend signup
    const backendResult = await testBackendSignup();
    
    // Test 4: Direct Supabase signup (if backend fails)
    if (!backendResult.success) {
      await testSupabaseDirectSignup();
    }

    // Summary
    addResult('Summary', 'info', '=== TEST SUMMARY ===');
    if (dbOk && triggerOk && backendResult.success) {
      addResult('Summary', 'success', '✅ All systems working correctly!');
    } else {
      addResult('Summary', 'error', '❌ Issues found that need fixing');
      
      if (!triggerOk) {
        addResult('Summary', 'error', '🔧 Database setup required - run the SQL script');
      }
      if (!backendResult.success) {
        addResult('Summary', 'error', '🔧 Backend signup issues detected');
      }
    }

    setTesting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔍 Signup Debug Tool
            <Badge variant="outline">Email/Password Signup Test</Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Test Configuration */}
          <div className="space-y-4">
            <h3 className="font-medium">Test Configuration:</h3>
            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium">Test Email:</label>
                <Input 
                  value={testEmail} 
                  onChange={(e) => setTestEmail(e.target.value)}
                  disabled={testing}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Test Password:</label>
                <Input 
                  value={testPassword} 
                  onChange={(e) => setTestPassword(e.target.value)}
                  disabled={testing}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Test Name:</label>
                <Input 
                  value={testName} 
                  onChange={(e) => setTestName(e.target.value)}
                  disabled={testing}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Test Controls */}
          <div className="flex gap-2">
            <Button 
              onClick={runFullTest} 
              disabled={testing}
              className="flex-1"
            >
              {testing ? 'Testing...' : '🚀 Run Full Signup Test'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>

          {/* Results */}
          {results.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-medium">Test Results:</h3>
                <div className="bg-muted p-4 rounded-lg space-y-2 max-h-60 overflow-y-auto">
                  {results.map((result, index) => (
                    <div key={index} className="text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          result.status === 'success' ? 'default' : 
                          result.status === 'error' ? 'destructive' : 
                          'secondary'
                        }>
                          {result.step}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {result.timestamp}
                        </span>
                      </div>
                      <p className={`mt-1 ${
                        result.status === 'success' ? 'text-green-600' :
                        result.status === 'error' ? 'text-red-600' :
                        'text-muted-foreground'
                      }`}>
                        {result.message}
                      </p>
                      {result.data && (
                        <details className="mt-1">
                          <summary className="text-xs cursor-pointer">
                            View data
                          </summary>
                          <pre className="text-xs bg-background p-2 rounded mt-1 overflow-x-auto">
                            {JSON.stringify(result.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Current Configuration Info */}
          <Alert>
            <AlertDescription>
              <strong>Current Configuration:</strong>
              <br />
              Project ID: {projectId}
              <br />
              Backend URL: https://{projectId}.supabase.co/functions/v1/make-server-e5dee741/auth/signup
              <br />
              This tool will test the complete signup flow and identify issues.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}