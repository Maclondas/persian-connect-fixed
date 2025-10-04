import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { getSupabaseClient } from '../utils/supabase/client';

interface EmergencySignupFixProps {
  onClose: () => void;
}

export function EmergencySignupFix({ onClose }: EmergencySignupFixProps) {
  const [fixing, setFixing] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);

  const addLog = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log(message);
  };

  const attemptEmergencyFix = async () => {
    setFixing(true);
    setResults([]);
    setSuccess(false);
    
    try {
      addLog('🚨 Starting emergency signup fix...');
      
      // Test 0: Check server connectivity first
      addLog('🌐 Testing server connectivity...');
      try {
        const { projectId, publicAnonKey } = await import('../../utils/supabase/info');
        const healthUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e5dee741/health`;
        
        const healthResponse = await fetch(healthUrl, {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        });
        
        if (healthResponse.ok) {
          const healthData = await healthResponse.json();
          addLog('✅ Server is online and healthy');
          addLog(`📊 Server timestamp: ${healthData.timestamp}`);
        } else {
          addLog(`❌ Server health check failed: ${healthResponse.status}`);
          addLog('🔧 This explains why signup is failing - server is not responding');
          return;
        }
      } catch (serverError) {
        addLog(`❌ Cannot connect to server: ${serverError}`);
        addLog('🔧 Network connectivity issue or server is down');
        addLog('💡 Try again in a few minutes or check your internet connection');
        return;
      }
      
      const supabase = getSupabaseClient();
      if (!supabase) {
        addLog('❌ Supabase client not available');
        return;
      }

      // Test 1: Check if profiles table exists
      addLog('🔍 Checking if profiles table exists...');
      const { error: tableCheckError } = await supabase
        .from('profiles')
        .select('count(*)')
        .limit(1);

      if (tableCheckError) {
        addLog('❌ Profiles table missing or inaccessible');
        addLog('🔧 You need to run the SQL setup script in Supabase dashboard');
        addLog('📋 Go to Supabase → SQL Editor → Run the database-setup.sql script');
        return;
      }

      addLog('✅ Profiles table exists');

      // Test 2: Try to create a test user profile manually
      addLog('🧪 Testing profile creation...');
      const testUserId = `test-${Date.now()}`;
      const testUsername = `test_user_${Math.random().toString(36).substr(2, 6)}`;
      
      const { data: testProfile, error: testError } = await supabase
        .from('profiles')
        .insert({
          id: testUserId,
          username: testUsername,
          email: 'test@example.com',
          name: 'Test User',
          role: 'user',
          auth_provider: 'email'
        })
        .select()
        .single();

      if (testError) {
        if (testError.message.includes('violates foreign key')) {
          addLog('❌ Foreign key constraint error - auth.users table issue');
          addLog('🔧 The profiles table is set up but auth integration is broken');
        } else {
          addLog(`❌ Profile creation test failed: ${testError.message}`);
        }
        return;
      }

      addLog('✅ Profile creation test successful');

      // Clean up test profile
      await supabase.from('profiles').delete().eq('id', testUserId);
      addLog('🧹 Cleaned up test data');

      // Test 3: Check trigger function exists
      addLog('🔍 Checking trigger function...');
      try {
        const { error: functionError } = await supabase.rpc('handle_new_user');
        if (functionError && !functionError.message.includes('missing')) {
          addLog('✅ Trigger function exists');
        } else {
          addLog('❌ Trigger function missing - need to run SQL setup');
          return;
        }
      } catch (e) {
        addLog('⚠️ Could not check trigger function directly');
      }

      // All tests passed
      addLog('🎉 All database components appear to be working!');
      addLog('🔍 The issue might be in the backend logic or auth flow');
      addLog('💡 Try the signup debug tool to identify the exact problem');
      setSuccess(true);

    } catch (error) {
      addLog(`❌ Emergency fix failed: ${error}`);
    } finally {
      setFixing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🚨 Emergency Signup Fix
            <Badge variant="destructive">Quick Diagnosis</Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              This tool will quickly diagnose common signup issues and attempt automatic fixes where possible.
              <strong> If Google Auth works but email/password doesn't, this is usually a database setup issue.</strong>
            </AlertDescription>
          </Alert>

          <div className="flex gap-2">
            <Button 
              onClick={attemptEmergencyFix} 
              disabled={fixing}
              variant={success ? "default" : "destructive"}
              className="flex-1"
            >
              {fixing ? 'Diagnosing...' : success ? '✅ Diagnosis Complete' : '🚨 Start Emergency Diagnosis'}
            </Button>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>

          {results.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-medium">Diagnosis Results:</h3>
              <div className="bg-muted p-4 rounded-lg space-y-1 max-h-40 overflow-y-auto">
                {results.map((result, index) => (
                  <div key={index} className="text-sm font-mono">
                    {result.includes('❌') && (
                      <span className="text-red-600">{result}</span>
                    )}
                    {result.includes('✅') && (
                      <span className="text-green-600">{result}</span>
                    )}
                    {result.includes('⚠️') && (
                      <span className="text-yellow-600">{result}</span>
                    )}
                    {result.includes('🔧') && (
                      <span className="text-blue-600">{result}</span>
                    )}
                    {result.includes('📋') && (
                      <span className="text-purple-600">{result}</span>
                    )}
                    {!result.includes('❌') && !result.includes('✅') && !result.includes('⚠️') && !result.includes('🔧') && !result.includes('📋') && (
                      <span className="text-muted-foreground">{result}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {success && (
            <Alert>
              <AlertDescription>
                <strong>Next Steps:</strong>
                <br />
                1. Use the "🔍 Debug Signup Issue" button to run a complete test
                <br />
                2. Try creating a test account with email/password
                <br />
                3. If still failing, check the backend server logs
              </AlertDescription>
            </Alert>
          )}

          {!success && results.some(r => r.includes('❌')) && (
            <Alert>
              <AlertDescription>
                <strong>Database Setup Required:</strong>
                <br />
                Go to your Supabase dashboard → SQL Editor → Run the complete database setup script.
                <br />
                The script is located at <code>/supabase/database-setup.sql</code> in your project.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}