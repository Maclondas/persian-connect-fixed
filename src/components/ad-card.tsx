import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Star, Heart, MessageCircle, MapPin, Clock, Eye } from 'lucide-react';
import { useLanguage } from './hooks/useLanguage';
import { Ad } from './services/real-data-service';
import { toast } from 'sonner@2.0.3';

interface AdCardProps {
  ad: Ad;
  onNavigate: (page: string, params?: { adId?: string }) => void;
  variant?: 'grid' | 'list';
  showViewCount?: boolean;
}

export function AdCard({ ad, onNavigate, variant = 'list', showViewCount = false }: AdCardProps) {
  const { t, currentLanguage } = useLanguage();
  const [isLiked, setIsLiked] = useState(false);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return currentLanguage === 'en' ? 'Just now' : 'همین الان';
    if (diffHours < 24) return currentLanguage === 'en' ? `${diffHours} hours ago` : `${diffHours} ساعت پیش`;
    if (diffDays === 1) return currentLanguage === 'en' ? 'Yesterday' : 'دیروز';
    return currentLanguage === 'en' ? `${diffDays} days ago` : `${diffDays} روز پیش`;
  };

  const isFeatured = ad.featured && ad.featuredUntil && new Date(ad.featuredUntil) > new Date();

  if (variant === 'grid') {
    return (
      <Card 
        className="group overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 border border-gray-200"
        onClick={() => onNavigate('ad-detail', { adId: ad.id })}
      >
        <div className="relative aspect-square overflow-hidden">
          <ImageWithFallback
            src={ad.images?.[0] || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'}
            alt={currentLanguage === 'en' ? ad.title : ad.titlePersian}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
          
          {/* Featured Badge */}
          {isFeatured && (
            <div className="absolute top-2 left-2 z-10">
              <Badge className="bg-yellow-500 text-white px-2 py-1 text-xs font-bold shadow-lg">
                <Star className="h-3 w-3 mr-1" />
                {currentLanguage === 'en' ? 'FEATURED' : 'ویژه'}
              </Badge>
            </div>
          )}
          
          {/* Urgent Badge */}
          {ad.urgent && (
            <div className="absolute top-2 right-2 z-10">
              <Badge className="bg-red-500 text-white px-2 py-1 text-xs font-bold shadow-lg">
                {currentLanguage === 'en' ? 'URGENT' : 'فوری'}
              </Badge>
            </div>
          )}

          {/* Like Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute bottom-2 right-2 h-8 w-8 bg-white/90 hover:bg-white shadow-md"
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
              toast.success(isLiked ? 'Removed from favorites' : 'Added to favorites');
            }}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
          </Button>
        </div>
        
        <CardContent className="p-3">
          <h3 className="font-medium text-sm mb-1 line-clamp-2">
            {currentLanguage === 'en' ? ad.title : ad.titlePersian}
          </h3>
          
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
            <MapPin className="h-3 w-3" />
            <span>{ad.location.city}, {ad.location.country}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-primary">${ad.price.toLocaleString()}</span>
              {ad.priceType === 'negotiable' && (
                <Badge variant="secondary" className="text-xs">
                  {currentLanguage === 'en' ? 'NEG' : 'قابل مذاکره'}
                </Badge>
              )}
            </div>
            
            {showViewCount && (
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Eye className="h-3 w-3" />
                <span>{ad.views}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-1 text-xs text-gray-500 mt-2">
            <Clock className="h-3 w-3" />
            <span>{formatTimeAgo(new Date(ad.createdAt))}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // List variant (default)
  return (
    <Card 
      className="group overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200 border border-gray-200"
      onClick={() => onNavigate('ad-detail', { adId: ad.id })}
    >
      <CardContent className="p-0">
        <div className="flex">
          <div className="relative w-24 h-24 flex-shrink-0">
            <ImageWithFallback
              src={ad.images?.[0] || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400'}
              alt={currentLanguage === 'en' ? ad.title : ad.titlePersian}
              className="w-full h-full object-cover"
            />
            
            {/* Featured Badge */}
            {isFeatured && (
              <div className="absolute top-1 left-1 z-10">
                <Badge className="bg-yellow-500 text-white px-1 py-0.5 text-xs font-bold">
                  <Star className="h-2.5 w-2.5 mr-1" />
                  {currentLanguage === 'en' ? 'FEATURED' : 'ویژه'}
                </Badge>
              </div>
            )}
            
            {/* Urgent Badge */}
            {ad.urgent && (
              <div className="absolute top-1 right-1 z-10">
                <Badge className="bg-red-500 text-white px-1 py-0.5 text-xs font-bold">
                  {currentLanguage === 'en' ? 'URGENT' : 'فوری'}
                </Badge>
              </div>
            )}
          </div>
          
          <div className="flex-1 p-3">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm mb-1 line-clamp-1">
                  {currentLanguage === 'en' ? ad.title : ad.titlePersian}
                </h3>
                
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatTimeAgo(new Date(ad.createdAt))}</span>
                </div>
                
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                  <MapPin className="h-3 w-3" />
                  <span>{ad.location.city}, {ad.location.country}</span>
                </div>
                
                {showViewCount && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Eye className="h-3 w-3" />
                    <span>{ad.views} views</span>
                  </div>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLiked(!isLiked);
                  toast.success(isLiked ? 'Removed from favorites' : 'Added to favorites');
                }}
              >
                <Heart className={`h-4 w-4 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-primary">${ad.price.toLocaleString()}</span>
                {ad.priceType === 'negotiable' && (
                  <Badge className="bg-green-500 text-white text-xs">
                    {currentLanguage === 'en' ? 'NEG' : 'قابل مذاکره'}
                  </Badge>
                )}
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-400 hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  toast.info('Chat feature coming soon');
                }}
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}