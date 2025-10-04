import { useState } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

export function AuthTestComponent() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('testpassword123');

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testBasicConnection = async () => {
    setIsLoading(true);
    addResult('🔍 Starting basic connection test...');
    
    try {
      // Test 1: Check environment variables
      addResult(`📋 Project ID: ${projectId || 'MISSING'}`);
      addResult(`📋 Has Anon Key: ${!!publicAnonKey}`);
      
      if (!projectId || projectId === 'your-project-id') {
        addResult('❌ Invalid project ID configuration');
        return;
      }
      
      if (!publicAnonKey) {
        addResult('❌ Missing anon key');
        return;
      }

      // Test 2: Health check endpoint
      const healthUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e5dee741/health`;
      addResult(`🏥 Testing health endpoint: ${healthUrl}`);
      
      const healthResponse = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        addResult(`✅ Health check passed: ${JSON.stringify(healthData)}`);
      } else {
        const errorText = await healthResponse.text();
        addResult(`❌ Health check failed: ${healthResponse.status} - ${errorText}`);
      }

    } catch (error: any) {
      addResult(`❌ Connection test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testSignin = async () => {
    setIsLoading(true);
    addResult('🔐 Starting signin test...');
    
    try {
      const signinUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e5dee741/auth/signin`;
      addResult(`📧 Testing signin endpoint: ${signinUrl}`);
      
      const response = await fetch(signinUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password
        })
      });
      
      const responseText = await response.text();
      addResult(`📋 Response status: ${response.status}`);
      addResult(`📋 Response headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`);
      
      if (response.ok) {
        const data = JSON.parse(responseText);
        addResult(`✅ Signin response: ${JSON.stringify(data)}`);
      } else {
        addResult(`❌ Signin failed: ${response.status} - ${responseText}`);
      }

    } catch (error: any) {
      addResult(`❌ Signin test failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const testSignup = async () => {
    setIsLoading(true);
    addResult('📝 Starting signup test...');
    
    try {
      // Test the service signup method directly
      addResult('📧 Testing realDataService.signUp()...');
      const { realDataService } = await import('../services/real-data-service');
      
      const testUserData = {
        name: 'Test User',
        email: `test-${Date.now()}@example.com`,
        password: 'testpassword123'
      };
      
      addResult(`📋 Test user data: ${JSON.stringify(testUserData)}`);
      
      const user = await realDataService.signUp(testUserData);
      addResult(`✅ Signup successful: ${JSON.stringify(user)}`);
      
    } catch (error: any) {
      addResult(`❌ Signup test failed: ${error.message}`);
      addResult(`📋 Error details: ${JSON.stringify(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Authentication Test Component</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={testBasicConnection} 
            disabled={isLoading}
            variant="outline"
          >
            Test Connection
          </Button>
          <Button 
            onClick={testSignin} 
            disabled={isLoading}
            variant="outline"
          >
            Test Signin
          </Button>
          <Button 
            onClick={testSignup} 
            disabled={isLoading}
            variant="outline"
          >
            Test Signup
          </Button>
          <Button 
            onClick={clearResults} 
            disabled={isLoading}
            variant="secondary"
          >
            Clear Results
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        
        <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-y-auto">
          <h3 className="font-semibold mb-2">Test Results:</h3>
          {testResults.length === 0 ? (
            <p className="text-gray-500">No test results yet. Run a test above.</p>
          ) : (
            <div className="space-y-1 font-mono text-sm">
              {testResults.map((result, index) => (
                <div key={index} className="text-gray-800">
                  {result}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}