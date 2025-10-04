import { useState, useEffect } from 'react';

export interface LocationData {
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

interface LocationState {
  location: LocationData | null;
  isLoading: boolean;
  error: string | null;
  isDetecting: boolean;
}

export function useLocation() {
  const [state, setState] = useState<LocationState>(() => {
    // Try to load location from localStorage first
    try {
      const savedLocation = localStorage.getItem('userLocation');
      if (savedLocation) {
        const location = JSON.parse(savedLocation);
        return {
          location,
          isLoading: false,
          error: null,
          isDetecting: false,
        };
      }
    } catch (error) {
      console.error('Failed to load saved location:', error);
    }
    
    // Return null as default - no hardcoded location
    return {
      location: null,
      isLoading: false,
      error: null,
      isDetecting: false,
    };
  });

  const detectLocation = async () => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by this browser',
        isDetecting: false,
      }));
      return;
    }

    setState(prev => ({ ...prev, isDetecting: true, error: null }));

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // 5 minutes cache
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          setState(prev => ({ ...prev, isLoading: true }));
          
          // Use a reverse geocoding service (mock implementation)
          const locationData = await reverseGeocode(latitude, longitude);
          
          const newLocation = {
            ...locationData,
            latitude,
            longitude,
          };
          
          setState(prev => ({
            ...prev,
            location: newLocation,
            isLoading: false,
            isDetecting: false,
            error: null,
          }));
          
          // Save detected location to localStorage
          try {
            localStorage.setItem('userLocation', JSON.stringify(newLocation));
          } catch (error) {
            console.error('Failed to save detected location:', error);
          }
        } catch (error) {
          console.error('Reverse geocoding failed:', error);
          setState(prev => ({
            ...prev,
            isLoading: false,
            isDetecting: false,
            error: 'Failed to get location details',
          }));
        }
      },
      (error) => {
        let errorMessage = 'Failed to detect location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        
        setState(prev => ({
          ...prev,
          error: errorMessage,
          isLoading: false,
          isDetecting: false,
        }));
      },
      options
    );
  };

  const setManualLocation = (location: LocationData) => {
    setState(prev => ({
      ...prev,
      location,
      error: null,
    }));
    
    // Save location to localStorage for persistence
    try {
      localStorage.setItem('userLocation', JSON.stringify(location));
    } catch (error) {
      console.error('Failed to save location:', error);
    }
  };

  return {
    ...state,
    detectLocation,
    setManualLocation,
  };
}

// Mock reverse geocoding function
// In a real app, you'd use a service like Google Maps, Mapbox, or OpenStreetMap
async function reverseGeocode(lat: number, lng: number): Promise<LocationData> {
  // This is a mock implementation
  // You could replace this with actual reverse geocoding API calls
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock city determination based on coordinates (very basic)
  const cities = [
    { name: 'London', country: 'United Kingdom', lat: 51.5074, lng: -0.1278 },
    { name: 'New York', country: 'United States', lat: 40.7128, lng: -74.0060 },
    { name: 'Stockholm', country: 'Sweden', lat: 59.3293, lng: 18.0686 },
    { name: 'Madrid', country: 'Spain', lat: 40.4168, lng: -3.7038 },
    { name: 'Rome', country: 'Italy', lat: 41.9028, lng: 12.4964 },
    { name: 'Berlin', country: 'Germany', lat: 52.5200, lng: 13.4050 },
    { name: 'Amsterdam', country: 'Netherlands', lat: 52.3676, lng: 4.9041 },
    { name: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522 },
    { name: 'Bucharest', country: 'Romania', lat: 44.4268, lng: 26.1025 },
    { name: 'Lisbon', country: 'Portugal', lat: 38.7223, lng: -9.1393 },
    { name: 'Dubai', country: 'United Arab Emirates', lat: 25.2048, lng: 55.2708 },
    { name: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832 },
    { name: 'Doha', country: 'Qatar', lat: 25.2854, lng: 51.5310 },
    { name: 'Kuwait City', country: 'Kuwait', lat: 29.3759, lng: 47.9774 },
    { name: 'Istanbul', country: 'Turkey', lat: 41.0082, lng: 28.9784 },
    { name: 'Bangkok', country: 'Thailand', lat: 13.7563, lng: 100.5018 },
    { name: 'Athens', country: 'Greece', lat: 37.9838, lng: 23.7275 },
    { name: 'Mexico City', country: 'Mexico', lat: 19.4326, lng: -99.1332 },
  ];
  
  // Find the closest city (very basic distance calculation)
  let closestCity = cities[0];
  let minDistance = calculateDistance(lat, lng, cities[0].lat, cities[0].lng);
  
  for (const city of cities) {
    const distance = calculateDistance(lat, lng, city.lat, city.lng);
    if (distance < minDistance) {
      minDistance = distance;
      closestCity = city;
    }
  }
  
  return {
    city: closestCity.name,
    country: closestCity.country,
  };
}

// Simple distance calculation using Haversine formula
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}