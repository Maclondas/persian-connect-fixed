import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, XCircle, AlertTriangle, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface TroubleshootStep {
  title: string;
  description: string;
  action?: string;
  type: 'check' | 'fix' | 'info';
}

export function LoginTroubleshootGuide() {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const troubleshootSteps: TroubleshootStep[] = [
    {
      title: "1. Check Your Credentials",
      description: "Make sure you're using the correct email and password. The email should match exactly what you used when signing up.",
      type: "check"
    },
    {
      title: "2. Verify Account Exists",
      description: "If you recently signed up, make sure your account was actually created. Try the 'Sign Up' flow to see if you get an 'email already exists' error.",
      type: "check"
    },
    {
      title: "3. Check Email Confirmation",
      description: "Some authentication systems require email confirmation. Check your email inbox (including spam) for a confirmation link.",
      type: "check"
    },
    {
      title: "4. Clear Browser Data",
      description: "Clear your browser's local storage, session storage, and cookies for this site.",
      action: "localStorage.clear(); sessionStorage.clear(); document.cookie.split(';').forEach(c => { document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/'); });",
      type: "fix"
    },
    {
      title: "5. Test Supabase Connection",
      description: "Use the debug tool above to test the direct Supabase authentication connection.",
      type: "check"
    },
    {
      title: "6. Check Network Connection",
      description: "Make sure you have a stable internet connection and that the Supabase servers are accessible.",
      type: "check"
    },
    {
      title: "7. Try Different Browser/Incognito",
      description: "Test login in a different browser or incognito/private browsing mode to rule out browser-specific issues.",
      type: "check"
    },
    {
      title: "8. Check Password Requirements",
      description: "Ensure your password meets the minimum requirements (usually at least 6 characters).",
      type: "check"
    }
  ];

  const toggleStep = (index: number) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(index)) {
      newCompleted.delete(index);
    } else {
      newCompleted.add(index);
    }
    setCompletedSteps(newCompleted);
  };

  const executeAction = async (action: string) => {
    try {
      eval(action);
      toast.success('Action executed successfully! Please refresh the page.');
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast.error('Failed to execute action');
      console.error('Action execution error:', error);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const getStepIcon = (index: number, type: TroubleshootStep['type']) => {
    const isCompleted = completedSteps.has(index);
    
    if (isCompleted) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    
    switch (type) {
      case 'check':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'fix':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'info':
        return <AlertTriangle className="h-5 w-5 text-blue-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Follow these troubleshooting steps one by one. Check off each step as you complete it. 
          If a step fixes your issue, you can stop there.
        </AlertDescription>
      </Alert>

      <div className="space-y-3">
        {troubleshootSteps.map((step, index) => (
          <Card key={index} className={`transition-all ${completedSteps.has(index) ? 'bg-green-50 border-green-200' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleStep(index)}
                  className="flex-shrink-0 mt-0.5"
                >
                  {getStepIcon(index, step.type)}
                </button>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{step.description}</p>
                  
                  {step.action && (
                    <div className="space-y-2">
                      <div className="bg-gray-100 p-2 rounded text-xs font-mono">
                        {step.action}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(step.action!)}
                          className="ml-2 h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => executeAction(step.action!)}
                        className="bg-red-500 hover:bg-red-600 text-white"
                      >
                        Execute This Fix
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">Still Having Issues?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-blue-700">
            <p>If none of the above steps work, the issue might be:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Server configuration problem</li>
              <li>Database connectivity issue</li>
              <li>Supabase service outage</li>
              <li>Account was deleted or suspended</li>
            </ul>
            <p className="mt-3 font-medium">
              Try creating a new account with a different email to test if the signup/login system is working.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="text-center">
        <p className="text-sm text-gray-500">
          Progress: {completedSteps.size} of {troubleshootSteps.length} steps completed
        </p>
      </div>
    </div>
  );
}