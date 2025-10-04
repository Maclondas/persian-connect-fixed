import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { AlertCircle, CheckCircle, RefreshCw, User, Database, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { realDataService } from './services/real-data-service';

interface ChatAuthFixProps {
  onFixed?: () => void;
}

export function ChatAuthFix({ onFixed }: ChatAuthFixProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  const checkProfileStatus = async () => {
    setIsChecking(true);
    try {
      console.log('🔍 Checking profile status...');
      
      const response = await fetch(`https://${realDataService.projectId}.supabase.co/functions/v1/make-server-e5dee741/auth/profile-debug`, {
        headers: {
          'Authorization': `Bearer ${realDataService.getAccessToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setDebugInfo(data);
      console.log('📋 Profile debug info:', data);
      
      toast.success('Profile status checked successfully');
    } catch (error) {
      console.error('❌ Profile check failed:', error);
      toast.error('Failed to check profile status: ' + (error as Error).message);
    } finally {
      setIsChecking(false);
    }
  };

  const fixProfile = async () => {
    setIsFixing(true);
    try {
      console.log('🔧 Fixing user profile...');
      
      const response = await fetch(`https://${realDataService.projectId}.supabase.co/functions/v1/make-server-e5dee741/auth/fix-profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${realDataService.getAccessToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Profile fixed:', data);
      
      toast.success('Profile fixed successfully! You can now use chat.');
      
      // Refresh the debug info
      await checkProfileStatus();
      
      if (onFixed) {
        onFixed();
      }
    } catch (error) {
      console.error('❌ Profile fix failed:', error);
      toast.error('Failed to fix profile: ' + (error as Error).message);
    } finally {
      setIsFixing(false);
    }
  };

  const restoreSession = async () => {
    try {
      const restored = await realDataService.forceRestoreSession();
      if (restored) {
        toast.success(`Session restored for ${restored.email}!`);
        await checkProfileStatus();
      } else {
        toast.error('No valid session found to restore');
      }
    } catch (error) {
      toast.error('Failed to restore session');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Chat Authentication Fix
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={restoreSession}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Restore Session
          </Button>
          
          <Button 
            onClick={checkProfileStatus}
            disabled={isChecking}
            variant="outline"
            size="sm"
          >
            <Database className="h-4 w-4 mr-2" />
            {isChecking ? 'Checking...' : 'Check Profile'}
          </Button>
          
          <Button 
            onClick={fixProfile}
            disabled={isFixing || !debugInfo}
            variant="default"
            size="sm"
          >
            <User className="h-4 w-4 mr-2" />
            {isFixing ? 'Fixing...' : 'Fix Profile'}
          </Button>
        </div>

        {/* Debug Information */}
        {debugInfo && (
          <div className="space-y-3">
            <h4 className="font-medium">Profile Status:</h4>
            
            {/* Database Profile */}
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                <span className="text-sm">Database Profile</span>
              </div>
              <Badge variant={debugInfo.database.exists ? "default" : "destructive"}>
                {debugInfo.database.exists ? (
                  <><CheckCircle className="h-3 w-3 mr-1" /> Exists</>
                ) : (
                  <><AlertCircle className="h-3 w-3 mr-1" /> Missing</>
                )}
              </Badge>
            </div>

            {/* KV Store Profile */}
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                <span className="text-sm">KV Store Profile</span>
              </div>
              <Badge variant={debugInfo.kvStore.exists ? "default" : "secondary"}>
                {debugInfo.kvStore.exists ? (
                  <><CheckCircle className="h-3 w-3 mr-1" /> Exists</>
                ) : (
                  <><AlertCircle className="h-3 w-3 mr-1" /> Missing</>
                )}
              </Badge>
            </div>

            {/* Auth User */}
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="text-sm">Auth User</span>
              </div>
              <Badge variant={debugInfo.authUser.exists ? "default" : "destructive"}>
                {debugInfo.authUser.exists ? (
                  <><CheckCircle className="h-3 w-3 mr-1" /> Exists</>
                ) : (
                  <><AlertCircle className="h-3 w-3 mr-1" /> Missing</>
                )}
              </Badge>
            </div>

            {/* User Details */}
            <div className="text-xs text-gray-600 space-y-1">
              <div><strong>User ID:</strong> {debugInfo.userId}</div>
              <div><strong>Email:</strong> {debugInfo.userEmail}</div>
              {debugInfo.authUser.provider && (
                <div><strong>Provider:</strong> {debugInfo.authUser.provider}</div>
              )}
            </div>

            {/* Recommendation */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">
                {!debugInfo.database.exists ? (
                  <>
                    <AlertCircle className="h-4 w-4 inline mr-1" />
                    <strong>Issue Found:</strong> Your user profile is missing from the database. 
                    Click "Fix Profile" to create it and enable chat functionality.
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 inline mr-1" />
                    <strong>All Good:</strong> Your profile exists in the database. 
                    Chat should work normally now.
                  </>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Steps to fix chat issues:</strong></p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Click "Restore Session" to ensure you're properly logged in</li>
            <li>Click "Check Profile" to see your profile status</li>
            <li>If profile is missing, click "Fix Profile" to create it</li>
            <li>Try using chat again after the fix</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}