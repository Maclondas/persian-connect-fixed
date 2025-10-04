import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface ServerDeploymentCheckerProps {
  onClose: () => void;
}

export function ServerDeploymentChecker({ onClose }: ServerDeploymentCheckerProps) {
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  const addResult = (test: string, status: 'success' | 'error' | 'warning' | 'info', message: string, details?: any) => {
    const result = { test, status, message, details, timestamp: new Date().toLocaleTimeString() };
    setResults(prev => [...prev, result]);
    console.log(`[${status.toUpperCase()}] ${test}: ${message}`, details || '');
  };

  const checkServerDeployment = async () => {
    setChecking(true);
    setResults([]);
    
    addResult('Start', 'info', 'Starting comprehensive server deployment check...');
    
    // Test 1: Basic connectivity to Supabase
    try {
      addResult('Supabase', 'info', 'Testing basic Supabase connectivity...');
      const supabaseResponse = await fetch(`https://${projectId}.supabase.co/rest/v1/`, {
        headers: { 
          'Authorization': `Bearer ${publicAnonKey}`,
          'apikey': publicAnonKey 
        }
      });
      
      if (supabaseResponse.ok) {
        addResult('Supabase', 'success', 'Supabase REST API is accessible');
      } else {
        addResult('Supabase', 'error', `Supabase REST API error: ${supabaseResponse.status}`);
        addResult('Fix', 'error', 'Your Supabase project may not be active or credentials are wrong');
        setChecking(false);
        return;
      }
    } catch (error) {
      addResult('Supabase', 'error', `Cannot connect to Supabase: ${error}`);
      addResult('Fix', 'error', 'Check internet connection and Supabase project status');
      setChecking(false);
      return;
    }

    // Test 2: Check Edge Functions are available
    try {
      addResult('Functions', 'info', 'Testing Edge Functions availability...');
      const functionsResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      
      if (functionsResponse.status === 404) {
        addResult('Functions', 'warning', 'Edge Functions not found - this is expected if none are deployed');
      } else if (functionsResponse.ok) {
        addResult('Functions', 'success', 'Edge Functions are available');
      } else {
        addResult('Functions', 'error', `Edge Functions error: ${functionsResponse.status}`);
      }
    } catch (error) {
      addResult('Functions', 'error', `Edge Functions connectivity failed: ${error}`);
    }

    // Test 3: Check our specific server function
    try {
      addResult('Server', 'info', 'Testing our server function deployment...');
      const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e5dee741`;
      
      const serverResponse = await fetch(serverUrl, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      
      if (serverResponse.ok) {
        const serverData = await serverResponse.json();
        addResult('Server', 'success', 'Server function is deployed and responding!', serverData);
      } else if (serverResponse.status === 404) {
        addResult('Server', 'error', 'Server function NOT DEPLOYED (404 error)');
        addResult('Fix', 'error', 'You need to deploy the Edge Function to Supabase');
        addDeploymentInstructions();
      } else {
        addResult('Server', 'error', `Server function error: ${serverResponse.status}`);
        const errorText = await serverResponse.text();
        addResult('Server', 'error', `Error details: ${errorText}`);
      }
    } catch (error) {
      addResult('Server', 'error', `Server function request failed: ${error}`);
    }

    // Test 4: Check health endpoint specifically
    try {
      addResult('Health', 'info', 'Testing server health endpoint...');
      const healthUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e5dee741/health`;
      
      const healthResponse = await fetch(healthUrl, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });
      
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        addResult('Health', 'success', 'Health endpoint responding correctly!', healthData);
      } else {
        addResult('Health', 'error', `Health endpoint failed: ${healthResponse.status}`);
      }
    } catch (error) {
      addResult('Health', 'error', `Health check failed: ${error}`);
    }

    // Test 5: Check signup endpoint specifically
    try {
      addResult('Signup', 'info', 'Testing signup endpoint...');
      const signupUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e5dee741/auth/signup`;
      
      // Don't send actual signup data, just test if endpoint exists
      const signupResponse = await fetch(signupUrl, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({}) // Empty body to test endpoint existence
      });
      
      if (signupResponse.status === 400) {
        // 400 means endpoint exists but we sent bad data (expected)
        addResult('Signup', 'success', 'Signup endpoint exists and is responding');
      } else if (signupResponse.status === 404) {
        addResult('Signup', 'error', 'Signup endpoint NOT FOUND (404)');
      } else {
        addResult('Signup', 'warning', `Signup endpoint responded with: ${signupResponse.status}`);
      }
    } catch (error) {
      addResult('Signup', 'error', `Signup endpoint test failed: ${error}`);
    }

    addResult('Complete', 'info', 'Server deployment check completed');
    setChecking(false);
  };

  const addDeploymentInstructions = () => {
    addResult('Deploy', 'info', '📋 DEPLOYMENT INSTRUCTIONS:');
    addResult('Deploy', 'info', '1. Install Supabase CLI: npm install -g supabase');
    addResult('Deploy', 'info', '2. Login to Supabase: supabase login');
    addResult('Deploy', 'info', `3. Link project: supabase link --project-ref ${projectId}`);
    addResult('Deploy', 'info', '4. Deploy functions: supabase functions deploy');
    addResult('Deploy', 'info', '5. Or deploy specific function: supabase functions deploy make-server-e5dee741');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔍 Server Deployment Checker
            <Badge variant="destructive">Server Not Available Fix</Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              This tool will check if your Supabase Edge Function (server) is properly deployed. 
              The "Server not available" error usually means the Edge Function isn't deployed to Supabase.
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button 
              onClick={checkServerDeployment} 
              disabled={checking}
              className="flex-1"
            >
              {checking ? 'Checking Server Deployment...' : '🚀 Check Server Deployment'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>

          {results.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-medium">Deployment Check Results:</h3>
                <div className="bg-muted p-4 rounded-lg space-y-2 max-h-80 overflow-y-auto">
                  {results.map((result, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Badge variant={
                          result.status === 'success' ? 'default' : 
                          result.status === 'error' ? 'destructive' : 
                          result.status === 'warning' ? 'secondary' :
                          'outline'
                        }>
                          {result.test}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {result.timestamp}
                        </span>
                      </div>
                      
                      <p className={`text-sm ${
                        result.status === 'success' ? 'text-green-600' :
                        result.status === 'error' ? 'text-red-600' :
                        result.status === 'warning' ? 'text-yellow-600' :
                        'text-muted-foreground'
                      }`}>
                        {result.message}
                      </p>
                      
                      {result.details && (
                        <details className="text-xs">
                          <summary className="cursor-pointer text-muted-foreground">
                            View details
                          </summary>
                          <pre className="mt-1 p-2 bg-background rounded overflow-x-auto">
                            {JSON.stringify(result.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Quick deployment guide */}
          {results.some(r => r.message.includes('NOT DEPLOYED')) && (
            <Alert>
              <AlertDescription>
                <strong>🚨 Edge Function Not Deployed!</strong>
                <br />
                Your server function needs to be deployed to Supabase. Follow these steps:
                <br />
                <br />
                <strong>Option 1: Using Supabase CLI (Recommended)</strong>
                <br />
                1. Install: <code>npm install -g supabase</code>
                <br />
                2. Login: <code>supabase login</code>
                <br />
                3. Deploy: <code>supabase functions deploy</code>
                <br />
                <br />
                <strong>Option 2: Using Supabase Dashboard</strong>
                <br />
                1. Go to your Supabase project dashboard
                <br />
                2. Navigate to Edge Functions
                <br />
                3. Create a new function named "make-server-e5dee741"
                <br />
                4. Copy the code from /supabase/functions/server/index.tsx
              </AlertDescription>
            </Alert>
          )}

          <Alert>
            <AlertDescription className="text-xs">
              <strong>Testing URLs:</strong>
              <br />
              Server: https://{projectId}.supabase.co/functions/v1/make-server-e5dee741
              <br />
              Health: https://{projectId}.supabase.co/functions/v1/make-server-e5dee741/health
              <br />
              Signup: https://{projectId}.supabase.co/functions/v1/make-server-e5dee741/auth/signup
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}