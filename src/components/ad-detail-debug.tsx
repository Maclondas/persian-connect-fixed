import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Database, Search, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { realDataService } from './services/real-data-service';

interface AdDetailDebugProps {
  adId: string;
}

export function AdDetailDebug({ adId }: AdDetailDebugProps) {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    const info: any = {
      adId,
      sources: {
        localStorage: null,
        supabase: null,
        server: null
      },
      errors: []
    };

    try {
      // Check localStorage
      try {
        const localAds = JSON.parse(localStorage.getItem('demo_ads') || '[]');
        const localAd = localAds.find((ad: any) => ad.id === adId);
        info.sources.localStorage = {
          found: !!localAd,
          ad: localAd,
          totalAds: localAds.length
        };
      } catch (error) {
        info.errors.push(`localStorage error: ${error}`);
      }

      // Check Supabase
      try {
        const supabaseAd = await realDataService.getAdFromSupabase(adId);
        info.sources.supabase = {
          found: !!supabaseAd,
          ad: supabaseAd
        };
      } catch (error) {
        info.errors.push(`Supabase error: ${error}`);
        info.sources.supabase = {
          found: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }

      // Check server
      try {
        const serverAd = await realDataService.makeRequest(`/ads/${adId}`);
        info.sources.server = {
          found: !!serverAd?.ad,
          ad: serverAd?.ad
        };
      } catch (error) {
        info.errors.push(`Server error: ${error}`);
        info.sources.server = {
          found: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }

      setDebugInfo(info);
    } catch (error) {
      info.errors.push(`General error: ${error}`);
      setDebugInfo(info);
    } finally {
      setLoading(false);
    }
  };

  const syncAdToSupabase = async () => {
    if (!debugInfo?.sources.localStorage?.ad) {
      toast.error('No ad found in localStorage to sync');
      return;
    }

    try {
      await realDataService.saveAdToSupabase(debugInfo.sources.localStorage.ad);
      toast.success('Ad synced to Supabase successfully!');
      // Re-run diagnostics
      await runDiagnostics();
    } catch (error) {
      toast.error(`Failed to sync ad: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, [adId]);

  const getStatusBadge = (found: boolean, error?: string) => {
    if (error) {
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Error</Badge>;
    }
    return found ? 
      <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Found</Badge> :
      <Badge variant="secondary"><XCircle className="h-3 w-3 mr-1" />Not Found</Badge>;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Ad Detail Debug - ID: {adId}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex gap-3">
            <Button 
              onClick={runDiagnostics}
              disabled={loading}
              variant="outline"
            >
              {loading ? 'Running...' : 'Run Diagnostics'}
            </Button>
            
            {debugInfo?.sources.localStorage?.found && !debugInfo?.sources.supabase?.found && (
              <Button 
                onClick={syncAdToSupabase}
                variant="default"
              >
                <Database className="h-4 w-4 mr-2" />
                Sync to Supabase
              </Button>
            )}
          </div>

          {debugInfo && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Storage Sources:</h3>
              
              {/* localStorage */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">localStorage</h4>
                    {getStatusBadge(debugInfo.sources.localStorage?.found)}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {debugInfo.sources.localStorage?.found ? (
                    <div className="space-y-2 text-sm">
                      <p><strong>Title:</strong> {debugInfo.sources.localStorage.ad.title}</p>
                      <p><strong>Status:</strong> {debugInfo.sources.localStorage.ad.status}</p>
                      <p><strong>Category:</strong> {debugInfo.sources.localStorage.ad.category}</p>
                      <p><strong>Total Local Ads:</strong> {debugInfo.sources.localStorage.totalAds}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">Ad not found in localStorage</p>
                  )}
                </CardContent>
              </Card>

              {/* Supabase */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Supabase Database</h4>
                    {getStatusBadge(debugInfo.sources.supabase?.found, debugInfo.sources.supabase?.error)}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {debugInfo.sources.supabase?.found ? (
                    <div className="space-y-2 text-sm">
                      <p><strong>Title:</strong> {debugInfo.sources.supabase.ad.title}</p>
                      <p><strong>Status:</strong> {debugInfo.sources.supabase.ad.status}</p>
                      <p><strong>Category:</strong> {debugInfo.sources.supabase.ad.category}</p>
                    </div>
                  ) : (
                    <div className="text-sm">
                      <p className="text-gray-600">Ad not found in Supabase</p>
                      {debugInfo.sources.supabase?.error && (
                        <p className="text-red-600 mt-1">Error: {debugInfo.sources.supabase.error}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Server */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Backend Server</h4>
                    {getStatusBadge(debugInfo.sources.server?.found, debugInfo.sources.server?.error)}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {debugInfo.sources.server?.found ? (
                    <div className="space-y-2 text-sm">
                      <p><strong>Title:</strong> {debugInfo.sources.server.ad.title}</p>
                      <p><strong>Status:</strong> {debugInfo.sources.server.ad.status}</p>
                      <p><strong>Category:</strong> {debugInfo.sources.server.ad.category}</p>
                    </div>
                  ) : (
                    <div className="text-sm">
                      <p className="text-gray-600">Ad not found on server</p>
                      {debugInfo.sources.server?.error && (
                        <p className="text-red-600 mt-1">Error: {debugInfo.sources.server.error}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Errors */}
              {debugInfo.errors.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      Errors
                    </h4>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-1">
                      {debugInfo.errors.map((error: string, index: number) => (
                        <p key={index} className="text-sm text-red-600">{error}</p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recommendations */}
              <Card>
                <CardHeader className="pb-3">
                  <h4 className="font-medium">Recommendations:</h4>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 text-sm">
                    {debugInfo.sources.localStorage?.found && !debugInfo.sources.supabase?.found && (
                      <p className="text-amber-600">• Ad exists in localStorage but not Supabase - click "Sync to Supabase"</p>
                    )}
                    {debugInfo.sources.supabase?.error?.includes('schema') && (
                      <p className="text-red-600">• Database schema issue - run the database setup script</p>
                    )}
                    {!debugInfo.sources.localStorage?.found && !debugInfo.sources.supabase?.found && !debugInfo.sources.server?.found && (
                      <p className="text-red-600">• Ad not found in any storage - may have been deleted or never created</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}