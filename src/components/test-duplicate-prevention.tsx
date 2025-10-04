import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { TestTube, Mail, CheckCircle, XCircle } from 'lucide-react';
import DuplicatePreventionService from './duplicate-prevention-service';
import realDataService from './services/real-data-service';

interface TestResult {
  type: 'email' | 'username' | 'signup';
  input: string;
  result: 'success' | 'error' | 'duplicate';
  message: string;
  timestamp: string;
}

export function TestDuplicatePrevention() {
  const [testEmail, setTestEmail] = useState('');
  const [testUsername, setTestUsername] = useState('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (result: TestResult) => {
    setTestResults(prev => [result, ...prev.slice(0, 9)]); // Keep last 10 results
  };

  const testEmailDuplicate = async () => {
    if (!testEmail) return;
    
    setLoading(true);
    try {
      const result = await DuplicatePreventionService.checkEmailExists(testEmail);
      
      addResult({
        type: 'email',
        input: testEmail,
        result: result.hasDuplicates ? 'duplicate' : 'success',
        message: result.message || 'Check completed',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      addResult({
        type: 'email',
        input: testEmail,
        result: 'error',
        message: (error as Error).message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const testUsernameDuplicate = async () => {
    if (!testUsername) return;
    
    setLoading(true);
    try {
      const result = await DuplicatePreventionService.checkUsernameExists(testUsername);
      
      addResult({
        type: 'username',
        input: testUsername,
        result: result.hasDuplicates ? 'duplicate' : 'success',
        message: result.message || 'Check completed',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      addResult({
        type: 'username',
        input: testUsername,
        result: 'error',
        message: (error as Error).message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const testSignupPrevention = async () => {
    if (!testEmail) return;
    
    setLoading(true);
    try {
      // Try to create an account with existing email
      await realDataService.signUp({
        email: testEmail,
        password: 'testpassword123',
        name: 'Test User'
      });
      
      addResult({
        type: 'signup',
        input: testEmail,
        result: 'error',
        message: 'Signup should have been prevented but succeeded!',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      const errorMessage = (error as Error).message;
      const isPreventedCorrectly = errorMessage.toLowerCase().includes('already exists') || 
                                  errorMessage.toLowerCase().includes('duplicate');
      
      addResult({
        type: 'signup',
        input: testEmail,
        result: isPreventedCorrectly ? 'success' : 'error',
        message: errorMessage,
        timestamp: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'duplicate':
        return <XCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Pass</Badge>;
      case 'duplicate':
        return <Badge className="bg-yellow-100 text-yellow-800">Duplicate Found</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Duplicate Prevention Testing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertDescription>
              This tool helps test the duplicate prevention system. Enter emails or usernames to check if they already exist.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <label className="text-sm font-medium">Test Email Duplicate Check</label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="test@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                />
                <Button 
                  onClick={testEmailDuplicate}
                  disabled={loading || !testEmail}
                  size="sm"
                >
                  Check Email
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Test Username Duplicate Check</label>
              <div className="flex gap-2">
                <Input
                  placeholder="testuser"
                  value={testUsername}
                  onChange={(e) => setTestUsername(e.target.value)}
                />
                <Button 
                  onClick={testUsernameDuplicate}
                  disabled={loading || !testUsername}
                  size="sm"
                >
                  Check Username
                </Button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button 
              onClick={testSignupPrevention}
              disabled={loading || !testEmail}
              variant="outline"
              className="w-full"
            >
              Test Signup Prevention (with test email above)
            </Button>
          </div>
        </CardContent>
      </Card>

      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getResultIcon(result.result)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{result.type}</span>
                        <Badge variant="outline">{result.input}</Badge>
                        {getResultBadge(result.result)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {result.message}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(result.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}