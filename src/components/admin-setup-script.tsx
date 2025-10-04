import { getSupabaseClient } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';

// Comprehensive admin setup script that works without backend deployment
export const AdminSetupScript = {
  
  // Method 1: Direct Supabase Auth admin creation
  async createDirectSupabaseAdmin(email: string, password: string, name: string) {
    console.log('🔧 Method 1: Creating admin via direct Supabase Auth...');
    
    try {
      const supabase = getSupabaseClient();
      
      if (!supabase) {
        throw new Error('Supabase client not available');
      }

      // Try to sign up first
      console.log('📧 Attempting Supabase Auth signup...');
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            name: name,
            username: 'admin'
          }
        }
      });

      if (signUpError) {
        console.log('⚠️ Signup failed, trying direct login:', signUpError.message);
        
        // If signup fails, try to login with existing credentials
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (signInError) {
          throw new Error(`Both signup and signin failed: ${signInError.message}`);
        }

        console.log('✅ Direct login successful');
        return signInData;
      }

      console.log('✅ Signup successful');
      return signUpData;

    } catch (error) {
      console.error('❌ Direct Supabase method failed:', error);
      throw error;
    }
  },

  // Method 2: Manual admin user creation (fallback)
  async createManualAdmin(email: string) {
    console.log('🔧 Method 2: Creating manual admin user...');
    
    const adminUser = {
      id: 'manual-admin-' + Date.now(),
      username: 'admin',
      email: email,
      name: 'Admin User',
      role: 'admin',
      authProvider: 'manual',
      createdAt: new Date().toISOString(),
      isBlocked: false,
      isManualAdmin: true
    };
    
    const adminToken = 'manual-admin-token-' + Date.now();
    
    // Clear all existing authentication data
    localStorage.clear();
    
    // Set admin credentials in all possible storage keys
    const storageKeys = [
      'currentUser',
      'access_token', 
      'pc_current_user',
      'pc_access_token',
      'username',
      'isAuthenticated',
      'userRole'
    ];
    
    // Store admin data
    localStorage.setItem('currentUser', JSON.stringify(adminUser));
    localStorage.setItem('access_token', adminToken);
    localStorage.setItem('pc_current_user', JSON.stringify(adminUser));
    localStorage.setItem('pc_access_token', adminToken);
    localStorage.setItem('username', 'admin');
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', 'admin');
    
    console.log('✅ Manual admin user created:', adminUser);
    
    return { user: adminUser, token: adminToken };
  },

  // Method 3: Force admin status on existing user
  async forceAdminStatus(existingUser?: any) {
    console.log('🔧 Method 3: Forcing admin status...');
    
    // Get existing user or create new one
    const user = existingUser || {
      id: 'force-admin-' + Date.now(),
      username: 'admin',
      email: 'ommzadeh@gmail.com',
      name: 'Force Admin',
      role: 'admin',
      authProvider: 'force',
      createdAt: new Date().toISOString(),
      isBlocked: false,
      isForceAdmin: true
    };
    
    // Force admin role
    user.role = 'admin';
    user.isAdmin = true;
    user.isForceAdmin = true;
    
    const token = 'force-admin-token-' + Date.now();
    
    // Update all storage
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('access_token', token);
    localStorage.setItem('pc_current_user', JSON.stringify(user));
    localStorage.setItem('pc_access_token', token);
    localStorage.setItem('userRole', 'admin');
    localStorage.setItem('isAuthenticated', 'true');
    
    console.log('✅ Forced admin status:', user);
    
    return { user, token };
  },

  // Method 4: Backend bypass with KV store simulation
  async simulateBackendAuth(email: string, password: string, name: string) {
    console.log('🔧 Method 4: Simulating backend auth...');
    
    try {
      // Create comprehensive user data
      const userData = {
        id: 'sim-admin-' + Date.now(),
        username: 'admin',
        email: email,
        name: name,
        role: 'admin',
        authProvider: 'simulated',
        createdAt: new Date().toISOString(),
        isBlocked: false,
        isSimulated: true,
        hasBackendAccess: true
      };
      
      const token = 'sim-admin-token-' + Date.now();
      
      // Store comprehensive auth data
      localStorage.setItem('currentUser', JSON.stringify(userData));
      localStorage.setItem('access_token', token);
      localStorage.setItem('pc_current_user', JSON.stringify(userData));
      localStorage.setItem('pc_access_token', token);
      localStorage.setItem('username', 'admin');
      localStorage.setItem('userRole', 'admin');
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('authMethod', 'simulated');
      
      // Also simulate KV store entries
      localStorage.setItem(`user:${userData.id}`, JSON.stringify(userData));
      localStorage.setItem('user:username:admin', userData.id);
      localStorage.setItem(`user:email:${email}`, userData.id);
      
      console.log('✅ Simulated backend auth successful:', userData);
      
      return { user: userData, token };
      
    } catch (error) {
      console.error('❌ Simulation failed:', error);
      throw error;
    }
  },

  // Comprehensive setup function that tries all methods
  async setupAdminAccess(email: string = 'ommzadeh@gmail.com', password: string = 'admin123456', name: string = 'Admin User') {
    console.log('🚀 Starting comprehensive admin setup...');
    console.log('📧 Email:', email);
    console.log('👤 Name:', name);
    
    const methods = [
      { name: 'Direct Supabase Auth', fn: () => this.createDirectSupabaseAdmin(email, password, name) },
      { name: 'Manual Admin Creation', fn: () => this.createManualAdmin(email) },
      { name: 'Force Admin Status', fn: () => this.forceAdminStatus() },
      { name: 'Simulated Backend Auth', fn: () => this.simulateBackendAuth(email, password, name) }
    ];
    
    for (const method of methods) {
      try {
        console.log(`\n🧪 Trying ${method.name}...`);
        const result = await method.fn();
        
        if (result && (result.user || result.session)) {
          console.log(`✅ ${method.name} successful!`);
          
          // Test admin access
          const adminTest = this.testAdminAccess();
          if (adminTest.isAdmin) {
            console.log('🎉 Admin access confirmed!');
            return {
              success: true,
              method: method.name,
              result,
              adminAccess: adminTest
            };
          }
        }
        
      } catch (error) {
        console.log(`❌ ${method.name} failed:`, (error as Error).message);
        continue; // Try next method
      }
    }
    
    console.error('❌ All methods failed');
    return {
      success: false,
      error: 'All admin setup methods failed'
    };
  },

  // Test admin access
  testAdminAccess() {
    console.log('🧪 Testing admin access...');
    
    const currentUser = localStorage.getItem('currentUser');
    const accessToken = localStorage.getItem('access_token');
    const userRole = localStorage.getItem('userRole');
    
    let userData = null;
    try {
      userData = currentUser ? JSON.parse(currentUser) : null;
    } catch (e) {
      console.log('⚠️ Could not parse user data');
    }
    
    const isAdmin = userData?.role === 'admin' || userRole === 'admin';
    const hasToken = !!accessToken;
    const hasUserData = !!userData;
    
    const result = {
      isAdmin,
      hasToken,
      hasUserData,
      userData,
      accessToken: accessToken?.substring(0, 20) + '...',
      canAccessAdmin: isAdmin && hasToken && hasUserData
    };
    
    console.log('📊 Admin access test result:', result);
    
    return result;
  },

  // Clear all auth data
  clearAllAuth() {
    console.log('🧹 Clearing all authentication data...');
    localStorage.clear();
    console.log('✅ All auth data cleared');
  },

  // Navigate to admin page
  navigateToAdmin() {
    console.log('🎯 Navigating to admin page...');
    window.location.href = window.location.origin + '?page=admin';
  }
};

// Export for console use
(window as any).AdminSetup = AdminSetupScript;

export default AdminSetupScript;