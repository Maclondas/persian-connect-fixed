import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AlertTriangle, Zap, Database, Settings, ArrowRight } from 'lucide-react';

interface DatabaseErrorHelperProps {
  onNavigate?: (page: string) => void;
}

export function DatabaseErrorHelper({ onNavigate }: DatabaseErrorHelperProps) {
  const openPage = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    } else {
      window.open(`/?page=${page}`, '_blank');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Database Setup Error - Choose Your Fix
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Problem */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="font-medium text-red-900 mb-2">❌ What's Wrong:</h3>
            <p className="text-sm text-red-800">
              The Supabase database doesn't have the required tables. This causes the 
              "column 'category' does not exist" error when trying to save ads.
            </p>
          </div>

          {/* Solutions */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">🛠️ Choose Your Solution:</h3>
            
            <div className="grid gap-4">
              {/* Option 1: Quick Fix */}
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-green-600" />
                      <h4 className="font-medium text-green-900">Super Quick Fix</h4>
                    </div>
                    <Badge variant="default">Recommended</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-green-800 mb-3">
                    Simplified SQL script that just creates the essential tables. 
                    Takes 2 minutes, very likely to work.
                  </p>
                  <Button 
                    onClick={() => openPage('simple-db-setup')}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Try Quick Fix
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* Option 2: Sync Existing */}
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-blue-600" />
                    <h4 className="font-medium text-blue-900">Sync Existing Ads</h4>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-blue-800 mb-3">
                    If you have ads saved locally, use this to move them to Supabase 
                    once the database is set up.
                  </p>
                  <Button 
                    onClick={() => openPage('sync-ads')}
                    variant="outline"
                    className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Sync My Ads
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* Option 3: Full Setup */}
              <Card className="border-gray-200 bg-gray-50">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-gray-600" />
                    <h4 className="font-medium text-gray-900">Complete Setup</h4>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-700 mb-3">
                    Full database schema with indexes, security policies, and triggers. 
                    More complex but comprehensive.
                  </p>
                  <Button 
                    onClick={() => openPage('database-schema')}
                    variant="outline"
                    className="w-full"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Full Setup
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* What Happens After */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">✅ After Setup:</h3>
            <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
              <li>All new ads will automatically save to Supabase</li>
              <li>Ad detail pages will work properly</li>
              <li>Chat system will have access to all ads</li>
              <li>No more "column does not exist" errors</li>
            </ul>
          </div>

          {/* Technical Note */}
          <details className="border rounded-lg">
            <summary className="p-4 cursor-pointer font-medium">🤓 Why This Happened</summary>
            <div className="p-4 pt-0 border-t text-sm text-gray-600">
              <p>
                Your app was posting ads to localStorage successfully, but when it tried to also 
                save them to Supabase (for the chat system), it couldn't find the database tables. 
                This is because Supabase projects start empty - you need to create the tables first.
              </p>
            </div>
          </details>
        </CardContent>
      </Card>
    </div>
  );
}