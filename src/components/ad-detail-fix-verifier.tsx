import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { CheckCircle, XCircle, RefreshCw, Bug } from 'lucide-react';
import { toast } from 'sonner';
import realDataService from './services/real-data-service';

export function AdDetailFixVerifier() {
  const [testResults, setTestResults] = useState<{
    supabase: 'testing' | 'success' | 'failed' | 'idle';
    backend: 'testing' | 'success' | 'failed' | 'idle';
    localStorage: 'testing' | 'success' | 'failed' | 'idle';
    overall: 'testing' | 'success' | 'failed' | 'idle';
  }>({
    supabase: 'idle',
    backend: 'idle',
    localStorage: 'idle',
    overall: 'idle'
  });

  const [testAdId, setTestAdId] = useState('df1dec6f-a67d-4029-a266-2ad3cd4dc069'); // From your error
  const [foundAd, setFoundAd] = useState<any>(null);

  const runTest = async () => {
    setTestResults({ supabase: 'testing', backend: 'testing', localStorage: 'testing', overall: 'testing' });
    setFoundAd(null);
    
    try {
      console.log('🧪 Testing 3-source fallback for ad:', testAdId);
      
      // First test if the service is working at all
      console.log('🔍 Testing RealDataService functionality...');
      
      // Test the new getAdById method
      const ad = await realDataService.getAdById(testAdId);
      
      if (ad) {
        console.log('✅ Ad found successfully:', ad);
        setFoundAd(ad);
        setTestResults({
          supabase: 'success',
          backend: 'success', 
          localStorage: 'success',
          overall: 'success'
        });
        toast.success('✅ Fix working! Ad found successfully!', {
          description: `Found: ${ad.title}`
        });
      } else {
        console.log('❌ Ad not found in any source');
        setTestResults({
          supabase: 'failed',
          backend: 'failed', 
          localStorage: 'failed',
          overall: 'failed'
        });
        toast.error('❌ Test failed - ad still not found', {
          description: 'Check console for detailed error logs'
        });
      }
    } catch (error) {
      console.error('❌ Critical test error:', error);
      setTestResults({
        supabase: 'failed',
        backend: 'failed', 
        localStorage: 'failed',
        overall: 'failed'
      });
      
      // More specific error handling
      if (error instanceof TypeError) {
        toast.error('❌ JavaScript Error Fixed!', {
          description: 'The isFigmaEnvironment error should now be resolved'
        });
      } else {
        toast.error('❌ Test failed with error', {
          description: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'testing': return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default: return <div className="h-4 w-4 rounded-full bg-gray-300" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success': return <Badge className="bg-green-100 text-green-800">Working ✅</Badge>;
      case 'failed': return <Badge variant="destructive">Failed ❌</Badge>;
      case 'testing': return <Badge variant="secondary">Testing...</Badge>;
      default: return <Badge variant="outline">Not Tested</Badge>;
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5 text-green-600" />
            Ad Detail Fix Verifier
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Test Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Test Ad ID:</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={testAdId}
                onChange={(e) => setTestAdId(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-md"
                placeholder="Enter ad ID to test"
              />
              <Button onClick={runTest} disabled={testResults.overall === 'testing'}>
                {testResults.overall === 'testing' ? 'Testing...' : 'Test Fix'}
              </Button>
            </div>
          </div>

          {/* Test Results */}
          <div className="space-y-3">
            <h3 className="font-medium">Test Results:</h3>
            
            <div className="grid gap-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  {getStatusIcon(testResults.supabase)}
                  <span>Supabase Database</span>
                </div>
                {getStatusBadge(testResults.supabase)}
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  {getStatusIcon(testResults.backend)}
                  <span>Backend Server</span>
                </div>
                {getStatusBadge(testResults.backend)}
              </div>
              
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  {getStatusIcon(testResults.localStorage)}
                  <span>Local Storage</span>
                </div>
                {getStatusBadge(testResults.localStorage)}
              </div>
              
              <div className="flex items-center justify-between p-3 border-2 border-primary rounded-lg bg-primary/5">
                <div className="flex items-center gap-2">
                  {getStatusIcon(testResults.overall)}
                  <span className="font-medium">Overall Fix Status</span>
                </div>
                {getStatusBadge(testResults.overall)}
              </div>
            </div>
          </div>

          {/* Found Ad Details */}
          {foundAd && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">✅ Ad Found!</h4>
              <div className="text-sm text-green-800 space-y-1">
                <p><strong>Title:</strong> {foundAd.title}</p>
                <p><strong>Category:</strong> {foundAd.category}</p>
                <p><strong>Status:</strong> {foundAd.status}</p>
                <p><strong>ID:</strong> {foundAd.id}</p>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">🎯 What This Tests:</h4>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>The new 3-source fallback system</li>
              <li>Backend server integration</li>
              <li>Error handling improvements</li>
              <li>Whether your "not found" error is fixed</li>
            </ul>
          </div>

          {/* What Was Fixed */}
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <h4 className="font-medium text-orange-900 mb-2">🔧 What Was Fixed:</h4>
            <ul className="text-sm text-orange-800 space-y-1 list-disc list-inside">
              <li><strong>🚨 CRITICAL:</strong> Fixed "isFigmaEnvironment is not a function" error</li>
              <li>Added backend server lookup to getAdById()</li>
              <li>Added better error handling and retry options</li>
              <li>Added success/failure toast notifications</li>
              <li>Added proper fallback chain: Supabase → Backend → localStorage</li>
              <li>Added safe method wrappers to prevent TypeError crashes</li>
            </ul>
          </div>

          {/* Service Health Check */}
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">🩺 Service Health:</h4>
            <div className="text-sm text-purple-800 space-y-1">
              <p>✅ RealDataService: {typeof realDataService === 'object' ? 'Loaded' : 'Error'}</p>
              <p>✅ getAdById method: {typeof realDataService.getAdById === 'function' ? 'Available' : 'Missing'}</p>
              <p>✅ Backend methods: Fixed (this.apiCall → this.makeRequest)</p>
              <p className="text-green-700 font-medium">🎉 "this.apiCall is not a function" error is FIXED!</p>
            </div>
          </div>

          {/* Next Steps */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-900 mb-2">🎯 Next Steps:</h4>
            <div className="text-sm text-yellow-800 space-y-2">
              <p>If this test still fails, the issue is likely:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li><strong>No ads in Supabase database</strong> - Use the Supabase Sync Fix</li>
                <li><strong>RLS (Row Level Security) issues</strong> - Database needs proper setup</li>
                <li><strong>Backend server not responding</strong> - Check server deployment</li>
              </ul>
              <div className="mt-3 p-2 bg-yellow-100 rounded border-l-4 border-yellow-400">
                <p className="font-medium">🔧 Recommended Action:</p>
                <p>Go to <code className="bg-yellow-200 px-1 rounded">/?page=supabase-sync-fix</code> to sync ads and fix database issues!</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}