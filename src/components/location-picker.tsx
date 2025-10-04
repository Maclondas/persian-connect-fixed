import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { MapPin, Loader2, Navigation, X } from 'lucide-react';
import { useLocation, LocationData } from './hooks/useLocation';
import { useLanguage } from './hooks/useLanguage';

interface LocationPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: LocationData) => void;
  currentLocation: LocationData | null;
}

const popularCities = [
  { city: 'London', country: 'United Kingdom' },
  { city: 'New York', country: 'United States' },
  { city: 'Stockholm', country: 'Sweden' },
  { city: 'Madrid', country: 'Spain' },
  { city: 'Rome', country: 'Italy' },
  { city: 'Berlin', country: 'Germany' },
  { city: 'Amsterdam', country: 'Netherlands' },
  { city: 'Paris', country: 'France' },
  { city: 'Bucharest', country: 'Romania' },
  { city: 'Lisbon', country: 'Portugal' },
  { city: 'Dubai', country: 'United Arab Emirates' },
  { city: 'Toronto', country: 'Canada' },
  { city: 'Doha', country: 'Qatar' },
  { city: 'Kuwait City', country: 'Kuwait' },
  { city: 'Istanbul', country: 'Turkey' },
  { city: 'Bangkok', country: 'Thailand' },
  { city: 'Athens', country: 'Greece' },
  { city: 'Mexico City', country: 'Mexico' },
];

export function LocationPicker({ isOpen, onClose, onLocationSelect, currentLocation }: LocationPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { detectLocation, isDetecting, error } = useLocation();
  const { t, isRTL } = useLanguage();

  const filteredCities = popularCities.filter(
    city =>
      city.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      city.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAutoDetect = async () => {
    try {
      await detectLocation();
      // The location will be updated through the hook
      // You might want to pass the detected location back to the parent
    } catch (error) {
      console.error('Location detection failed:', error);
    }
  };

  const handleCitySelect = (location: LocationData) => {
    onLocationSelect(location);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className={`flex items-center ${isRTL ? 'space-x-reverse space-x-2' : 'space-x-2'}`}>
            <MapPin className="h-5 w-5" />
            <span>{t('location.title')}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Auto Detect Section */}
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
              <Navigation className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">{t('location.useCurrentLocation')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('location.autoDetect')}
                </p>
              </div>
            </div>
            <Button
              onClick={handleAutoDetect}
              disabled={isDetecting}
              variant="outline"
              size="sm"
            >
              {isDetecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t('location.detect')
              )}
            </Button>
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Search */}
          <div className="relative">
            <MapPin className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4`} />
            <Input
              type="text"
              placeholder={t('location.searchPlaceholder')}
              className={isRTL ? 'pr-10' : 'pl-10'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Cities List */}
          <div className="max-h-60 overflow-y-auto space-y-1">
            {filteredCities.map((location, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start h-auto p-3"
                onClick={() => handleCitySelect(location)}
              >
                <div className={`flex items-center w-full ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div className={isRTL ? 'text-right' : 'text-left'}>
                    <p className="font-medium">{location.city}</p>
                    <p className="text-sm text-muted-foreground">{location.country}</p>
                  </div>
                  {currentLocation?.city === location.city && (
                    <div className={`${isRTL ? 'mr-auto' : 'ml-auto'} w-2 h-2 bg-primary rounded-full`} />
                  )}
                </div>
              </Button>
            ))}
            
            {filteredCities.length === 0 && searchQuery && (
              <div className="text-center py-6 text-muted-foreground">
                <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>{t('location.noCitiesFound')} "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}