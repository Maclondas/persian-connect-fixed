import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

interface DatabaseSetupHelperProps {
  onClose: () => void;
}

export function DatabaseSetupHelper({ onClose }: DatabaseSetupHelperProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const markStepComplete = (step: number) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps([...completedSteps, step]);
    }
  };

  const steps = [
    {
      id: 1,
      title: "Execute SQL Setup",
      description: "Run the database setup script in Supabase SQL Editor",
      action: "Manual Action Required"
    },
    {
      id: 2,
      title: "Create Admin User",
      description: "Set up your first admin account",
      action: "SQL Command"
    },
    {
      id: 3,
      title: "Test User Signup",
      description: "Verify the trigger is working correctly",
      action: "App Testing"
    },
    {
      id: 4,
      title: "Verify Backend",
      description: "Check server logs and functionality",
      action: "Monitoring"
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔧 Database Setup - Fix User Signup Issue
            <Badge variant="outline">Step {currentStep} of {steps.length}</Badge>
          </CardTitle>
          <CardDescription>
            Follow these steps to implement the profiles table and trigger system for proper user signup flow
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Progress */}
          <div className="flex gap-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex-1 h-2 rounded ${
                  completedSteps.includes(step.id)
                    ? 'bg-green-500'
                    : step.id === currentStep
                    ? 'bg-primary'
                    : 'bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Step 1: SQL Setup */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Step 1: Execute SQL Setup Script</h3>
              
              <Alert>
                <AlertDescription>
                  You need to run the SQL setup script in your Supabase dashboard to create the profiles table and triggers. 
                  <strong>✅ This setup includes auto-confirmation - users won't need to verify their email!</strong>
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <h4 className="font-medium">Instructions:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Go to your Supabase project dashboard</li>
                  <li>Navigate to <strong>SQL Editor</strong> in the left sidebar</li>
                  <li>Click <strong>"New Query"</strong></li>
                  <li>Copy the contents of <code>/supabase/database-setup.sql</code></li>
                  <li>Paste it into the SQL editor</li>
                  <li>Click <strong>"Run"</strong> to execute</li>
                </ol>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">SQL File Location:</p>
                <code className="text-xs bg-background p-2 rounded block">
                  /supabase/database-setup.sql
                </code>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => markStepComplete(1)}>
                  ✅ I've executed the SQL script
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(2)}
                  disabled={!completedSteps.includes(1)}
                >
                  Next Step
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Create Admin */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Step 2: Create Admin User</h3>
              
              <Alert>
                <AlertDescription>
                  Create your first admin user to access the admin dashboard.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <h4 className="font-medium">Run this SQL command:</h4>
                <div className="bg-muted p-4 rounded-lg">
                  <code className="text-sm block">
                    SELECT public.create_admin_user('your-email@domain.com');
                  </code>
                </div>
                <p className="text-sm text-muted-foreground">
                  Replace 'your-email@domain.com' with your actual email address that you'll use to sign up.
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => markStepComplete(2)}>
                  ✅ I've created the admin user
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(3)}
                  disabled={!completedSteps.includes(2)}
                >
                  Next Step
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Test Signup */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Step 3: Test User Signup</h3>
              
              <Alert>
                <AlertDescription>
                  Test the signup flow to verify the database trigger is working correctly.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <h4 className="font-medium">Testing Steps:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm">
                  <li>Go to the login page and click "Sign Up"</li>
                  <li>Fill out the signup form with test data</li>
                  <li>Submit the form and check for success</li>
                  <li>Go to Supabase dashboard → Authentication → Users</li>
                  <li>Verify the user appears in auth.users</li>
                  <li>Go to Table Editor → profiles table</li>
                  <li>Verify the user profile was automatically created</li>
                </ol>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-sm font-medium text-yellow-800">What to Check:</p>
                <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                  <li>• User exists in both auth.users and profiles tables</li>
                  <li>• Profile has correct username, email, and name</li>
                  <li>• User can login immediately (no email confirmation needed!)</li>
                  <li>• No errors in browser console or server logs</li>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => markStepComplete(3)}>
                  ✅ Signup test successful
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(4)}
                  disabled={!completedSteps.includes(3)}
                >
                  Next Step
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Verify Backend */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Step 4: Verify Backend Integration</h3>
              
              <Alert>
                <AlertDescription>
                  Final verification that everything is working correctly.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <h4 className="font-medium">Backend Checks:</h4>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Check server logs for successful profile creation</li>
                  <li>Verify user authentication works after signup</li>
                  <li>Test profile fetching in the app</li>
                  <li>Ensure admin dashboard access (if admin user)</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <p className="text-sm font-medium text-green-800">Success Indicators:</p>
                <ul className="text-sm text-green-700 mt-1 space-y-1">
                  <li>• No "user not found" errors</li>
                  <li>• Smooth login/logout flow</li>
                  <li>• Profile data loads correctly</li>
                  <li>• Database trigger creates profiles automatically</li>
                </ul>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => markStepComplete(4)}>
                  ✅ Backend verification complete
                </Button>
              </div>
            </div>
          )}

          {/* All Complete */}
          {completedSteps.length === 4 && (
            <div className="space-y-4">
              <div className="text-center py-8">
                <h3 className="text-xl font-semibold text-green-600 mb-2">
                  🎉 Setup Complete!
                </h3>
                <p className="text-muted-foreground">
                  Your user signup issue has been resolved. Users will now be automatically 
                  created in both the auth system and profiles table.
                </p>
              </div>

              <Alert>
                <AlertDescription>
                  <strong>What was fixed:</strong>
                  <br />
                  • Added profiles table with proper RLS policies
                  <br />
                  • Created database trigger to auto-create profiles
                  <br />
                  • Enabled auto-confirmation (no email verification required)
                  <br />
                  • Updated backend to use profiles table
                  <br />
                  • Maintained backward compatibility with KV store
                </AlertDescription>
              </Alert>
            </div>
          )}

          <Separator />
          
          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            
            <div className="text-sm text-muted-foreground">
              {completedSteps.length} of {steps.length} steps completed
            </div>
            
            <div className="flex gap-2">
              {currentStep < 4 ? (
                <Button 
                  onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                  disabled={!completedSteps.includes(currentStep)}
                >
                  Next
                </Button>
              ) : (
                <Button onClick={onClose}>
                  Close
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}