import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { getSupabaseClient } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface DebugStep {
  name: string;
  status: 'pending' | 'running' | 'success' | 'error';
  message?: string;
  details?: any;
}

export function LoginDebugTool() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [steps, setSteps] = useState<DebugStep[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const updateStep = (stepName: string, status: DebugStep['status'], message?: string, details?: any) => {
    setSteps(prev => prev.map(step => 
      step.name === stepName 
        ? { ...step, status, message, details }
        : step
    ));
  };

  const addStep = (name: string) => {
    setSteps(prev => [...prev, { name, status: 'pending' }]);
  };

  const runDebugTest = async () => {
    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }

    setIsRunning(true);
    setSteps([]);

    // Initialize debug steps
    const debugSteps = [
      'Supabase Configuration Check',
      'Supabase Client Initialization',  
      'Direct Supabase Authentication',
      'Backend Server Health Check',
      'Backend Authentication Test',
      'Session Storage Test',
      'Final Authentication Flow'
    ];

    debugSteps.forEach(addStep);

    try {
      // Step 1: Supabase Configuration Check
      updateStep('Supabase Configuration Check', 'running');
      console.log('🔍 Debug: Checking Supabase configuration...');
      
      if (!projectId || projectId === 'your-project-id') {
        updateStep('Supabase Configuration Check', 'error', 'Project ID not configured');
        return;
      }
      
      if (!publicAnonKey || publicAnonKey === 'your-anon-key') {
        updateStep('Supabase Configuration Check', 'error', 'Public anon key not configured');
        return;
      }
      
      updateStep('Supabase Configuration Check', 'success', `Project: ${projectId}`);

      // Step 2: Supabase Client Initialization
      updateStep('Supabase Client Initialization', 'running');
      const supabase = getSupabaseClient();
      
      if (!supabase) {
        updateStep('Supabase Client Initialization', 'error', 'Failed to initialize Supabase client');
        return;
      }
      
      updateStep('Supabase Client Initialization', 'success', 'Client initialized successfully');

      // Step 3: Direct Supabase Authentication
      updateStep('Direct Supabase Authentication', 'running');
      console.log('🔐 Debug: Testing direct Supabase auth...');
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (authError) {
        console.error('❌ Direct Supabase auth failed:', authError);
        updateStep('Direct Supabase Authentication', 'error', authError.message, authError);
        
        // Check for specific error types
        if (authError.message.includes('Invalid login credentials')) {
          console.log('💡 This might mean: 1) Wrong password, 2) User doesn\'t exist, 3) Email not confirmed');
        }
        
        return;
      }

      if (!authData.user || !authData.session) {
        updateStep('Direct Supabase Authentication', 'error', 'No user or session returned');
        return;
      }

      updateStep('Direct Supabase Authentication', 'success', `Authenticated: ${authData.user.email}`, {
        userId: authData.user.id,
        email: authData.user.email,
        confirmed: authData.user.email_confirmed_at ? 'Yes' : 'No',
        lastSignIn: authData.user.last_sign_in_at,
        provider: authData.user.app_metadata?.provider || 'email'
      });

      // Step 4: Backend Server Health Check
      updateStep('Backend Server Health Check', 'running');
      
      try {
        const healthResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e5dee741/health`, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        });

        if (!healthResponse.ok) {
          throw new Error(`Health check failed: ${healthResponse.status} ${healthResponse.statusText}`);
        }

        const healthData = await healthResponse.json();
        updateStep('Backend Server Health Check', 'success', 'Server is healthy', healthData);
      } catch (healthError) {
        console.error('❌ Backend health check failed:', healthError);
        updateStep('Backend Server Health Check', 'error', healthError.message);
        
        // Continue with auth test even if health check fails
      }

      // Step 5: Backend Authentication Test
      updateStep('Backend Authentication Test', 'running');
      
      try {
        const backendAuthResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e5dee741/auth/signin`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email.trim(),
            password: password
          })
        });

        if (!backendAuthResponse.ok) {
          const errorText = await backendAuthResponse.text();
          throw new Error(`Backend auth failed: ${backendAuthResponse.status} - ${errorText}`);
        }

        const backendAuthData = await backendAuthResponse.json();
        updateStep('Backend Authentication Test', 'success', 'Backend authentication successful', {
          hasAccessToken: !!backendAuthData.access_token,
          hasUser: !!backendAuthData.user,
          userEmail: backendAuthData.user?.email,
          userRole: backendAuthData.user?.role
        });

        // Step 6: Session Storage Test
        updateStep('Session Storage Test', 'running');
        
        try {
          // Test storing session data
          localStorage.setItem('debug_currentUser', JSON.stringify(backendAuthData.user));
          localStorage.setItem('debug_accessToken', backendAuthData.access_token);
          
          // Test retrieving session data
          const storedUser = localStorage.getItem('debug_currentUser');
          const storedToken = localStorage.getItem('debug_accessToken');
          
          if (storedUser && storedToken) {
            updateStep('Session Storage Test', 'success', 'Local storage working correctly');
          } else {
            updateStep('Session Storage Test', 'error', 'Failed to store/retrieve session data');
          }
          
          // Clean up test data
          localStorage.removeItem('debug_currentUser');
          localStorage.removeItem('debug_accessToken');
          
        } catch (storageError) {
          updateStep('Session Storage Test', 'error', storageError.message);
        }

        // Step 7: Final Authentication Flow
        updateStep('Final Authentication Flow', 'running');
        
        // Test the actual service authentication
        try {
          const { realDataService } = await import('./services/real-data-service');
          const user = await realDataService.signIn(email.trim(), password);
          
          updateStep('Final Authentication Flow', 'success', `Successfully authenticated ${user.email}`, {
            userId: user.id,
            role: user.role,
            authProvider: user.authProvider
          });
          
        } catch (serviceError) {
          console.error('❌ Service authentication failed:', serviceError);
          updateStep('Final Authentication Flow', 'error', serviceError.message);
        }

      } catch (backendError) {
        console.error('❌ Backend authentication failed:', backendError);
        updateStep('Backend Authentication Test', 'error', backendError.message);
      }

    } catch (error) {
      console.error('❌ Debug test failed:', error);
      // Update any running step to error
      setSteps(prev => prev.map(step => 
        step.status === 'running' 
          ? { ...step, status: 'error', message: error.message }
          : step
      ));
    } finally {
      setIsRunning(false);
    }
  };

  const getStepIcon = (status: DebugStep['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Login Debug Tool</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="debug-email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <Input
                id="debug-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={isRunning}
              />
            </div>
            <div>
              <label htmlFor="debug-password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <Input
                id="debug-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isRunning}
              />
            </div>
          </div>
          
          <Button 
            onClick={runDebugTest} 
            disabled={isRunning || !email || !password}
            className="w-full"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running Debug Test...
              </>
            ) : (
              'Run Debug Test'
            )}
          </Button>
        </CardContent>
      </Card>

      {steps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Debug Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={index} className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className="flex-shrink-0 mt-0.5">
                    {getStepIcon(step.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{step.name}</div>
                    {step.message && (
                      <div className={`text-sm mt-1 ${
                        step.status === 'error' ? 'text-red-600' : 
                        step.status === 'success' ? 'text-green-600' : 
                        'text-gray-600'
                      }`}>
                        {step.message}
                      </div>
                    )}
                    {step.details && (
                      <details className="mt-2">
                        <summary className="text-xs text-gray-500 cursor-pointer">
                          View Details
                        </summary>
                        <pre className="text-xs bg-gray-50 p-2 rounded mt-1 overflow-auto">
                          {JSON.stringify(step.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This tool will test each step of the authentication process to identify exactly where the login is failing. 
          Make sure to check the browser console for additional error details.
        </AlertDescription>
      </Alert>
    </div>
  );
}