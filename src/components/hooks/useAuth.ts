import { useState, useEffect } from 'react';
import realDataService from '../services/real-data-service';
import type { User } from '../services/real-data-service';

// Add a global flag to prevent multiple useAuth instances from initializing simultaneously
let globalAuthInitialized = false;
let globalAuthPromise: Promise<User | null> | null = null;

// Utility function to reset global auth state (useful for testing/debugging)
export const resetGlobalAuthState = () => {
  globalAuthInitialized = false;
  globalAuthPromise = null;
  console.log('🔄 Global auth state reset');
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      // Prevent multiple initializations globally
      if (initialized || globalAuthInitialized) {
        // If already initialized globally, get current state
        if (globalAuthInitialized) {
          const currentUser = realDataService.getCurrentUser();
          if (mounted) {
            setUser(currentUser);
            setAuthChecked(true);
            setLoading(false);
            setInitialized(true);
          }
        }
        return;
      }

      // If there's already a global auth check in progress, wait for it
      if (globalAuthPromise) {
        try {
          const sessionUser = await globalAuthPromise;
          if (mounted) {
            setUser(sessionUser);
            setAuthChecked(true);
            setLoading(false);
            setInitialized(true);
          }
        } catch (error) {
          console.warn('⚠️ useAuth: Global auth promise failed:', error);
          if (mounted) {
            setUser(null);
            setAuthChecked(true);
            setLoading(false);
            setInitialized(true);
          }
        }
        return;
      }
      
      globalAuthInitialized = true;
      
      try {
        console.log('🔍 useAuth: Initializing authentication...');
        
        // Get current user from memory first (fast path)
        const currentUser = realDataService.getCurrentUser();
        
        if (currentUser) {
          console.log('✅ useAuth: Found user in memory:', currentUser.email);
          if (mounted) {
            setUser(currentUser);
            setAuthChecked(true);
            setLoading(false);
            setInitialized(true);
          }
          return; // Early exit for performance
        }

        console.log('❌ useAuth: No user in memory, checking session...');
        
        // Try to restore session with timeout for better UX
        globalAuthPromise = realDataService.checkExistingSession();
        
        try {
          const timeoutPromise = new Promise<null>((_, reject) => 
            setTimeout(() => reject(new Error('Session restore timeout')), 5000)
          );
          
          const sessionUser = await Promise.race([globalAuthPromise, timeoutPromise]);
          
          if (mounted) {
            setUser(sessionUser);
            setAuthChecked(true);
            setLoading(false);
            setInitialized(true);
            
            if (sessionUser) {
              console.log('✅ useAuth: Restored user session:', sessionUser.email);
            } else {
              console.log('❌ useAuth: No valid session found');
            }
          }
        } catch (error) {
          console.warn('⚠️ useAuth: Session check failed (timeout or error):', error);
          if (mounted) {
            setUser(null);
            setAuthChecked(true);
            setLoading(false);
            setInitialized(true);
          }
        } finally {
          globalAuthPromise = null;
        }
      } catch (error) {
        console.error('❌ useAuth: Failed to initialize auth:', error);
        if (mounted) {
          setUser(null);
          setAuthChecked(true);
          setLoading(false);
          setInitialized(true);
        }
      } finally {
        globalAuthPromise = null;
      }
    };

    // Initialize with a small delay to prevent blocking
    const timeoutId = setTimeout(() => {
      initializeAuth();
    }, 100);

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      mounted = false;
    };
  }, [initialized]); // Depend on initialized to prevent multiple runs

  // Listen for auth state changes in a separate useEffect
  useEffect(() => {
    let mounted = true;

    const handleUserSignedIn = (user: User) => {
      console.log('🎉 useAuth: User signed in event:', user.email);
      if (mounted) {
        setUser(user);
        setAuthChecked(true);
        setLoading(false);
      }
    };

    const handleUserSignedOut = () => {
      console.log('🚪 useAuth: User signed out event');
      if (mounted) {
        setUser(null);
        setAuthChecked(true);
        setLoading(false);
      }
    };

    realDataService.on('userSignedIn', handleUserSignedIn);
    realDataService.on('userSignedOut', handleUserSignedOut);

    // Cleanup listeners
    return () => {
      mounted = false;
      realDataService.off('userSignedIn', handleUserSignedIn);
      realDataService.off('userSignedOut', handleUserSignedOut);
    };
  }, []);

  const signOut = async () => {
    console.log('🚪 useAuth: Signing out...');
    // Reset global auth state on sign out
    globalAuthInitialized = false;
    globalAuthPromise = null;
    await realDataService.signOut();
  };

  const refreshAuth = async () => {
    console.log('🔄 useAuth: Refreshing auth...');
    try {
      setLoading(true);
      const refreshedUser = await realDataService.refreshAuth();
      setUser(refreshedUser);
      return refreshedUser;
    } catch (error) {
      console.error('❌ useAuth: Refresh failed:', error);
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Minimal debug logging only when status changes
  useEffect(() => {
    if (authChecked && !loading) {
      console.log(`🔍 useAuth final status: ${user?.email || 'no user'} (authenticated: ${!!user})`);
    }
  }, [user, authChecked, loading]);

  return {
    user,
    loading,
    signOut,
    refreshAuth,
    isAuthenticated: !!user && authChecked,
    isAdmin: user?.role === 'admin',
    authChecked
  };
}