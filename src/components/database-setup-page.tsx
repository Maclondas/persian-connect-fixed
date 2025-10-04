import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { DatabaseSetupHelper } from './database-setup-helper';
import { SignupDebugTool } from './signup-debug-tool';
import { EmergencySignupFix } from './emergency-signup-fix';
import { QuickSignupTest } from './quick-signup-test';
import { ServerDeploymentChecker } from './server-deployment-checker';
import { EdgeFunctionDeploymentHelper } from './edge-function-deployment-helper';

interface DatabaseSetupPageProps {
  onNavigate: (page: string) => void;
}

export function DatabaseSetupPage({ onNavigate }: DatabaseSetupPageProps) {
  const [showHelper, setShowHelper] = useState(false);
  const [showDebugTool, setShowDebugTool] = useState(false);
  const [showEmergencyFix, setShowEmergencyFix] = useState(false);
  const [showQuickTest, setShowQuickTest] = useState(false);
  const [showServerChecker, setShowServerChecker] = useState(false);
  const [showDeploymentHelper, setShowDeploymentHelper] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => onNavigate('home')}
              className="mb-4"
            >
              ← Back to Home
            </Button>
            
            <h1 className="text-3xl font-bold mb-2">
              🔧 Database Setup & User Signup Fix
            </h1>
            <p className="text-muted-foreground">
              Fix the user signup issue by implementing proper database triggers and profiles table
            </p>
          </div>

          {/* Issue Description */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>❗ Issue Description</CardTitle>
              <CardDescription>
                Users are being created in Supabase auth but not appearing in the profiles table
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm">
                  <strong>Symptoms:</strong>
                </p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>Users can sign up successfully</li>
                  <li>User appears in Supabase Authentication dashboard</li>
                  <li>User profile data is not accessible in the app</li>
                  <li>"User not found" errors when trying to access profile</li>
                </ul>
                
                <p className="text-sm mt-4">
                  <strong>Root Cause:</strong> Missing database trigger to automatically create profile entries when users sign up.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Solution Overview */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>✅ Solution Overview</CardTitle>
              <CardDescription>
                What we'll implement to fix this issue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-medium">Database Changes</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Create profiles table</li>
                    <li>• Set up Row Level Security (RLS)</li>
                    <li>• Create trigger function</li>
                    <li>• Attach trigger to auth.users</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">Backend Updates</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Update signup endpoint</li>
                    <li>• Modify profile fetching</li>
                    <li>• Add database fallbacks</li>
                    <li>• Maintain KV compatibility</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Files Created */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>📁 Files Created/Updated</CardTitle>
              <CardDescription>
                New files and changes made to fix the issue
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="bg-green-50 p-3 rounded border">
                  <p className="font-medium text-green-800 text-sm">✅ New Files Created:</p>
                  <ul className="text-sm text-green-700 mt-1 space-y-1">
                    <li>• <code>/supabase/database-setup.sql</code> - Complete database setup script</li>
                    <li>• <code>/components/database-setup-helper.tsx</code> - Step-by-step setup guide</li>
                    <li>• <code>/components/database-setup-page.tsx</code> - This setup page</li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 p-3 rounded border">
                  <p className="font-medium text-blue-800 text-sm">🔄 Files Updated:</p>
                  <ul className="text-sm text-blue-700 mt-1 space-y-1">
                    <li>• <code>/supabase/functions/server/index.tsx</code> - Updated auth endpoints</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Required */}
          <Alert className="mb-6">
            <AlertDescription>
              <strong>Manual Action Required:</strong> You need to run the SQL setup script in your Supabase dashboard to complete the fix.
              Click the button below to start the guided setup process.
            </AlertDescription>
          </Alert>

          {/* Start Setup Button */}
          <div className="text-center">
            <Button 
              onClick={() => setShowHelper(true)}
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              🚀 Start Database Setup Process
            </Button>
            
            <p className="text-sm text-muted-foreground mt-2">
              This will guide you through each step to fix the user signup issue
            </p>
            
            <div className="mt-4 space-y-3">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm font-medium text-red-800 mb-2">
                  🚨 Getting "Server not available" error?
                </p>
                <p className="text-sm text-red-700 mb-3">
                  This usually means your Supabase Edge Function (server) isn't deployed yet.
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowServerChecker(true)}
                    className="border-red-300 text-red-700 hover:bg-red-100"
                  >
                    🔍 Check Deployment
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowDeploymentHelper(true)}
                    className="border-green-300 text-green-700 hover:bg-green-100"
                  >
                    🚀 Deploy Now
                  </Button>
                </div>
              </div>
              
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm font-medium text-orange-800 mb-2">
                  🚨 Email/Password signup not working but Google Auth works?
                </p>
                <p className="text-sm text-orange-700 mb-3">
                  This is usually because the database triggers haven't been set up. Google Auth works differently and doesn't rely on our custom triggers.
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowEmergencyFix(true)}
                    className="border-orange-300 text-orange-700 hover:bg-orange-100"
                  >
                    🚨 Quick Fix
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowDebugTool(true)}
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    🔍 Full Diagnosis
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>🔧 Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                <Button 
                  variant="outline" 
                  onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
                >
                  Open Supabase Dashboard
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => onNavigate('auth-debug')}
                >
                  Auth Debug Page
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => onNavigate('admin')}
                >
                  Admin Dashboard
                </Button>
                
                <Button
  variant="outline"
  onClick={() => alert('Health check disabled in this build')}
  className="bg-blue-50 hover:bg-blue-100 border-blue-200"
>
  Debug Signup Issue
</Button>
                
                <Button 
                  variant="outline" 
                  onClick={async () => {
                    try {
                      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
                      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e5dee741/health`, {
                        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
                      });
                      
                      if (response.ok) {
                        const data = await response.json();
                        console.log('🏥 Health check response:', data);
                        alert(`✅ Server is online!\n\nStatus: ${data.status}\nKV Available: ${data.kv_available}\nRequest Valid: ${data.request_valid}\nHeaders Available: ${data.headers_available}\n\nTime: ${new Date(data.timestamp).toLocaleString()}`);
                      } else {
                        const errorText = await response.text();
                        console.error('❌ Server health check failed:', response.status, errorText);
                        alert(`❌ Server error: ${response.status}\n\nResponse: ${errorText}`);
                      }
                    } catch (error) {
                      console.error('❌ Server connection error:', error);
                      alert(`❌ Cannot connect to server\n\nError: ${error.message}\n\nThis usually means the Edge Function isn't deployed yet.`);
                    }
                  }}
                  className="bg-green-50 hover:bg-green-100 border-green-200"
                >
                  🌐 Test Server
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => setShowQuickTest(true)}
                  className="bg-purple-50 hover:bg-purple-100 border-purple-200"
                >
                  🧪 Test Signup Fix
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Setup Helper Modal */}
      {showHelper && (
        <DatabaseSetupHelper onClose={() => setShowHelper(false)} />
      )}
      
      {/* Debug Tool Modal */}
      {showDebugTool && (
        <SignupDebugTool onClose={() => setShowDebugTool(false)} />
      )}
      
      {/* Emergency Fix Modal */}
      {showEmergencyFix && (
        <EmergencySignupFix onClose={() => setShowEmergencyFix(false)} />
      )}
      
      {/* Quick Test Modal */}
      {showQuickTest && (
        <QuickSignupTest onClose={() => setShowQuickTest(false)} />
      )}
      
      {/* Server Deployment Checker Modal */}
      {showServerChecker && (
        <ServerDeploymentChecker onClose={() => setShowServerChecker(false)} />
      )}
      
      {/* Edge Function Deployment Helper Modal */}
      {showDeploymentHelper && (
        <EdgeFunctionDeploymentHelper onClose={() => setShowDeploymentHelper(false)} />
      )}
    </div>
  );
}