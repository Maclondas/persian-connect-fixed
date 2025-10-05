// Real-time data service connecting to Supabase backend
import { projectId, publicAnonKey } from '../../utils/supabase/info'
import { getSupabaseClient } from '../../utils/supabase/client'

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  authProvider: 'email' | 'google';
  createdAt: Date;
  isBlocked?: boolean;
  avatar?: string;
  picture?: string; // For Google auth profile pictures
  termsAccepted?: {
    accepted: boolean;
    acceptedAt: Date;
    version: string;
    ipAddress?: string;
  };
}

// Helper function to check if an email should have admin privileges
function isAdminEmail(email: string): boolean {
  const adminEmails = ['ommzadeh@gmail.com'];
  return adminEmails.includes(email.toLowerCase());
}

export interface Ad {
  id: string;
  title: string;
  titlePersian: string;
  description: string;
  descriptionPersian: string;
  price: number;
  priceType: 'fixed' | 'negotiable';
  currency: string;
  category: string;
  subcategory: string;
  location: {
    country: string;
    city: string;
  };
  images: string[];
  userId: string;
  username: string;
  userEmail: string;
  status: 'pending' | 'approved' | 'rejected' | 'under_review' | 'expired';
  featured: boolean;
  featuredUntil?: Date;
  urgent: boolean;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  views: number;
  contactInfo: {
    phone?: string;
    email?: string;
    whatsapp?: string;
  };
  condition?: 'new' | 'used' | 'refurbished' | 'excellent' | 'good' | 'like-new' | 'sealed';
  brand?: string;
  model?: string;
  specifications?: Record<string, any>;
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentId?: string;
  moderationResult?: {
    aiScore: number;
    flaggedContent: string[];
    requiresManualReview: boolean;
    rejectionReason?: string;
    reviewedBy?: string;
    reviewedAt?: Date;
  };
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderUsername: string;
  receiverId: string;
  receiverUsername: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  adId?: string;
  adTitle?: string;
}

export interface Chat {
  id: string;
  participants: string[];
  participantUsernames: string[];
  lastMessage?: Message;
  lastActivity: Date;
  adId?: string;
  adTitle?: string;
  isActive: boolean;
  isTemporary?: boolean; // Flag for locally created chats when server is unavailable
}

export interface Payment {
  id: string;
  userId: string;
  adId: string;
  amount: number;
  currency: string;
  type: 'ad_posting' | 'ad_boost';
  status: 'pending' | 'completed' | 'failed';
  stripeSessionId?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface AdminStats {
  totalAds: number;
  activeAds: number;
  pendingAds: number;
  featuredAds: number;
  totalUsers: number;
  totalChats: number;
  todayAds: number;
}

class RealDataService {
  private static instance: RealDataService;
  private baseUrl: string;
  private currentUser: User | null = null;
  private accessToken: string | null = null;
  private eventListeners: { [key: string]: Function[] } = {};
  private isServerAvailable: boolean = false;
  private hasCheckedServer: boolean = false;
  private isInitializing: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {
    this.baseUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e5dee741`;
    this.loadCurrentUser();
    // Initialize dual storage system asynchronously
    this.initializeDualStorage();
  }

  static getInstance(): RealDataService {
    if (!RealDataService.instance) {
      RealDataService.instance = new RealDataService();
    }
    return RealDataService.instance;
  }

  // Initialize dual storage system
  private async initializeDualStorage(): Promise<void> {
    try {
      console.log('🔧 Initializing dual storage system...');
      
      // Check and update localStorage index
      await this.updateLocalStorageIndex();
      
      // Try to sync any unsynced ads in the background
      setTimeout(async () => {
        try {
          const syncStatus = await this.checkSyncStatus();
          console.log('📊 Sync status on startup:', syncStatus);
          
          if (syncStatus.localOnly > 0) {
            console.log(`🔄 Found ${syncStatus.localOnly} unsynced ads, attempting background sync...`);
            const syncResult = await this.syncLocalStorageAdsToSupabase();
            console.log('🔄 Background sync result:', syncResult);
          }
        } catch (error) {
          console.log('⚠️ Background sync failed (normal if offline):', error);
        }
      }, 2000); // Delay to not block initial load
      
    } catch (error) {
      console.warn('⚠️ Dual storage initialization failed:', error);
    }
  }

  // Check if running in Figma environment
  isFigmaEnvironment(): boolean {
    try {
      // Detect Figma environment by checking various indicators
      return !!(
        // Check if we're in an iframe (common for embedded environments)
        window.parent !== window ||
        // Check for Figma-specific user agent patterns
        navigator.userAgent.includes('Figma') ||
        // Check for specific Figma domains in referrer
        document.referrer.includes('figma.com') ||
        // Check hostname patterns that suggest embedded environment
        window.location.hostname.includes('figma') ||
        // Check for embedded environment indicators
        window.name.includes('figma') ||
        // Check for specific iframe context
        window.frameElement !== null
      );
    } catch (error) {
      console.warn('⚠️ Error checking Figma environment:', error);
      return false; // Safe fallback
    }
  }

  // Safe wrapper for checking Figma environment
  private safeIsFigmaEnvironment(): boolean {
    try {
      return this.isFigmaEnvironment();
    } catch (error) {
      console.warn('⚠️ Safe Figma environment check failed:', error);
      return false;
    }
  }

  // Public method to check if running in demo mode
  isDemoMode(): boolean {
    // Disable demo mode override for Figma - user wants real functionality
    // if (this.isFigmaEnvironment()) {
    //   console.log('🎭 Figma environment detected - using demo mode for reliability');
    //   return true;
    // }

    // If we have valid Supabase configuration, we're not in demo mode
    // regardless of server availability check
    if (projectId && publicAnonKey && projectId !== 'your-project-id') {
      console.log('✅ Real mode enabled - valid Supabase configuration detected');
      return false;
    }
    console.log('⚠️ Demo mode enabled - invalid or missing Supabase configuration');
    return !this.isServerAvailable;
  }

  private loadCurrentUser() {
    try {
      // Try both new and old storage keys for compatibility
      let userData = localStorage.getItem('currentUser') || localStorage.getItem('pc_current_user');
      let token = localStorage.getItem('accessToken') || localStorage.getItem('pc_access_token');
      
      if (userData && token) {
        const user = JSON.parse(userData);
        // Basic validation of stored user data
        if (user.id && user.email) {
          this.currentUser = user;
          this.accessToken = token;
          console.log('📱 Loaded cached user session for:', user.email);
        } else {
          console.log('⚠️ Invalid user data in storage, clearing...');
          this.clearExpiredSession();
        }
      } else {
        console.log('📱 No cached user session found');
      }
    } catch (error) {
      console.error('❌ Error loading current user:', error);
      this.clearExpiredSession();
    }
  }

  saveCurrentUser(user: User | null, token: string | null = null) {
    console.log('💾 Saving user session:', user?.email || 'signed out');
    this.currentUser = user;
    this.accessToken = token;
    
    if (user && token) {
      try {
        // Use the same keys as the newer authentication system
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('accessToken', token);
        // Also keep compatibility with old keys
        localStorage.setItem('pc_current_user', JSON.stringify(user));
        localStorage.setItem('pc_access_token', token);
        
        console.log('✅ User session saved successfully to localStorage');
        
        // Emit sign in event with a slight delay to ensure components are ready
        setTimeout(() => {
          console.log('📢 Emitting userSignedIn event for:', user.email);
          this.emit('userSignedIn', user);
        }, 100);
        
      } catch (error) {
        console.error('❌ Failed to save user session to localStorage:', error);
      }
    } else {
      try {
        // Clear all variants
        localStorage.removeItem('currentUser');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('pc_current_user');
        localStorage.removeItem('pc_access_token');
        
        console.log('✅ User session cleared from localStorage');
        
        // Emit sign out event if user was signed out
        if (user === null) {
          console.log('📢 Emitting userSignedOut event');
          this.emit('userSignedOut');
        }
      } catch (error) {
        console.error('❌ Failed to clear user session from localStorage:', error);
      }
    }
  }

  private async checkServerAvailability() {
    // Prevent multiple concurrent checks
    if (this.hasCheckedServer || this.isInitializing) {
      if (this.initializationPromise) {
        await this.initializationPromise;
      }
      return;
    }
    
    this.isInitializing = true;
    this.initializationPromise = this.performServerCheck();
    
    try {
      await this.initializationPromise;
    } finally {
      this.isInitializing = false;
      this.initializationPromise = null;
    }
  }

  private async performServerCheck() {
    try {
      // Check if we need to clear old cached auth data
      const currentVersion = '2.0.1-concurrent-fix';
      const cachedVersion = localStorage.getItem('persian-connect-version');
      if (cachedVersion !== currentVersion) {
        console.log('🔄 Clearing cached auth data due to version update');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        localStorage.setItem('persian-connect-version', currentVersion);
      }
      
      console.log('🔍 Checking server availability...');
      console.log('📋 Project ID:', projectId);
      console.log('📋 Has anon key:', !!publicAnonKey);
      
      // If we don't have valid Supabase config, run in demo mode
      if (!projectId || projectId === 'your-project-id' || !publicAnonKey) {
        this.isServerAvailable = true; // Allow demo mode to work
        this.hasCheckedServer = true;
        console.info('🎭 No valid Supabase config - running in demo mode');
        return;
      }
      
      // If we have Supabase config, mark server as available for basic operations
      // This ensures auth operations can proceed even if custom functions are down
      this.isServerAvailable = true;
      this.hasCheckedServer = true;
      console.info('✅ Supabase configured - authentication available');
      
      // Optional: Test custom server function availability with timeout
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(`${this.baseUrl}/health`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${publicAnonKey}` },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          console.info('✅ Custom backend server also available');
        } else {
          console.info('⚠️ Custom backend server not available, but auth will work');
        }
      } catch (error) {
        // Don't log server check failures as errors - this is normal
        console.info('⚠️ Custom backend server not available, but auth will work');
      }
    } catch (error) {
      console.error('❌ Server availability check failed:', error);
      // Default to available so auth can still work
      this.isServerAvailable = true;
      this.hasCheckedServer = true;
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}, setJsonHeader: boolean = true) {
    // Always check server availability first
    if (!this.hasCheckedServer) {
      await this.checkServerAvailability();
    }
    
    // If server is not available and we don't have Supabase config, throw for fallbacks
    // But for authentication endpoints, be more lenient since we have fallbacks
    if (!this.isServerAvailable && (!projectId || projectId === 'your-project-id')) {
      if (endpoint.includes('/auth/')) {
        console.log('⚠️ Server not available for auth endpoint, caller should implement fallback');
      }
      throw new Error('Server not available');
    }

    try {
      const url = `${this.baseUrl}${endpoint}`;
      const headers: Record<string, string> = {
        ...options.headers,
      };

      // Only set Content-Type for JSON requests, not for FormData
      if (setJsonHeader && !(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
      }

      if (this.accessToken) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
      } else {
        headers['Authorization'] = `Bearer ${publicAnonKey}`;
      }

      // Use provided signal or create a new one with timeout
      // Shorter timeout for Figma environment
      let signal = options.signal;
      let timeoutId: NodeJS.Timeout | undefined;
      
      if (!signal) {
        const controller = new AbortController();
        signal = controller.signal;
        const timeout = this.safeIsFigmaEnvironment() ? 3000 : 8000; // 3s for Figma, 8s for normal
        timeoutId = setTimeout(() => controller.abort(), timeout);
      }

      const response = await fetch(url, {
        ...options,
        headers,
        signal
      });

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`API Error: ${response.status} - ${error}`);
      }

      return response.json();
    } catch (error: any) {
      console.log('🚫 Request failed:', endpoint, error.message);
      
      // Don't mark server as unavailable for network timeouts or temporary errors
      if (error.name === 'AbortError') {
        throw new Error('Request timeout - server may be busy');
      }
      
      // For other errors, throw a more descriptive message for fallback handling
      if (error.message.includes('fetch')) {
        throw new Error('Server not available');
      }
      
      throw error;
    }
  }

  // Event system for real-time updates
  on(event: string, callback: Function) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  off(event: string, callback: Function) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    }
  }

  private emit(event: string, data?: any) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(data));
    }
  }

  // Authentication methods
  async signUp(userData: { email: string; password: string; name: string; username?: string }): Promise<User> {
    console.log('📝 [signUp] Attempting sign up for:', userData.email);
    console.log('📋 [signUp] Method signature confirmed: email, password, name, username?');
    
    const { email, password, name, username } = userData;
    
    // Basic validation
    if (!email || !password || !name) {
      throw new Error('Please fill in all required fields');
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Please enter a valid email address');
    }
    
    // Validate password length
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    
    // Check if we're in demo mode (no real Supabase config)
    const isDemoMode = !projectId || projectId === 'your-project-id';
    
    if (isDemoMode) {
      console.log('🎭 Demo mode: creating demo user');
      
      // Create demo user for development
      const demoUser: User = {
        id: `demo-${Date.now()}`,
        username: username || `user_${Math.random().toString(36).substr(2, 9)}`,
        email: email,
        name: name,
        role: isAdminEmail(email) ? 'admin' : 'user',
        authProvider: 'email',
        createdAt: new Date(),
        isBlocked: false,
        termsAccepted: {
          accepted: true,
          acceptedAt: new Date(),
          version: '1.0'
        }
      };
      
      const demoToken = `demo-token-${Date.now()}`;
      this.saveCurrentUser(demoUser, demoToken);
      
      console.log('✅ Demo user created successfully');
      return demoUser;
    }
    
    // We have real Supabase configuration
    console.log('🔍 Real mode: trying server signup with fallback...');
    
    try {
      // First try to call our backend signup endpoint which handles both Auth and KV store
      const signupData = {
        email,
        password,
        name,
        username: username || `user_${Math.random().toString(36).substr(2, 9)}`
      };
      
      console.log('📧 Calling backend signup endpoint with data:', { email, name, username: signupData.username });
      
      // Direct fetch instead of makeRequest to avoid potential issues
      const backendUrl = `https://${projectId}.supabase.co/functions/v1/make-server-e5dee741/auth/signup`;
      console.log('📡 Backend URL:', backendUrl);
      
      const fetchResponse = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(signupData)
      });
      
      console.log('📊 Raw response status:', fetchResponse.status);
      console.log('📊 Response headers:', Object.fromEntries(fetchResponse.headers.entries()));
      
      if (!fetchResponse.ok) {
        console.error('❌ HTTP Error:', fetchResponse.status, fetchResponse.statusText);
      }
      
      console.log('📊 Backend response status:', fetchResponse.status);
      const responseData = await fetchResponse.json();
      console.log('📊 Backend response data:', responseData);
      
      if (fetchResponse.ok && responseData.user) {
        console.log('✅ Backend signup successful');
        
        // Now get the actual auth session from Supabase
        const supabase = getSupabaseClient();
        if (supabase) {
          try {
            console.log('🔐 Attempting auto sign-in after signup...');
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email,
              password
            });
            
            if (signInError) {
              console.log('⚠️ Auto sign-in error:', signInError.message);
            }
            
            if (signInData.session?.access_token) {
              this.saveCurrentUser(responseData.user, signInData.session.access_token);
              console.log('✅ Auto sign-in successful after signup');
            } else {
              // Use a temporary token if auto sign-in fails
              this.saveCurrentUser(responseData.user, `temp-token-${Date.now()}`);
              console.log('📧 Using temporary token - user may need to sign in');
            }
          } catch (signInError) {
            console.log('⚠️ Auto sign-in failed after signup:', signInError);
            this.saveCurrentUser(responseData.user, `temp-token-${Date.now()}`);
          }
        } else {
          console.log('⚠️ No Supabase client available');
          this.saveCurrentUser(responseData.user, `temp-token-${Date.now()}`);
        }
        
        return responseData.user;
      } else {
        console.log('❌ Backend signup failed:', responseData);
        throw new Error(responseData.error || 'Backend signup failed. Trying fallback...');
      }
    } catch (backendError: any) {
      console.log('⚠️ Backend signup failed, trying direct Supabase fallback:', backendError);
      
      // Check if it's a server deployment issue
      if (backendError.message.includes('Failed to fetch') || 
          backendError.message.includes('NetworkError') ||
          backendError.message.includes('ERR_NETWORK') ||
          backendError.name === 'TypeError') {
        console.log('🌐 Server connectivity issue detected - likely Edge Function not deployed');
        console.log('🔄 Attempting direct Supabase signup as fallback...');
        
        // Don't throw an error here - proceed with fallback immediately
      }
      
      // Fallback to direct Supabase signup if backend is unavailable
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('Authentication service not available');
      }
      
      try {
        console.log('📧 Fallback: Signing up with Supabase Auth...');
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              name: name,
              username: username || `user_${Math.random().toString(36).substr(2, 9)}`
            }
          }
        });
        
        if (error) {
          console.log('❌ Supabase signup error:', error.message);
          
          // Return user-friendly error messages
          if (error.message.includes('User already registered')) {
            throw new Error('An account with this email already exists. Please sign in instead.');
          }
          
          if (error.message.includes('Password should be at least')) {
            throw new Error('Password must be at least 6 characters long');
          }
          
          if (error.message.includes('Invalid email')) {
            throw new Error('Please enter a valid email address');
          }
          
          if (error.message.includes('Signup is disabled')) {
            throw new Error('Account registration is currently disabled');
          }
          
          // Generic error for other cases
          throw new Error('Sign up failed. Please try again');
        }
        
        if (data.user) {
          console.log('✅ Fallback Supabase signup successful');
          
          // Create user object from Supabase data
          const newUser: User = {
            id: data.user.id,
            username: username || `user_${Math.random().toString(36).substr(2, 9)}`,
            email: data.user.email || '',
            name: name,
            role: isAdminEmail(data.user.email || '') ? 'admin' : 'user',
            authProvider: 'email',
            createdAt: new Date(data.user.created_at || Date.now()),
            isBlocked: false,
            termsAccepted: {
              accepted: true,
              acceptedAt: new Date(),
              version: '1.0'
            }
          };
          
          // For signup, we might not get a session immediately if email confirmation is required
          if (data.session?.access_token) {
            this.saveCurrentUser(newUser, data.session.access_token);
          } else {
            // Save user without token for now, they'll need to confirm email
            console.log('📧 Email confirmation required');
            this.saveCurrentUser(newUser, `temp-token-${Date.now()}`);
          }
          
          return newUser;
        } else {
          throw new Error('Sign up failed. Please try again');
        }
      } catch (fallbackError: any) {
        // If it's already a formatted error, re-throw it
        if (fallbackError.message.includes('already exists') ||
            fallbackError.message.includes('Password must be') ||
            fallbackError.message.includes('Please enter a valid') ||
            fallbackError.message.includes('registration is currently') ||
            fallbackError.message.includes('Sign up failed')) {
          throw fallbackError;
        }
        
        console.error('🔥 Unexpected signup error:', fallbackError);
        throw new Error('Sign up failed. Please check your connection and try again');
      }
    }
  }

  async signIn(email: string, password: string): Promise<User> {
    console.log('🔐 Attempting sign in for:', email);
    
    // Basic validation
    if (!email || !password) {
      throw new Error('Please enter both email and password');
    }
    
    // Use the class method to check if we're in demo mode
    const isDemoMode = this.isDemoMode();
    
    if (isDemoMode) {
      const isFigma = this.safeIsFigmaEnvironment();
      console.log('🎭 Demo mode: accepting any credentials', isFigma ? '(Figma environment)' : '');
      
      // Demo mode accepts any valid email/password combo
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address');
      }
      
      if (password.length < 3) {
        throw new Error('Password must be at least 3 characters');
      }
      
      const isAdmin = isAdminEmail(email);
      const demoUser: User = {
        id: isAdmin ? 'demo-admin' : `demo-user-${Date.now()}`,
        username: isAdmin ? 'admin' : `user_${Math.random().toString(36).substr(2, 9)}`,
        email,
        name: isAdmin ? 'Admin User' : (isFigma ? 'Figma Demo User' : 'Demo User'),
        role: isAdmin ? 'admin' : 'user',
        authProvider: 'email',
        createdAt: new Date(),
        isBlocked: false,
        termsAccepted: {
          accepted: true,
          acceptedAt: new Date(),
          version: '1.0'
        }
      };
      
      const demoToken = `demo-token-${Date.now()}`;
      this.saveCurrentUser(demoUser, demoToken);
      
      console.log('✅ Demo authentication successful for:', email, isFigma ? '(Figma)' : '');
      return demoUser;
    }
    
    // We have real Supabase configuration, try authentication
    console.log('🔍 Real mode: attempting Supabase authentication...');
    console.log('📊 Supabase config check - projectId:', projectId, 'hasAnonKey:', !!publicAnonKey);
    
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error('❌ Supabase client not available');
      throw new Error('Authentication service not available');
    }
    
    console.log('✅ Supabase client available, proceeding with authentication...');
    
    try {
      console.log('📧 Signing in with Supabase Auth for email:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      
      console.log('📊 Supabase auth response - hasData:', !!data, 'hasUser:', !!data?.user, 'hasSession:', !!data?.session, 'hasError:', !!error);
      
      if (error) {
        console.log('❌ Supabase auth error:', error.message);
        console.log('❌ Full error object:', error);
        
        // Return user-friendly error messages
        if (error.message.includes('Invalid login credentials') || 
            error.message.includes('Invalid email or password') ||
            error.message.includes('Email not confirmed')) {
          throw new Error('Invalid email or password');
        }
        
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Please check your email and confirm your account');
        }
        
        if (error.message.includes('Too many requests')) {
          throw new Error('Too many login attempts. Please try again later');
        }
        
        // Generic error for other cases
        throw new Error(`Sign in failed: ${error.message}`);
      }
      
      if (data.user && data.session) {
        console.log('✅ Supabase authentication successful for user:', data.user.email);
        console.log('📊 Session details - access_token length:', data.session.access_token?.length, 'expires_at:', data.session.expires_at);
        
        // Create user object from Supabase data
        let userData: User;
        try {
          // Try to get user profile from backend (this will auto-promote admins)
          console.log('🔍 Fetching user profile from backend...');
          const result = await this.makeRequest('/auth/profile', {
            headers: { 'Authorization': `Bearer ${data.session.access_token}` }
          });
          userData = result.user;
          console.log('✅ Got user profile from backend:', userData.role);
        } catch (backendError) {
          console.log('📝 Backend not available, creating user from Supabase data:', backendError?.message);
          // Create user from Supabase session data
          userData = {
            id: data.user.id,
            username: data.user.user_metadata?.username || `user_${Date.now()}`,
            email: data.user.email || '',
            name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || 'User',
            role: isAdminEmail(data.user.email || '') ? 'admin' : 'user',
            authProvider: 'email',
            createdAt: new Date(data.user.created_at || Date.now()),
            isBlocked: false,
            termsAccepted: {
              accepted: true,
              acceptedAt: new Date(),
              version: '1.0'
            }
          };
          console.log('📝 Created user data from Supabase session:', userData);
        }
        
        console.log('💾 Saving user session...');
        this.saveCurrentUser(userData, data.session.access_token);
        
        console.log('✅ Sign in process completed successfully for:', userData.email);
        return userData;
      } else {
        console.error('❌ No user or session in Supabase response');
        throw new Error('Sign in failed. Please try again');
      }
      
    } catch (error: any) {
      // If it's already a formatted error, re-throw it
      if (error.message === 'Invalid email or password' ||
          error.message.includes('Please check your email') ||
          error.message.includes('Too many requests') ||
          error.message.includes('Sign in failed')) {
        throw error;
      }
      
      console.error('🔥 Unexpected sign in error:', error);
      
      // Disable demo fallback - use real authentication only
      if (false && this.isFigmaEnvironment()) {
        console.log('🎭 Figma environment detected - falling back to demo mode due to auth error');
        
        // Validate email format for demo fallback
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          throw new Error('Please enter a valid email address');
        }
        
        const isAdmin = isAdminEmail(email);
        const fallbackUser: User = {
          id: isAdmin ? 'figma-admin' : `figma-user-${Date.now()}`,
          username: isAdmin ? 'admin' : `user_${Math.random().toString(36).substr(2, 9)}`,
          email,
          name: isAdmin ? 'Admin User (Figma)' : 'Figma Demo User',
          role: isAdmin ? 'admin' : 'user',
          authProvider: 'email',
          createdAt: new Date(),
          isBlocked: false,
          termsAccepted: {
            accepted: true,
            acceptedAt: new Date(),
            version: '1.0'
          }
        };
        
        const fallbackToken = `figma-token-${Date.now()}`;
        this.saveCurrentUser(fallbackUser, fallbackToken);
        
        console.log('✅ Figma fallback authentication successful for:', email);
        return fallbackUser;
      }
      
      throw new Error('Sign in failed. Please check your connection and try again');
    }
  }

  async signInWithGoogle(): Promise<User | null> {
    console.log('🔍 Starting Google OAuth flow...');
    console.log('📋 Project ID:', projectId);
    console.log('📋 Current URL:', window.location.href);
    
    try {
      // Check if we're in demo mode or Figma environment
      if (this.isDemoMode()) {
        console.log('❌ Demo mode detected');
        throw new Error('Demo mode - using demo credentials');
      }
      
      // Allow Google OAuth in all environments
      if (false && this.isFigmaEnvironment()) {
        console.log('🎭 Figma environment detected - Google OAuth may have restrictions');
        throw new Error('Figma environment - using demo credentials');
      }
      
      // Use Supabase client-side OAuth for real authentication
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('Supabase client not available');
      }
      
      console.log('🚀 Initiating Supabase OAuth...');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      console.log('📊 OAuth response:', { data, error });
      
      if (error) {
        console.error('❌ Supabase Google OAuth error:', error);
        console.error('❌ Error details:', {
          message: error.message,
          status: error.status,
          details: error
        });
        
        // Check for specific Google provider errors
        if (error.message.includes('provider not enabled') || 
            error.message.includes('Invalid provider') ||
            error.message.includes('Google sign in is not configured')) {
          throw new Error(`Google OAuth not configured in Supabase: ${error.message}`);
        }
        
        throw new Error(`Google sign-in error: ${error.message}`);
      }
      
      console.log('✅ OAuth initiated successfully, should redirect to Google...');
      
      // The OAuth flow will redirect to Google and back
      // In the normal case, this code won't be reached as the page redirects
      // Return null to indicate redirect is happening
      return null;
      
    } catch (error: any) {
      console.error('🔥 Google sign in error:', error);
      
      // Only fall back to demo mode if there's a real configuration error
      if (error.message.includes('not configured') || 
          error.message.includes('not enabled') ||
          error.message.includes('Invalid provider') ||
          error.message.includes('provider not enabled')) {
        
        console.log('🎭 Falling back to demo mode due to configuration error');
        
        // Enhanced fallback for demo mode with more realistic Google-like user
        const demoUser: User = {
          id: `demo-google-${Date.now()}`,
          username: `google_user_${Date.now()}`,
          email: 'demo.google@example.com',
          name: 'Google Demo User',
          role: isAdminEmail('demo.google@example.com') ? 'admin' : 'user',
          authProvider: 'google',
          createdAt: new Date(),
          isBlocked: false,
          picture: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop&crop=face',
          // Store in temp for username creation flow
          termsAccepted: undefined // Will need to accept terms
        };
        
        // Store temporarily for username creation flow
        localStorage.setItem('tempGoogleAuth', JSON.stringify(demoUser));
        
        const demoToken = `demo-google-token-${Date.now()}`;
        this.saveCurrentUser(demoUser, demoToken);
        this.emit('userSignedIn', demoUser);
        
        return demoUser;
      }
      
      // For other errors, don't fall back to demo mode, just re-throw
      throw error;
    }
  }

  async handleOAuthCallback(): Promise<User | null> {
    console.log('🔄 Handling OAuth callback...');
    console.log('📋 Current URL:', window.location.href);
    console.log('📋 Hash:', window.location.hash);
    console.log('📋 Search:', window.location.search);
    
    try {
      // Check if Supabase is configured
      if (!projectId || projectId === 'your-project-id') {
        console.log('❌ OAuth callback: Supabase not configured, using demo mode');
        // Quick fallback to demo for immediate response
        const demoUser = this.createDemoUser();
        this.saveCurrentUser(demoUser, 'demo-token');
        this.emit('userSignedIn', demoUser);
        return demoUser;
      }
      
      const supabase = getSupabaseClient();
      if (!supabase) {
        throw new Error('Supabase client not available');
      }
      
      // Get session from URL hash or stored session with timeout
      console.log('🔍 Getting session from Supabase...');
      const sessionPromise = supabase.auth.getSession();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Session retrieval timeout')), 3000)
      );
      
      const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]);
      
      console.log('📊 Session data:', { 
        hasSession: !!session, 
        hasUser: !!session?.user, 
        userEmail: session?.user?.email,
        error: error 
      });
      
      if (error) {
        console.error('❌ Session error:', error);
        return null;
      }
      
      if (!session?.user) {
        console.log('❌ No session or user found');
        return null;
      }
      
      const user = session.user;
      console.log('✅ User found:', {
        id: user.id,
        email: user.email,
        provider: user.app_metadata?.provider,
        metadata: user.user_metadata
      });
      
      // Create or get user data
      let userData: User;
      try {
        // Try to get existing user from server (this will auto-promote admins)
        console.log('🔍 Fetching user profile from server...');
        const result = await this.makeRequest(`/auth/profile`, {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        userData = result.user;
        console.log('✅ Got user from server:', userData);
      } catch (serverError) {
        console.log('📝 Server not available, creating local user data:', serverError.message || serverError);
        // Create new user data for Google OAuth user
        userData = {
          id: user.id,
          username: '', // Empty string to trigger username creation flow
          email: user.email || '',
          name: user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.display_name || 'User',
          role: isAdminEmail(user.email || '') ? 'admin' : 'user',
          authProvider: 'google',
          createdAt: new Date(),
          isBlocked: false,
          picture: user.user_metadata?.avatar_url || user.user_metadata?.picture,
          termsAccepted: undefined // Will need to accept terms
        };
        
        console.log('✅ Created local user data for offline setup');
        
        console.log('✅ Created user data:', userData);
        
        // Store in temp storage for username creation
        localStorage.setItem('tempGoogleAuth', JSON.stringify(userData));
      }
      
      console.log('💾 Saving user session...');
      this.saveCurrentUser(userData, session.access_token);
      this.emit('userSignedIn', userData);
      
      console.log('✅ OAuth callback completed successfully');
      return userData;
    } catch (error) {
      console.error('🔥 OAuth callback error:', error);
      return null;
    }
  }

  async checkExistingSession(): Promise<User | null> {
    try {
      console.log('🔍 Checking for existing session...');
      
      // First, check if we should use stored session directly (fast path)
      if (this.shouldUseStoredSession()) {
        console.log('⚡ Found valid stored session, using it directly');
        const restoredUser = await this.forceRestoreSession();
        if (restoredUser) {
          console.log('✅ Successfully restored from stored session:', restoredUser.email);
          return restoredUser;
        }
      }
      
      // Ensure server availability is checked first
      await this.checkServerAvailability();
      
      // First, check for OAuth callback (prioritize fresh OAuth session)
      const hash = window.location.hash;
      const search = window.location.search;
      const isOAuthCallback = hash.includes('access_token') || 
                             search.includes('code=') || 
                             hash.includes('refresh_token');
      
      if (isOAuthCallback) {
        console.log('🔄 OAuth callback detected, processing...');
        const oauthUser = await this.handleOAuthCallback();
        if (oauthUser) {
          return oauthUser;
        }
      }
      
      // Check Supabase session first if available (most reliable)
      if (projectId && projectId !== 'your-project-id') {
        try {
          const supabase = getSupabaseClient();
          if (supabase) {
            console.log('🔍 Checking Supabase session...');
            
            // Add timeout to session check - shorter for Figma environment
            const sessionPromise = supabase.auth.getSession();
            const timeout = this.safeIsFigmaEnvironment() ? 2000 : 5000;
            const timeoutPromise = new Promise<any>((_, reject) => 
              setTimeout(() => reject(new Error('Session check timeout')), timeout)
            );
            
            const { data: { session }, error } = await Promise.race([sessionPromise, timeoutPromise]);
            
            if (!error && session?.user && session?.access_token) {
              console.log('✅ Found valid Supabase session for:', session.user.email);
              
              // Create user object from Supabase session
              let userData: User;
              try {
                // Try to get user profile from backend with shorter timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000);
                
                const result = await this.makeRequest('/auth/profile', {
                  headers: { 'Authorization': `Bearer ${session.access_token}` },
                  signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                userData = result.user;
                console.log('✅ Got user profile from backend');
              } catch (backendError) {
                console.log('📝 Backend not available, creating user from Supabase session');
                // Create user from Supabase session data
                userData = {
                  id: session.user.id,
                  username: session.user.user_metadata?.username || `user_${Date.now()}`,
                  email: session.user.email || '',
                  name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || 'User',
                  role: isAdminEmail(session.user.email || '') ? 'admin' : 'user',
                  authProvider: session.user.app_metadata?.provider === 'google' ? 'google' : 'email',
                  createdAt: new Date(session.user.created_at || Date.now()),
                  isBlocked: false,
                  picture: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture,
                  termsAccepted: {
                    accepted: true,
                    acceptedAt: new Date(),
                    version: '1.0'
                  }
                };
              }
              
              // Save the session
              this.saveCurrentUser(userData, session.access_token);
              return userData;
            } else if (error) {
              console.log('❌ Supabase session error:', error.message);
            } else {
              console.log('❌ No valid Supabase session found');
            }
          }
        } catch (sessionError) {
          console.warn('⚠️ Supabase session check failed:', sessionError.message || sessionError);
          
          // In Figma environment, if session check fails, try to use stored credentials if they exist
          if (this.safeIsFigmaEnvironment()) {
            console.log('🎭 Figma environment - checking for stored session after Supabase failure');
            const storedUser = localStorage.getItem('currentUser');
            const storedToken = localStorage.getItem('accessToken');
            
            if (storedUser && storedToken) {
              try {
                const user = JSON.parse(storedUser);
                if (user.id && user.email) {
                  console.log('✅ Found stored session in Figma environment, using it:', user.email);
                  this.currentUser = user;
                  this.accessToken = storedToken;
                  this.emit('userSignedIn', user);
                  return user;
                }
              } catch (parseError) {
                console.error('❌ Failed to parse stored user data in Figma fallback:', parseError);
              }
            }
          }
        }
      }
      
      // Fallback: Check localStorage for existing session (but validate it's still reasonable)
      const storedUser = localStorage.getItem('currentUser');
      const storedToken = localStorage.getItem('accessToken');
      
      if (storedUser && storedToken) {
        try {
          const user = JSON.parse(storedUser);
          
          // Basic validation of stored user data
          if (user.id && user.email && user.authProvider) {
            // For demo tokens and Figma tokens, accept them as-is
            if (storedToken.startsWith('demo-token-') || storedToken.startsWith('figma-token-')) {
              console.log('🎭 Found valid demo/figma session for:', user.email);
              this.currentUser = user;
              this.accessToken = storedToken;
              this.emit('userSignedIn', user);
              return user;
            }
            
            // For real tokens, we already checked Supabase above
            // If we're here with a real token but no Supabase session, 
            // the session might be expired - clear it
            console.log('⚠️ Found stored session but no valid Supabase session - may be expired');
            this.clearExpiredSession();
          }
        } catch (parseError) {
          console.error('❌ Failed to parse stored user data:', parseError);
          this.clearExpiredSession();
        }
      }
      
      console.log('❌ No valid session found');
      return null;
    } catch (error) {
      console.error('🔥 Check session error:', error);
      return null;
    }
  }

  private clearExpiredSession() {
    console.log('🧹 Clearing expired session data');
    this.currentUser = null;
    this.accessToken = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('pc_current_user');
    localStorage.removeItem('pc_access_token');
  }

  async signOut(): Promise<void> {
    console.log('🚪 Signing out user...');
    
    try {
      // Sign out from Supabase if configured
      if (projectId && projectId !== 'your-project-id') {
        const supabase = getSupabaseClient();
        if (supabase) {
          console.log('🔍 Signing out from Supabase...');
          await supabase.auth.signOut();
          console.log('✅ Supabase signout completed');
        }
      }
    } catch (error) {
      console.error('❌ Supabase signout error:', error);
    }
    
    // Clear all session data
    console.log('🧹 Clearing session data...');
    this.clearExpiredSession();
    this.emit('userSignedOut');
    console.log('✅ User signed out successfully');
  }

  // Force logout - clears ALL authentication data
  async forceSignOut(): Promise<void> {
    console.log('🔴 Force logout initiated - clearing ALL authentication data');
    
    try {
      // Sign out from Supabase if configured
      if (projectId && projectId !== 'your-project-id') {
        const supabase = getSupabaseClient();
        if (!supabase) {
          throw new Error('Supabase client not available');
        }
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error('Supabase signout error:', error);
    }
    
    // Clear all possible localStorage keys
    const keysToRemove = [
      'persian_connect_user',
      'persian_connect_token', 
      'supabase.auth.token',
      'sb-supabase-auth-token',
      'google_signin_loading',
      'demo_user',
      'demo_token',
      'access_token',
      'refresh_token'
    ];
    
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
        console.log(`🗑️ Cleared localStorage: ${key}`);
      } catch (error) {
        console.warn(`Failed to clear ${key}:`, error);
      }
    });
    
    // Clear sessionStorage
    try {
      sessionStorage.clear();
      console.log('🗑️ Cleared sessionStorage');
    } catch (error) {
      console.warn('Failed to clear sessionStorage:', error);
    }
    
    // Clear all cookies that might contain auth data
    const cookiesToClear = [
      'supabase-auth-token',
      'auth-token',
      'session',
      'user'
    ];
    
    cookiesToClear.forEach(cookieName => {
      try {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        console.log(`🗑️ Cleared cookie: ${cookieName}`);
      } catch (error) {
        console.warn(`Failed to clear cookie ${cookieName}:`, error);
      }
    });
    
    // Reset internal state
    this.currentUser = null;
    this.accessToken = null;
    
    // Emit sign out event
    this.emit('userSignedOut');
    
    console.log('✅ Force logout completed - all authentication data cleared');
  }

  getCurrentUser(): User | null {
    // If we don't have a current user in memory, try to reload from storage
    if (!this.currentUser) {
      this.loadCurrentUser();
    }
    return this.currentUser;
  }

  // Method to refresh authentication status
  async refreshAuth(): Promise<User | null> {
    console.log('🔄 Refreshing authentication status...');
    try {
      const user = await this.checkExistingSession();
      if (user) {
        console.log('✅ Auth refreshed for:', user.email);
        return user;
      } else {
        console.log('❌ No valid session found during refresh');
        return null;
      }
    } catch (error) {
      console.error('❌ Auth refresh failed:', error);
      return null;
    }
  }

  // Debug method to check authentication status
  getAuthStatus(): { 
    hasUser: boolean; 
    hasToken: boolean; 
    isDemoMode: boolean; 
    userEmail?: string; 
    authProvider?: string;
  } {
    return {
      hasUser: !!this.currentUser,
      hasToken: !!this.accessToken,
      isDemoMode: this.isDemoMode(),
      userEmail: this.currentUser?.email,
      authProvider: this.currentUser?.authProvider
    };
  }

  async getCurrentUserProfile(): Promise<User | null> {
    if (!this.accessToken) return null;
    
    try {
      const result = await this.makeRequest('/auth/profile');
      return result.user;
    } catch (error) {
      console.error('Get profile error:', error);
      return null;
    }
  }

  // Enhanced ad retrieval with dual storage support
  async getAds(filters: {
    category?: string;
    country?: string;
    city?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
  } = {}): Promise<{ ads: Ad[]; totalCount: number; hasMore: boolean }> {
    console.log('🔍 Getting ads with filters:', filters);
    
    let supabaseAds: Ad[] = [];
    let supabaseSuccess = false;
    
    // Try Supabase first
    try {
      const params = new URLSearchParams();
      
      if (filters.category) params.append('category', filters.category);
      if (filters.country) params.append('country', filters.country);
      if (filters.city) params.append('city', filters.city);
      if (filters.featured) params.append('featured', 'true');
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.offset) params.append('offset', filters.offset.toString());

      const result = await this.makeRequest(`/ads?${params.toString()}`);
      
      // Convert date strings back to Date objects
      supabaseAds = result.ads.map((ad: any) => ({
        ...ad,
        createdAt: new Date(ad.createdAt),
        updatedAt: new Date(ad.updatedAt),
        expiresAt: new Date(ad.expiresAt),
        featuredUntil: ad.featuredUntil ? new Date(ad.featuredUntil) : undefined,
        _source: 'supabase'
      }));
      
      supabaseSuccess = true;
      console.log('✅ Successfully retrieved ads from Supabase:', supabaseAds.length);
      
      return {
        ads: supabaseAds,
        totalCount: result.totalCount,
        hasMore: result.hasMore
      };
      
    } catch (error) {
      console.log('⚠️ Supabase not available, using localStorage fallback');
    }
    
    // Fallback to localStorage with enhanced data handling
    const localResult = this.getDemoAds(filters);
    
    // If we had some Supabase success but not complete, try to merge data
    if (supabaseSuccess && supabaseAds.length > 0) {
      console.log('🔄 Merging Supabase and localStorage data');
      const mergedAds = this.mergeAdsFromBothSources(supabaseAds, localResult.ads);
      return {
        ads: mergedAds,
        totalCount: mergedAds.length,
        hasMore: false // For merged data, disable pagination
      };
    }
    
    return localResult;
  }

  // Merge ads from both sources, prioritizing Supabase data but including local-only ads
  private mergeAdsFromBothSources(supabaseAds: Ad[], localAds: Ad[]): Ad[] {
    const supabaseAdIds = new Set(supabaseAds.map(ad => ad.id));
    
    // Start with Supabase ads (most up-to-date)
    const mergedAds = [...supabaseAds];
    
    // Add local-only ads that aren't in Supabase
    const localOnlyAds = localAds.filter(ad => !supabaseAdIds.has(ad.id));
    mergedAds.push(...localOnlyAds.map(ad => ({ ...ad, _source: 'localStorage' })));
    
    // Sort by featured first, then by date
    mergedAds.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    console.log('🔄 Merged ads:', {
      supabase: supabaseAds.length,
      localOnly: localOnlyAds.length,
      total: mergedAds.length
    });
    
    return mergedAds;
  }

  private getDemoAds(filters: any = {}): { ads: Ad[]; totalCount: number; hasMore: boolean } {
    console.log('📦 Demo mode: Starting ad retrieval with dual storage access');
    
    // Get ads from local storage (primary source in demo mode)
    const localAds = JSON.parse(localStorage.getItem('demo_ads') || '[]');
    console.log('📦 Local storage ads found:', localAds.length);
    
    // Get sync metadata to understand data state
    const syncMetadata = JSON.parse(localStorage.getItem('ad_sync_metadata') || '{}');
    
    // Clean and prepare ads (remove metadata, ensure date objects)
    const cleanedAds = localAds.map((ad: any) => {
      // Remove localStorage metadata for clean display
      const { _localStorage, ...cleanAd } = ad;
      
      // Ensure dates are Date objects
      return {
        ...cleanAd,
        createdAt: new Date(cleanAd.createdAt),
        updatedAt: new Date(cleanAd.updatedAt),
        expiresAt: new Date(cleanAd.expiresAt),
        featuredUntil: cleanAd.featuredUntil ? new Date(cleanAd.featuredUntil) : undefined,
        _syncStatus: syncMetadata[cleanAd.id] ? 'synced' : 'local-only'
      };
    });
    
    console.log('📦 Cleaned ads prepared:', cleanedAds.length);
    
    // Start with cleaned ads
    let filteredAds = [...cleanedAds];

    // Filter by status - only show approved ads (like the server would do)
    const beforeStatusFilter = filteredAds.length;
    filteredAds = filteredAds.filter(ad => ad.status === 'approved');
    console.log(`📦 Status filter: ${beforeStatusFilter} ads → ${filteredAds.length} approved ads`);
    
    // Log sample of ads for debugging
    if (filteredAds.length > 0) {
      console.log('📦 Sample approved ad:', {
        id: filteredAds[0].id,
        title: filteredAds[0].title,
        status: filteredAds[0].status,
        paymentStatus: filteredAds[0].paymentStatus,
        category: filteredAds[0].category
      });
    }

    if (filters.category && filters.category !== 'all') {
      filteredAds = filteredAds.filter(ad => ad.category === filters.category);
    }

    if (filters.country && filters.country !== 'all') {
      filteredAds = filteredAds.filter(ad => ad.location.country === filters.country);
    }

    if (filters.city && filters.city !== 'all') {
      filteredAds = filteredAds.filter(ad => ad.location.city === filters.city);
    }

    if (filters.featured) {
      filteredAds = filteredAds.filter(ad => ad.featured);
    }

    // Sort by featured first, then by date
    filteredAds.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const limit = filters.limit || 20;
    const offset = filters.offset || 0;

    return {
      ads: filteredAds.slice(offset, offset + limit),
      totalCount: filteredAds.length,
      hasMore: offset + limit < filteredAds.length
    };
  }

  // Helper method for backward compatibility
  async getAdsByCategory(category: string): Promise<Ad[]> {
    try {
      const result = await this.getAds({ category });
      return result.ads;
    } catch (error) {
      console.error('Failed to get ads by category:', error);
      return [];
    }
  }

  async getAdById(id: string): Promise<Ad | null> {
    console.log('🔍 Getting ad by ID:', id);

    // First try Supabase
    try {
      const supabaseAd = await this.getAdFromSupabase(id);
      if (supabaseAd) {
        console.log('✅ Ad found in Supabase:', supabaseAd.title);
        return await this.fixBlobUrls(supabaseAd);
      }
    } catch (error) {
      console.warn('⚠️ Supabase lookup failed for ad:', id, error);
    }

    // Then try backend server
    try {
      const result = await this.makeRequest(`/ads/${id}`);
      
      // Convert date strings back to Date objects
      const ad = {
        ...result.ad,
        createdAt: new Date(result.ad.createdAt),
        updatedAt: new Date(result.ad.updatedAt),
        expiresAt: new Date(result.ad.expiresAt),
        featuredUntil: result.ad.featuredUntil ? new Date(result.ad.featuredUntil) : undefined,
      };
      
      console.log('✅ Ad loaded from backend:', ad.title);
      return await this.fixBlobUrls(ad);
    } catch (error) {
      console.log('⚠️ Backend failed, trying local storage fallback for ad:', id);
    }

    // Finally try localStorage
    try {
      const localAds = JSON.parse(localStorage.getItem('demo_ads') || '[]');
      const foundAd = localAds.find((ad: Ad) => ad.id === id);
      
      if (foundAd) {
        console.log('✅ Ad found in local storage:', foundAd.title);
        // Ensure dates are Date objects
        const ad = {
          ...foundAd,
          createdAt: foundAd.createdAt ? new Date(foundAd.createdAt) : new Date(),
          updatedAt: foundAd.updatedAt ? new Date(foundAd.updatedAt) : new Date(),
          expiresAt: foundAd.expiresAt ? new Date(foundAd.expiresAt) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          featuredUntil: foundAd.featuredUntil ? new Date(foundAd.featuredUntil) : undefined,
        };
        return await this.fixBlobUrls(ad);
      }
    } catch (localError) {
      console.error('❌ Error reading from local storage:', localError);
    }

    console.log('❌ Ad not found in any storage system:', id);
    return null;
  }

  // Make the makeRequest method accessible for debugging
  async makeRequest(endpoint: string, options: any = {}): Promise<any> {
    // This method should already exist in the service, but adding this for type safety
    try {
      const { projectId, publicAnonKey } = await import('../../utils/supabase/info');
      
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-e5dee741${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.accessToken || publicAnonKey}`,
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ API request failed:', error);
      throw error;
    }
  }

  // Get single ad from Supabase
  async getAdFromSupabase(id: string): Promise<Ad | null> {
    try {
      const { getSupabaseClient } = await import('../../utils/supabase/client');
      const supabase = getSupabaseClient();
      
      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      const { data: ad, error } = await supabase
        .from('ads')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found
          return null;
        }
        throw new Error(`Supabase query error: ${error.message}`);
      }

      if (!ad) {
        return null;
      }

      // Convert Supabase format to our Ad interface
      const convertedAd: Ad = {
        id: ad.id,
        title: ad.title,
        titlePersian: ad.title_persian || ad.title,
        description: ad.description,
        descriptionPersian: ad.description_persian || ad.description,
        price: ad.price ? parseFloat(ad.price.toString()) : 0,
        priceType: ad.price_type || 'fixed',
        currency: ad.currency || 'USD',
        category: ad.category || 'Other',
        subcategory: ad.subcategory || '',
        images: ad.images || [],
        userId: ad.owner_id,
        username: ad.owner_id, // Will be resolved later if needed
        userEmail: '', // Will be resolved later if needed
        contactInfo: ad.contact_info || '',
        location: ad.location || { country: '', city: '' },
        createdAt: new Date(ad.created_at),
        updatedAt: new Date(ad.updated_at),
        expiresAt: ad.expires_at ? new Date(ad.expires_at) : undefined,
        status: ad.status || 'active',
        approved: ad.approved || false,
        featured: ad.featured || false,
        featuredUntil: ad.featured_until ? new Date(ad.featured_until) : undefined,
        urgent: ad.urgent || false,
        condition: ad.condition,
        brand: ad.brand,
        model: ad.model,
        specifications: ad.specifications,
        boost: ad.boost || { active: false, expiresAt: null },
        paymentStatus: ad.payment_status || 'pending',
        paymentId: ad.payment_id,
        moderationResult: ad.moderation_result,
        views: ad.views || 0
      };

      return convertedAd;
    } catch (error) {
      console.error('❌ Failed to load ad from Supabase:', error);
      throw error;
    }
  }

  // Alias for backward compatibility
  async getAd(id: string): Promise<Ad | null> {
    return this.getAdById(id);
  }



  async updateAd(adId: string, adData: Partial<Ad>): Promise<Ad> {
    console.log('📝 Updating ad:', adId, 'with data:', adData);
    
    // First get the existing ad
    const existingAd = await this.getAdById(adId);
    if (!existingAd) {
      throw new Error(`Ad with ID ${adId} not found`);
    }

    // Create updated ad object
    const updatedAd: Ad = {
      ...existingAd,
      ...adData,
      updatedAt: new Date(),
    };

    // Save to both storages
    const saveResults = await this.saveAdToBothStorages(updatedAd);
    
    if (saveResults.supabaseSuccess || saveResults.localStorageSuccess) {
      console.log('✅ Ad updated successfully:', {
        id: updatedAd.id,
        title: updatedAd.title,
        supabase: saveResults.supabaseSuccess,
        localStorage: saveResults.localStorageSuccess
      });
      this.emit('adUpdated', updatedAd);
      return updatedAd;
    } else {
      throw new Error('Failed to update ad in any storage system');
    }
  }

  async boostAd(adId: string): Promise<Ad> {
    try {
      const result = await this.makeRequest(`/ads/${adId}/boost`, {
        method: 'POST',
      });
      
      const ad = {
        ...result.ad,
        createdAt: new Date(result.ad.createdAt),
        updatedAt: new Date(result.ad.updatedAt),
        expiresAt: new Date(result.ad.expiresAt),
        featuredUntil: result.ad.featuredUntil ? new Date(result.ad.featuredUntil) : undefined,
      };
      
      this.emit('adBoosted', ad);
      return ad;
    } catch (error) {
      console.error('Boost ad error:', error);
      throw error;
    }
  }

  async getUserAds(): Promise<Ad[]> {
    try {
      console.log('🔍 getUserAds debug info:', {
        hasAccessToken: !!this.accessToken,
        accessTokenLength: this.accessToken?.length,
        currentUserId: this.currentUser?.id,
        currentUserEmail: this.currentUser?.email,
        isServerAvailable: this.isServerAvailable
      });
      
      const result = await this.makeRequest('/users/me/ads');
      
      // Convert date strings back to Date objects
      const ads = result.ads.map((ad: any) => ({
        ...ad,
        createdAt: new Date(ad.createdAt),
        updatedAt: new Date(ad.updatedAt),
        expiresAt: new Date(ad.expiresAt),
        featuredUntil: ad.featuredUntil ? new Date(ad.featuredUntil) : undefined,
      }));
      
      return ads;
    } catch (error) {
      console.error('Get user ads error:', error);
      
      // Fallback: Return user's localStorage ads first, then demo ads
      if (!this.currentUser) {
        return [];
      }
      
      // First try to get user's actual ads from localStorage
      const localAds = JSON.parse(localStorage.getItem('demo_ads') || '[]');
      const userLocalAds = localAds.filter((ad: any) => 
        ad.userId === this.currentUser?.id || ad.userEmail === this.currentUser?.email
      );
      
      console.log('📦 Found localStorage ads for user:', userLocalAds.length);
      
      if (userLocalAds.length > 0) {
        // Convert date strings back to Date objects for localStorage ads
        const processedAds = userLocalAds.map((ad: any) => ({
          ...ad,
          createdAt: new Date(ad.createdAt),
          updatedAt: new Date(ad.updatedAt),
          expiresAt: new Date(ad.expiresAt),
          featuredUntil: ad.featuredUntil ? new Date(ad.featuredUntil) : undefined,
        }));
        
        console.log('✅ Returning localStorage ads for user');
        return processedAds;
      }
      
      // If no localStorage ads found, return demo ads that belong to current user
      const demoAds: Ad[] = [
        {
          id: 'demo-user-ad-1',
          title: 'BMW 3 Series 2020',
          titlePersian: 'بی‌ام‌دبلیو سری ۳ ۲۰۲۰',
          description: 'Excellent condition BMW 3 Series with low mileage. Full service history available.',
          descriptionPersian: 'بی‌ام‌دبلیو سری ۳ در وضعیت عالی با کیلومتر کم. تاریخچه کامل سرویس موجود.',
          price: 45000,
          priceType: 'negotiable' as const,
          currency: 'USD',
          category: 'vehicles',
          subcategory: 'cars',
          location: { country: 'United Kingdom', city: 'London' },
          images: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?w=500'],
          userId: this.currentUser.id,
          username: this.currentUser.username,
          userEmail: this.currentUser.email,
          status: 'approved' as const,
          featured: false,
          urgent: false,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
          expiresAt: new Date('2024-04-15'),
          views: 127,
          contactInfo: { phone: '+44 7123 456789', email: this.currentUser.email },
          condition: 'excellent' as const,
          brand: 'BMW',
          model: '3 Series',
          paymentStatus: 'completed' as const
        },
        {
          id: 'demo-user-ad-2',
          title: 'Modern Apartment in City Center',
          titlePersian: 'آپارتمان مدرن در مرکز شهر',
          description: 'Beautiful 2-bedroom apartment with great amenities and city views.',
          descriptionPersian: 'آپارتمان زیبای ۲ خوابه با امکانات عالی و نمای شهر.',
          price: 2500,
          priceType: 'fixed' as const,
          currency: 'USD',
          category: 'real-estate',
          subcategory: 'apartments',
          location: { country: 'United Kingdom', city: 'Manchester' },
          images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500'],
          userId: this.currentUser.id,
          username: this.currentUser.username,
          userEmail: this.currentUser.email,
          status: 'approved' as const,
          featured: true,
          featuredUntil: new Date('2024-02-01'),
          urgent: false,
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-01-10'),
          expiresAt: new Date('2024-04-10'),
          views: 89,
          contactInfo: { phone: '+44 7987 654321', email: this.currentUser.email },
          paymentStatus: 'completed' as const
        },
        {
          id: 'demo-user-ad-3',
          title: 'iPhone 14 Pro Max',
          titlePersian: 'آیفون ۱۴ پرو مکس',
          description: 'Brand new iPhone 14 Pro Max, 256GB storage, still in original packaging.',
          descriptionPersian: 'آیفون ۱۴ پرو مکس کاملاً نو، ۲۵۶ گیگابایت حافظه، هنوز در بسته‌بندی اصلی.',
          price: 1200,
          priceType: 'fixed' as const,
          currency: 'USD',
          category: 'digital-goods',
          subcategory: 'phones',
          location: { country: 'United Kingdom', city: 'Birmingham' },
          images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500'],
          userId: this.currentUser.id,
          username: this.currentUser.username,
          userEmail: this.currentUser.email,
          status: 'pending' as const,
          featured: false,
          urgent: true,
          createdAt: new Date('2024-01-20'),
          updatedAt: new Date('2024-01-20'),
          expiresAt: new Date('2024-04-20'),
          views: 45,
          contactInfo: { phone: '+44 7456 123789', email: this.currentUser.email },
          condition: 'new' as const,
          brand: 'Apple',
          model: 'iPhone 14 Pro Max',
          paymentStatus: 'completed' as const
        }
      ];
      
      return demoAds;
    }
  }

  // Enhanced dual storage system for ads
  async saveAdToBothStorages(ad: Ad): Promise<{ supabaseSuccess: boolean; localStorageSuccess: boolean; errors: string[] }> {
    const errors: string[] = [];
    let supabaseSuccess = false;
    let localStorageSuccess = false;

    console.log('🔄 Saving ad to dual storage system:', { 
      id: ad.id, 
      title: ad.title,
      status: ad.status,
      paymentStatus: ad.paymentStatus 
    });

    // Always save to localStorage first (most reliable)
    try {
      await this.saveAdToLocalStorage(ad);
      localStorageSuccess = true;
      console.log('✅ Ad saved to localStorage:', ad.id);
    } catch (error) {
      const errorMsg = `localStorage save failed: ${error}`;
      console.error('❌', errorMsg);
      errors.push(errorMsg);
    }

    // Try Supabase (for cloud sync)
    try {
      await this.saveAdToSupabase(ad);
      supabaseSuccess = true;
      console.log('✅ Ad saved to Supabase:', ad.id);
    } catch (error) {
      const errorMsg = `Supabase save failed: ${error}`;
      console.warn('⚠️', errorMsg);
      errors.push(errorMsg);
    }

    // Mark ad as synced if both succeeded
    if (supabaseSuccess && localStorageSuccess) {
      try {
        await this.markAdAsSynced(ad.id);
        console.log('🔄 Ad marked as synced across both storages:', ad.id);
      } catch (error) {
        console.warn('⚠️ Failed to mark ad as synced:', error);
      }
    }

    return { supabaseSuccess, localStorageSuccess, errors };
  }

  // Mark ad as synced in metadata
  private async markAdAsSynced(adId: string): Promise<void> {
    try {
      const syncMetadata = JSON.parse(localStorage.getItem('ad_sync_metadata') || '{}');
      syncMetadata[adId] = {
        lastSynced: new Date().toISOString(),
        supabaseSync: true,
        localStorageSync: true
      };
      localStorage.setItem('ad_sync_metadata', JSON.stringify(syncMetadata));
    } catch (error) {
      console.warn('Failed to update sync metadata:', error);
    }
  }

  // Save ad to Supabase
  async saveAdToSupabase(ad: Ad): Promise<void> {
    try {
      const { getSupabaseClient } = await import('../../utils/supabase/client');
      const supabase = getSupabaseClient();
      
      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      // Convert ad to Supabase format (excluding problematic fields)
      const supabaseAd = {
        id: ad.id,
        title: ad.title,
        title_persian: ad.titlePersian || ad.title,
        description: ad.description,
        description_persian: ad.descriptionPersian || ad.description,
        price: parseFloat(ad.price?.toString() || '0'),
        price_type: ad.priceType || 'fixed',
        currency: ad.currency || 'USD',
        category: ad.category,
        subcategory: ad.subcategory || '',
        images: ad.images || [],
        owner_id: ad.userId,
        contact_info: ad.contactInfo || {},
        location: ad.location || {},
        status: ad.status || 'pending',
        approved: ad.status === 'approved',
        featured: ad.featured || false,
        featured_until: ad.featuredUntil?.toISOString() || null,
        urgent: ad.urgent || false,
        condition: ad.condition || null,
        // Removed brand, model, specifications fields to avoid schema issues
        payment_status: ad.paymentStatus || 'pending',
        payment_id: ad.paymentId || null,
        moderation_result: ad.moderationResult || null,
        views: ad.views || 0,
        created_at: ad.createdAt.toISOString(),
        updated_at: ad.updatedAt.toISOString(),
        expires_at: ad.expiresAt?.toISOString() || null
      };

      console.log('📊 Attempting to save ad to Supabase:', {
        id: supabaseAd.id,
        title: supabaseAd.title,
        category: supabaseAd.category,
        owner_id: supabaseAd.owner_id
      });

      const { error } = await supabase
        .from('ads')
        .upsert(supabaseAd, { onConflict: 'id' });

      if (error) {
        console.error('❌ Supabase error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });

        // If it's a schema/table error, provide more helpful message
        if (error.message.includes('schema cache') || error.message.includes('relation') || error.message.includes('column')) {
          throw new Error(`Database schema issue: ${error.message}. Please run the database setup script.`);
        }
        
        throw new Error(`Supabase insert error: ${error.message}`);
      }

      console.log('✅ Ad saved to Supabase database successfully:', ad.id);
    } catch (error) {
      console.error('❌ Failed to save ad to Supabase:', error);
      throw error;
    }
  }

  // Save ad to localStorage
  async saveAdToLocalStorage(ad: Ad): Promise<void> {
    try {
      // Check localStorage usage before attempting to save
      const currentUsage = JSON.stringify(localStorage).length;
      const maxUsage = 8 * 1024 * 1024; // 8MB limit
      
      if (currentUsage > maxUsage * 0.8) { // If over 80% usage
        console.log('🧹 LocalStorage usage high, cleaning old data...');
        this.cleanOldLocalStorageData();
      }
      
      // Save to demo_ads for compatibility
      const localAds = JSON.parse(localStorage.getItem('demo_ads') || '[]');
      
      // Add sync metadata to the ad
      const enhancedAd = {
        ...ad,
        _localStorage: {
          savedAt: new Date().toISOString(),
          version: '1.0',
          syncAttempts: (ad as any)?._localStorage?.syncAttempts || 0
        }
      };
      
      // Remove existing ad with same ID if it exists
      const filteredAds = localAds.filter((existingAd: Ad) => existingAd.id !== ad.id);
      
      // Add the new/updated ad
      filteredAds.push(enhancedAd);
      
      // Keep only last 50 ads to prevent storage bloat
      const adsToSave = filteredAds.slice(-50);
      
      localStorage.setItem('demo_ads', JSON.stringify(adsToSave));
      
      // Update localStorage index for faster lookups
      await this.updateLocalStorageIndex(adsToSave);
      
      console.log('✅ Ad saved to localStorage with metadata:', ad.id);
    } catch (error) {
      console.error('❌ Failed to save ad to localStorage:', error);
      
      // If it's a quota error, try cleaning and retrying once
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.log('🧹 Quota exceeded, attempting cleanup and retry...');
        try {
          this.cleanOldLocalStorageData();
          // Try again with just this ad
          localStorage.setItem('demo_ads', JSON.stringify([ad]));
          console.log('✅ Ad saved to localStorage after cleanup');
          return;
        } catch (retryError) {
          console.error('❌ Failed even after cleanup:', retryError);
          throw new Error('localStorage quota exceeded and cleanup failed');
        }
      }
      
      throw error;
    }
  }

  // Create/update index for faster ad lookups
  private async updateLocalStorageIndex(adsToSave?: Ad[]): Promise<void> {
    try {
      const localAds = adsToSave || JSON.parse(localStorage.getItem('demo_ads') || '[]');
      const index = {
        lastUpdated: new Date().toISOString(),
        totalAds: localAds.length,
        adIds: localAds.map((ad: Ad) => ad.id),
        categories: [...new Set(localAds.map((ad: Ad) => ad.category))],
        statuses: localAds.reduce((acc: any, ad: Ad) => {
          acc[ad.status] = (acc[ad.status] || 0) + 1;
          return acc;
        }, {}),
        countries: [...new Set(localAds.map((ad: Ad) => ad.location?.country).filter(Boolean))],
        featuredCount: localAds.filter((ad: Ad) => ad.featured).length
      };
      
      localStorage.setItem('demo_ads_index', JSON.stringify(index));
      console.log('📊 Updated localStorage index:', {
        totalAds: index.totalAds,
        categories: index.categories.length,
        statuses: Object.keys(index.statuses)
      });
    } catch (error) {
      console.warn('Failed to update localStorage index:', error);
    }
  }

  // Clean old localStorage data to free up space
  private cleanOldLocalStorageData(): void {
    try {
      console.log('🧹 Cleaning old localStorage data...');
      
      // Keep only essential keys
      const keysToKeep = [
        'auth_user', 'auth_token', 'demo_language', 'user_preferences', 'demo_ads'
      ];
      
      const allKeys = Object.keys(localStorage);
      let removedCount = 0;
      
      allKeys.forEach(key => {
        if (!keysToKeep.includes(key)) {
          try {
            localStorage.removeItem(key);
            removedCount++;
          } catch (error) {
            console.warn(`Failed to remove localStorage key: ${key}`, error);
          }
        }
      });
      
      // Also limit demo_ads to last 20 items
      try {
        const ads = JSON.parse(localStorage.getItem('demo_ads') || '[]');
        if (ads.length > 20) {
          const limitedAds = ads.slice(-20);
          localStorage.setItem('demo_ads', JSON.stringify(limitedAds));
          console.log(`🧹 Reduced ads from ${ads.length} to ${limitedAds.length}`);
        }
      } catch (error) {
        console.warn('Failed to limit demo_ads:', error);
      }
      
      console.log(`✅ Cleaned ${removedCount} localStorage keys`);
    } catch (error) {
      console.error('❌ Failed to clean localStorage:', error);
    }
  }

  // Save user settings to Supabase and localStorage
  async saveUserSettings(settings: any): Promise<void> {
    const user = this.getCurrentUser();
    if (!user) {
      console.warn('⚠️ No user logged in, settings not saved');
      return;
    }

    try {
      // Save to Supabase
      await this.saveUserSettingsToSupabase(user.id, settings);
      console.log('✅ User settings saved to Supabase');
    } catch (error) {
      console.warn('⚠️ Failed to save settings to Supabase:', error);
    }

    try {
      // Always save to localStorage as backup
      const userSettingsKey = `user_settings_${user.id}`;
      localStorage.setItem(userSettingsKey, JSON.stringify({
        ...settings,
        userId: user.id,
        updatedAt: new Date().toISOString()
      }));
      console.log('✅ User settings saved to localStorage');
    } catch (error) {
      console.error('❌ Failed to save settings to localStorage:', error);
    }
  }

  // Save user settings to Supabase
  async saveUserSettingsToSupabase(userId: string, settings: any): Promise<void> {
    try {
      const { getSupabaseClient } = await import('../../utils/supabase/client');
      const supabase = getSupabaseClient();
      
      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      const settingsData = {
        user_id: userId,
        settings: settings,
        updated_at: new Date().toISOString()
      };

      // Check if user settings already exist
      const { data: existing } = await supabase
        .from('user_settings')
        .select('user_id')
        .eq('user_id', userId)
        .single();

      if (existing) {
        // Update existing settings
        const { error } = await supabase
          .from('user_settings')
          .update(settingsData)
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        // Insert new settings
        const { error } = await supabase
          .from('user_settings')
          .insert(settingsData);

        if (error) throw error;
      }

      console.log('📊 User settings saved to Supabase database');
    } catch (error) {
      console.error('❌ Failed to save user settings to Supabase:', error);
      throw error;
    }
  }

  // Load user settings from Supabase with localStorage fallback
  async loadUserSettings(): Promise<any> {
    const user = this.getCurrentUser();
    if (!user) {
      return {};
    }

    // Try Supabase first
    try {
      const { getSupabaseClient } = await import('../../utils/supabase/client');
      const supabase = getSupabaseClient();
      
      if (supabase) {
        const { data, error } = await supabase
          .from('user_settings')
          .select('settings')
          .eq('user_id', user.id)
          .single();

        if (!error && data) {
          console.log('✅ User settings loaded from Supabase');
          return data.settings;
        }
      }
    } catch (error) {
      console.warn('⚠️ Failed to load settings from Supabase:', error);
    }

    // Fallback to localStorage
    try {
      const userSettingsKey = `user_settings_${user.id}`;
      const localSettings = localStorage.getItem(userSettingsKey);
      if (localSettings) {
        const parsed = JSON.parse(localSettings);
        console.log('✅ User settings loaded from localStorage');
        return parsed.settings || parsed;
      }
    } catch (error) {
      console.warn('⚠️ Failed to load settings from localStorage:', error);
    }

    return {};
  }

  // Create new ad
  async createAd(adData: Partial<Ad>): Promise<Ad> {
    console.log('📝 Creating new ad...', adData.title);
    
    const user = this.getCurrentUser();
    if (!user) {
      throw new Error('User must be authenticated to create an ad');
    }

    // Check if user is admin
    const isAdmin = user.role === 'admin';
    const isAdminEmail = user.email && ['ommzadeh@gmail.com'].includes(user.email.toLowerCase());
    console.log('👤 User role check:', { 
      userId: user.id, 
      role: user.role, 
      email: user.email,
      isAdmin, 
      isAdminEmail,
      finalIsAdmin: isAdmin || isAdminEmail
    });

    // Create a new ad with default values
    const newAd: Ad = {
      id: crypto.randomUUID(),
      title: adData.title || '',
      titlePersian: adData.titlePersian || adData.title || '',
      description: adData.description || '',
      descriptionPersian: adData.descriptionPersian || adData.description || '',
      price: adData.price || 0,
      priceType: adData.priceType || 'fixed',
      currency: adData.currency || 'USD',
      category: adData.category || '',
      subcategory: adData.subcategory || '',
      location: adData.location || { country: '', city: '' },
      images: adData.images || [],
      userId: user.id,
      username: user.username || user.name || user.email,
      userEmail: user.email,
      status: (isAdmin || isAdminEmail) ? 'approved' : 'pending', // Admin ads start approved, others pending
      featured: adData.featured || false,
      featuredUntil: adData.featured ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : undefined,
      urgent: adData.urgent || false,
      createdAt: new Date(),
      updatedAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      views: 0,
      contactInfo: adData.contactInfo || { email: user.email },
      condition: adData.condition,
      brand: adData.brand,
      model: adData.model,
      specifications: adData.specifications,
      paymentStatus: (isAdmin || isAdminEmail) ? 'completed' : 'pending', // Admin payments are automatically complete
      paymentId: (isAdmin || isAdminEmail) ? `admin_bypass_${Date.now()}` : undefined,
      moderationResult: (isAdmin || isAdminEmail) ? {
        status: 'approved',
        reason: 'Admin posting - auto-approved',
        reviewedAt: new Date(),
        reviewedBy: user.id
      } : undefined
    };

    if (isAdmin || isAdminEmail) {
      console.log('🔧 Admin ad created with approved status:', {
        id: newAd.id,
        status: newAd.status,
        paymentStatus: newAd.paymentStatus,
        featured: newAd.featured,
        isAdmin,
        isAdminEmail
      });
    }

    // Save to both Supabase and localStorage for reliability
    const saveResults = await this.saveAdToBothStorages(newAd);
    
    if (saveResults.supabaseSuccess || saveResults.localStorageSuccess) {
      console.log('✅ Ad created successfully:', {
        id: newAd.id,
        title: newAd.title,
        supabase: saveResults.supabaseSuccess,
        localStorage: saveResults.localStorageSuccess
      });
      this.emit('adCreated', newAd);
      return newAd;
    } else {
      // Provide detailed error information
      const errorDetails = saveResults.errors.join(' | ');
      console.error('❌ Failed to save ad to any storage system:', {
        errors: saveResults.errors,
        adId: newAd.id,
        title: newAd.title,
        userId: user.id
      });
      
      throw new Error(`Failed to save ad to any storage system. Details: ${errorDetails}`);
    }
  }

  // Sync unsynced localStorage ads to Supabase when connection is restored
  async syncLocalStorageAdsToSupabase(): Promise<{ synced: number; failed: number; errors: string[] }> {
    console.log('🔄 Starting sync of localStorage ads to Supabase...');
    
    const errors: string[] = [];
    let synced = 0;
    let failed = 0;
    
    try {
      // Get all local ads
      const localAds = JSON.parse(localStorage.getItem('demo_ads') || '[]');
      const syncMetadata = JSON.parse(localStorage.getItem('ad_sync_metadata') || '{}');
      
      // Find ads that need syncing (not yet synced to Supabase)
      const adsToSync = localAds.filter((ad: any) => {
        const metadata = syncMetadata[ad.id];
        return !metadata || !metadata.supabaseSync;
      });
      
      console.log(`📊 Found ${adsToSync.length} ads to sync out of ${localAds.length} total`);
      
      if (adsToSync.length === 0) {
        return { synced: 0, failed: 0, errors: [] };
      }
      
      // Sync each ad
      for (const ad of adsToSync) {
        try {
          await this.saveAdToSupabase(ad);
          await this.markAdAsSynced(ad.id);
          synced++;
          console.log(`✅ Synced ad to Supabase: ${ad.title}`);
        } catch (error) {
          failed++;
          const errorMsg = `Failed to sync ad ${ad.id}: ${error}`;
          errors.push(errorMsg);
          console.error('❌', errorMsg);
        }
      }
      
      console.log(`🔄 Sync completed: ${synced} synced, ${failed} failed`);
      
    } catch (error) {
      const errorMsg = `Sync process failed: ${error}`;
      errors.push(errorMsg);
      console.error('❌', errorMsg);
    }
    
    return { synced, failed, errors };
  }

  // Check sync status of all ads
  async checkSyncStatus(): Promise<{ total: number; synced: number; localOnly: number; details: any[] }> {
    try {
      const localAds = JSON.parse(localStorage.getItem('demo_ads') || '[]');
      const syncMetadata = JSON.parse(localStorage.getItem('ad_sync_metadata') || '{}');
      
      const details = localAds.map((ad: any) => {
        const metadata = syncMetadata[ad.id];
        return {
          id: ad.id,
          title: ad.title,
          status: ad.status,
          syncStatus: metadata ? 'synced' : 'local-only',
          lastSynced: metadata?.lastSynced || null
        };
      });
      
      const syncedCount = details.filter(ad => ad.syncStatus === 'synced').length;
      const localOnlyCount = details.filter(ad => ad.syncStatus === 'local-only').length;
      
      return {
        total: localAds.length,
        synced: syncedCount,
        localOnly: localOnlyCount,
        details
      };
    } catch (error) {
      console.error('Failed to check sync status:', error);
      return { total: 0, synced: 0, localOnly: 0, details: [] };
    }
  }

  // Admin function to approve all pending ads for admin emails
  async approveAllPendingAdsForAdmin(): Promise<{ approved: number; total: number }> {
    const user = this.getCurrentUser();
    if (!user) {
      throw new Error('User must be authenticated');
    }

    const isAdminEmail = user.email && ['ommzadeh@gmail.com'].includes(user.email.toLowerCase());
    if (!isAdminEmail && user.role !== 'admin') {
      throw new Error('Only admins can approve ads');
    }

    console.log('🔧 Admin approving all pending ads...');

    try {
      // Try backend first
      const result = await this.makeRequest('/admin/approve-pending-ads', {
        method: 'POST'
      });
      console.log('✅ Backend: Approved pending ads:', result);
      return result;
    } catch (error) {
      console.log('⚠️ Backend not available, using local storage fallback');
      
      // Local storage fallback
      const localAds = JSON.parse(localStorage.getItem('demo_ads') || '[]');
      let approved = 0;
      
      const updatedAds = localAds.map((ad: Ad) => {
        if (ad.status === 'pending' && ad.userEmail === user.email) {
          console.log('✅ Approving ad:', ad.title);
          approved++;
          return {
            ...ad,
            status: 'approved',
            paymentStatus: 'completed',
            paymentId: `admin_manual_approval_${Date.now()}`,
            moderationResult: {
              status: 'approved',
              reason: 'Admin manual approval',
              reviewedAt: new Date(),
              reviewedBy: user.id
            }
          };
        }
        return ad;
      });

      localStorage.setItem('demo_ads', JSON.stringify(updatedAds));
      
      console.log(`✅ Local: Approved ${approved} ads out of ${localAds.length} total`);
      return { approved, total: localAds.length };
    }
  }

  // Create payment record
  async createPayment(paymentData: Partial<Payment>): Promise<Payment> {
    console.log('💰 Creating payment record...', paymentData);
    
    const user = this.getCurrentUser();
    if (!user) {
      throw new Error('User must be authenticated to create a payment');
    }

    const newPayment: Payment = {
      id: crypto.randomUUID(),
      userId: user.id,
      adId: paymentData.adId || '',
      amount: paymentData.amount || 2.00,
      currency: paymentData.currency || 'USD',
      type: paymentData.type || 'ad_posting',
      status: 'pending',
      createdAt: new Date(),
      completedAt: undefined,
      stripeSessionId: undefined
    };

    try {
      // Try to create payment via backend
      const result = await this.makeRequest('/payments/create', {
        method: 'POST',
        body: JSON.stringify(newPayment),
      });
      
      console.log('✅ Payment created successfully via backend:', result.payment.id);
      return result.payment;
    } catch (error) {
      console.log('⚠️ Backend not available, using local storage fallback:', error);
      
      // Fallback: store in local storage for demo purposes
      const localPayments = JSON.parse(localStorage.getItem('demo_payments') || '[]');
      localPayments.push(newPayment);
      localStorage.setItem('demo_payments', JSON.stringify(localPayments));
      
      console.log('✅ Payment created in local storage:', newPayment.id);
      return newPayment;
    }
  }

  // File upload method
  async uploadFile(file: File, type: 'ad-image' | 'avatar' | 'video' = 'ad-image'): Promise<string> {
    console.log('🚀 uploadFile called:', { 
      fileName: file.name, 
      fileSize: file.size, 
      fileType: file.type,
      type: type 
    });
    
    try {
      console.log('📁 Uploading file to backend:', file.name, 'Type:', type);
      console.log('🔗 Backend URL:', `${this.baseUrl}/upload?type=${type}`);
      console.log('🔑 Access token available:', !!this.accessToken);
      console.log('🔑 Public anon key available:', !!publicAnonKey);
      
      const response = await fetch(`${this.baseUrl}/upload?type=${type}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken || publicAnonKey}`,
        },
        body: file,
      });

      console.log('📡 Backend response status:', response.status);
      console.log('📡 Backend response ok:', response.ok);

      if (!response.ok) {
        console.log('❌ Backend upload failed with status:', response.status, response.statusText);
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      console.log('✅ Backend upload successful, result:', result);
      
      // Validate that we got a proper URL
      if (!result?.url || typeof result.url !== 'string') {
        console.log('❌ Backend returned invalid URL format:', result);
        throw new Error('Invalid response format from backend');
      }
      
      const urlType = result.url.startsWith('data:') ? 'Base64 Data URL' : 'Signed URL';
      console.log('✅ File uploaded to backend successfully! Type:', urlType);
      console.log('📏 URL length:', result.url.length);
      
      return result.url;
    } catch (error) {
      console.log('⚠️ Backend upload failed, using frontend base64 fallback:', error);
      
      // Demo mode fallback: Convert file to base64 data URL for persistent storage
      return new Promise((resolve, reject) => {
        // If the file is very large, try to compress it
        if (file.size > 2 * 1024 * 1024) { // 2MB+
          console.log('📏 Large file detected, attempting compression...');
          
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          
          img.onload = () => {
            // Calculate new dimensions (max 1200px width/height)
            const maxSize = 1200;
            let { width, height } = img;
            
            if (width > maxSize || height > maxSize) {
              if (width > height) {
                height = (height * maxSize) / width;
                width = maxSize;
              } else {
                width = (width * maxSize) / height;
                height = maxSize;
              }
            }
            
            canvas.width = width;
            canvas.height = height;
            
            // Draw and compress
            ctx?.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
            
            console.log('✅ Image compressed for demo mode:', 
                      `${file.size} bytes -> ${compressedDataUrl.length * 0.75} bytes`);
            resolve(compressedDataUrl);
          };
          
          img.onerror = () => {
            console.log('⚠️ Compression failed, using original file');
            fallbackToOriginal();
          };
          
          // Create object URL for the image to load
          img.src = URL.createObjectURL(file);
        } else {
          fallbackToOriginal();
        }
        
        function fallbackToOriginal() {
          const reader = new FileReader();
          reader.onload = () => {
            const base64Url = reader.result as string;
            console.log('✅ File converted to base64 for demo mode');
            resolve(base64Url);
          };
          reader.onerror = () => {
            console.error('❌ Failed to convert file to base64');
            reject(new Error('Failed to process file in demo mode'));
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }

  // Search methods
  searchAds(query: string, ads: Ad[]): Ad[] {
    if (!query.trim()) return ads;
    
    const searchTerm = query.toLowerCase();
    return ads.filter(ad => 
      ad.title.toLowerCase().includes(searchTerm) ||
      ad.titlePersian.toLowerCase().includes(searchTerm) ||
      ad.description.toLowerCase().includes(searchTerm) ||
      ad.descriptionPersian.toLowerCase().includes(searchTerm) ||
      ad.category.toLowerCase().includes(searchTerm) ||
      ad.subcategory.toLowerCase().includes(searchTerm) ||
      ad.location.country.toLowerCase().includes(searchTerm) ||
      ad.location.city.toLowerCase().includes(searchTerm)
    );
  }

  // Message methods with fallbacks
  async getChats(): Promise<Chat[]> {
    try {
      const result = await this.makeRequest('/messages/chats');
      
      // Convert date strings back to Date objects
      const chats = result.chats.map((chat: any) => ({
        ...chat,
        lastActivity: new Date(chat.lastActivity),
        lastMessage: chat.lastMessage ? {
          ...chat.lastMessage,
          timestamp: new Date(chat.lastMessage.timestamp),
        } : undefined,
      }));
      
      return chats;
    } catch (error) {
      // Return empty chats for demo mode
      return [];
    }
  }

  async getChatMessages(chatId: string): Promise<{ chat: Chat; messages: Message[] }> {
    try {
      const result = await this.makeRequest(`/messages/chats/${chatId}`);
      
      // Convert date strings back to Date objects
      const chat = {
        ...result.chat,
        lastActivity: new Date(result.chat.lastActivity),
        lastMessage: result.chat.lastMessage ? {
          ...result.chat.lastMessage,
          timestamp: new Date(result.chat.lastMessage.timestamp),
        } : undefined,
      };
      
      const messages = result.messages.map((message: any) => ({
        ...message,
        timestamp: new Date(message.timestamp),
      }));
      
      return { chat, messages };
    } catch (error) {
      // Return empty chat for demo mode
      const demoChat: Chat = {
        id: chatId,
        participants: [],
        participantUsernames: [],
        lastActivity: new Date(),
        isActive: true
      };
      return { chat: demoChat, messages: [] };
    }
  }

  async sendMessage(chatId: string, content: string): Promise<Message> {
    try {
      const result = await this.makeRequest(`/messages/chats/${chatId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
      
      const message = {
        ...result.message,
        timestamp: new Date(result.message.timestamp),
      };
      
      this.emit('messageReceived', message);
      return message;
    } catch (error) {
      // Create demo message
      const currentUser = this.getCurrentUser();
      const message: Message = {
        id: `demo-msg-${Date.now()}`,
        chatId,
        senderId: currentUser?.id || 'demo-user',
        senderUsername: currentUser?.username || 'Demo User',
        receiverId: 'demo-receiver',
        receiverUsername: 'Demo Receiver',
        content,
        timestamp: new Date(),
        isRead: false
      };
      
      this.emit('messageReceived', message);
      return message;
    }
  }

  async createOrGetChat(receiverId: string, adId?: string): Promise<Chat> {
    try {
      const result = await this.makeRequest('/messages/chats', {
        method: 'POST',
        body: JSON.stringify({ receiverId, adId }),
      });
      
      const chat = {
        ...result.chat,
        lastActivity: new Date(result.chat.lastActivity),
        lastMessage: result.chat.lastMessage ? {
          ...result.chat.lastMessage,
          timestamp: new Date(result.chat.lastMessage.timestamp),
        } : undefined,
      };
      
      return chat;
    } catch (error) {
      // Create demo chat
      const currentUser = this.getCurrentUser();
      const chat: Chat = {
        id: `demo-chat-${Date.now()}`,
        participants: [currentUser?.id || 'demo-user', receiverId],
        participantUsernames: [currentUser?.username || 'Demo User', 'Other User'],
        lastActivity: new Date(),
        adId,
        isActive: true
      };
      return chat;
    }
  }

  // Admin methods with fallbacks
  async getAdminStats(): Promise<AdminStats> {
    try {
      const result = await this.makeRequest('/admin/stats');
      return result.stats;
    } catch (error) {
      // Return demo stats
      return {
        totalAds: 5,
        activeAds: 5,
        pendingAds: 0,
        featuredAds: 2,
        totalUsers: 3,
        totalChats: 0,
        todayAds: 1
      };
    }
  }



  // Create a demo user for fallback scenarios
  private createDemoUser(): User {
    return {
      id: 'demo-user-' + Date.now(),
      username: '', // Empty to trigger username creation
      email: 'demo@example.com',
      name: 'Demo User',
      role: 'user',
      authProvider: 'google',
      createdAt: new Date(),
      isBlocked: false,
      picture: null,
      termsAccepted: undefined
    };
  }

  // Google authentication method
  async authenticateGoogleUser(googleData: any): Promise<User> {
    try {
      // Try to sign in with Google through the backend
      const result = await this.makeRequest('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ googleData }),
      });
      
      this.saveCurrentUser(result.user, result.access_token);
      this.emit('userSignedIn', result.user);
      
      return result.user;
    } catch (error) {
      console.error('Google auth error:', error);
      
      // Fallback: create demo user based on Google data
      const demoUser: User = {
        id: `google-${Date.now()}`,
        username: googleData.email.split('@')[0],
        email: googleData.email,
        name: googleData.name || googleData.email.split('@')[0],
        role: 'user',
        authProvider: 'google',
        createdAt: new Date(),
        isBlocked: false,
        avatar: googleData.picture
      };
      
      const demoToken = `google-token-${Date.now()}`;
      this.saveCurrentUser(demoUser, demoToken);
      this.emit('userSignedIn', demoUser);
      
      return demoUser;
    }
  }

  // Authentication methods
  async signIn(email: string, password: string): Promise<User> {
    try {
      const result = await this.makeRequest('/auth/signin', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      
      this.accessToken = result.session?.access_token;
      this.currentUser = result.user;
      localStorage.setItem('currentUser', JSON.stringify(result.user));
      if (this.accessToken) {
        localStorage.setItem('accessToken', this.accessToken);
      }
      
      this.emit('userSignedIn', result.user);
      return result.user;
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      // Fallback: Check demo users
      const demoUsers = [
        { id: 'demo-1', email: 'demo@test.com', password: 'demo123', name: 'Demo User', username: 'demo_user', role: 'user' as const },
        { id: 'admin-1', email: 'admin@persianconnect.com', password: 'admin123', name: 'Admin User', username: 'admin', role: 'admin' as const }
      ];
      
      const user = demoUsers.find(u => u.email === email && u.password === password);
      if (user) {
        const authUser: User = {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          role: user.role,
          authProvider: 'email',
          createdAt: new Date()
        };
        
        this.currentUser = authUser;
        localStorage.setItem('currentUser', JSON.stringify(authUser));
        this.emit('userSignedIn', authUser);
        return authUser;
      }
      
      throw new Error('Invalid email or password');
    }
  }





  async signOut(): Promise<void> {
    try {
      await this.makeRequest('/auth/signout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      this.accessToken = null;
      this.currentUser = null;
      localStorage.removeItem('currentUser');
      localStorage.removeItem('accessToken');
      this.emit('userSignedOut');
    }
  }

  // Legacy authentication method for backward compatibility
  async authenticateGoogleUser(googleUser: any): Promise<User> {
    const userData = {
      name: googleUser.name,
      email: googleUser.email,
      authProvider: 'google' as const,
      picture: googleUser.picture
    };
    
    // For now, just create a demo user from Google data
    const user: User = {
      id: `google-user-${Date.now()}`,
      email: userData.email,
      name: userData.name,
      username: userData.name.toLowerCase().replace(/\s+/g, '_'),
      role: 'user',
      authProvider: 'google',
      picture: userData.picture,
      createdAt: new Date()
    };
    
    this.currentUser = user;
    localStorage.setItem('currentUser', JSON.stringify(user));
    this.emit('userSignedIn', user);
    return user;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    try {
      // Only try server if we're not in demo mode
      if (!this.isDemoMode()) {
        const result = await this.makeRequest(`/users/${userId}`, {
          method: 'PUT',
          body: JSON.stringify(updates),
        });
        
        const updatedUser = result.user;
        
        // Update current user if it's the same user
        if (this.currentUser && this.currentUser.id === userId) {
          this.currentUser = updatedUser;
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          this.emit('userSignedIn', this.currentUser);
        }
        
        return updatedUser;
      }
      
      // Demo mode: Update user locally
      if (this.currentUser && this.currentUser.id === userId) {
        this.currentUser = { ...this.currentUser, ...updates };
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        this.emit('userSignedIn', this.currentUser);
        console.log('✅ User updated in demo mode');
        return this.currentUser;
      }
      
      throw new Error('User not found');
    } catch (error: any) {
      // Don't log server availability as an error - this is expected in demo mode
      console.log('Using local storage for user update (offline mode)');
      
      // Graceful fallback: Update user locally
      if (this.currentUser && this.currentUser.id === userId) {
        this.currentUser = { ...this.currentUser, ...updates };
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        this.emit('userSignedIn', this.currentUser);
        console.log('✅ User updated locally (offline mode)');
        return this.currentUser;
      }
      
      // If no current user, try to create one with the updates
      if (!this.currentUser) {
        const newUser: User = {
          id: userId,
          username: updates.username || 'user',
          email: updates.email || `${updates.username}@example.com`,
          name: updates.name || updates.username || 'User',
          role: updates.role || 'user',
          authProvider: updates.authProvider || 'email',
          createdAt: new Date(),
          ...updates
        };
        
        this.currentUser = newUser;
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        this.emit('userSignedIn', newUser);
        console.log('✅ User created locally (offline mode)');
        return newUser;
      }
      
      throw new Error('Unable to update user profile');
    }
  }

  async registerUser(userData: Partial<User>): Promise<User> {
    try {
      // Only try server if we're not in demo mode
      if (!this.isDemoMode()) {
        const result = await this.makeRequest('/auth/signup', {
          method: 'POST',
          body: JSON.stringify(userData),
        });
        
        const user = result.user;
        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.emit('userSignedIn', user);
        return user;
      }
      
      // Create user in demo mode
      const user: User = {
        id: userData.id || `demo-user-${Date.now()}`,
        email: userData.email || `${userData.username}@example.com`,
        name: userData.name || userData.username || 'User',
        username: userData.username || 'user',
        role: userData.role || 'user',
        authProvider: userData.authProvider || 'email',
        createdAt: new Date(),
        ...userData
      };
      
      this.currentUser = user;
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.emit('userSignedIn', user);
      console.log('✅ User created in demo mode');
      return user;
    } catch (error: any) {
      console.warn('Server not available for user registration, using demo mode:', error.message);
      
      // Graceful fallback: Create demo user locally
      const user: User = {
        id: userData.id || `demo-user-${Date.now()}`,
        email: userData.email || `${userData.username}@example.com`,
        name: userData.name || userData.username || 'User',
        username: userData.username || 'user',
        role: userData.role || 'user',
        authProvider: userData.authProvider || 'email',
        createdAt: new Date(),
        ...userData
      };
      
      this.currentUser = user;
      localStorage.setItem('currentUser', JSON.stringify(user));
      this.emit('userSignedIn', user);
      console.log('✅ User created locally (fallback mode)');
      return user;
    }
  }

  // User management methods
  getAllUsers(): User[] {
    // This would normally fetch from server, but for now return demo users
    return [
      { id: 'demo-1', email: 'demo@test.com', name: 'Demo User', username: 'demo_user', role: 'user', authProvider: 'email', createdAt: new Date() },
      { id: 'admin-1', email: 'admin@persianconnect.com', name: 'Admin User', username: 'admin', role: 'admin', authProvider: 'email', createdAt: new Date() }
    ];
  }

  getUserByEmail(email: string): User | null {
    const users = this.getAllUsers();
    return users.find(user => user.email === email) || null;
  }

  // Utility methods
  isCurrentUserAd(ad: Ad): boolean {
    return this.currentUser?.id === ad.userId;
  }

  canUserDeleteAd(ad: Ad): boolean {
    return this.isCurrentUserAd(ad) || this.currentUser?.role === 'admin';
  }

  canUserEditAd(ad: Ad): boolean {
    return this.isCurrentUserAd(ad);
  }

  canUserBoostAd(ad: Ad): boolean {
    return this.isCurrentUserAd(ad) && !ad.featured;
  }

  async acceptTermsAndConditions(userId: string): Promise<void> {
    try {
      // Only try server if we're not in demo mode
      if (!this.isDemoMode()) {
        await this.makeRequest(`/users/${userId}/accept-terms`, {
          method: 'POST',
          body: JSON.stringify({
            version: '1.0',
            acceptedAt: new Date().toISOString()
          }),
        });
      }
      
      // Update current user (works for both server and demo mode)
      if (this.currentUser && this.currentUser.id === userId) {
        this.currentUser.termsAccepted = {
          accepted: true,
          acceptedAt: new Date(),
          version: '1.0'
        };
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        this.emit('userSignedIn', this.currentUser);
        
        if (this.isDemoMode()) {
          console.log('✅ Terms accepted in demo mode');
        } else {
          console.log('✅ Terms accepted successfully');
        }
      }
    } catch (error: any) {
      console.warn('Server not available for terms acceptance, using local storage:', error.message);
      
      // Graceful fallback: Update user locally
      if (this.currentUser && this.currentUser.id === userId) {
        this.currentUser.termsAccepted = {
          accepted: true,
          acceptedAt: new Date(),
          version: '1.0'
        };
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        this.emit('userSignedIn', this.currentUser);
        console.log('✅ Terms accepted locally (fallback mode)');
      } else {
        throw new Error('Unable to accept terms. Please try again.');
      }
    }
  }

  // Ad management methods (stubbed for compatibility)
  async getUserAds(): Promise<Ad[]> {
    try {
      // Only try server if we're not in demo mode
      if (!this.isDemoMode()) {
        const result = await this.makeRequest('/users/me/ads', {
          method: 'GET',
        });
        return result.ads || [];
      }
      
      // Demo mode: get user's ads from localStorage
      console.log('getUserAds called in demo mode - checking localStorage');
      
      if (!this.currentUser) {
        return [];
      }
      
      const localAds = JSON.parse(localStorage.getItem('demo_ads') || '[]');
      const userLocalAds = localAds.filter((ad: any) => 
        ad.userId === this.currentUser?.id || ad.userEmail === this.currentUser?.email
      );
      
      console.log('📦 Demo mode - found localStorage ads:', userLocalAds.length);
      
      // Convert date strings back to Date objects
      const processedAds = userLocalAds.map((ad: any) => ({
        ...ad,
        createdAt: new Date(ad.createdAt),
        updatedAt: new Date(ad.updatedAt),
        expiresAt: new Date(ad.expiresAt),
        featuredUntil: ad.featuredUntil ? new Date(ad.featuredUntil) : undefined,
      }));
      
      return processedAds;
    } catch (error: any) {
      console.warn('Get user ads error:', error.message);
      
      // Fallback: check localStorage before returning empty array
      if (this.currentUser) {
        const localAds = JSON.parse(localStorage.getItem('demo_ads') || '[]');
        const userLocalAds = localAds.filter((ad: any) => 
          ad.userId === this.currentUser?.id || ad.userEmail === this.currentUser?.email
        );
        
        if (userLocalAds.length > 0) {
          console.log('📦 Error fallback - found localStorage ads:', userLocalAds.length);
          const processedAds = userLocalAds.map((ad: any) => ({
            ...ad,
            createdAt: new Date(ad.createdAt),
            updatedAt: new Date(ad.updatedAt),
            expiresAt: new Date(ad.expiresAt),
            featuredUntil: ad.featuredUntil ? new Date(ad.featuredUntil) : undefined,
          }));
          return processedAds;
        }
      }
      
      return [];
    }
  }

  // Check and update expired featured ads (stubbed for compatibility)
  checkExpiredFeaturedAds(): void {
    // This method is stubbed for compatibility with existing code
    // In a real implementation, this would check and update expired featured ads
    console.log('checkExpiredFeaturedAds called - no action needed in current implementation');
  }

  // Boost an ad to featured status
  async boostAd(adId: string): Promise<void> {
    try {
      console.log('🌟 Boosting ad to featured status:', adId);
      
      // Only try server if we're not in demo mode
      if (!this.isDemoMode()) {
        const result = await this.makeRequest(`/ads/${adId}/boost`, {
          method: 'POST',
        });
        console.log('✅ Ad boosted successfully via server:', result);
        return;
      }
      
      // Demo mode: just log the action
      console.log('✅ Ad boost simulated in demo mode for ad:', adId);
    } catch (error: any) {
      console.error('❌ Boost ad error:', error.message);
      throw new Error(`Failed to boost ad: ${error.message}`);
    }
  }

  // Verify payment session with Stripe and update ad/payment status
  async verifyPaymentSession(sessionId: string, paymentId: string, adId: string): Promise<any> {
    try {
      console.log('🔍 Verifying payment session:', { sessionId, paymentId, adId });
      
      // Only try server if we're not in demo mode
      if (!this.isDemoMode()) {
        const result = await this.makeRequest('/payments/verify-session', {
          method: 'POST',
          body: JSON.stringify({
            sessionId,
            paymentId,
            adId
          }),
        });
        console.log('✅ Payment session verified successfully:', result);
        return result;
      }
      
      // Demo mode: return mock success
      console.log('✅ Payment verification simulated in demo mode');
      return { verified: true, message: 'Payment verified in demo mode' };
    } catch (error: any) {
      console.error('❌ Payment verification error:', error.message);
      throw new Error(`Failed to verify payment: ${error.message}`);
    }
  }

  // Get all ads (synchronous method for backward compatibility)
  getAllAds(): Ad[] {
    try {
      // Load from localStorage for backward compatibility
      const localAds = JSON.parse(localStorage.getItem('demo_ads') || '[]');
      console.log(`📦 getAllAds: Loaded ${localAds.length} ads from localStorage`);
      return localAds;
    } catch (error) {
      console.error('❌ Error loading ads from localStorage:', error);
      return [];
    }
  }

  // Get all ads (async method that combines Supabase and localStorage)
  async getAllAdsAsync(): Promise<Ad[]> {
    const allAds: Ad[] = [];
    const seenIds = new Set<string>();

    // First, try to load from Supabase
    try {
      const supabaseAds = await this.getSupabaseAds();
      for (const ad of supabaseAds) {
        allAds.push(ad);
        seenIds.add(ad.id);
      }
      console.log(`📊 Loaded ${supabaseAds.length} ads from Supabase`);
    } catch (error) {
      console.warn('⚠️ Failed to load ads from Supabase:', error);
    }

    // Then, load from localStorage (avoiding duplicates)
    try {
      const localAds = JSON.parse(localStorage.getItem('demo_ads') || '[]');
      for (const ad of localAds) {
        if (!seenIds.has(ad.id)) {
          allAds.push(ad);
          seenIds.add(ad.id);
        }
      }
      console.log(`📦 Added ${localAds.length - (allAds.length - (allAds.length - localAds.length))} unique ads from localStorage`);
    } catch (error) {
      console.warn('⚠️ Failed to load ads from localStorage:', error);
    }

    console.log(`✅ Total unique ads loaded: ${allAds.length}`);
    return allAds;
  }

  // Get ads from Supabase
  async getSupabaseAds(): Promise<Ad[]> {
    try {
      const { getSupabaseClient } = await import('../../utils/supabase/client');
      const supabase = getSupabaseClient();
      
      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      const { data: ads, error } = await supabase
        .from('ads')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Supabase query error: ${error.message}`);
      }

      // Convert Supabase format to our Ad interface
      const convertedAds: Ad[] = (ads || []).map(ad => ({
        id: ad.id,
        title: ad.title,
        titlePersian: ad.title_persian,
        description: ad.description,
        descriptionPersian: ad.description_persian,
        price: ad.price ? parseFloat(ad.price.toString()) : 0,
        priceType: ad.price_type || 'fixed',
        currency: ad.currency || 'USD',
        category: ad.category || 'Other',
        subcategory: ad.subcategory || '',
        images: ad.images || [],
        userId: ad.owner_id,
        username: ad.owner_id, // Will be resolved later if needed
        userEmail: '', // Will be resolved later if needed
        contactInfo: ad.contact_info || '',
        location: ad.location || { country: '', city: '' },
        createdAt: new Date(ad.created_at),
        updatedAt: new Date(ad.updated_at),
        expiresAt: ad.expires_at ? new Date(ad.expires_at) : undefined,
        status: ad.status || 'active',
        approved: ad.approved || false,
        featured: ad.featured || false,
        featuredUntil: ad.featured_until ? new Date(ad.featured_until) : undefined,
        urgent: ad.urgent || false,
        condition: ad.condition,
        brand: ad.brand,
        model: ad.model,
        specifications: ad.specifications,
        boost: ad.boost || { active: false, expiresAt: null },
        paymentStatus: ad.payment_status || 'pending',
        paymentId: ad.payment_id,
        moderationResult: ad.moderation_result,
        views: ad.views || 0
      }));

      return convertedAds;
    } catch (error) {
      console.error('❌ Failed to load ads from Supabase:', error);
      throw error;
    }
  }

  // Get featured ads for a specific category
  getFeaturedAdsForCategory(category: string): Ad[] {
    // For demo mode, return empty array
    // In a real implementation, this would filter featured ads by category
    console.log(`getFeaturedAdsForCategory called for category: ${category} - returning empty array for compatibility`);
    return [];
  }

  // Get all rotated featured ads
  getAllRotatedFeaturedAds(): Ad[] {
    // For demo mode, return empty array
    // In a real implementation, this would return rotated featured ads
    console.log('getAllRotatedFeaturedAds called - returning empty array for compatibility');
    return [];
  }

  // Helper methods
  private createDemoUser(): User {
    return {
      id: `demo-user-${Date.now()}`,
      username: `user_${Math.random().toString(36).substr(2, 9)}`,
      email: 'demo@example.com',
      name: 'Demo User',
      role: 'user',
      authProvider: 'email',
      createdAt: new Date(),
      isBlocked: false
    };
  }

  private createDemoGoogleUser(): User {
    const demoUser: User = {
      id: `demo-google-${Date.now()}`,
      username: `google_user_${Math.random().toString(36).substr(2, 9)}`,
      email: 'demo.google@example.com',
      name: 'Google Demo User',
      role: 'user',
      authProvider: 'google',
      createdAt: new Date(),
      isBlocked: false,
      picture: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop&crop=face',
      termsAccepted: {
        accepted: true,
        acceptedAt: new Date(),
        version: '1.0'
      }
    };
    
    const demoToken = `demo-google-token-${Date.now()}`;
    this.saveCurrentUser(demoUser, demoToken);
    
    console.log('✅ Created demo Google user for development');
    return demoUser;
  }

  // Refresh authentication - force check existing session
  async refreshAuth(): Promise<User | null> {
    console.log('🔄 Refreshing authentication...');
    
    try {
      // Clear any cached user data
      this.currentUser = null;
      
      // Force re-check existing session
      const user = await this.checkExistingSession();
      
      if (user) {
        console.log('✅ Refreshed user:', user.email);
        this.currentUser = user;
        this.emit('userSignedIn', user);
        return user;
      } else {
        console.log('❌ No valid session found during refresh');
        this.emit('userSignedOut');
        return null;
      }
    } catch (error) {
      console.error('❌ Refresh auth error:', error);
      this.emit('userSignedOut');
      return null;
    }
  }

  // Sign out user
  async signOut(): Promise<void> {
    console.log('🚪 Signing out...');
    
    try {
      // Clear local state
      this.currentUser = null;
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
      localStorage.removeItem('pc_current_user');
      localStorage.removeItem('pc_access_token');
      localStorage.removeItem('tempGoogleAuth');
      
      // Try to sign out from Supabase if available
      if (!this.isDemoMode()) {
        try {
          const supabase = getSupabaseClient();
          if (supabase) {
            await supabase.auth.signOut();
          }
        } catch (supabaseError) {
          console.log('Note: Supabase sign out failed (may be in demo mode):', supabaseError);
        }
      }
      
      this.emit('userSignedOut');
      console.log('✅ Sign out completed');
    } catch (error) {
      console.error('❌ Sign out error:', error);
      // Still emit sign out event even if there was an error
      this.emit('userSignedOut');
    }
  }

  // Payment methods
  async createPayment(paymentData: {
    userId: string;
    adId: string;
    amount: number;
    currency: string;
    type: 'ad_posting' | 'ad_boost';
    status: 'pending' | 'completed' | 'failed';
  }): Promise<Payment> {
    try {
      // Only try server if we're not in demo mode
      if (!this.isDemoMode()) {
        const result = await this.makeRequest('/payments/create', {
          method: 'POST',
          body: JSON.stringify(paymentData),
        });
        
        return result.payment;
      }
      
      // Demo mode: create a mock payment
      const payment: Payment = {
        id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: paymentData.userId,
        adId: paymentData.adId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        type: paymentData.type,
        status: paymentData.status,
        createdAt: new Date()
      };
      
      console.log('✅ Payment created in demo mode:', payment.id);
      return payment;
      
    } catch (error: any) {
      console.warn('Server not available for payment creation, using demo mode:', error.message);
      
      // Graceful fallback: create demo payment locally
      const payment: Payment = {
        id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userId: paymentData.userId,
        adId: paymentData.adId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        type: paymentData.type,
        status: paymentData.status,
        createdAt: new Date()
      };
      
      console.log('✅ Payment created locally (fallback mode):', payment.id);
      return payment;
    }
  }

  async updatePaymentStatus(paymentId: string, status: 'pending' | 'completed' | 'failed', stripeSessionId?: string): Promise<Payment> {
    try {
      // Only try server if we're not in demo mode
      if (!this.isDemoMode()) {
        const result = await this.makeRequest(`/payments/${paymentId}`, {
          method: 'PUT',
          body: JSON.stringify({ 
            status, 
            stripeSessionId,
            completedAt: status === 'completed' ? new Date().toISOString() : undefined
          }),
        });
        
        return result.payment;
      }
      
      // Demo mode: return a mock updated payment
      const payment: Payment = {
        id: paymentId,
        userId: 'demo-user',
        adId: 'demo-ad',
        amount: 2.00,
        currency: 'USD',
        type: 'ad_posting',
        status: status,
        stripeSessionId: stripeSessionId,
        createdAt: new Date(),
        completedAt: status === 'completed' ? new Date() : undefined
      };
      
      console.log('✅ Payment status updated in demo mode:', paymentId, status);
      return payment;
      
    } catch (error: any) {
      console.warn('Server not available for payment update, using demo mode:', error.message);
      
      // Graceful fallback: return demo payment
      const payment: Payment = {
        id: paymentId,
        userId: 'demo-user',
        adId: 'demo-ad',
        amount: 2.00,
        currency: 'USD',
        type: 'ad_posting',
        status: status,
        stripeSessionId: stripeSessionId,
        createdAt: new Date(),
        completedAt: status === 'completed' ? new Date() : undefined
      };
      
      console.log('✅ Payment status updated locally (fallback mode):', paymentId, status);
      return payment;
    }
  }

  async getPayment(paymentId: string): Promise<Payment | null> {
    try {
      // Only try server if we're not in demo mode
      if (!this.isDemoMode()) {
        const result = await this.makeRequest(`/payments/${paymentId}`, {
          method: 'GET',
        });
        
        return result.payment;
      }
      
      // Demo mode: return a mock payment
      const payment: Payment = {
        id: paymentId,
        userId: 'demo-user',
        adId: 'demo-ad',
        amount: 2.00,
        currency: 'USD',
        type: 'ad_posting',
        status: 'completed',
        createdAt: new Date(),
        completedAt: new Date()
      };
      
      console.log('✅ Payment retrieved in demo mode:', paymentId);
      return payment;
      
    } catch (error: any) {
      console.warn('Server not available for payment retrieval, using demo mode:', error.message);
      
      // Graceful fallback: return demo payment
      const payment: Payment = {
        id: paymentId,
        userId: 'demo-user',
        adId: 'demo-ad',
        amount: 2.00,
        currency: 'USD',
        type: 'ad_posting',
        status: 'completed',
        createdAt: new Date(),
        completedAt: new Date()
      };
      
      console.log('✅ Payment retrieved locally (fallback mode):', paymentId);
      return payment;
    }
  }

  // Public getter methods
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  // Update ad status (for admin bypass payment)
  async updateAdStatus(adId: string, status: 'pending' | 'approved' | 'rejected' | 'under_review' | 'expired', reason?: string): Promise<void> {
    try {
      // Only try server if we're not in demo mode
      if (!this.isDemoMode()) {
        await this.makeRequest(`/ads/${adId}/status`, {
          method: 'PUT',
          body: JSON.stringify({ 
            status, 
            reason,
            updatedAt: new Date().toISOString()
          }),
        });
        
        console.log(`✅ Ad ${adId} status updated to ${status} via server`);
        if (reason) {
          console.log(`📝 Reason: ${reason}`);
        }
        return;
      }
      
      // Demo mode: Update local storage
      this.updateLocalAdStatus(adId, status, reason);
      
    } catch (error: any) {
      console.warn(`Server not available for ad status update, using local storage fallback:`, error.message);
      
      // Graceful fallback: Update local storage
      this.updateLocalAdStatus(adId, status, reason);
    }
  }

  // Helper method to update ad status in local storage
  private updateLocalAdStatus(adId: string, status: 'pending' | 'approved' | 'rejected' | 'under_review' | 'expired', reason?: string): void {
    try {
      const localAds = JSON.parse(localStorage.getItem('demo_ads') || '[]');
      const adIndex = localAds.findIndex((ad: Ad) => ad.id === adId);
      
      if (adIndex !== -1) {
        localAds[adIndex].status = status;
        localAds[adIndex].updatedAt = new Date();
        if (reason) {
          localAds[adIndex].moderationResult = {
            status,
            reason,
            reviewedAt: new Date(),
            reviewedBy: this.currentUser?.id || 'admin'
          };
        }
        
        localStorage.setItem('demo_ads', JSON.stringify(localAds));
        console.log(`✅ Ad ${adId} status updated to ${status} in local storage`);
        if (reason) {
          console.log(`📝 Reason: ${reason}`);
        }
      } else {
        console.warn(`⚠️ Ad ${adId} not found in local storage`);
      }
    } catch (error) {
      console.error(`❌ Error updating ad status in local storage:`, error);
    }
  }

  // File upload method
  async uploadFile(file: File, type: 'ad-image' | 'profile-image' = 'ad-image'): Promise<string> {
    try {
      console.log('📤 Starting file upload:', {
        name: file.name,
        size: file.size,
        type: file.type,
        uploadType: type
      });
      
      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        const error = 'File size too large. Maximum allowed size is 10MB.';
        console.error('❌ File size validation failed:', error);
        throw new Error(error);
      }
      
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        const error = 'Invalid file type. Please upload JPEG, PNG, GIF, or WebP images only.';
        console.error('❌ File type validation failed:', error);
        throw new Error(error);
      }
      
      // Try to upload to server first
      if (!this.isDemoMode()) {
        try {
          console.log('🚀 Attempting server upload via API...');
          
          const formData = new FormData();
          formData.append('file', file);
          formData.append('type', type);
          
          console.log('📡 Making upload request to server...');
          const result = await this.makeRequest('/upload', {
            method: 'POST',
            body: formData,
            // Don't set Content-Type header, let browser set it for FormData
          }, false); // Skip JSON header for FormData
          
          if (!result.url) {
            throw new Error('Server returned empty URL');
          }
          
          console.log('✅ File uploaded to server successfully:', {
            url: result.url.substring(0, 100) + '...',
            filename: result.filename,
            size: result.size
          });
          
          return result.url;
          
        } catch (serverError: any) {
          console.warn('⚠️ Server upload failed, falling back to client-side base64:', {
            error: serverError.message,
            fileName: file.name
          });
          
          // Don't throw here, fall through to base64 conversion
        }
      } else {
        console.log('📱 Demo mode detected, using client-side base64 conversion');
      }
      
      // Fallback: Convert to base64 data URL on client side
      console.log('🔄 Converting file to base64 data URL as fallback...');
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = () => {
          const dataUrl = reader.result as string;
          
          if (!dataUrl || !dataUrl.startsWith('data:')) {
            const error = 'Failed to generate valid data URL';
            console.error('❌ Base64 conversion failed:', error);
            reject(new Error(error));
            return;
          }
          
          console.log('✅ File converted to base64 data URL successfully:', {
            fileName: file.name,
            dataLength: dataUrl.length,
            preview: dataUrl.substring(0, 50) + '...'
          });
          
          resolve(dataUrl);
        };
        
        reader.onerror = (error) => {
          const errorMsg = 'Failed to read file for base64 conversion';
          console.error('❌ FileReader error:', error, errorMsg);
          reject(new Error(errorMsg));
        };
        
        reader.readAsDataURL(file);
      });
      
    } catch (error: any) {
      console.error('❌ File upload error in uploadFile method:', {
        error: error.message,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });
      throw error;
    }
  }

  // Helper method to fix existing blob URLs in ad data
  private async fixBlobUrls(ad: Ad): Promise<Ad> {
    if (!ad.images || ad.images.length === 0) {
      return ad;
    }
    
    const fixedImages: string[] = [];
    
    for (const imageUrl of ad.images) {
      // If it's a blob URL that's no longer valid, replace with placeholder
      if (imageUrl.startsWith('blob:')) {
        try {
          // Try to fetch the blob to see if it's still valid
          const response = await fetch(imageUrl);
          if (response.ok) {
            fixedImages.push(imageUrl); // Still valid
          } else {
            console.log('🔄 Replacing invalid blob URL with placeholder');
            fixedImages.push('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCA3MEg5MFY5MEg2MFY3MFoiIGZpbGw9IiNEMUQ1REIiLz4KPHA+dGggZD0iTTcwIDc1SDEzMFYxNDBMOTAgMTAwTDcwIDEyMFY3NVoiIGZpbGw9IiNEMUQ1REIiLz4KPC9zdmc+'); // SVG placeholder
          }
        } catch (error) {
          console.log('🔄 Replacing invalid blob URL with placeholder');
          fixedImages.push('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCA3MEg5MFY5MEg2MFY3MFoiIGZpbGw9IiNEMUQ1REIiLz4KPHA+dGggZD0iTTcwIDc1SDEzMFYxNDBMOTAgMTAwTDcwIDEyMFY3NVoiIGZpbGw9IiNEMUQ1REIiLz4KPC9zdmc+'); // SVG placeholder
        }
      } else {
        fixedImages.push(imageUrl); // Keep valid URLs
      }
    }
    
    return {
      ...ad,
      images: fixedImages
    };
  }

  // ============================
  // MESSAGING SYSTEM METHODS
  // ============================

  // Get user's chats/conversations
  async getChats(): Promise<Chat[]> {
    try {
      if (!this.currentUser) {
        throw new Error('User not authenticated');
      }

      console.log('💬 Loading user chats...');
      
      if (!this.isDemoMode()) {
        const result = await this.makeRequest('/messages/chats', {
          method: 'GET',
        });
        
        console.log('✅ Chats loaded from server:', result.chats.length);
        return result.chats;
      }

      // Demo mode: return empty array since we're removing mock data
      console.log('📱 Demo mode: returning empty chats array');
      return [];
      
    } catch (error: any) {
      console.warn('Server not available for chats, using empty array:', error.message);
      return [];
    }
  }

  // Get specific chat with messages
  async getChat(chatId: string): Promise<{ chat: Chat; messages: Message[] } | null> {
    try {
      if (!this.currentUser) {
        throw new Error('User not authenticated');
      }

      console.log('💬 Loading chat:', chatId);
      
      if (!this.isDemoMode()) {
        const result = await this.makeRequest(`/messages/chats/${chatId}`, {
          method: 'GET',
        });
        
        console.log('✅ Chat loaded from server:', {
          chatId,
          messageCount: result.messages.length
        });
        
        return {
          chat: result.chat,
          messages: result.messages
        };
      }

      // Demo mode: return null since we're removing mock data
      console.log('📱 Demo mode: returning null for chat');
      return null;
      
    } catch (error: any) {
      console.warn('Server not available for chat, returning null:', error.message);
      return null;
    }
  }

  // Create or get existing chat between two users for an ad - ALWAYS LOCAL MODE
  async createOrGetChat(adId: string, sellerId: string, sellerUsername: string): Promise<Chat> {
    // Check authentication first - be more lenient
    if (!this.currentUser) {
      console.error('❌ No current user found for chat creation');
      
      // Try to restore user from localStorage as fallback
      try {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          console.log('🔄 Using stored user data for chat creation:', userData.email);
          this.currentUser = userData;
          this.accessToken = localStorage.getItem('accessToken') || '';
        } else {
          throw new Error('Please login to start a chat');
        }
      } catch (storageError) {
        console.error('❌ Could not restore user from storage:', storageError);
        throw new Error('Please login to start a chat');
      }
    }

    console.log('💬 Creating LOCAL chat (backend bypass enabled):', {
      adId,
      sellerId,
      sellerUsername,
      buyerId: this.currentUser.id,
      buyerUsername: this.currentUser.username || this.currentUser.email
    });
    
    // Check if a local chat already exists for this ad and users
    const chatKey = `chat_${this.currentUser.id}_${sellerId}_${adId}`;
    try {
      const existingChatData = localStorage.getItem(chatKey);
      if (existingChatData) {
        const existingChat = JSON.parse(existingChatData);
        existingChat.lastActivity = new Date(existingChat.lastActivity);
        console.log('✅ Found existing local chat:', existingChat.id);
        return existingChat;
      }
    } catch (error) {
      console.warn('Error checking for existing local chat:', error);
    }
    
    // Create new local chat - ALWAYS use local storage for maximum reliability
    const localChat: Chat = {
      id: `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      participants: [this.currentUser.id, sellerId],
      participantUsernames: [this.currentUser.username || this.currentUser.email, sellerUsername],
      lastActivity: new Date(),
      adId,
      isActive: true,
      isTemporary: true // Mark as local chat
    };
    
    console.log('📱 Creating local chat (100% offline):', localChat.id);
    
    // Store chat locally for persistence
    try {
      localStorage.setItem(`chat:${localChat.id}`, JSON.stringify(localChat));
      localStorage.setItem(chatKey, JSON.stringify(localChat)); // Store by unique key for lookup
      console.log('💾 Local chat stored successfully:', localChat.id);
    } catch (storageError) {
      console.warn('Could not store chat locally:', storageError);
    }
    
    return localChat;
  }

  // Get chat by ID with support for local chats
  async getChat(chatId: string): Promise<{ chat: Chat; messages: Message[] } | null> {
    try {
      console.log('📥 Getting chat:', chatId);
      
      // ALWAYS try local storage first (for reliability)
      try {
        const storedChat = localStorage.getItem(`chat:${chatId}`);
        if (storedChat) {
          const chat = JSON.parse(storedChat);
          // Convert date strings back to Date objects
          chat.lastActivity = new Date(chat.lastActivity);
          
          // Get messages for this chat from localStorage
          const messages: Message[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(`message:${chatId}:`)) {
              try {
                const messageStr = localStorage.getItem(key);
                if (messageStr) {
                  const message = JSON.parse(messageStr);
                  message.timestamp = new Date(message.timestamp);
                  messages.push(message);
                }
              } catch (e) {
                console.warn('Failed to parse stored message:', key);
              }
            }
          }
          
          // Sort messages by timestamp
          messages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
          
          console.log('✅ Loaded local chat with', messages.length, 'messages');
          return { chat, messages };
        }
      } catch (error) {
        console.warn('Failed to load local chat:', error);
      }
      
      // Skip server requests for chats - always use local storage for reliability
      if (false) { // Disabled to ensure local-only chat functionality
        try {
          console.log('🌐 Trying to load chat from server...');
          
          // Short timeout for server requests
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 1500);
          
          const result = await this.makeRequest(`/messages/chats/${chatId}`, {
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          // Convert date strings back to Date objects
          if (result.chat) {
            result.chat.lastActivity = new Date(result.chat.lastActivity);
            if (result.chat.lastMessage) {
              result.chat.lastMessage.timestamp = new Date(result.chat.lastMessage.timestamp);
            }
          }
          
          if (result.messages) {
            result.messages = result.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }));
          }
          
          console.log('✅ Loaded chat from server');
          return result;
        } catch (error) {
          console.log('⚠️ Failed to load chat from server, chat not found:', error.message);
        }
      }
      
      console.log('❌ Chat not found anywhere');
      return null;
      
    } catch (error) {
      console.error('❌ Error getting chat:', error);
      return null;
    }
  }

  // Send message with support for local chats
  async sendMessage(chatId: string, content: string): Promise<Message> {
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }

    console.log('📤 Sending message to chat:', chatId);
    
    // Create message object
    const message: Message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      chatId,
      senderId: this.currentUser.id,
      senderUsername: this.currentUser.username || this.currentUser.email,
      receiverId: '', // Will be set below
      receiverUsername: '', // Will be set below
      content,
      timestamp: new Date(),
      isRead: false
    };

    // Get chat to determine receiver
    const chatResult = await this.getChat(chatId);
    if (chatResult?.chat) {
      const otherUserId = chatResult.chat.participants.find(id => id !== this.currentUser!.id);
      const otherUsername = chatResult.chat.participantUsernames.find((username, index) => 
        chatResult.chat.participants[index] !== this.currentUser!.id
      );
      
      message.receiverId = otherUserId || '';
      message.receiverUsername = otherUsername || 'Unknown';
      
      // Copy ad info if available
      if (chatResult.chat.adId) {
        message.adId = chatResult.chat.adId;
        message.adTitle = chatResult.chat.adTitle;
      }
    }

    // ALWAYS store message locally first (for reliability)
    try {
      localStorage.setItem(`message:${chatId}:${message.id}`, JSON.stringify(message));
      
      // Update chat's last message and activity
      if (chatResult?.chat) {
        const updatedChat = {
          ...chatResult.chat,
          lastMessage: message,
          lastActivity: new Date()
        };
        localStorage.setItem(`chat:${chatId}`, JSON.stringify(updatedChat));
        
        // Also update by lookup key if it exists
        const chatKey = `chat_${updatedChat.participants[0]}_${updatedChat.participants[1]}_${updatedChat.adId}`;
        localStorage.setItem(chatKey, JSON.stringify(updatedChat));
      }
      
      console.log('✅ Message stored locally');
      
      // Emit message event for real-time updates
      this.emit('messageReceived', message);
      
      return message;
    } catch (error) {
      console.error('❌ Failed to store message locally:', error);
      throw new Error('Failed to send message');
    }
  }

  // Mark messages as read (for local chats)
  async markMessagesAsRead(chatId: string): Promise<void> {
    console.log('✅ Marking messages as read for chat:', chatId);
    
    if (!this.currentUser) return;
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(`message:${chatId}:`)) {
          const messageStr = localStorage.getItem(key);
          if (messageStr) {
            const message = JSON.parse(messageStr);
            if (message.receiverId === this.currentUser.id && !message.isRead) {
              message.isRead = true;
              localStorage.setItem(key, JSON.stringify(message));
            }
          }
        }
      }
      console.log('✅ Messages marked as read locally');
    } catch (error) {
      console.warn('Failed to mark messages as read locally:', error);
    }
  }

  // Send a message in a chat
  async sendMessage(chatId: string, content: string): Promise<Message> {
    try {
      if (!this.currentUser) {
        throw new Error('User not authenticated');
      }

      console.log('📤 Sending message:', {
        chatId,
        content: content.substring(0, 50) + '...'
      });
      
      if (!this.isDemoMode()) {
        const result = await this.makeRequest(`/messages/chats/${chatId}/messages`, {
          method: 'POST',
          body: JSON.stringify({ content }),
        });
        
        console.log('✅ Message sent successfully');
        return result.message;
      }

      // Demo mode: create a temporary message object
      console.log('📱 Demo mode: creating temporary message');
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        chatId,
        senderId: this.currentUser.id,
        senderUsername: this.currentUser.username || this.currentUser.email,
        receiverId: 'unknown',
        receiverUsername: 'unknown',
        content,
        timestamp: new Date(),
        isRead: false
      };
      
      return tempMessage;
      
    } catch (error: any) {
      console.warn('Server not available for sending message, using temporary message:', error.message);
      // Create a temporary message object as fallback
      const tempMessage: Message = {
        id: `temp-${Date.now()}`,
        chatId,
        senderId: this.currentUser.id,
        senderUsername: this.currentUser.username || this.currentUser.email,
        receiverId: 'unknown',
        receiverUsername: 'unknown',
        content,
        timestamp: new Date(),
        isRead: false
      };
      
      return tempMessage;
    }
  }

  // Mark messages as read
  async markMessagesAsRead(chatId: string): Promise<void> {
    try {
      if (!this.currentUser) {
        throw new Error('User not authenticated');
      }

      console.log('👁️ Marking messages as read in chat:', chatId);
      
      if (!this.isDemoMode()) {
        await this.makeRequest(`/messages/chats/${chatId}/read`, {
          method: 'POST',
        });
        
        console.log('✅ Messages marked as read');
        return;
      }

      console.log('📱 Demo mode: messages marked as read locally');
      
    } catch (error: any) {
      console.warn('Server not available for marking messages as read:', error.message);
    }
  }

  // Simple method to force restore session from localStorage (for debugging)
  async forceRestoreSession(): Promise<User | null> {
    try {
      console.log('🔄 Force restoring session from localStorage...');
      
      // Check all possible storage keys
      const storedUser = localStorage.getItem('currentUser') || localStorage.getItem('pc_current_user');
      const storedToken = localStorage.getItem('accessToken') || localStorage.getItem('pc_access_token');
      
      console.log('📋 Found stored data:', {
        currentUser: !!localStorage.getItem('currentUser'),
        pcCurrentUser: !!localStorage.getItem('pc_current_user'),
        accessToken: !!localStorage.getItem('accessToken'),
        pcAccessToken: !!localStorage.getItem('pc_access_token'),
        hasUser: !!storedUser,
        hasToken: !!storedToken
      });
      
      if (storedUser && storedToken) {
        console.log('📄 Raw stored user data:', storedUser.substring(0, 100) + '...');
        const user = JSON.parse(storedUser);
        
        // Basic validation
        if (user && user.id && user.email) {
          console.log('✅ Restoring session for:', user.email);
          console.log('👤 User details:', {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          });
          
          // Force save the user
          this.currentUser = user;
          this.accessToken = storedToken;
          
          // Also save to both storage keys for compatibility
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('accessToken', storedToken);
          localStorage.setItem('pc_current_user', JSON.stringify(user));
          localStorage.setItem('pc_access_token', storedToken);
          
          // Emit the sign-in event
          this.emit('userSignedIn', user);
          
          return user;
        } else {
          console.error('❌ Invalid stored user data:', user);
          return null;
        }
      } else {
        console.log('❌ No stored session data found');
        return null;
      }
      
    } catch (error) {
      console.error('❌ Failed to force restore session:', error);
      return null;
    }
  }

  // Method to check if we should bypass the complex session restoration and use stored data directly
  shouldUseStoredSession(): boolean {
    const storedUser = localStorage.getItem('currentUser') || localStorage.getItem('pc_current_user');
    const storedToken = localStorage.getItem('accessToken') || localStorage.getItem('pc_access_token');
    
    if (!storedUser || !storedToken) return false;
    
    try {
      const user = JSON.parse(storedUser);
      return !!(user && user.id && user.email && user.authProvider);
    } catch {
      return false;
    }
  }

  // ============================
  // SUPABASE CHAT METHODS
  // ============================

  // Create or get existing Supabase chat room
  async createOrGetSupabaseChat(ad: Ad, currentUser: User): Promise<string> {
    try {
      console.log('💬 Creating/getting Supabase chat room:', {
        adId: ad.id,
        sellerId: ad.userId,
        buyerId: currentUser.id
      });

      // Import Supabase client dynamically
      const { getSupabaseClient } = await import('../../utils/supabase/client');
      const supabase = getSupabaseClient();
      
      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      // Convert IDs to UUIDs if they're strings
      const adUuid = typeof ad.id === 'string' ? ad.id : ad.id;
      const buyerUuid = typeof currentUser.id === 'string' ? currentUser.id : currentUser.id;
      const sellerUuid = typeof ad.userId === 'string' ? ad.userId : ad.userId;

      console.log('🔍 Looking for existing chat room with UUIDs:', {
        ad_id: adUuid,
        buyer_id: buyerUuid,
        seller_id: sellerUuid
      });

      // First, try to find existing chat room
      const { data: existingRoom, error: findError } = await supabase
        .from('chat_rooms')
        .select('id')
        .eq('ad_id', adUuid)
        .eq('buyer_id', buyerUuid)
        .single();

      if (findError && findError.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('❌ Error finding existing chat room:', findError);
        throw new Error('Failed to check for existing chat room');
      }

      if (existingRoom) {
        console.log('✅ Found existing chat room:', existingRoom.id);
        return existingRoom.id;
      }

      // Create new chat room
      console.log('📝 Creating new chat room...');
      const { data: newRoom, error: createError } = await supabase
        .from('chat_rooms')
        .insert({
          ad_id: adUuid,
          buyer_id: buyerUuid,
          seller_id: sellerUuid
        })
        .select('id')
        .single();

      if (createError) {
        console.error('❌ Error creating chat room:', createError);
        throw new Error('Failed to create chat room');
      }

      console.log('✅ Created new chat room:', newRoom.id);
      return newRoom.id;

    } catch (error) {
      console.error('❌ Failed to create/get Supabase chat:', error);
      throw error;
    }
  }

  // Get Supabase chat rooms for current user
  async getSupabaseChatRooms(): Promise<any[]> {
    try {
      if (!this.currentUser) {
        throw new Error('User not authenticated');
      }

      console.log('💬 Loading Supabase chat rooms for user:', this.currentUser.id);

      const { getSupabaseClient } = await import('../../utils/supabase/client');
      const supabase = getSupabaseClient();
      
      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      // Get chat rooms where user is either buyer or seller
      const { data: chatRooms, error } = await supabase
        .from('chat_rooms')
        .select(`
          id,
          ad_id,
          buyer_id,
          seller_id,
          created_at,
          messages (
            content,
            created_at,
            sender_id
          )
        `)
        .or(`buyer_id.eq.${this.currentUser.id},seller_id.eq.${this.currentUser.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading chat rooms:', error);
        throw new Error('Failed to load chat rooms');
      }

      console.log('✅ Loaded chat rooms:', chatRooms.length);
      return chatRooms || [];

    } catch (error) {
      console.error('❌ Failed to load Supabase chat rooms:', error);
      return [];
    }
  }

  // Get ad from Supabase by ID
  async getSupabaseAdById(adId: string): Promise<Ad | null> {
    try {
      console.log('📋 Loading Supabase ad by ID:', adId);

      const { getSupabaseClient } = await import('../../utils/supabase/client');
      const supabase = getSupabaseClient();
      
      if (!supabase) {
        console.log('⚠️ Supabase client not available, falling back to local storage');
        return this.getLocalStorageAdById(adId);
      }

      const { data: ad, error } = await supabase
        .from('ads')
        .select('*')
        .eq('id', adId)
        .single();

      if (error && error.code === 'PGRST116') {
        console.log('⚠️ Ad not found in Supabase (PGRST116), trying localStorage');
        return this.getLocalStorageAdById(adId);
      }

      if (error) {
        console.error('❌ Error loading ad from Supabase:', error);
        // Fallback to localStorage method
        return this.getLocalStorageAdById(adId);
      }

      if (!ad) {
        console.log('⚠️ Ad not found in Supabase, trying localStorage');
        return this.getLocalStorageAdById(adId);
      }

      // Convert Supabase ad format to our Ad interface
      const convertedAd: Ad = {
        id: ad.id,
        title: ad.title,
        description: ad.description,
        price: ad.price ? parseFloat(ad.price.toString()) : 0,
        category: ad.category || 'Other',
        subcategory: ad.subcategory || '',
        images: ad.images || [],
        userId: ad.owner_id,
        username: ad.owner_id, // Will be resolved later if needed
        userEmail: '', // Will be resolved later if needed
        contactInfo: ad.contact_info || '',
        location: ad.location || { country: '', city: '' },
        createdAt: ad.created_at,
        updatedAt: ad.updated_at,
        status: ad.status || 'active',
        approved: ad.approved || false,
        featured: ad.featured || false,
        boost: ad.boost || { active: false, expiresAt: null },
        paymentStatus: ad.payment_status || 'pending'
      };

      console.log('✅ Loaded ad from Supabase:', convertedAd.title);
      return convertedAd;

    } catch (error) {
      console.error('❌ Failed to load ad from Supabase:', error);
      // Fallback to localStorage method
      return this.getLocalStorageAdById(adId);
    }
  }

  // Original localStorage method  
  getLocalStorageAdById(adId: string): Ad | null {
    try {
      console.log('📦 Trying to load ad from localStorage:', adId);
      const ads = this.getAllAds();
      const foundAd = ads.find(ad => ad.id === adId) || null;
      
      if (foundAd) {
        console.log('✅ Found ad in localStorage:', foundAd.title);
      } else {
        console.log('❌ Ad not found in localStorage');
      }
      
      return foundAd;
    } catch (error) {
      console.error('❌ Error loading ad from localStorage:', error);
      return null;
    }
  }

  // Override getAdById to properly handle fallback
  async getAdById(adId: string): Promise<Ad | null> {
    console.log('🔍 Getting ad by ID (3-source fallback):', adId);

    // 1. First try Supabase
    try {
      const supabaseAd = await this.getSupabaseAdById(adId);
      if (supabaseAd) {
        console.log('✅ Ad found in Supabase:', supabaseAd.title);
        return supabaseAd;
      }
    } catch (error) {
      console.warn('❌ Supabase failed, trying backend server:', error);
    }

    // 2. Try Backend Server
    try {
      console.log('🔍 Checking backend server for ad:', adId);
      const response = await this.makeRequest(`/ads/${adId}`, {
        method: 'GET'
      });
      
      if (response && response.id) {
        console.log('✅ Ad found in backend server:', response.title);
        return response as Ad;
      }
    } catch (error) {
      console.warn('❌ Backend server failed, trying localStorage:', error);
    }

    // 3. Fallback to localStorage
    try {
      const localAd = await this.getLocalStorageAdById(adId);
      if (localAd) {
        console.log('✅ Ad found in localStorage:', localAd.title);
        return localAd;
      }
    } catch (error) {
      console.warn('❌ localStorage also failed:', error);
    }

    // If we reach here, all three sources failed
    console.log('❌ Ad not found in Supabase, backend server, or localStorage:', adId);
    return null;
  }
}

export const realDataService = RealDataService.getInstance();
export default realDataService;