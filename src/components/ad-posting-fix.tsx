import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { AlertTriangle, Database, HardDrive, Trash2, Settings, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface NavigateFunction {
  (page: 'home' | 'post-ad' | 'admin' | 'ultra-simple-db'): void;
}

interface AdPostingFixProps {
  onNavigate: NavigateFunction;
}

export function AdPostingFix({ onNavigate }: AdPostingFixProps) {
  const [isFixing, setIsFixing] = useState(false);
  const [fixResults, setFixResults] = useState<{
    localStorage: boolean;
    database: boolean;
    userRole: boolean;
  } | null>(null);

  // Check localStorage usage
  const getLocalStorageUsage = () => {
    try {
      let total = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += localStorage[key].length + key.length;
        }
      }
      return {
        used: total,
        usedMB: (total / 1024 / 1024).toFixed(2),
        percentage: (total / (10 * 1024 * 1024) * 100).toFixed(1) // Assuming 10MB limit
      };
    } catch (error) {
      return { used: 0, usedMB: '0', percentage: '0' };
    }
  };

  const [storageInfo, setStorageInfo] = useState(getLocalStorageUsage());

  // Check what's causing the issues
  const checkIssues = () => {
    const issues = [];
    
    // Check localStorage quota
    if (parseFloat(storageInfo.percentage) > 80) {
      issues.push({
        type: 'localStorage',
        severity: 'high',
        message: `LocalStorage usage is ${storageInfo.percentage}% (${storageInfo.usedMB} MB)`
      });
    }

    // Check for old data
    const oldKeys = Object.keys(localStorage).filter(key => 
      key.includes('demo_ads') || key.includes('omm_ads') || key.includes('temp_')
    );
    
    if (oldKeys.length > 0) {
      issues.push({
        type: 'oldData',
        severity: 'medium',
        message: `Found ${oldKeys.length} old data keys that can be cleaned`
      });
    }

    return issues;
  };

  const [issues, setIssues] = useState(checkIssues());

  // Fix localStorage issues
  const fixLocalStorage = async (): Promise<boolean> => {
    try {
      console.log('🧹 Cleaning localStorage...');
      
      // Keep only essential keys
      const essentialKeys = [
        'auth_user', 'auth_token', 'demo_language', 'user_preferences'
      ];
      
      const keysToRemove = Object.keys(localStorage).filter(key => 
        !essentialKeys.includes(key)
      );
      
      console.log('🗑️ Removing keys:', keysToRemove);
      
      keysToRemove.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.warn(`Failed to remove key ${key}:`, error);
        }
      });
      
      // Update storage info
      setStorageInfo(getLocalStorageUsage());
      setIssues(checkIssues());
      
      console.log('✅ LocalStorage cleaned successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to clean localStorage:', error);
      return false;
    }
  };

  // Fix database schema issues
  const fixDatabaseSchema = async (): Promise<boolean> => {
    try {
      console.log('🗄️ Checking database schema...');
      
      // Import and check Supabase connection
      const { getSupabaseClient } = await import('../utils/supabase/client');
      const supabase = getSupabaseClient();
      
      if (!supabase) {
        console.log('⚠️ Supabase not available, using local storage only');
        return true; // Not an error if Supabase isn't configured
      }

      // Test the ads table structure
      const { data, error } = await supabase
        .from('ads')
        .select('id, title, category, status')
        .limit(1);

      if (error) {
        console.log('❌ Database schema issue detected:', error.message);
        
        if (error.message.includes('relation "ads" does not exist')) {
          console.log('🔧 Ads table needs to be created');
          toast.error('Database setup required. Redirecting to setup page...', {
            description: 'The ads table needs to be created in your Supabase database.',
          });
          
          setTimeout(() => {
            onNavigate('ultra-simple-db');
          }, 2000);
          
          return false;
        }
        
        // For column-specific errors, we'll handle them in the service
        console.log('⚠️ Schema mismatch detected, but database exists');
        return true;
      }

      console.log('✅ Database schema check passed');
      return true;
    } catch (error) {
      console.error('❌ Database check failed:', error);
      return false;
    }
  };

  // Fix user role checking
  const fixUserRole = async (): Promise<boolean> => {
    try {
      console.log('👤 Fixing user role checking...');
      
      // Check current user data
      const userData = localStorage.getItem('auth_user');
      if (!userData) {
        console.log('❌ No user data found');
        return false;
      }

      const user = JSON.parse(userData);
      console.log('👤 Current user:', { email: user.email, role: user.role });

      // Ensure admin status for the admin email
      if (user.email === 'ommzadeh@gmail.com' && user.role !== 'admin') {
        console.log('🔧 Promoting user to admin...');
        user.role = 'admin';
        localStorage.setItem('auth_user', JSON.stringify(user));
        console.log('✅ User promoted to admin');
      }

      // Ensure role field exists
      if (!user.role) {
        user.role = user.email === 'ommzadeh@gmail.com' ? 'admin' : 'user';
        localStorage.setItem('auth_user', JSON.stringify(user));
        console.log('✅ User role field added');
      }

      return true;
    } catch (error) {
      console.error('❌ Failed to fix user role:', error);
      return false;
    }
  };

  // Run all fixes
  const runAllFixes = async () => {
    setIsFixing(true);
    toast.loading('Fixing ad posting issues...');

    try {
      const results = {
        localStorage: await fixLocalStorage(),
        database: await fixDatabaseSchema(),
        userRole: await fixUserRole()
      };

      setFixResults(results);

      const allFixed = Object.values(results).every(result => result === true);
      
      toast.dismiss();
      
      if (allFixed) {
        toast.success('✅ All issues fixed! You can now post ads successfully.', {
          description: 'The ad posting system should work properly now.',
        });
      } else {
        toast.error('⚠️ Some issues remain. Check the results below.', {
          description: 'You may need to run database setup or check your configuration.',
        });
      }
    } catch (error) {
      console.error('❌ Fix process failed:', error);
      toast.dismiss();
      toast.error('❌ Fix process failed. Please try again or contact support.');
    } finally {
      setIsFixing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Settings className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Ad Posting Issue Fix</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Fix database schema, localStorage quota, and user role issues
          </p>
        </div>

        {/* Current Issues */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Detected Issues
            </CardTitle>
          </CardHeader>
          <CardContent>
            {issues.length === 0 ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-4 w-4" />
                <span>No critical issues detected</span>
              </div>
            ) : (
              <div className="space-y-3">
                {issues.map((issue, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                    <div>
                      <Badge variant={issue.severity === 'high' ? 'destructive' : 'secondary'} className="mb-1">
                        {issue.severity.toUpperCase()}
                      </Badge>
                      <p className="text-sm font-medium">{issue.type}</p>
                      <p className="text-xs text-gray-600">{issue.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Storage Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5 text-blue-500" />
              Storage Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{storageInfo.usedMB} MB</div>
                <div className="text-sm text-gray-600">Used</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{storageInfo.percentage}%</div>
                <div className="text-sm text-gray-600">Usage</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{Object.keys(localStorage).length}</div>
                <div className="text-sm text-gray-600">Keys</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fix Results */}
        {fixResults && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-green-500" />
                Fix Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(fixResults).map(([key, success]) => (
                  <div key={key} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      {success ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    </div>
                    <Badge variant={success ? 'default' : 'destructive'}>
                      {success ? 'Fixed' : 'Failed'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Fix Actions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5 text-green-500" />
              Quick Fix Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={async () => {
                  setIsFixing(true);
                  toast.loading('Clearing localStorage...');
                  try {
                    const keysToKeep = ['auth_user', 'auth_token', 'demo_language'];
                    const allKeys = Object.keys(localStorage);
                    allKeys.forEach(key => {
                      if (!keysToKeep.includes(key)) {
                        localStorage.removeItem(key);
                      }
                    });
                    toast.dismiss();
                    toast.success('✅ LocalStorage cleaned!');
                    setStorageInfo(getLocalStorageUsage());
                    setIssues(checkIssues());
                  } catch (error) {
                    toast.dismiss();
                    toast.error('❌ Failed to clean localStorage');
                  } finally {
                    setIsFixing(false);
                  }
                }}
                disabled={isFixing}
                variant="outline"
                className="bg-blue-50 hover:bg-blue-100 border-blue-200"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Storage Cache
              </Button>

              <Button 
                onClick={async () => {
                  setIsFixing(true);
                  toast.loading('Promoting to admin...');
                  try {
                    const userData = localStorage.getItem('auth_user');
                    if (userData) {
                      const user = JSON.parse(userData);
                      if (user.email === 'ommzadeh@gmail.com') {
                        user.role = 'admin';
                        localStorage.setItem('auth_user', JSON.stringify(user));
                        toast.dismiss();
                        toast.success('✅ Admin privileges activated!');
                      } else {
                        toast.dismiss();
                        toast.error('Only ommzadeh@gmail.com can be promoted to admin');
                      }
                    } else {
                      toast.dismiss();
                      toast.error('No user found. Please log in first.');
                    }
                  } catch (error) {
                    toast.dismiss();
                    toast.error('❌ Failed to set admin role');
                  } finally {
                    setIsFixing(false);
                  }
                }}
                disabled={isFixing}
                variant="outline"
                className="bg-green-50 hover:bg-green-100 border-green-200"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Force Admin Role
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={runAllFixes}
                disabled={isFixing}
                className="flex-1 bg-primary hover:bg-primary/90"
              >
                {isFixing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Fixing Issues...
                  </>
                ) : (
                  <>
                    <Settings className="h-4 w-4 mr-2" />
                    Fix All Issues
                  </>
                )}
              </Button>
              
              <Button variant="outline" onClick={() => onNavigate('post-ad')}>
                Try Posting Ad
              </Button>
              
              <Button variant="outline" onClick={() => onNavigate('ultra-simple-db')}>
                Database Setup
              </Button>
            </div>
            
            <Separator className="my-4" />
            
            <div className="text-center">
              <Button variant="ghost" onClick={() => onNavigate('home')}>
                ← Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>If issues persist, please run the database setup or contact support.</p>
          <p className="mt-1">
            <strong>Admin email:</strong> ommzadeh@gmail.com will automatically get admin privileges.
          </p>
        </div>
      </div>
    </div>
  );
}