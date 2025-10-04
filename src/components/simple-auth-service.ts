// Simple authentication service for immediate testing and debugging
// This bypasses backend dependencies and provides direct local authentication

export interface SimpleUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: Date;
}

class SimpleAuthService {
  private currentUser: SimpleUser | null = null;
  private users: Map<string, { password: string; user: SimpleUser }> = new Map();

  constructor() {
    this.initializeDefaultUsers();
    this.loadCurrentUser();
  }

  private initializeDefaultUsers() {
    // Pre-create admin user
    const adminUser: SimpleUser = {
      id: 'admin-001',
      email: 'ommzadeh@gmail.com',
      name: 'Admin User',
      role: 'admin',
      createdAt: new Date()
    };

    // Pre-create test user
    const testUser: SimpleUser = {
      id: 'test-001',
      email: 'test@persianconnect.com',
      name: 'Test User',
      role: 'user',
      createdAt: new Date()
    };

    this.users.set('ommzadeh@gmail.com', {
      password: 'admin123',
      user: adminUser
    });

    this.users.set('test@persianconnect.com', {
      password: 'test123',
      user: testUser
    });

    console.log('✅ Simple Auth: Initialized with default users');
  }

  private loadCurrentUser() {
    try {
      const userData = localStorage.getItem('simple_auth_user');
      if (userData) {
        this.currentUser = JSON.parse(userData);
        console.log('📱 Simple Auth: Loaded user session for:', this.currentUser?.email);
      }
    } catch (error) {
      console.error('❌ Simple Auth: Error loading user session:', error);
      localStorage.removeItem('simple_auth_user');
    }
  }

  private saveCurrentUser(user: SimpleUser | null) {
    this.currentUser = user;
    if (user) {
      localStorage.setItem('simple_auth_user', JSON.stringify(user));
      console.log('💾 Simple Auth: Saved user session for:', user.email);
    } else {
      localStorage.removeItem('simple_auth_user');
      console.log('💾 Simple Auth: Cleared user session');
    }
  }

  async signIn(email: string, password: string): Promise<SimpleUser> {
    console.log('🔐 Simple Auth: Attempting sign in for:', email);

    // Basic validation
    if (!email || !password) {
      throw new Error('Please enter both email and password');
    }

    // Check if user exists
    const userRecord = this.users.get(email.toLowerCase());
    if (!userRecord) {
      throw new Error('Invalid email or password');
    }

    // Check password
    if (userRecord.password !== password) {
      throw new Error('Invalid email or password');
    }

    // Success
    const user = userRecord.user;
    this.saveCurrentUser(user);
    
    console.log('✅ Simple Auth: Sign in successful for:', user.email, 'Role:', user.role);
    return user;
  }

  async signUp(data: { name: string; email: string; password: string }): Promise<SimpleUser> {
    console.log('📝 Simple Auth: Attempting sign up for:', data.email);

    // Basic validation
    if (!data.name || !data.email || !data.password) {
      throw new Error('Please fill in all fields');
    }

    if (data.password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Check if user already exists
    if (this.users.has(data.email.toLowerCase())) {
      throw new Error('An account with this email already exists. Please sign in instead.');
    }

    // Create new user
    const newUser: SimpleUser = {
      id: `user-${Date.now()}`,
      email: data.email.toLowerCase(),
      name: data.name,
      role: data.email.toLowerCase() === 'ommzadeh@gmail.com' ? 'admin' : 'user',
      createdAt: new Date()
    };

    // Store user
    this.users.set(data.email.toLowerCase(), {
      password: data.password,
      user: newUser
    });

    this.saveCurrentUser(newUser);
    
    console.log('✅ Simple Auth: Sign up successful for:', newUser.email, 'Role:', newUser.role);
    return newUser;
  }

  async signOut(): Promise<void> {
    console.log('🚪 Simple Auth: Signing out user:', this.currentUser?.email);
    this.saveCurrentUser(null);
  }

  getCurrentUser(): SimpleUser | null {
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  // Get all users (admin only)
  getAllUsers(): SimpleUser[] {
    if (!this.isAdmin()) {
      throw new Error('Unauthorized: Admin access required');
    }
    return Array.from(this.users.values()).map(record => record.user);
  }

  // Create user manually (admin only)
  async createUser(data: { name: string; email: string; password: string; role?: 'user' | 'admin' }): Promise<SimpleUser> {
    if (!this.isAdmin()) {
      throw new Error('Unauthorized: Admin access required');
    }

    if (this.users.has(data.email.toLowerCase())) {
      throw new Error('User already exists');
    }

    const newUser: SimpleUser = {
      id: `user-${Date.now()}`,
      email: data.email.toLowerCase(),
      name: data.name,
      role: data.role || 'user',
      createdAt: new Date()
    };

    this.users.set(data.email.toLowerCase(), {
      password: data.password,
      user: newUser
    });

    console.log('✅ Simple Auth: Admin created user:', newUser.email, 'Role:', newUser.role);
    return newUser;
  }
}

export const simpleAuthService = new SimpleAuthService();
export default simpleAuthService;