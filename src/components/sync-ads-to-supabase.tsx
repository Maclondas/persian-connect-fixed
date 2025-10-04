import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useLanguage } from './hooks/useLanguage';
import { realDataService } from './services/real-data-service';

export function SyncAdsToSupabase() {
  const { t, isRTL } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{ success: number; failed: number; details: string[] }>({
    success: 0,
    failed: 0,
    details: []
  });
  const [allAdsInfo, setAllAdsInfo] = useState<string[]>([]);

  const syncAds = async () => {
    setIsLoading(true);
    setResults({ success: 0, failed: 0, details: [] });

    try {
      // Get current user
      const currentUser = realDataService.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Get all ads from localStorage
      const localAds = await realDataService.getAllAds();
      const userAds = localAds.filter(ad => ad.userId === currentUser.id);
      
      // Debug info
      const details: string[] = [
        `🔍 Current user ID: ${currentUser.id}`,
        `📦 Total ads in localStorage: ${localAds.length}`,
        `👤 Ads for current user: ${userAds.length}`
      ];

      if (localAds.length > 0) {
        details.push(`📝 Sample ad user IDs: ${localAds.slice(0, 3).map(ad => ad.userId).join(', ')}`);
      }
      
      if (userAds.length === 0) {
        // Try to find ads with any user ID that might match
        const allUserIds = [...new Set(localAds.map(ad => ad.userId))];
        details.push(`🔍 All user IDs in localStorage: ${allUserIds.join(', ')}`);
        
        // If there are ads but none for current user, offer to sync all
        if (localAds.length > 0) {
          details.push(`⚠️ No ads found for current user, but ${localAds.length} ads exist for other users`);
          details.push(`💡 You may need to login as the user who created the ads`);
          
          setResults({ success: 0, failed: 0, details });
          return;
        } else {
          details.push('⚠️ No ads found in localStorage at all');
          setResults({ success: 0, failed: 0, details });
          return;
        }
      }

      // Import Supabase client
      const { getSupabaseClient } = await import('../utils/supabase/client');
      const supabase = getSupabaseClient();
      
      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      let successCount = 0;
      let failedCount = 0;

      for (const ad of userAds) {
        try {
          // Check if ad already exists in Supabase
          const { data: existing } = await supabase
            .from('ads')
            .select('id')
            .eq('id', ad.id)
            .single();

          if (existing) {
            details.push(`⏭️ Skipped ${ad.title} (already exists)`);
            continue;
          }

          // Convert ad to Supabase format
          const supabaseAd = {
            id: ad.id,
            title: ad.title,
            description: ad.description,
            price: ad.price,
            category: ad.category,
            subcategory: ad.subcategory,
            images: ad.images,
            owner_id: ad.userId,
            contact_info: ad.contactInfo,
            location: ad.location,
            status: ad.status || 'active',
            approved: ad.approved || true, // Set to approved for migration
            featured: ad.featured || false,
            boost: ad.boost,
            payment_status: ad.paymentStatus || 'completed',
            created_at: ad.createdAt,
            updated_at: ad.updatedAt
          };

          // Insert ad into Supabase
          const { error: insertError } = await supabase
            .from('ads')
            .insert(supabaseAd);

          if (insertError) {
            console.error('Failed to sync ad:', ad.title, insertError);
            details.push(`❌ Failed ${ad.title}: ${insertError.message}`);
            failedCount++;
          } else {
            details.push(`✅ Synced ${ad.title}`);
            successCount++;
          }

        } catch (error) {
          console.error('Error syncing ad:', ad.title, error);
          details.push(`❌ Error ${ad.title}: ${error}`);
          failedCount++;
        }
      }

      setResults({ success: successCount, failed: failedCount, details });

    } catch (error) {
      console.error('Sync failed:', error);
      setResults(prev => ({
        ...prev,
        details: [...prev.details, `❌ Sync failed: ${error}`]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const showAllAds = async () => {
    try {
      // Get current user
      const currentUser = realDataService.getCurrentUser();
      
      // Get all ads from localStorage
      const localAds = await realDataService.getAllAds();
      
      const info: string[] = [
        `👤 Current User: ${currentUser ? `${currentUser.email} (${currentUser.id})` : 'Not logged in'}`,
        `📦 Total ads in localStorage: ${localAds.length}`,
        ''
      ];

      if (localAds.length > 0) {
        info.push('📝 All Ads in localStorage:');
        localAds.forEach((ad, index) => {
          info.push(`${index + 1}. "${ad.title}" - User: ${ad.userId} - ID: ${ad.id}`);
        });
      } else {
        info.push('❌ No ads found in localStorage');
      }

      setAllAdsInfo(info);

    } catch (error) {
      setAllAdsInfo([`❌ Error: ${error}`]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">
            🔄 Sync Ads to Supabase
          </CardTitle>
          <CardDescription>
            This will sync your existing localStorage ads to the Supabase database
            so the chat system can access them properly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-2">
            <Button 
              onClick={syncAds} 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Syncing Ads...
                </>
              ) : (
                '🔄 Sync My Ads to Supabase'
              )}
            </Button>
            
            <Button 
              onClick={showAllAds} 
              variant="outline"
              className="w-full"
            >
              🔍 Show All Ads in localStorage
            </Button>
          </div>

          {(results.success > 0 || results.failed > 0 || results.details.length > 0) && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-2">Sync Results:</h3>
              <div className="flex gap-4 mb-3">
                <span className="text-green-600">✅ Success: {results.success}</span>
                <span className="text-red-600">❌ Failed: {results.failed}</span>
              </div>
              <div className="space-y-1 text-sm max-h-60 overflow-y-auto">
                {results.details.map((detail, index) => (
                  <div key={index}>{detail}</div>
                ))}
              </div>
            </div>
          )}

          {allAdsInfo.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <h3 className="font-medium mb-2">LocalStorage Debug Info:</h3>
              <div className="space-y-1 text-sm max-h-60 overflow-y-auto font-mono">
                {allAdsInfo.map((info, index) => (
                  <div key={index}>{info}</div>
                ))}
              </div>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            <h4 className="font-medium mb-1">What this does:</h4>
            <ul className="list-disc list-inside space-y-1">
              <li>Finds all your ads in localStorage</li>
              <li>Uploads them to Supabase database</li>
              <li>Skips ads that already exist</li>
              <li>Makes them accessible to the chat system</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}