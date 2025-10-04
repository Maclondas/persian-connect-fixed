import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { realDataService } from './services/real-data-service';
import { getSupabaseClient } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function LoginTestDebug() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const clearLogs = () => {
    setLogs([]);
    setResult('');
  };

  const testSupabaseConfig = () => {
    addLog('🔍 Testing Supabase Configuration...');
    addLog(`Project ID: ${projectId}`);
    addLog(`Has Anon Key: ${!!publicAnonKey}`);
    addLog(`Anon Key Length: ${publicAnonKey.length}`);
    
    const client = getSupabaseClient();
    addLog(`Supabase Client Available: ${!!client}`);
    
    if (client) {
      addLog('✅ Supabase client created successfully');
    } else {
      addLog('❌ Failed to create Supabase client');
    }
  };

  const testRealDataService = () => {
    addLog('🔍 Testing Real Data Service...');
    addLog(`Service Available: ${!!realDataService}`);
    addLog(`SignIn Method Available: ${typeof realDataService.signIn === 'function'}`);
    addLog(`Current User: ${realDataService.getCurrentUser()?.email || 'None'}`);
    addLog(`Demo Mode: ${realDataService.isDemoMode()}`);
    addLog(`Figma Environment: ${realDataService.isFigmaEnvironment()}`);
  };

  const testSignIn = async () => {
    setLoading(true);
    setResult('');
    addLog('🔐 Starting sign-in test...');
    
    try {
      addLog(`Attempting to sign in with email: ${email}`);
      const user = await realDataService.signIn(email, password);
      addLog(`✅ Sign-in successful!`);
      addLog(`User ID: ${user.id}`);
      addLog(`User Email: ${user.email}`);
      addLog(`User Name: ${user.name}`);
      addLog(`User Role: ${user.role}`);
      addLog(`Auth Provider: ${user.authProvider}`);
      setResult('✅ Sign-in successful! Check logs for details.');
    } catch (error: any) {
      addLog(`❌ Sign-in failed: ${error.message}`);
      setResult(`❌ Sign-in failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testDirectSupabase = async () => {
    setLoading(true);
    setResult('');
    addLog('🔍 Testing direct Supabase authentication...');
    
    try {
      const client = getSupabaseClient();
      if (!client) {
        throw new Error('No Supabase client available');
      }

      addLog('📧 Calling Supabase signInWithPassword...');
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        addLog(`❌ Supabase error: ${error.message}`);
        setResult(`❌ Supabase error: ${error.message}`);
      } else {
        addLog(`✅ Supabase sign-in successful!`);
        addLog(`User ID: ${data.user?.id}`);
        addLog(`User Email: ${data.user?.email}`);
        addLog(`Has Session: ${!!data.session}`);
        addLog(`Access Token Length: ${data.session?.access_token?.length || 0}`);
        setResult('✅ Direct Supabase sign-in successful! Check logs for details.');
      }
    } catch (error: any) {
      addLog(`❌ Direct Supabase test failed: ${error.message}`);
      setResult(`❌ Direct Supabase test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createTestUser = async () => {
    setLoading(true);
    setResult('');
    addLog('👤 Creating test user...');
    
    try {
      const client = getSupabaseClient();
      if (!client) {
        throw new Error('No Supabase client available');
      }

      addLog('📝 Calling Supabase signUp...');
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: 'Test User',
            name: 'Test User'
          }
        }
      });

      if (error) {
        addLog(`❌ Signup error: ${error.message}`);
        setResult(`❌ Signup error: ${error.message}`);
      } else {
        addLog(`✅ Test user created successfully!`);
        addLog(`User ID: ${data.user?.id}`);
        addLog(`User Email: ${data.user?.email}`);
        addLog(`Email Confirmation Required: ${!data.session}`);
        setResult('✅ Test user created! Try signing in now.');
      }
    } catch (error: any) {
      addLog(`❌ Test user creation failed: ${error.message}`);
      setResult(`❌ Test user creation failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>🔧 Login Debug Tool</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="test@example.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="password123"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button onClick={testSupabaseConfig} disabled={loading}>
            Test Config
          </Button>
          <Button onClick={testRealDataService} disabled={loading}>
            Test Service
          </Button>
          <Button onClick={testSignIn} disabled={loading}>
            Test Sign In
          </Button>
          <Button onClick={testDirectSupabase} disabled={loading}>
            Test Direct
          </Button>
          <Button onClick={createTestUser} disabled={loading}>
            Create Test User
          </Button>
          <Button onClick={clearLogs} variant="outline">
            Clear Logs
          </Button>
        </div>

        {result && (
          <Alert>
            <AlertDescription>{result}</AlertDescription>
          </Alert>
        )}

        <div className="border rounded p-3 h-64 overflow-y-auto bg-black text-green-400 font-mono text-xs">
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}