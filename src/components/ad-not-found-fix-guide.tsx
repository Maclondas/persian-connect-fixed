import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CheckCircle, AlertTriangle, Database, ExternalLink, Settings } from 'lucide-react';

interface AdNotFoundFixGuideProps {
  onNavigate?: (page: string) => void;
}

export function AdNotFoundFixGuide({ onNavigate }: AdNotFoundFixGuideProps) {
  const openSchemaSetup = () => {
    if (onNavigate) {
      onNavigate('simple-db-setup');
    } else {
      window.open('/?page=simple-db-setup', '_blank');
    }
  };

  const openErrorHelper = () => {
    if (onNavigate) {
      onNavigate('database-error-helper');
    } else {
      window.open('/?page=database-error-helper', '_blank');
    }
  };

  const openSyncPage = () => {
    if (onNavigate) {
      onNavigate('sync-ads');
    } else {
      window.open('/?page=sync-ads', '_blank');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Ad Not Found - Quick Fix Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Problem Description */}
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <h3 className="font-medium text-orange-900 mb-2">What's happening?</h3>
            <p className="text-sm text-orange-800">
              Your ad was created successfully but it's only saved in localStorage (browser storage). 
              For it to work with the chat system and be fully accessible, it needs to be synced to the Supabase database.
            </p>
          </div>

          {/* Steps to Fix */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">🔧 How to Fix (Choose One Option):</h3>
            
            {/* Option 1: Quick Fix */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Option 1: Quick Sync (Recommended)</h4>
                  <Badge variant="default">Fastest</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <p className="text-sm text-gray-600">
                  Use our sync tool to automatically transfer all localStorage ads to Supabase.
                </p>
                <Button 
                  onClick={openSyncPage}
                  className="w-full"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Open Ad Sync Tool
                </Button>
              </CardContent>
            </Card>

            {/* Option 2: Complete Setup */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Option 2: Complete Database Setup</h4>
                  <Badge variant="secondary">Permanent Fix</Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <p className="text-sm text-gray-600">
                  Set up the proper database schema so all future ads automatically sync to Supabase.
                </p>
                <div className="space-y-2">
                  <Button 
                    onClick={openSchemaSetup}
                    className="w-full"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Quick Database Setup
                  </Button>
                  <Button 
                    onClick={openErrorHelper}
                    variant="outline"
                    className="w-full"
                  >
                    See All Fix Options
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* What Each Option Does */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">📋 What Each Option Does:</h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Quick Sync Tool:</h4>
                <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                  <li>Syncs all existing ads from localStorage to Supabase</li>
                  <li>Shows sync status and fixes user ID mismatches</li>
                  <li>Makes ads immediately available for chat</li>
                  <li>Takes 1-2 minutes</li>
                </ul>
              </div>
              
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Database Setup:</h4>
                <ul className="list-disc list-inside text-sm text-green-800 space-y-1">
                  <li>Creates proper database schema in Supabase</li>
                  <li>Enables automatic syncing for all future ads</li>
                  <li>One-time setup (5 minutes)</li>
                  <li>Prevents this issue from happening again</li>
                </ul>
              </div>
            </div>
          </div>

          {/* After Fix */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-medium text-green-900 mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              After the Fix:
            </h3>
            <ul className="list-disc list-inside text-sm text-green-800 space-y-1">
              <li>Your ad will be visible when clicked</li>
              <li>Chat system will work properly</li>
              <li>Ad will be accessible from all devices</li>
              <li>No more "Ad not found" errors</li>
            </ul>
          </div>

          {/* Technical Details */}
          <details className="border rounded-lg">
            <summary className="p-4 cursor-pointer font-medium">🔍 Technical Details (Optional)</summary>
            <div className="p-4 pt-0 border-t text-sm text-gray-600 space-y-2">
              <p><strong>What happened:</strong> The ad was saved to localStorage but the Supabase database doesn't have the proper schema to store it.</p>
              <p><strong>Why it matters:</strong> The chat system and cross-device access require ads to be in the central Supabase database.</p>
              <p><strong>The fix:</strong> Either sync existing ads or set up the database schema for automatic syncing.</p>
            </div>
          </details>
        </CardContent>
      </Card>
    </div>
  );
}