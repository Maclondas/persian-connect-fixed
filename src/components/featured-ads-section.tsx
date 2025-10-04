import { useState, useEffect } from 'react';
import { AdCard } from './ad-card';
import { Star, RefreshCw } from 'lucide-react';
import { useLanguage } from './hooks/useLanguage';
import { realDataService as dataService, Ad } from './services/real-data-service';

interface FeaturedAdsSectionProps {
  category?: string;
  onNavigate: (page: string, params?: { adId?: string }) => void;
  variant?: 'grid' | 'list';
  maxAds?: number;
}

export function FeaturedAdsSection({ 
  category, 
  onNavigate, 
  variant = 'list',
  maxAds = 5 
}: FeaturedAdsSectionProps) {
  const { t, currentLanguage } = useLanguage();
  const [featuredAds, setFeaturedAds] = useState<Ad[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rotationKey, setRotationKey] = useState(0);

  useEffect(() => {
    loadFeaturedAds();
    
    // Set up auto-refresh every 10 minutes to check for rotation
    const interval = setInterval(() => {
      loadFeaturedAds();
      setRotationKey(prev => prev + 1);
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, [category, rotationKey]);

  const loadFeaturedAds = async () => {
    try {
      setIsLoading(true);
      
      // Check for expired featured ads first
      dataService.checkExpiredFeaturedAds();
      
      // Get featured ads using the async getAds method
      const response = await dataService.getAds({
        category: category || undefined,
        featured: true
      });
      
      // Limit to maxAds
      setFeaturedAds(response.ads.slice(0, maxAds));
    } catch (error) {
      console.error('Failed to load featured ads:', error);
      setFeaturedAds([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render if no featured ads
  if (!isLoading && featuredAds.length === 0) {
    return null;
  }

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <Star className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">
                {currentLanguage === 'en' ? 'Featured Ads' : 'آگهی‌های ویژه'}
              </h2>
              <p className="text-xs text-gray-500">
                {currentLanguage === 'en' 
                  ? `${featuredAds.length} featured listings` 
                  : `${featuredAds.length} آگهی ویژه`}
              </p>
            </div>
          </div>
          
          {/* Rotation indicator */}
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <RefreshCw className="h-3 w-3" />
            <span>
              {currentLanguage === 'en' ? 'Auto-rotating' : 'چرخش خودکار'}
            </span>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-2"></div>
            <p className="text-gray-500 text-sm">
              {currentLanguage === 'en' ? 'Loading featured ads...' : 'در حال بارگذاری آگهی‌های ویژه...'}
            </p>
          </div>
        ) : (
          <div className={variant === 'grid' 
            ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" 
            : "space-y-3"
          }>
            {featuredAds.map((ad) => (
              <AdCard
                key={ad.id}
                ad={ad}
                onNavigate={onNavigate}
                variant={variant}
                showViewCount={true}
              />
            ))}
          </div>
        )}
        
        {/* Rotation info */}
        {featuredAds.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-yellow-800">
                <p className="font-medium mb-1">
                  {currentLanguage === 'en' ? 'Featured Ads Rotation' : 'چرخش آگهی‌های ویژه'}
                </p>
                <p>
                  {currentLanguage === 'en' 
                    ? 'Featured ads rotate every 10 minutes to ensure all boosted listings get maximum visibility throughout their featured period.'
                    : 'آگهی‌های ویژه هر ۱۰ دقیقه چرخش می‌کنند تا همه آگهی‌های تقویت شده در طول دوره ویژه خود حداکثر نمایش را داشته باشند.'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}