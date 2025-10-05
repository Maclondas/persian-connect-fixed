import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Database, CheckCircle, XCircle, AlertCircle, Copy, Zap } from 'lucide-react';
import { toast } from 'sonner';

export function UltraSimpleDatabaseSetup() {
  const [setupStatus, setSetupStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string>('');

  // Ultra-clean SQL - no snippets, no complex references
  const ultraCleanSQL = `CREATE TABLE ads (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    title_persian text,
    description text NOT NULL,
    description_persian text,
    price decimal(10,2) DEFAULT 0,
    price_type text DEFAULT 'fixed',
    currency text DEFAULT 'USD',
    category text NOT NULL,
    subcategory text,
    images text[],
    owner_id text NOT NULL,
    contact_info jsonb,
    location jsonb,
    status text DEFAULT 'pending',
    approved boolean DEFAULT false,
    featured boolean DEFAULT false,
    featured_until timestamptz,
    urgent boolean DEFAULT false,
    condition text,
    brand text,
    model text,
    specifications jsonb,
    payment_status text DEFAULT 'pending',
    payment_id text,
    moderation_result jsonb,
    views integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    expires_at timestamptz
);

CREATE TABLE user_settings (
    user_id text PRIMARY KEY,
    settings jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(ultraCleanSQL);
      toast.success('✅ Clean SQL copied!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const checkSchema = async () => {
    setSetupStatus('checking');
    setError('');

    try {
      const { getSupabaseClient } = await import('../utils/supabase/client');
      const supabase = getSupabaseClient();
      
      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      // Try to query the ads table
      const { data, error } = await supabase
        .from('ads')
        .select('id')
        .limit(1);

      if (error) {
        setSetupStatus('error');
        setError(`Database setup needed: ${error.message}`);
      } else {
        setSetupStatus('success');
        toast.success('✅ Database is ready!');
      }
    } catch (error) {
      setSetupStatus('error');
      setError(`Schema check failed: ${error}`);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-green-600" />
            Ultra-Simple Database Fix
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Status:</h3>
            <Badge variant={
              setupStatus === 'success' ? 'default' :
              setupStatus === 'error' ? 'destructive' :
              setupStatus === 'checking' ? 'secondary' : 'outline'
            }>
              {setupStatus === 'success' && <CheckCircle className="h-4 w-4 mr-1" />}
              {setupStatus === 'error' && <XCircle className="h-4 w-4 mr-1" />}
              {setupStatus === 'checking' && <AlertCircle className="h-4 w-4 mr-1 animate-spin" />}
              {setupStatus === 'idle' && 'Not Checked'}
              {setupStatus === 'checking' && 'Checking...'}
              {setupStatus === 'success' && 'Database Ready ✅'}
              {setupStatus === 'error' && 'Setup Required'}
            </Badge>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Error Fix Notice */}
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <h4 className="font-medium text-orange-900 mb-2">🔥 Fixing Your Snippet Error:</h4>
            <p className="text-sm text-orange-800 mb-2">
              The error you saw was caused by snippet references in the SQL. 
              This version has <strong>NO snippets, NO templates</strong> - just pure SQL.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-3">
            <Button 
              onClick={checkSchema}
              disabled={setupStatus === 'checking'}
              variant="outline"
              className="w-full"
            >
              {setupStatus === 'checking' ? 'Checking...' : 'Test Database'}
            </Button>
            
            <Button 
              onClick={() => window.open('https://supabase.com/dashboard/project', '_blank')}
              variant="outline"
              className="w-full"
            >
              Open Supabase →
            </Button>
          </div>

          {/* Instructions */}
          {setupStatus !== 'success' && (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-900 mb-3">✨ Super Simple Steps:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-green-800">
                  <li><strong>Copy</strong> the clean SQL below (no snippets!)</li>
                  <li><strong>Go to</strong> Supabase → SQL Editor</li>
                  <li><strong>Paste</strong> in the editor</li>
                  <li><strong>Click "RUN"</strong></li>
                  <li><strong>Come back</strong> and click "Test Database"</li>
                </ol>
              </div>

              {/* Clean SQL */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">🧹 Ultra-Clean SQL (No Snippets):</h4>
                  <Button 
                    onClick={copyToClipboard}
                    variant="outline" 
                    size="sm"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy SQL
                  </Button>
                </div>
                
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto max-h-96">
                  <pre className="text-xs whitespace-pre-wrap">{ultraCleanSQL}</pre>
                </div>
              </div>
            </div>
          )}

          {setupStatus === 'success' && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-medium text-green-900 mb-2">🎉 Perfect! Database Ready!</h4>
              <p className="text-green-800 text-sm">
                Your ads will now save properly and be visible when clicked!
              </p>
            </div>
          )}

          {/* What's Different */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">🔧 What We Fixed:</h4>
            <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
              <li>Removed ALL snippet references</li>
              <li>Removed complex policies that cause errors</li>
              <li>Just creates the basic tables you need</li>
              <li>No templates, no dependencies</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}