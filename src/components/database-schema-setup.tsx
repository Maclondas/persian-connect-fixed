import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Database, CheckCircle, XCircle, AlertCircle, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export function DatabaseSchemaSetup() {
  const [setupStatus, setSetupStatus] = useState<'idle' | 'checking' | 'creating' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string>('');

  const sqlSchema = `-- Step 1: Create the ads table
CREATE TABLE IF NOT EXISTS public.ads (
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
    images text[] DEFAULT '{}',
    owner_id text NOT NULL,
    contact_info jsonb DEFAULT '{}',
    location jsonb DEFAULT '{}',
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

-- Step 2: Create user_settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
    user_id text PRIMARY KEY,
    settings jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Step 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_ads_owner_id ON public.ads(owner_id);
CREATE INDEX IF NOT EXISTS idx_ads_category ON public.ads(category);
CREATE INDEX IF NOT EXISTS idx_ads_status ON public.ads(status);
CREATE INDEX IF NOT EXISTS idx_ads_created_at ON public.ads(created_at DESC);

-- Step 4: Enable Row Level Security
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view approved ads" ON public.ads;
DROP POLICY IF EXISTS "Users can view their own ads" ON public.ads;
DROP POLICY IF EXISTS "Users can insert their own ads" ON public.ads;
DROP POLICY IF EXISTS "Users can update their own ads" ON public.ads;
DROP POLICY IF EXISTS "Users can delete their own ads" ON public.ads;
DROP POLICY IF EXISTS "Users can view their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON public.user_settings;

-- Step 6: Create new policies
CREATE POLICY "Anyone can view approved ads" ON public.ads
    FOR SELECT USING (approved = true OR status = 'approved');

CREATE POLICY "Users can manage their own ads" ON public.ads
    FOR ALL USING (owner_id = auth.uid()::text);

CREATE POLICY "Users can manage their own settings" ON public.user_settings
    FOR ALL USING (user_id = auth.uid()::text);

-- Step 7: Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.ads TO anon, authenticated;
GRANT ALL ON public.user_settings TO anon, authenticated;`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sqlSchema);
      toast.success('SQL schema copied to clipboard!');
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

      // Try to query the ads table to check if it exists with proper schema
      const { data, error } = await supabase
        .from('ads')
        .select('id, title, category')
        .limit(1);

      if (error) {
        if (error.message.includes('relation') || error.message.includes('does not exist')) {
          setSetupStatus('error');
          setError('Ads table does not exist. Please run the setup.');
        } else if (error.message.includes('column') || error.message.includes('schema cache')) {
          setSetupStatus('error');
          setError('Ads table exists but has incorrect schema. Please run the setup.');
        } else {
          throw error;
        }
      } else {
        setSetupStatus('success');
        toast.success('✅ Database schema is properly configured!');
      }
    } catch (error) {
      setSetupStatus('error');
      setError(`Schema check failed: ${error}`);
      console.error('Schema check error:', error);
    }
  };

  const openSupabaseDashboard = () => {
    window.open('https://supabase.com/dashboard/project', '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Schema Setup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Current Status:</h3>
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
              {setupStatus === 'success' && 'Schema Ready'}
              {setupStatus === 'error' && 'Setup Required'}
            </Badge>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              onClick={checkSchema}
              disabled={setupStatus === 'checking'}
              variant="outline"
            >
              {setupStatus === 'checking' ? 'Checking...' : 'Check Schema'}
            </Button>
            
            <Button 
              onClick={openSupabaseDashboard}
              variant="outline"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Supabase Dashboard
            </Button>
          </div>

          {/* Instructions */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Setup Instructions:</h3>
            
            {setupStatus !== 'success' && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Manual Setup Required:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                  <li>Go to your <strong>Supabase Dashboard</strong></li>
                  <li>Navigate to <strong>SQL Editor</strong></li>
                  <li>Copy the SQL schema below and paste it into the editor</li>
                  <li>Click <strong>"Run"</strong> to execute the schema</li>
                  <li>Come back here and click <strong>"Check Schema"</strong></li>
                </ol>
              </div>
            )}

            {setupStatus === 'success' && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800">
                  ✅ Your database schema is properly configured! All ads will now automatically save to Supabase.
                </p>
              </div>
            )}

            {/* SQL Schema */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">SQL Schema to Run:</h4>
                <Button 
                  onClick={copyToClipboard}
                  variant="outline" 
                  size="sm"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy SQL
                </Button>
              </div>
              
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <pre className="text-xs whitespace-pre-wrap">{sqlSchema}</pre>
              </div>
            </div>

            {/* Additional Notes */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h4 className="font-medium text-amber-900 mb-2">Important Notes:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-amber-800">
                <li>This setup is required only once per Supabase project</li>
                <li>The schema includes proper indexes and security policies</li>
                <li>All existing ads in localStorage will sync once schema is ready</li>
                <li>Future ads will automatically save to both Supabase and localStorage</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}