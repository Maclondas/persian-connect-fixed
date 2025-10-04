// Real-time data management service using localStorage
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
  featuredUntil?: Date; // When the featured status expires
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
  // Payment and moderation fields
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
}

export interface Payment {
  id: string;
  userId: string;
  adId: string;
  amount: number;
  currency: string;
  type: 'ad_posting' | 'ad_boost'; // Type of payment
  status: 'pending' | 'completed' | 'failed';
  stripeSessionId?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface SupportMessage {
  id: string;
  userId: string;
  username: string;
  email: string;
  subject: string;
  message: string;
  status: 'open' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
  adminResponse?: string;
  adminId?: string;
}

class DataService {
  private static instance: DataService;
  private users: User[] = [];
  private ads: Ad[] = [];
  private messages: Message[] = [];
  private chats: Chat[] = [];
  private payments: Payment[] = [];
  private supportMessages: SupportMessage[] = [];
  private eventListeners: { [key: string]: Function[] } = {};

  constructor() {
    this.loadData();
    this.initializeDefaultData();
    this.startAutoCleanup(); // Start automatic cleanup of expired ads
  }

  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  private loadData() {
    try {
      this.users = JSON.parse(localStorage.getItem('users') || '[]').map((u: any) => ({
        ...u,
        createdAt: new Date(u.createdAt)
      }));
      this.ads = JSON.parse(localStorage.getItem('ads') || '[]').map((ad: any) => ({
        ...ad,
        createdAt: new Date(ad.createdAt),
        updatedAt: new Date(ad.updatedAt)
      }));
      this.messages = JSON.parse(localStorage.getItem('messages') || '[]').map((m: any) => ({
        ...m,
        timestamp: new Date(m.timestamp)
      }));
      this.chats = JSON.parse(localStorage.getItem('chats') || '[]').map((c: any) => ({
        ...c,
        lastActivity: new Date(c.lastActivity),
        lastMessage: c.lastMessage ? {
          ...c.lastMessage,
          timestamp: new Date(c.lastMessage.timestamp)
        } : undefined
      }));
      this.payments = JSON.parse(localStorage.getItem('payments') || '[]').map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        completedAt: p.completedAt ? new Date(p.completedAt) : undefined
      }));
      this.supportMessages = JSON.parse(localStorage.getItem('supportMessages') || '[]').map((s: any) => ({
        ...s,
        createdAt: new Date(s.createdAt),
        updatedAt: new Date(s.updatedAt)
      }));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }

  private saveData() {
    try {
      localStorage.setItem('users', JSON.stringify(this.users));
      localStorage.setItem('ads', JSON.stringify(this.ads));
      localStorage.setItem('messages', JSON.stringify(this.messages));
      localStorage.setItem('chats', JSON.stringify(this.chats));
      localStorage.setItem('payments', JSON.stringify(this.payments));
      localStorage.setItem('supportMessages', JSON.stringify(this.supportMessages));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  private emit(event: string, data?: any) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(data));
    }
  }

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

  private initializeDefaultData() {
    // Initialize with sample data if empty
    if (this.users.length === 0) {
      this.users = [
        {
          id: 'admin-1',
          username: 'admin',
          email: 'admin@persianconnect.com',
          name: 'Admin User',
          role: 'admin',
          authProvider: 'email',
          createdAt: new Date(),
        },
        {
          id: 'user-1',
          username: 'john_doe',
          email: 'john@example.com',
          name: 'John Doe',
          role: 'user',
          authProvider: 'email',
          createdAt: new Date(),
        }
      ];
    }

    if (this.ads.length === 0) {
      // No default demo ads - start with empty array
      this.ads = [];
    }
          titlePersian: 'تویوتا کمری مدل 2019',
          description: 'Reliable Toyota Camry with excellent fuel economy',
          descriptionPersian: 'تویوتا کمری قابل اعتماد با مصرف سوخت عالی',
          price: 28000,
          priceType: 'fixed',
          currency: 'USD',
          category: 'vehicles',
          subcategory: 'cars',
          location: { country: 'United States', city: 'Los Angeles' },
          images: ['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=500'],
          userId: 'user-1',
          username: 'john_doe',
          userEmail: 'john@example.com',
          status: 'approved',
          featured: true,
          featuredUntil: new Date(now.getTime() + (6 * 24 * 60 * 60 * 1000)), // 6 days from now
          urgent: false,
          createdAt: new Date(now.getTime() - 172800000), // 2 days ago
          updatedAt: new Date(now.getTime() - 172800000),
          expiresAt: expiresAt,
          views: 18,
          contactInfo: { phone: '+1234567891', email: 'john@example.com' },
          condition: 'used',
          brand: 'Toyota',
          model: 'Camry',
          paymentStatus: 'completed',
          paymentId: 'pay-sample-3',
          moderationResult: {
            aiScore: 0.08,
            flaggedContent: [],
            requiresManualReview: false
          }
        },
        {
          id: 'ad-4',
          title: '2021 Honda Civic',
          titlePersian: 'هوندا سیویک مدل 2021',
          description: 'Low mileage Honda Civic in excellent condition',
          descriptionPersian: 'هوندا سیویک کم کارکرد در حالت عالی',
          price: 32000,
          priceType: 'negotiable',
          currency: 'USD',
          category: 'vehicles',
          subcategory: 'cars',
          location: { country: 'United States', city: 'Chicago' },
          images: ['https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=500'],
          userId: 'user-1',
          username: 'john_doe',
          userEmail: 'john@example.com',
          status: 'approved',
          featured: true,
          featuredUntil: new Date(now.getTime() + (5 * 24 * 60 * 60 * 1000)), // 5 days from now
          urgent: true,
          createdAt: new Date(now.getTime() - 259200000), // 3 days ago
          updatedAt: new Date(now.getTime() - 259200000),
          expiresAt: expiresAt,
          views: 32,
          contactInfo: { phone: '+1234567892', email: 'john@example.com' },
          condition: 'used',
          brand: 'Honda',
          model: 'Civic',
          paymentStatus: 'completed',
          paymentId: 'pay-sample-4',
          moderationResult: {
            aiScore: 0.06,
            flaggedContent: [],
            requiresManualReview: false
          }
        },
        {
          id: 'ad-5',
          title: '2022 Ford Mustang',
          titlePersian: 'فورد موستانگ مدل 2022',
          description: 'Performance sports car with premium features',
          descriptionPersian: 'خودروی اسپرت با امکانات پریمیوم',
          price: 55000,
          priceType: 'fixed',
          currency: 'USD',
          category: 'vehicles',
          subcategory: 'sports-cars',
          location: { country: 'United States', city: 'Miami' },
          images: ['https://images.unsplash.com/photo-1494905998402-395d579af36f?w=500'],
          userId: 'user-1',
          username: 'john_doe',
          userEmail: 'john@example.com',
          status: 'approved',
          featured: true,
          featuredUntil: new Date(now.getTime() + (4 * 24 * 60 * 60 * 1000)), // 4 days from now
          urgent: false,
          createdAt: new Date(now.getTime() - 345600000), // 4 days ago
          updatedAt: new Date(now.getTime() - 345600000),
          expiresAt: expiresAt,
          views: 45,
          contactInfo: { phone: '+1234567893', email: 'john@example.com' },
          condition: 'used',
          brand: 'Ford',
          model: 'Mustang',
          paymentStatus: 'completed',
          paymentId: 'pay-sample-5',
          moderationResult: {
            aiScore: 0.07,
            flaggedContent: [],
            requiresManualReview: false
          }
        },
        {
          id: 'ad-6',
          title: '2023 Tesla Model 3',
          titlePersian: 'تسلا مدل 3 سال 2023',
          description: 'Electric vehicle with autopilot features',
          descriptionPersian: 'خودروی برقی با قابلیت رانندگی خودکار',
          price: 48000,
          priceType: 'negotiable',
          currency: 'USD',
          category: 'vehicles',
          subcategory: 'electric-cars',
          location: { country: 'United States', city: 'San Francisco' },
          images: ['https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=500'],
          userId: 'user-1',
          username: 'john_doe',
          userEmail: 'john@example.com',
          status: 'approved',
          featured: true,
          featuredUntil: new Date(now.getTime() + (3 * 24 * 60 * 60 * 1000)), // 3 days from now
          urgent: false,
          createdAt: new Date(now.getTime() - 432000000), // 5 days ago
          updatedAt: new Date(now.getTime() - 432000000),
          expiresAt: expiresAt,
          views: 67,
          contactInfo: { phone: '+1234567894', email: 'john@example.com' },
          condition: 'used',
          brand: 'Tesla',
          model: 'Model 3',
          paymentStatus: 'completed',
          paymentId: 'pay-sample-6',
          moderationResult: {
            aiScore: 0.04,
            flaggedContent: [],
            requiresManualReview: false
          }
        },
        {
          id: 'ad-7',
          title: '2018 Chevrolet Silverado',
          titlePersian: 'شورولت سیلورادو مدل 2018',
          description: 'Heavy-duty pickup truck for work and recreation',
          descriptionPersian: 'پیکاپ سنگین برای کار و تفریح',
          price: 38000,
          priceType: 'negotiable',
          currency: 'USD',
          category: 'vehicles',
          subcategory: 'trucks',
          location: { country: 'United States', city: 'Dallas' },
          images: ['https://images.unsplash.com/photo-1563720223185-11003d516935?w=500'],
          userId: 'user-1',
          username: 'john_doe',
          userEmail: 'john@example.com',
          status: 'approved',
          featured: true,
          featuredUntil: new Date(now.getTime() + (2 * 24 * 60 * 60 * 1000)), // 2 days from now
          urgent: true,
          createdAt: new Date(now.getTime() - 518400000), // 6 days ago
          updatedAt: new Date(now.getTime() - 518400000),
          expiresAt: expiresAt,
          views: 28,
          contactInfo: { phone: '+1234567895', email: 'john@example.com' },
          condition: 'used',
          brand: 'Chevrolet',
          model: 'Silverado',
          paymentStatus: 'completed',
          paymentId: 'pay-sample-7',
          moderationResult: {
            aiScore: 0.09,
            flaggedContent: [],
            requiresManualReview: false
          }
        },
        {
          id: 'ad-8',
          title: '2020 Kawasaki Ninja 650',
          titlePersian: 'کاواساکی نینجا 650 مدل 2020',
          description: 'Sport motorcycle with excellent performance',
          descriptionPersian: 'موتورسیکلت اسپرت با عملکرد عالی',
          price: 8500,
          priceType: 'fixed',
          currency: 'USD',
          category: 'vehicles',
          subcategory: 'motorcycles',
          location: { country: 'United States', city: 'Phoenix' },
          images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500'],
          userId: 'user-1',
          username: 'john_doe',
          userEmail: 'john@example.com',
          status: 'approved',
          featured: false,
          urgent: false,
          createdAt: new Date(now.getTime() - 604800000), // 7 days ago
          updatedAt: new Date(now.getTime() - 604800000),
          expiresAt: expiresAt,
          views: 12,
          contactInfo: { phone: '+1234567896', email: 'john@example.com' },
          condition: 'used',
          brand: 'Kawasaki',
          model: 'Ninja 650',
          paymentStatus: 'completed',
          paymentId: 'pay-sample-8',
          moderationResult: {
            aiScore: 0.05,
            flaggedContent: [],
            requiresManualReview: false
          }
        },
        {
          id: 'ad-2',
          title: 'iPhone 15 Pro Max',
          titlePersian: 'آیفون 15 پرو مکس',
          description: 'Brand new iPhone 15 Pro Max 256GB',
          descriptionPersian: 'آیفون 15 پرو مکس نو 256 گیگابایت',
          price: 1200,
          priceType: 'fixed',
          currency: 'USD',
          category: 'digital-goods',
          subcategory: 'mobile-phones',
          location: { country: 'Canada', city: 'Toronto' },
          images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500'],
          userId: 'user-1',
          username: 'john_doe',
          userEmail: 'john@example.com',
          status: 'approved',
          featured: false,
          urgent: true,
          createdAt: new Date(now.getTime() - 43200000),
          updatedAt: new Date(now.getTime() - 43200000),
          expiresAt: expiresAt,
          views: 15,
          contactInfo: { phone: '+1234567890', email: 'john@example.com' },
          condition: 'new',
          brand: 'Apple',
          model: 'iPhone 15 Pro Max',
          paymentStatus: 'completed',
          paymentId: 'pay-sample-2',
          moderationResult: {
            aiScore: 0.05,
            flaggedContent: [],
            requiresManualReview: false
          }
        }
      ];
    }

    this.saveData();
  }

  // User methods
  async registerUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const user: User = {
      ...userData,
      id: `user-${Date.now()}`,
      createdAt: new Date()
    };
    
    this.users.push(user);
    this.saveData();
    this.emit('userRegistered', user);
    return user;
  }

  async authenticateUser(email: string, password: string): Promise<User | null> {
    // Simulate authentication - in real app this would verify password
    const user = this.users.find(u => u.email === email && !u.isBlocked);
    if (user) {
      this.emit('userAuthenticated', user);
      return user;
    }
    return null;
  }

  async authenticateGoogleUser(googleData: any): Promise<User> {
    let user = this.users.find(u => u.email === googleData.email);
    
    if (!user) {
      user = await this.registerUser({
        username: googleData.email.split('@')[0],
        email: googleData.email,
        name: googleData.name,
        role: 'user',
        authProvider: 'google'
      });
    }
    
    this.emit('userAuthenticated', user);
    return user;
  }

  getUserById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  getUserByEmail(email: string): User | undefined {
    return this.users.find(u => u.email === email);
  }

  getAllUsers(): User[] {
    return [...this.users];
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex !== -1) {
      this.users[userIndex] = { ...this.users[userIndex], ...updates };
      this.saveData();
      this.emit('userUpdated', this.users[userIndex]);
      return this.users[userIndex];
    }
    return null;
  }

  async deleteUser(id: string): Promise<boolean> {
    const userIndex = this.users.findIndex(u => u.id === id);
    if (userIndex !== -1) {
      const deletedUser = this.users.splice(userIndex, 1)[0];
      // Also delete user's ads and messages
      this.ads = this.ads.filter(ad => ad.userId !== id);
      this.messages = this.messages.filter(m => m.senderId !== id && m.receiverId !== id);
      this.saveData();
      this.emit('userDeleted', deletedUser);
      return true;
    }
    return false;
  }

  // Ad methods
  async createAd(adData: Omit<Ad, 'id' | 'createdAt' | 'updatedAt' | 'views' | 'status' | 'expiresAt' | 'paymentStatus'>): Promise<Ad> {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from now
    
    const ad: Ad = {
      ...adData,
      id: `ad-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      expiresAt: expiresAt,
      views: 0,
      status: 'pending', // Starts as pending until payment and moderation
      paymentStatus: 'pending' // Payment required before moderation
    };
    
    this.ads.push(ad);
    this.saveData();
    this.emit('adCreated', ad);
    return ad;
  }

  getAdById(id: string): Ad | undefined {
    const ad = this.ads.find(a => a.id === id);
    if (ad) {
      // Increment view count
      ad.views++;
      this.saveData();
    }
    return ad;
  }

  getAdsByUser(userId: string): Ad[] {
    return this.ads.filter(ad => ad.userId === userId);
  }

  getApprovedAds(filters?: {
    category?: string;
    location?: { country?: string; city?: string };
    search?: string;
    priceRange?: { min?: number; max?: number };
    featured?: boolean;
  }): Ad[] {
    // Only show approved ads that have completed payment and haven't expired
    let ads = this.ads.filter(ad => 
      ad.status === 'approved' && 
      ad.paymentStatus === 'completed' &&
      new Date() < new Date(ad.expiresAt)
    );
    
    if (filters) {
      if (filters.category) {
        ads = ads.filter(ad => ad.category === filters.category);
      }
      
      if (filters.location) {
        if (filters.location.country && filters.location.country !== 'All Countries') {
          ads = ads.filter(ad => ad.location.country === filters.location!.country);
        }
        if (filters.location.city && filters.location.city !== 'All Cities') {
          ads = ads.filter(ad => ad.location.city === filters.location!.city);
        }
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        ads = ads.filter(ad => 
          ad.title.toLowerCase().includes(searchLower) ||
          ad.titlePersian.includes(filters.search!) ||
          ad.description.toLowerCase().includes(searchLower) ||
          ad.descriptionPersian.includes(filters.search!)
        );
      }
      
      if (filters.priceRange) {
        if (filters.priceRange.min) {
          ads = ads.filter(ad => ad.price >= filters.priceRange!.min!);
        }
        if (filters.priceRange.max) {
          ads = ads.filter(ad => ad.price <= filters.priceRange!.max!);
        }
      }
      
      if (filters.featured) {
        ads = ads.filter(ad => ad.featured);
      }
    }
    
    return ads.sort((a, b) => {
      // Featured ads first, then by urgency, then by date
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      if (a.urgent && !b.urgent) return -1;
      if (!a.urgent && b.urgent) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  getAllAds(): Ad[] {
    return [...this.ads];
  }

  async updateAd(id: string, updates: Partial<Ad>): Promise<Ad | null> {
    const adIndex = this.ads.findIndex(a => a.id === id);
    if (adIndex !== -1) {
      this.ads[adIndex] = { 
        ...this.ads[adIndex], 
        ...updates, 
        updatedAt: new Date() 
      };
      this.saveData();
      this.emit('adUpdated', this.ads[adIndex]);
      return this.ads[adIndex];
    }
    return null;
  }

  async deleteAd(id: string): Promise<boolean> {
    const adIndex = this.ads.findIndex(a => a.id === id);
    if (adIndex !== -1) {
      const deletedAd = this.ads.splice(adIndex, 1)[0];
      // Also delete related messages and chats
      this.messages = this.messages.filter(m => m.adId !== id);
      this.chats = this.chats.filter(c => c.adId !== id);
      this.saveData();
      this.emit('adDeleted', deletedAd);
      return true;
    }
    return false;
  }

  // Ad boost methods
  async boostAd(adId: string): Promise<boolean> {
    const adIndex = this.ads.findIndex(a => a.id === adId);
    if (adIndex !== -1) {
      const now = new Date();
      const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
      
      this.ads[adIndex] = {
        ...this.ads[adIndex],
        featured: true,
        featuredUntil: oneWeekFromNow,
        updatedAt: now
      };
      
      this.saveData();
      this.emit('adBoosted', this.ads[adIndex]);
      return true;
    }
    return false;
  }

  // Check and update expired featured ads
  checkExpiredFeaturedAds(): void {
    const now = new Date();
    let hasUpdates = false;
    
    this.ads.forEach((ad, index) => {
      if (ad.featured && ad.featuredUntil && ad.featuredUntil <= now) {
        this.ads[index] = {
          ...ad,
          featured: false,
          featuredUntil: undefined,
          updatedAt: now
        };
        hasUpdates = true;
        this.emit('adFeaturedExpired', this.ads[index]);
      }
    });
    
    if (hasUpdates) {
      this.saveData();
    }
  }

  // Get rotated featured ads (max 5, rotating every 10 minutes)
  getRotatedFeaturedAds(category?: string): Ad[] {
    // Get all active featured ads
    const featuredAds = this.ads.filter(ad => {
      const isActive = ad.featured && 
                      ad.status === 'approved' && 
                      new Date(ad.expiresAt) > new Date() &&
                      (!ad.featuredUntil || new Date(ad.featuredUntil) > new Date());
      
      // If category is specified, filter by category
      if (category && isActive) {
        return ad.category.toLowerCase() === category.toLowerCase();
      }
      
      return isActive;
    });

    if (featuredAds.length <= 5) {
      return featuredAds;
    }

    // Calculate rotation based on 10-minute intervals
    const now = new Date();
    const rotationInterval = 10 * 60 * 1000; // 10 minutes in milliseconds
    const rotationIndex = Math.floor(now.getTime() / rotationInterval) % Math.ceil(featuredAds.length / 5);
    
    // Calculate start and end indices for current rotation
    const startIndex = rotationIndex * 5;
    const endIndex = Math.min(startIndex + 5, featuredAds.length);
    
    return featuredAds.slice(startIndex, endIndex);
  }

  // Get featured ads with category filtering for pages
  getFeaturedAdsForCategory(category: string): Ad[] {
    return this.getRotatedFeaturedAds(category);
  }

  // Get all featured ads for homepage (from all categories)
  getAllRotatedFeaturedAds(): Ad[] {
    return this.getRotatedFeaturedAds();
  }

  // Message and Chat methods
  async sendMessage(messageData: Omit<Message, 'id' | 'timestamp' | 'isRead'>): Promise<Message> {
    const message: Message = {
      ...messageData,
      id: `msg-${Date.now()}`,
      timestamp: new Date(),
      isRead: false
    };
    
    this.messages.push(message);
    
    // Update or create chat
    let chat = this.chats.find(c => c.id === message.chatId);
    if (!chat) {
      chat = {
        id: message.chatId,
        participants: [message.senderId, message.receiverId],
        participantUsernames: [message.senderUsername, message.receiverUsername],
        lastActivity: new Date(),
        adId: message.adId,
        adTitle: message.adTitle,
        isActive: true
      };
      this.chats.push(chat);
    }
    
    chat.lastMessage = message;
    chat.lastActivity = new Date();
    
    this.saveData();
    this.emit('messageSent', message);
    this.emit('chatUpdated', chat);
    return message;
  }

  getMessagesByChatId(chatId: string): Message[] {
    return this.messages
      .filter(m => m.chatId === chatId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  getChatsByUserId(userId: string): Chat[] {
    return this.chats
      .filter(c => c.participants.includes(userId) && c.isActive)
      .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
  }

  async markMessagesAsRead(chatId: string, userId: string): Promise<void> {
    this.messages
      .filter(m => m.chatId === chatId && m.receiverId === userId && !m.isRead)
      .forEach(m => m.isRead = true);
    
    this.saveData();
    this.emit('messagesRead', { chatId, userId });
  }

  getUnreadMessageCount(userId: string): number {
    return this.messages.filter(m => m.receiverId === userId && !m.isRead).length;
  }

  // Payment methods
  async createPayment(paymentData: Omit<Payment, 'id' | 'createdAt'>): Promise<Payment> {
    const payment: Payment = {
      ...paymentData,
      id: `pay-${Date.now()}`,
      createdAt: new Date()
    };
    
    this.payments.push(payment);
    this.saveData();
    this.emit('paymentCreated', payment);
    return payment;
  }

  async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment | null> {
    const paymentIndex = this.payments.findIndex(p => p.id === id);
    if (paymentIndex !== -1) {
      this.payments[paymentIndex] = { ...this.payments[paymentIndex], ...updates };
      if (updates.status === 'completed') {
        this.payments[paymentIndex].completedAt = new Date();
      }
      this.saveData();
      this.emit('paymentUpdated', this.payments[paymentIndex]);
      return this.payments[paymentIndex];
    }
    return null;
  }

  getPaymentsByUser(userId: string): Payment[] {
    return this.payments.filter(p => p.userId === userId);
  }

  getAllPayments(): Payment[] {
    return [...this.payments];
  }

  // Support message methods
  async createSupportMessage(messageData: Omit<SupportMessage, 'id' | 'createdAt' | 'updatedAt'>): Promise<SupportMessage> {
    const supportMessage: SupportMessage = {
      ...messageData,
      id: `support-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.supportMessages.push(supportMessage);
    this.saveData();
    this.emit('supportMessageCreated', supportMessage);
    return supportMessage;
  }

  getAllSupportMessages(): SupportMessage[] {
    return [...this.supportMessages].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async updateSupportMessage(id: string, updates: Partial<SupportMessage>): Promise<SupportMessage | null> {
    const messageIndex = this.supportMessages.findIndex(m => m.id === id);
    if (messageIndex !== -1) {
      this.supportMessages[messageIndex] = { 
        ...this.supportMessages[messageIndex], 
        ...updates,
        updatedAt: new Date()
      };
      this.saveData();
      this.emit('supportMessageUpdated', this.supportMessages[messageIndex]);
      return this.supportMessages[messageIndex];
    }
    return null;
  }

  // Expiration and cleanup methods
  cleanupExpiredAds(): number {
    const now = new Date();
    const expiredAds = this.ads.filter(ad => new Date(ad.expiresAt) <= now && ad.status !== 'expired');
    
    expiredAds.forEach(ad => {
      ad.status = 'expired';
      ad.updatedAt = now;
    });
    
    if (expiredAds.length > 0) {
      this.saveData();
      this.emit('adsExpired', expiredAds);
    }
    
    return expiredAds.length;
  }

  getAdsRequiringReview(): Ad[] {
    return this.ads.filter(ad => 
      ad.status === 'under_review' || 
      (ad.moderationResult?.requiresManualReview && ad.status === 'pending')
    );
  }

  async processAdModeration(adId: string): Promise<void> {
    const ad = this.ads.find(a => a.id === adId);
    if (!ad || ad.paymentStatus !== 'completed') {
      return;
    }

    // Import moderation service
    const { contentModerationService } = await import('./content-moderation-service');
    
    const moderationResult = await contentModerationService.moderateContent({
      title: ad.title,
      titlePersian: ad.titlePersian,
      description: ad.description,
      descriptionPersian: ad.descriptionPersian,
      images: ad.images,
      category: ad.category,
      price: ad.price
    });

    ad.moderationResult = {
      aiScore: moderationResult.score,
      flaggedContent: moderationResult.flaggedContent,
      requiresManualReview: moderationResult.requiresManualReview,
      rejectionReason: moderationResult.rejectionReason
    };

    if (moderationResult.approved && !moderationResult.requiresManualReview) {
      ad.status = 'approved';
    } else if (moderationResult.requiresManualReview) {
      ad.status = 'under_review';
    } else {
      ad.status = 'rejected';
    }

    ad.updatedAt = new Date();
    this.saveData();
    this.emit('adModerated', ad);
  }

  async adminReviewAd(adId: string, decision: 'approve' | 'reject', adminId: string, reason?: string): Promise<boolean> {
    const ad = this.ads.find(a => a.id === adId);
    if (!ad) return false;

    if (ad.moderationResult) {
      ad.moderationResult.reviewedBy = adminId;
      ad.moderationResult.reviewedAt = new Date();
      if (reason) {
        ad.moderationResult.rejectionReason = reason;
      }
    }

    ad.status = decision === 'approve' ? 'approved' : 'rejected';
    ad.updatedAt = new Date();
    
    this.saveData();
    this.emit('adReviewed', { ad, decision, adminId });
    return true;
  }

  // Auto-cleanup expired ads (call this periodically)
  startAutoCleanup(): void {
    try {
      // Clean up expired ads every hour
      setInterval(() => {
        this.cleanupExpiredAds();
      }, 60 * 60 * 1000);

      // Initial cleanup
      this.cleanupExpiredAds();
    } catch (error) {
      console.error('Error starting auto cleanup:', error);
    }
  }

  // Analytics methods
  getAnalytics() {
    const totalUsers = this.users.length;
    const totalAds = this.ads.length;
    const approvedAds = this.ads.filter(ad => ad.status === 'approved').length;
    const pendingAds = this.ads.filter(ad => ad.status === 'pending').length;
    const underReviewAds = this.ads.filter(ad => ad.status === 'under_review').length;
    const rejectedAds = this.ads.filter(ad => ad.status === 'rejected').length;
    const expiredAds = this.ads.filter(ad => ad.status === 'expired').length;
    
    const totalRevenue = this.payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const revenueByCountry = this.ads
      .filter(ad => ad.status === 'approved' && ad.paymentStatus === 'completed')
      .reduce((acc, ad) => {
        const country = ad.location.country;
        acc[country] = (acc[country] || 0) + 2; // $2 per ad
        return acc;
      }, {} as Record<string, number>);

    const usersByMonth = this.users.reduce((acc, user) => {
      const month = user.createdAt.toISOString().slice(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalUsers,
      totalAds,
      approvedAds,
      pendingAds,
      underReviewAds,
      rejectedAds,
      expiredAds,
      activeAds: this.getApprovedAds().length,
      totalRevenue,
      revenueByCountry,
      usersByMonth,
      adsByCategory: this.ads.reduce((acc, ad) => {
        acc[ad.category] = (acc[ad.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      moderationStats: {
        autoApproved: this.ads.filter(ad => ad.moderationResult && ad.moderationResult.aiScore < 0.2).length,
        autoRejected: this.ads.filter(ad => ad.moderationResult && ad.moderationResult.aiScore >= 0.8).length,
        manualReviewRequired: this.ads.filter(ad => ad.status === 'under_review').length
      }
    };
  }
}

export const dataService = DataService.getInstance();
export default dataService;