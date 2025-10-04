import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Shield, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId } from '../utils/supabase/info';

interface AdminInitializerProps {
  onComplete?: () => void;
}

export function AdminInitializer({ onComplete }: AdminInitializerProps) {
  const [email, setEmail] = useState('ommzadeh@gmail.com');
  const [secretKey, setSecretKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleInitialize = async () => {
    if (!email || !secretKey) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e5dee741/admin/initialize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          secretKey
        })
      });

      const data = await response.json();

      if (response.ok) {
        setResult('✅ Admin access initialized successfully! You can now access the admin dashboard.');
        setIsSuccess(true);
        toast.success('Admin access granted!');
        
        // Refresh the page to update auth state
        setTimeout(() => {
          if (onComplete) {
            onComplete();
          } else {
            window.location.reload();
          }
        }, 2000);
      } else {
        setResult(`❌ ${data.error || 'Failed to initialize admin access'}`);
        setIsSuccess(false);
        toast.error(data.error || 'Failed to initialize admin access');
      }
    } catch (error) {
      console.error('Admin initialization error:', error);
      setResult('❌ Network error. Please check your connection and try again.');
      setIsSuccess(false);
      toast.error('Network error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Admin Access Initialization</CardTitle>
          <CardDescription>
            Initialize admin access for your Persian Connect account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm">Email Address</label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="secretKey" className="text-sm">Secret Key</label>
            <Input
              id="secretKey"
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="Enter secret key"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Use: PERSIAN_CONNECT_ADMIN_INIT_2024
            </p>
          </div>

          <Button 
            onClick={handleInitialize}
            disabled={isLoading || !email || !secretKey}
            className="w-full"
          >
            {isLoading ? 'Initializing...' : 'Initialize Admin Access'}
          </Button>

          {result && (
            <Alert className={isSuccess ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <div className="flex items-center">
                {isSuccess ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className="ml-2">
                  {result}
                </AlertDescription>
              </div>
            </Alert>
          )}

          <div className="text-center pt-4">
            <p className="text-xs text-muted-foreground">
              This is a one-time setup to grant admin privileges to your account.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}