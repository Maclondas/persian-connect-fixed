import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { CheckCircle, AlertTriangle, Database, Users, MessageCircle } from 'lucide-react';

export function ChatFixGuide() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-6 w-6" />
            Chat Issue Fixed - Solution Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Problem Explanation */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Issue Identified:</strong> Users were being redirected to login when clicking "Chat with Seller" 
              because user profiles weren't being created in the database automatically during signup.
            </AlertDescription>
          </Alert>

          {/* Solution Overview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Solution Implemented
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <Database className="h-4 w-4" />
                  Database Trigger
                </h4>
                <p className="text-sm text-gray-600">
                  Added automatic database trigger that creates user profiles in the `profiles` table 
                  whenever a new user signs up in the `auth.users` table.
                </p>
              </Card>
              
              <Card className="p-4">
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4" />
                  Profile Validation
                </h4>
                <p className="text-sm text-gray-600">
                  Enhanced chat creation to automatically check and create missing user profiles 
                  before allowing chat functionality.
                </p>
              </Card>
            </div>
          </div>

          {/* Database Setup Required */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-orange-600">
              🔧 Database Setup Required
            </h3>
            
            <Alert>
              <Database className="h-4 w-4" />
              <AlertDescription>
                <strong>Important:</strong> You need to run the database setup script in your Supabase dashboard 
                to create the profiles table and trigger.
              </AlertDescription>
            </Alert>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Steps to Complete Setup:</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Go to your Supabase project dashboard</li>
                <li>Navigate to <Badge variant="outline">SQL Editor</Badge></li>
                <li>Run the script from <code>/supabase/database-setup.sql</code></li>
                <li>This will create:
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                    <li>The <code>profiles</code> table</li>
                    <li>Automatic trigger for profile creation</li>
                    <li>Row Level Security policies</li>
                    <li>Helper functions</li>
                  </ul>
                </li>
              </ol>
            </div>
          </div>

          {/* For Existing Users */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-blue-600">
              👥 For Existing Users
            </h3>
            
            <p className="text-sm text-gray-600">
              If you have existing users who signed up before the database trigger was set up, 
              they can use the "Chat Auth Fix" tool above to:
            </p>
            
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-4">
              <li>Check their profile status</li>
              <li>Automatically create missing profiles</li>
              <li>Restore their authentication session</li>
              <li>Enable chat functionality</li>
            </ul>
          </div>

          {/* Admin Setup */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-purple-600">
              👑 Admin User Setup
            </h3>
            
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-800 mb-2">
                After running the database setup, create your first admin user:
              </p>
              <code className="block bg-purple-100 p-2 rounded text-xs">
                SELECT public.create_admin_user('ommzadeh@gmail.com');
              </code>
              <p className="text-xs text-purple-600 mt-2">
                Run this SQL command to give admin privileges to your email.
              </p>
            </div>
          </div>

          {/* Testing */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-green-600">
              ✅ Testing the Fix
            </h3>
            
            <div className="grid md:grid-cols-3 gap-3">
              <Card className="p-3">
                <h4 className="font-medium text-sm">1. New Users</h4>
                <p className="text-xs text-gray-600">
                  New signups will automatically get profiles created and can use chat immediately.
                </p>
              </Card>
              
              <Card className="p-3">
                <h4 className="font-medium text-sm">2. Existing Users</h4>
                <p className="text-xs text-gray-600">
                  Use the "Fix Profile" button above to create missing profiles.
                </p>
              </Card>
              
              <Card className="p-3">
                <h4 className="font-medium text-sm">3. Chat Function</h4>
                <p className="text-xs text-gray-600">
                  "Chat with Seller" should work without redirecting to login.
                </p>
              </Card>
            </div>
          </div>

          {/* Success Status */}
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Status:</strong> Chat authentication system has been fixed and enhanced. 
              Complete the database setup above to activate the solution.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}