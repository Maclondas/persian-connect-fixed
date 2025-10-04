import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Zap, RefreshCw, Trash2, Database, Shield } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { getSupabaseClient } from '../utils/supabase/client';

export function AuthQuickFix() {
  const [isFixing, setIsFixing] = useState(false);

  const quickFixes = [
    {
      id: 'clear-storage',
      title: 'Clear All Storage',
      description: 'Clears localStorage, sessionStorage, and cookies',
      icon: <Trash2 className="h-4 w-4" />,
      action: async () => {
        localStorage.clear();
        sessionStorage.clear();
        
        // Clear cookies
        document.cookie.split(';').forEach(c => {
          document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
        });
        
        toast.success('All storage cleared! Page will reload...');
        setTimeout(() => window.location.reload(), 1000);
      }
    },
    {
      id: 'reset-supabase',
      title: 'Reset Supabase Session',
      description: 'Signs out and clears Supabase session',
      icon: <Database className="h-4 w-4" />,
      action: async () => {
        try {
          const supabase = getSupabaseClient();
          if (supabase) {
            const { error } = await supabase.auth.signOut();
            if (error) {
              console.warn('Supabase signout error:', error);
            }
          }
          
          // Clear Supabase-related storage
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('sb-') || key.includes('supabase')) {
              localStorage.removeItem(key);
            }
          });
          
          toast.success('Supabase session reset! Page will reload...');
          setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
          toast.error('Failed to reset Supabase session');
          console.error('Supabase reset error:', error);
        }
      }
    },
    {
      id: 'hard-refresh',
      title: 'Hard Refresh',
      description: 'Forces a complete page reload with cache bypass',
      icon: <RefreshCw className="h-4 w-4" />,
      action: async () => {
        toast.info('Performing hard refresh...');
        window.location.reload();
      }
    },
    {
      id: 'reset-auth-state',
      title: 'Reset Auth State',
      description: 'Resets internal authentication state',
      icon: <Shield className="h-4 w-4" />,
      action: async () => {
        try {
          // Clear Persian Connect specific storage
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('pc_') || key.includes('persian') || key.includes('currentUser') || key.includes('accessToken')) {
              localStorage.removeItem(key);
            }
          });
          
          // Reset global auth state if available
          if (window.resetGlobalAuthState) {
            window.resetGlobalAuthState();
          }
          
          toast.success('Auth state reset! Page will reload...');
          setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
          toast.error('Failed to reset auth state');
          console.error('Auth state reset error:', error);
        }
      }
    }
  ];

  const runAllFixes = async () => {
    setIsFixing(true);
    toast.info('Running all quick fixes...');
    
    try {
      // Run all fixes except hard refresh (which would interrupt the process)
      for (const fix of quickFixes.slice(0, -1)) {
        try {
          await fix.action();
          await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between fixes
        } catch (error) {
          console.warn(`Fix ${fix.id} failed:`, error);
        }
      }
      
      toast.success('All fixes applied! Page will reload...');
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      toast.error('Some fixes failed - check console for details');
      console.error('Quick fixes error:', error);
    } finally {
      setIsFixing(false);
    }
  };

  const runSingleFix = async (fix: typeof quickFixes[0]) => {
    setIsFixing(true);
    try {
      await fix.action();
    } catch (error) {
      toast.error(`Failed to run ${fix.title}`);
      console.error(`Fix ${fix.id} error:`, error);
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="space-y-4">
      <Alert>
        <Zap className="h-4 w-4" />
        <AlertDescription>
          These quick fixes can resolve most authentication issues. Try the "Run All Fixes" button first, 
          or use individual fixes if you know the specific issue.
        </AlertDescription>
      </Alert>

      <div className="flex justify-center mb-4">
        <Button
          onClick={runAllFixes}
          disabled={isFixing}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium px-8 py-2"
        >
          {isFixing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Applying Fixes...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Run All Fixes
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quickFixes.map((fix) => (
          <Card key={fix.id} className="hover:bg-gray-50 transition-colors">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                {fix.icon}
                {fix.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-gray-600 mb-3">{fix.description}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => runSingleFix(fix)}
                disabled={isFixing}
                className="w-full"
              >
                {isFixing ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  'Apply Fix'
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <RefreshCw className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Note:</p>
              <p>These fixes will reload the page and clear your current session. You'll need to log in again after applying the fixes.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Add to global scope for debugging
declare global {
  interface Window {
    resetGlobalAuthState?: () => void;
  }
}