import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckCircle, Database, Cloud, Zap } from 'lucide-react';

interface AutoSyncSetupGuideProps {
  onNavigate?: (page: string) => void;
}

export function AutoSyncSetupGuide({ onNavigate }: AutoSyncSetupGuideProps) {
  const openSchemaSetup = () => {
    if (onNavigate) {
      onNavigate('database-schema');
    } else {
      window.open('/?page=database-schema', '_blank');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Auto-Sync Setup Complete!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* What's New */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">✨ What's New:</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Cloud className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-900">Automatic Supabase Sync</span>
                </div>
                <p className="text-sm text-green-800">
                  All ads now automatically save to Supabase cloud database when posted
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Dual Storage System</span>
                </div>
                <p className="text-sm text-blue-800">
                  Saves to both Supabase and localStorage for maximum reliability
                </p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">🚀 New Features:</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Real-time chat system now works with all ads</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>User settings automatically sync across devices</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>No more manual sync required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span>Better error handling with helpful messages</span>
              </div>
            </div>
          </div>

          {/* Setup Required */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h4 className="font-medium text-amber-900 mb-2">📋 One-Time Setup Required:</h4>
            <p className="text-sm text-amber-800 mb-3">
              To enable full auto-sync functionality, you need to set up the database schema in Supabase (one-time only).
            </p>
            <Button onClick={openSchemaSetup} variant="outline">
              <Database className="h-4 w-4 mr-2" />
              Setup Database Schema
            </Button>
          </div>

          {/* How It Works */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">🔄 How Auto-Sync Works:</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li><strong>Post an ad:</strong> System automatically saves to both Supabase and localStorage</li>
                <li><strong>Real-time sync:</strong> Changes are immediately available across all devices</li>
                <li><strong>Fallback protection:</strong> If Supabase fails, ad is saved locally with sync retry</li>
                <li><strong>Chat integration:</strong> All ads are immediately available for chat functionality</li>
              </ol>
            </div>
          </div>

          <div className="text-center">
            <Badge variant="secondary" className="text-xs">
              No more localStorage-only ads • No more manual syncing • Real-time everywhere
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}