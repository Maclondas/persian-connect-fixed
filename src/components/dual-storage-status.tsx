import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Cloud, Database, RefreshCw, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { realDataService } from './services/real-data-service';
import { toast } from 'sonner';

interface SyncStatus {
  total: number;
  synced: number;
  localOnly: number;
  details: Array<{
    id: string;
    title: string;
    status: string;
    syncStatus: string;
    lastSynced: string | null;
  }>;
}

interface NavigateFunction {
  (page: string): void;
}

interface DualStorageStatusProps {
  onNavigate?: NavigateFunction;
}

export function DualStorageStatus({ onNavigate }: DualStorageStatusProps) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkSyncStatus = async () => {
    try {
      setIsLoading(true);
      const status = await realDataService.checkSyncStatus();
      setSyncStatus(status);
      setLastChecked(new Date());
    } catch (error) {
      console.error('Failed to check sync status:', error);
      toast.error('Failed to check sync status');
    } finally {
      setIsLoading(false);
    }
  };

  const performSync = async () => {
    try {
      setIsSyncing(true);
      const result = await realDataService.syncLocalStorageAdsToSupabase();
      
      if (result.synced > 0) {
        toast.success(`Successfully synced ${result.synced} ads to cloud storage`);
      } else if (result.failed > 0) {
        toast.error(`Failed to sync ${result.failed} ads`);
      } else {
        toast.info('All ads are already synced');
      }
      
      // Refresh status after sync
      await checkSyncStatus();
    } catch (error) {
      console.error('Sync failed:', error);
      toast.error('Failed to sync ads to cloud storage');
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    checkSyncStatus();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(checkSyncStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading && !syncStatus) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          <span>Checking storage status...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Dual Storage System Status
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={checkSyncStatus}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Storage Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <div className="text-2xl">{syncStatus?.total || 0}</div>
              <div className="text-sm text-muted-foreground">Total Ads</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Cloud className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-2xl text-green-600">{syncStatus?.synced || 0}</div>
              <div className="text-sm text-green-600">Cloud Synced</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="text-2xl text-orange-600">{syncStatus?.localOnly || 0}</div>
              <div className="text-sm text-orange-600">Local Only</div>
            </div>
          </div>

          {/* Sync Action */}
          {syncStatus && syncStatus.localOnly > 0 && (
            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
              <div>
                <p className="font-medium text-orange-800">
                  {syncStatus.localOnly} ads need cloud backup
                </p>
                <p className="text-sm text-orange-600">
                  These ads are only stored locally and should be synced to cloud storage
                </p>
              </div>
              <Button 
                onClick={performSync}
                disabled={isSyncing}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <Cloud className="h-4 w-4 mr-2" />
                    Sync to Cloud
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Status indicator */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center">
              {syncStatus?.localOnly === 0 ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                  <span className="text-green-600">All ads backed up to cloud</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 mr-2 text-orange-600" />
                  <span className="text-orange-600">Some ads need cloud backup</span>
                </>
              )}
            </div>
            {lastChecked && (
              <span>
                Last checked: {lastChecked.toLocaleTimeString()}
              </span>
            )}
          </div>

          {/* Detailed ad list (if needed) */}
          {syncStatus && syncStatus.details.length > 0 && (
            <details className="mt-4">
              <summary className="cursor-pointer font-medium text-sm">
                View ad details ({syncStatus.details.length} ads)
              </summary>
              <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
                {syncStatus.details.map((ad) => (
                  <div key={ad.id} className="flex items-center justify-between p-2 bg-muted rounded text-sm">
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium">{ad.title}</div>
                      <div className="text-xs text-muted-foreground">
                        Status: {ad.status}
                      </div>
                    </div>
                    <Badge 
                      variant={ad.syncStatus === 'synced' ? 'default' : 'secondary'}
                      className="ml-2"
                    >
                      {ad.syncStatus === 'synced' ? '☁️ Synced' : '💾 Local'}
                    </Badge>
                  </div>
                ))}
              </div>
            </details>
          )}
        </CardContent>
      </Card>

      {/* Info card explaining the system */}
      <Card className="bg-blue-50">
        <CardContent className="p-4">
          <h4 className="font-medium mb-2 text-blue-800">About Dual Storage System</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Ads are automatically saved to both local storage and cloud (Supabase)</li>
            <li>• Local storage provides instant access even when offline</li>
            <li>• Cloud storage provides backup and sync across devices</li>
            <li>• The system works even if cloud storage is temporarily unavailable</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}