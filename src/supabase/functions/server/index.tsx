import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import { createClient } from 'npm:@supabase/supabase-js@2'

// Import KV store - keep it simple for now
import * as kv from './kv_store.tsx'

const app = new Hono()

// CORS configuration
app.use('*', cors({
  origin: [
    'http://localhost:5173', 
    'https://*.vercel.app', 
    'https://*.netlify.app', 
    'https://*.github.io',
    'https://persian-connect.com',
    'https://www.persian-connect.com',
    'https://*.persian-connect.com'
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}))

app.use('*', logger(console.log))

// Request validation middleware
app.use('*', async (c, next) => {
  try {
    // Basic validation - c.req should always exist in Hono
    if (!c || !c.req) {
      console.error('❌ Invalid context or request object in middleware')
      return c?.json ? c.json({ error: 'Invalid request' }, 400) : new Response('Invalid request', { status: 400 })
    }
    
    await next()
  } catch (error) {
    console.error('❌ Middleware error:', error)
    return c.json({ 
      error: 'Request processing error',
      message: error?.message || 'Unknown error'
    }, 500)
  }
})

// Supabase client for database operations
console.log('🔧 Initializing Supabase client...')
const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
} else {
  console.log('✅ Supabase environment variables found')
}

const supabase = createClient(
  supabaseUrl!,
  supabaseKey!,
)

console.log('✅ Supabase client initialized')
console.log('🔧 KV store imported:', typeof kv !== 'undefined' && kv.get !== undefined)

// Initialize storage buckets
async function initializeBuckets() {
  const buckets = [
    'make-e5dee741-user-avatars',
    'make-e5dee741-ad-images',
    'make-e5dee741-ad-videos'
  ]
  
  const { data: existingBuckets } = await supabase.storage.listBuckets()
  
  for (const bucketName of buckets) {
    const bucketExists = existingBuckets?.some(bucket => bucket.name === bucketName)
    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, { public: false })
      console.log(`Created bucket: ${bucketName}`)
    }
  }
}

// Initialize buckets on startup
initializeBuckets().catch(console.error)

// Safe KV operations with error handling
const safeKV = {
  async get(key: string) {
    try {
      return await kv.get(key);
    } catch (error) {
      console.error(`❌ KV get error for key ${key}:`, error);
      return null;
    }
  },
  
  async set(key: string, value: any) {
    try {
      await kv.set(key, value);
      return true;
    } catch (error) {
      console.error(`❌ KV set error for key ${key}:`, error);
      return false;
    }
  },
  
  async del(key: string) {
    try {
      await kv.del(key);
      return true;
    } catch (error) {
      console.error(`❌ KV del error for key ${key}:`, error);
      return false;
    }
  },
  
  async mget(keys: string[]) {
    try {
      return await kv.mget(keys);
    } catch (error) {
      console.error(`❌ KV mget error:`, error);
      return [];
    }
  },
  
  async getByPrefix(prefix: string) {
    try {
      return await kv.getByPrefix(prefix);
    } catch (error) {
      console.error(`❌ KV getByPrefix error for prefix ${prefix}:`, error);
      return [];
    }
  }
};

// Helper function to get authenticated user
async function getAuthenticatedUser(request: any) {
  try {
    if (!request) {
      console.error('❌ getAuthenticatedUser: No request object provided')
      return null
    }
    
    // Handle Hono context request objects - access headers through header() method
    let authHeader: string | null = null
    
    if (typeof request.header === 'function') {
      // Hono request object
      authHeader = request.header('Authorization') || request.header('authorization')
    } else if (request.headers && typeof request.headers.get === 'function') {
      // Standard Request object
      authHeader = request.headers.get('Authorization') || request.headers.get('authorization')
    } else if (request.headers) {
      // Plain headers object
      authHeader = request.headers['Authorization'] || request.headers['authorization']
    }
    
    if (!authHeader) {
      console.log('📝 No authorization header found')
      return null
    }
    
    const accessToken = authHeader.split(' ')[1]
    if (!accessToken) {
      console.log('📝 No authorization token provided')
      return null
    }
    
    // Check if this is the anon key (which means no authenticated user)
    if (accessToken === Deno.env.get('SUPABASE_ANON_KEY')) {
      console.log('📝 Using anon key - no authenticated user')
      return null
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken)
    if (error) {
      console.error('❌ Auth validation error:', error.message)
      return null
    }
    
    if (!user) {
      console.error('❌ No user found for token')
      return null
    }
    
    console.log('✅ Authenticated user:', user.email)
    return user
  } catch (error) {
    console.error('❌ getAuthenticatedUser error:', error)
    return null
  }
}

// Health check endpoint
app.get('/make-server-e5dee741/health', (c) => {
  return c.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    kv_available: typeof kv !== 'undefined' && kv.get !== undefined,
    request_valid: !!c.req,
    headers_available: !!(c.req && c.req.headers)
  })
})

// Base route
app.get('/make-server-e5dee741', (c) => {
  return c.json({ 
    message: 'Persian Connect API Server',
    version: '1.0.0',
    endpoints: [
      '/health',
      '/auth/signup',
      '/auth/signin', 
      '/auth/google-user',
      '/ads',
      '/messages',
      '/payments',
      '/admin'
    ]
  })
})

// Auth Routes
app.post('/make-server-e5dee741/auth/signup', async (c) => {
  console.log('🔥 Signup endpoint called')
  try {
    const requestBody = await c.req.json()
    const { email, password, name, username } = requestBody
    console.log('📧 Signup request:', { email, name, username, hasPassword: !!password })
    
    if (!email || !password || !name) {
      console.error('❌ Missing required fields:', { email: !!email, password: !!password, name: !!name, username: !!username })
      return c.json({ error: 'Missing required fields: email, password, and name are required' }, 400)
    }
    
    // Generate username if not provided
    let finalUsername = username || `user_${Math.random().toString(36).substr(2, 9)}`
    console.log('👤 Using username:', finalUsername)
    
    // Check if email is already registered in KV store
    console.log('🔍 Checking if email exists in KV store:', email)
    const emailKey = `user:email:${email}`
    const existingEmailUserId = await safeKV.get(emailKey)
    
    if (existingEmailUserId) {
      console.log('❌ Email already exists in KV store:', email)
      return c.json({ error: 'An account with this email already exists. Please sign in instead.' }, 400)
    }
    
    // Check if username is taken in KV store
    console.log('🔍 Checking if username exists in KV store:', finalUsername)
    const usernameKey = `user:username:${finalUsername}`
    const existingUsernameUserId = await safeKV.get(usernameKey)
    
    if (existingUsernameUserId) {
      console.log('❌ Username already exists, generating new one...')
      finalUsername = `${finalUsername}_${Math.random().toString(36).substr(2, 4)}`
      console.log('🔄 Using new username:', finalUsername)
    }
    
    // Create user in Supabase Auth (trigger will handle profile creation)
    console.log('👤 Creating user in Supabase Auth...')
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, username: finalUsername },
      email_confirm: true // Auto-confirm - no email verification needed
    })
    
    if (error) {
      console.error('❌ Supabase Auth signup error:', error)
      // Provide user-friendly error messages
      if (error.message.includes('User already registered')) {
        return c.json({ error: 'An account with this email already exists. Please sign in instead.' }, 400)
      }
      return c.json({ error: error.message }, 400)
    }
    
    console.log('✅ Supabase Auth user created successfully:', data.user.id)
    console.log('📧 User email confirmed automatically:', data.user.email_confirmed_at ? 'Yes' : 'No')
    
    // Create user profile in KV store
    console.log('📋 Creating user profile in KV store...')
    const userProfile = {
      id: data.user.id,
      username: finalUsername,
      email,
      name,
      role: email === 'ommzadeh@gmail.com' || data.user.id === 'user_93ijk5a5h' ? 'admin' : 'user',
      authProvider: 'email',
      createdAt: new Date().toISOString(),
      isBlocked: false,
      lastLoginAt: new Date().toISOString()
    }
    
    try {
      // Store user profile
      await safeKV.set(`user:${data.user.id}`, userProfile)
      
      // Store email lookup
      await safeKV.set(`user:email:${email}`, data.user.id)
      
      // Store username lookup
      await safeKV.set(`user:username:${finalUsername}`, data.user.id)
      
      console.log('✅ User profile created successfully in KV store')
      
      // Auto-promote admin if needed
      if (userProfile.role === 'admin') {
        console.log('🔐 Auto-promoted user to admin role:', email)
      }
      
      return c.json({ 
        message: 'User created successfully',
        user: userProfile 
      })
  } catch (error) {
    console.error('❌ Critical signup error:', error)
    return c.json({ error: 'Internal server error during signup: ' + (error as Error).message }, 500)
  }
})

// Debug route to check user profile status
app.get('/make-server-e5dee741/auth/profile-debug', async (c) => {
  const user = await getAuthenticatedUser(c.req)
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  try {
    console.log('🔍 Debug check for user:', user.id, user.email)
    
    // Check profile in database
    const { data: dbProfile, error: dbError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    // Check profile in KV store
    const kvProfile = await safeKV.get(`user:${user.id}`)
    
    // Check auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(user.id)
    
    return c.json({
      userId: user.id,
      userEmail: user.email,
      database: {
        exists: !!dbProfile,
        profile: dbProfile,
        error: dbError?.message
      },
      kvStore: {
        exists: !!kvProfile,
        profile: kvProfile
      },
      authUser: {
        exists: !!authUser?.user,
        email: authUser?.user?.email,
        provider: authUser?.user?.app_metadata?.provider,
        error: authError?.message
      }
    })
  } catch (error) {
    console.error('❌ Profile debug error:', error)
    return c.json({ error: 'Debug check failed: ' + error.message }, 500)
  }
})

// Fix user profile route - creates missing profiles
app.post('/make-server-e5dee741/auth/fix-profile', async (c) => {
  const user = await getAuthenticatedUser(c.req)
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  try {
    console.log('🔧 Fixing profile for user:', user.id, user.email)
    
    const profile = await ensureUserProfile(user.id, user.email)
    
    return c.json({
      message: 'Profile fixed successfully',
      profile: profile
    })
  } catch (error) {
    console.error('❌ Fix profile error:', error)
    return c.json({ error: 'Failed to fix profile: ' + error.message }, 500)
  }
})

app.post('/make-server-e5dee741/auth/signin', async (c) => {
  try {
    const { email, password } = await c.req.json()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      return c.json({ error: error.message }, 400)
    }
    
    // Get user data from KV store
    let userData = await safeKV.get(`user:${data.user.id}`)
    
    // Create user profile if not found
    if (!userData) {
      console.log('Creating user profile from auth data for:', data.user.email)
      
      // Auto-promote admin email/ID to admin role
      const isAdmin = data.user.email === 'ommzadeh@gmail.com' || data.user.id === 'user_93ijk5a5h'
      
      userData = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || 'User',
        username: data.user.user_metadata?.username || data.user.email?.split('@')[0] || 'user',
        role: isAdmin ? 'admin' : 'user',
        authProvider: data.user.app_metadata?.provider || 'email',
        createdAt: data.user.created_at || new Date().toISOString(),
        isBlocked: false,
        lastLoginAt: new Date().toISOString()
      }
      
      // Save to KV store
      await safeKV.set(`user:${userData.id}`, userData)
      await safeKV.set(`user:email:${userData.email}`, userData.id)
      if (userData.username) {
        await safeKV.set(`user:username:${userData.username}`, userData.id)
      }
      
      if (isAdmin) {
        console.log('🔐 Auto-promoted admin user to admin role on signin:', data.user.email)
      }
    } else {
      // Update last login
      userData.lastLoginAt = new Date().toISOString()
      
      // Check for admin promotion
      if ((data.user.email === 'ommzadeh@gmail.com' || data.user.id === 'user_93ijk5a5h') && userData.role !== 'admin') {
        console.log('🔐 Auto-promoting existing user to admin role on signin:', data.user.email)
        userData.role = 'admin'
      }
      
      await safeKV.set(`user:${userData.id}`, userData)
    }
    
    return c.json({
      access_token: data.session.access_token,
      user: userData
    })
  } catch (error) {
    console.error('Signin error:', error)
    return c.json({ error: 'Internal server error during signin' }, 500)
  }
})

// Auth profile endpoint
app.get('/make-server-e5dee741/auth/profile', async (c) => {
  const user = await getAuthenticatedUser(c.req)
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  try {
    console.log('📋 Fetching user profile for:', user.id, user.email)
    
    // Check KV store for existing profile
    const kvUserData = await safeKV.get(`user:${user.id}`)
    
    if (kvUserData) {
      // Check if this user should be auto-promoted to admin
      if ((user.email === 'ommzadeh@gmail.com' || user.id === 'user_93ijk5a5h') && kvUserData.role !== 'admin') {
        console.log('🔐 Auto-promoting existing KV user to admin role for:', user.id, user.email)
        kvUserData.role = 'admin'
        await safeKV.set(`user:${user.id}`, kvUserData)
        console.log('✅ Successfully updated admin role in KV store')
      }
      
      // Update last access
      kvUserData.lastAccessAt = new Date().toISOString()
      await safeKV.set(`user:${user.id}`, kvUserData)
      
      return c.json({ user: kvUserData })
    }
    
    // Create profile from auth data if not found
    console.log('No profile found, creating from auth metadata...')
    
    // Auto-promote admin email/ID to admin role
    const isAdmin = user.email === 'ommzadeh@gmail.com' || user.id === 'user_93ijk5a5h'
    
    const newUserData = {
      id: user.id,
      username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
      email: user.email || '',
      name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
      role: isAdmin ? 'admin' : 'user',
      authProvider: user.app_metadata?.provider || 'email',
      createdAt: user.created_at || new Date().toISOString(),
      isBlocked: false,
      lastAccessAt: new Date().toISOString()
    }
    
    if (isAdmin) {
      console.log('🔐 Auto-promoting admin user to admin role for new user:', user.id, user.email)
    }
    
    // Save to KV store
    await safeKV.set(`user:${user.id}`, newUserData)
    await safeKV.set(`user:email:${user.email}`, user.id)
    if (newUserData.username) {
      await safeKV.set(`user:username:${newUserData.username}`, user.id)
    }
    
    console.log('✅ User profile created in KV store')
    return c.json({ user: newUserData })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return c.json({ error: 'Failed to fetch user profile' }, 500)
  }
})

// Google OAuth user creation/update endpoint
app.post('/make-server-e5dee741/auth/google-user', async (c) => {
  const user = await getAuthenticatedUser(c.req)
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  try {
    const { username, name } = await c.req.json()
    
    // Check if username is taken in profiles table
    if (username) {
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .maybeSingle()
      
      if (existingUser && existingUser.id !== user.id) {
        return c.json({ error: 'Username already taken' }, 400)
      }
    }
    
    const finalUsername = username || user.email?.split('@')[0] || 'user'
    const finalName = name || user.user_metadata?.full_name || user.user_metadata?.name || 'User'
    
    // Try to update existing profile or create new one
    const { data: profile, error: upsertError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        username: finalUsername,
        email: user.email || '',
        name: finalName,
        role: 'user',
        auth_provider: 'google',
        picture: user.user_metadata?.avatar_url || user.user_metadata?.picture,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
      .select()
      .single()
    
    if (upsertError) {
      console.error('Profile upsert error:', upsertError)
      return c.json({ error: 'Failed to create/update profile' }, 500)
    }
    
    // Create user data in our format
    const userData = {
      id: profile.id,
      username: profile.username,
      email: profile.email,
      name: profile.name,
      role: profile.role,
      authProvider: profile.auth_provider,
      createdAt: profile.created_at,
      isBlocked: profile.is_blocked,
      picture: profile.picture
    }
    
    // Also store in KV for backward compatibility
    console.log('💾 Google user - storing in KV store...')
    await safeKV.set(`user:${user.id}`, userData)
    if (finalUsername) {
      await safeKV.set(`user:username:${finalUsername}`, user.id)
      console.log(`✅ Google user KV keys created: user:${user.id}, user:username:${finalUsername}, user:email:${user.email}`)
    } else {
      console.log(`✅ Google user KV keys created: user:${user.id}, user:email:${user.email}`)
    }
    await safeKV.set(`user:email:${user.email}`, user.id)
    
    return c.json({ 
      message: 'Google user created/updated successfully',
      user: userData 
    })
  } catch (error) {
    console.error('Google user creation error:', error)
    return c.json({ error: 'Failed to create/update Google user' }, 500)
  }
})

// Signout
app.post('/make-server-e5dee741/auth/signout', async (c) => {
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      return c.json({ error: error.message }, 400)
    }
    
    return c.json({ message: 'Signed out successfully' })
  } catch (error) {
    console.error('Signout error:', error)
    return c.json({ error: 'Internal server error during signout' }, 500)
  }
})

// Duplicate profile endpoint removed - using the one above with proper error handling

// Accept terms and conditions
app.post('/make-server-e5dee741/users/:userId/accept-terms', async (c) => {
  try {
    const userId = c.req.param('userId')
    const { version, acceptedAt } = await c.req.json()
    
    // Get existing user data
    const userData = await kv.get(`user:${userId}`)
    if (!userData) {
      return c.json({ error: 'User not found' }, 404)
    }
    
    // Update user with terms acceptance
    const updatedUser = {
      ...userData,
      termsAccepted: {
        accepted: true,
        acceptedAt: new Date(acceptedAt),
        version: version || '1.0',
        ipAddress: c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown'
      }
    }
    
    await kv.set(`user:${userId}`, updatedUser)
    
    return c.json({ 
      message: 'Terms accepted successfully',
      user: updatedUser 
    })
  } catch (error) {
    console.error('Terms acceptance error:', error)
    return c.json({ error: 'Internal server error during terms acceptance' }, 500)
  }
})

// Ads Routes
app.get('/make-server-e5dee741/ads', async (c) => {
  try {
    const { category, country, city, featured, limit = '20', offset = '0' } = c.req.query()
    
    // Build query key for ads
    let queryKey = 'ads:all'
    if (category && category !== 'all') queryKey += `:category:${category}`
    if (country && country !== 'all') queryKey += `:country:${country}`
    if (city && city !== 'all') queryKey += `:city:${city}`
    if (featured === 'true') queryKey += ':featured'
    
    // Get ads from KV store
    const ads = await kv.getByPrefix('ad:')
    
    // Filter and sort ads
    let filteredAds = ads.filter(ad => {
      if (!ad || ad.status !== 'approved') return false
      if (category && category !== 'all' && ad.category !== category) return false
      if (country && country !== 'all' && ad.location?.country !== country) return false
      if (city && city !== 'all' && ad.location?.city !== city) return false
      if (featured === 'true' && !ad.featured) return false
      
      // Check if featured ad hasn't expired
      if (ad.featured && ad.featuredUntil && new Date(ad.featuredUntil) < new Date()) {
        ad.featured = false
        kv.set(`ad:${ad.id}`, ad) // Update the ad
      }
      
      return true
    })
    
    console.log(`📊 Homepage ads: ${filteredAds.length} approved ads found`)
    
    // Sort by featured first, then by date
    filteredAds.sort((a, b) => {
      if (a.featured && !b.featured) return -1
      if (!a.featured && b.featured) return 1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
    
    // Implement pagination
    const startIndex = parseInt(offset)
    const endIndex = startIndex + parseInt(limit)
    const paginatedAds = filteredAds.slice(startIndex, endIndex)
    
    return c.json({
      ads: paginatedAds,
      totalCount: filteredAds.length,
      hasMore: endIndex < filteredAds.length
    })
  } catch (error) {
    console.error('Get ads error:', error)
    return c.json({ error: 'Failed to fetch ads' }, 500)
  }
})

app.get('/make-server-e5dee741/ads/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const ad = await kv.get(`ad:${id}`)
    
    if (!ad) {
      return c.json({ error: 'Ad not found' }, 404)
    }
    
    // Increment view count
    ad.views = (ad.views || 0) + 1
    await kv.set(`ad:${id}`, ad)
    
    return c.json({ ad })
  } catch (error) {
    console.error('Get ad error:', error)
    return c.json({ error: 'Failed to fetch ad' }, 500)
  }
})

app.post('/make-server-e5dee741/ads', async (c) => {
  const user = await getAuthenticatedUser(c.req)
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  try {
    const adData = await c.req.json()
    const userData = await kv.get(`user:${user.id}`)
    
    // Check if user is admin - admins bypass payment
    const isAdmin = userData?.role === 'admin'
    
    const ad = {
      id: crypto.randomUUID(),
      ...adData,
      userId: user.id,
      username: userData?.username || user.email,
      userEmail: user.email,
      status: isAdmin ? 'approved' : 'pending_payment', // Admin ads auto-approved, regular ads pending payment
      featured: isAdmin ? (adData.featured || false) : false, // Only admin can set featured directly
      urgent: adData.urgent || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      views: 0,
      paymentStatus: isAdmin ? 'completed' : 'pending' // Admin ads don't need payment
    }
    
    await kv.set(`ad:${ad.id}`, ad)
    await kv.set(`user:${user.id}:ads:${ad.id}`, ad.id)
    
    console.log(`✅ Ad created: ${ad.id} - Status: ${ad.status}, PaymentStatus: ${ad.paymentStatus}, IsAdmin: ${isAdmin}`)
    console.log(`📝 Ad stored with userId: ${ad.userId}, userEmail: ${ad.userEmail}`)
    console.log(`🔍 Auth user details: id=${user.id}, email=${user.email}`)
    
    return c.json({ ad, message: 'Ad created successfully' })
  } catch (error) {
    console.error('Create ad error:', error)
    return c.json({ error: 'Failed to create ad' }, 500)
  }
})

// First upload endpoint removed - using the more robust second implementation below

// Update existing ad
app.put('/make-server-e5dee741/ads/:id', async (c) => {
  const user = await getAuthenticatedUser(c.req)
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  try {
    const adId = c.req.param('id')
    const updateData = await c.req.json()
    
    // Get existing ad
    const existingAd = await kv.get(`ad:${adId}`)
    
    if (!existingAd) {
      return c.json({ error: 'Ad not found' }, 404)
    }
    
    // Check ownership - allow admins to edit any ad
    const userData = await kv.get(`user:${user.id}`)
    const isAdmin = userData?.role === 'admin'
    
    if (!isAdmin && existingAd.userId !== user.id) {
      return c.json({ error: 'Unauthorized to edit this ad' }, 403)
    }
    
    // Update the ad with new data, preserving important fields
    const updatedAd = {
      ...existingAd,
      ...updateData,
      id: adId, // Preserve original ID
      userId: existingAd.userId, // Preserve original owner
      username: existingAd.username, // Preserve original username  
      userEmail: existingAd.userEmail, // Preserve original email
      createdAt: existingAd.createdAt, // Preserve creation date
      views: existingAd.views || 0, // Preserve view count
      featured: existingAd.featured, // Preserve featured status
      featuredUntil: existingAd.featuredUntil, // Preserve featured expiry
      paymentStatus: existingAd.paymentStatus, // Preserve payment status
      updatedAt: new Date().toISOString(), // Update timestamp
      // For admin edits, preserve status, for user edits might need re-approval
      status: isAdmin ? (updateData.status || existingAd.status) : 'approved'
    }
    
    // Save updated ad
    await kv.set(`ad:${adId}`, updatedAd)
    
    console.log(`✏️ Ad ${adId} updated by ${isAdmin ? 'admin' : 'user'} ${user.email}`)
    
    return c.json({ 
      ad: updatedAd, 
      message: 'Ad updated successfully' 
    })
  } catch (error) {
    console.error('Update ad error:', error)
    return c.json({ error: 'Failed to update ad' }, 500)
  }
})

// Boost ad to featured
app.post('/make-server-e5dee741/ads/:id/boost', async (c) => {
  const user = await getAuthenticatedUser(c.req)
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  try {
    const adId = c.req.param('id')
    const ad = await kv.get(`ad:${adId}`)
    
    if (!ad || ad.userId !== user.id) {
      return c.json({ error: 'Ad not found or unauthorized' }, 404)
    }
    
    // Get duration from request body (for testing), default to 1 week
    const body = await c.req.json().catch(() => ({}))
    const durationMinutes = body.durationMinutes || 10080 // 7 days default
    
    // Set featured status
    ad.featured = true
    ad.featuredUntil = new Date(Date.now() + durationMinutes * 60 * 1000).toISOString()
    ad.updatedAt = new Date().toISOString()
    
    console.log('🌟 Ad boosted:', {
      adId,
      featured: ad.featured,
      featuredUntil: ad.featuredUntil,
      durationMinutes
    })
    
    await kv.set(`ad:${adId}`, ad)
    
    return c.json({ ad, message: 'Ad boosted to featured successfully' })
  } catch (error) {
    console.error('Boost ad error:', error)
    return c.json({ error: 'Failed to boost ad' }, 500)
  }
})

// Remove featured status from ad (for testing)
app.post('/make-server-e5dee741/ads/:id/unboost', async (c) => {
  const user = await getAuthenticatedUser(c.req)
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  try {
    const adId = c.req.param('id')
    const ad = await kv.get(`ad:${adId}`)
    
    if (!ad || ad.userId !== user.id) {
      return c.json({ error: 'Ad not found or unauthorized' }, 404)
    }
    
    // Remove featured status
    ad.featured = false
    ad.featuredUntil = undefined
    ad.updatedAt = new Date().toISOString()
    
    await kv.set(`ad:${adId}`, ad)
    
    return c.json({ ad, message: 'Featured status removed successfully' })
  } catch (error) {
    console.error('Unboost ad error:', error)
    return c.json({ error: 'Failed to remove featured status' }, 500)
  }
})

// Get user's ads
app.get('/make-server-e5dee741/users/me/ads', async (c) => {
  const user = await getAuthenticatedUser(c.req)
  if (!user) {
    console.log('❌ getUserAds: No authenticated user found')
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  try {
    console.log('🔍 getUserAds for user:', { id: user.id, email: user.email })
    
    const allAds = await kv.getByPrefix('ad:')
    console.log('📦 Total ads in KV store:', allAds.length)
    
    const userAds = allAds.filter(ad => ad && ad.userId === user.id)
    console.log('📦 Ads for this user:', userAds.length)
    
    if (userAds.length === 0 && allAds.length > 0) {
      // Debug: Show ALL ad userIds to help debug
      const allAdUserIds = allAds.map(ad => ({ 
        id: ad.id, 
        userId: ad.userId, 
        userEmail: ad.userEmail, 
        title: ad.title?.substring(0, 30) + '...',
        createdAt: ad.createdAt
      }))
      console.log('🔍 ALL ads with userIds:', JSON.stringify(allAdUserIds, null, 2))
      console.log('🔍 Looking for userId:', user.id)
      console.log('🔍 userId type:', typeof user.id)
      console.log('🔍 Sample stored userId type:', typeof allAds[0]?.userId)
      
      // Check if any ads have userEmail matching current user
      const emailMatches = allAds.filter(ad => ad.userEmail === user.email)
      console.log('🔍 Ads with matching email:', emailMatches.length)
      if (emailMatches.length > 0) {
        console.log('🔍 Email matching ads userIds:', emailMatches.map(ad => ad.userId))
        console.log('🔍 TEMPORARY FIX: Returning email-matched ads for admin user')
        
        // ADMIN FIX: If email matches admin email, return those ads
        if (user.email === 'ommzadeh@gmail.com') {
          console.log('✅ Admin email detected - returning email-matched ads')
          console.log('📋 Email-matched ads:', emailMatches.map(ad => ({ 
            id: ad.id, 
            title: ad.title?.substring(0, 30), 
            status: ad.status,
            userEmail: ad.userEmail 
          })))
          emailMatches.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          console.log('🚀 ADMIN OVERRIDE: Returning', emailMatches.length, 'email-matched ads')
          return c.json({ ads: emailMatches })
        }
        
        // Also check if user has admin role in KV store
        const userData = await safeKV.get(`user:${user.id}`)
        if (userData?.role === 'admin') {
          console.log('✅ Admin role detected - returning email-matched ads')
          console.log('📋 Email-matched ads:', emailMatches.map(ad => ({ 
            id: ad.id, 
            title: ad.title?.substring(0, 30), 
            status: ad.status,
            userEmail: ad.userEmail 
          })))
          emailMatches.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          console.log('🚀 ADMIN ROLE OVERRIDE: Returning', emailMatches.length, 'email-matched ads')
          return c.json({ ads: emailMatches })
        }
      }
    }
    
    // Sort by creation date (newest first)
    userAds.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    console.log('✅ Returning', userAds.length, 'ads for user')
    return c.json({ ads: userAds })
  } catch (error) {
    console.error('Get user ads error:', error)
    return c.json({ error: 'Failed to fetch user ads' }, 500)
  }
})

// Messages Routes
app.get('/make-server-e5dee741/messages/chats', async (c) => {
  const user = await getAuthenticatedUser(c.req)
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  try {
    const allChats = await kv.getByPrefix('chat:')
    const userChats = allChats.filter(chat => 
      chat && chat.participants.includes(user.id)
    )
    
    // Sort by last activity
    userChats.sort((a, b) => 
      new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    )
    
    return c.json({ chats: userChats })
  } catch (error) {
    console.error('Get chats error:', error)
    return c.json({ error: 'Failed to fetch chats' }, 500)
  }
})

app.get('/make-server-e5dee741/messages/chats/:chatId', async (c) => {
  const user = await getAuthenticatedUser(c.req)
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  try {
    const chatId = c.req.param('chatId')
    const chat = await kv.get(`chat:${chatId}`)
    
    if (!chat || !chat.participants.includes(user.id)) {
      return c.json({ error: 'Chat not found or unauthorized' }, 404)
    }
    
    // Get messages for this chat
    const allMessages = await kv.getByPrefix(`message:${chatId}:`)
    const messages = allMessages.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
    
    return c.json({ chat, messages })
  } catch (error) {
    console.error('Get chat messages error:', error)
    return c.json({ error: 'Failed to fetch chat messages' }, 500)
  }
})

app.post('/make-server-e5dee741/messages/chats/:chatId/messages', async (c) => {
  const user = await getAuthenticatedUser(c.req)
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  try {
    const chatId = c.req.param('chatId')
    const { content } = await c.req.json()
    const userData = await kv.get(`user:${user.id}`)
    
    const chat = await kv.get(`chat:${chatId}`)
    if (!chat || !chat.participants.includes(user.id)) {
      return c.json({ error: 'Chat not found or unauthorized' }, 404)
    }
    
    const message = {
      id: crypto.randomUUID(),
      chatId,
      senderId: user.id,
      senderUsername: userData?.username || user.email,
      receiverId: chat.participants.find(id => id !== user.id),
      content,
      timestamp: new Date().toISOString(),
      isRead: false,
      adId: chat.adId,
      adTitle: chat.adTitle
    }
    
    await kv.set(`message:${chatId}:${message.id}`, message)
    
    // Update chat's last activity and message
    chat.lastMessage = message
    chat.lastActivity = new Date().toISOString()
    await kv.set(`chat:${chatId}`, chat)
    
    return c.json({ message })
  } catch (error) {
    console.error('Send message error:', error)
    return c.json({ error: 'Failed to send message' }, 500)
  }
})

// Create or get existing chat
app.post('/make-server-e5dee741/messages/chats', async (c) => {
  const user = await getAuthenticatedUser(c.req)
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  try {
    const { sellerId, sellerUsername, buyerId, buyerUsername, adId } = await c.req.json()
    
    console.log('🎯 Creating chat with params:', {
      sellerId,
      sellerUsername,
      buyerId: buyerId || user.id,
      buyerUsername,
      adId,
      currentUserId: user.id,
      currentUserEmail: user.email
    })
    
    // Use the provided IDs or fall back to the authenticated user
    const actualBuyerId = buyerId || user.id
    const actualSellerId = sellerId
    
    if (actualSellerId === actualBuyerId) {
      return c.json({ error: 'Cannot start chat with yourself' }, 400)
    }
    
    // Skip profile checks - chat works without database profiles
    console.log('🔍 Skipping profile checks for KV-only chat system...')
    
    // Check if chat already exists between these users for this ad
    const allChats = await kv.getByPrefix('chat:')
    const existingChat = allChats.find(chat => 
      chat && 
      chat.participants.includes(actualBuyerId) && 
      chat.participants.includes(actualSellerId) &&
      chat.adId === adId
    )
    
    if (existingChat) {
      console.log('✅ Found existing chat:', existingChat.id)
      return c.json({ chat: existingChat })
    }
    
    // Get ad data for context
    const adData = adId ? await kv.get(`ad:${adId}`) : null
    
    // Create new chat
    const chat = {
      id: crypto.randomUUID(),
      participants: [actualBuyerId, actualSellerId],
      participantUsernames: [
        buyerUsername || user.email,
        sellerUsername || 'Unknown'
      ],
      lastActivity: new Date().toISOString(),
      adId,
      adTitle: adData?.title,
      isActive: true
    }
    
    await kv.set(`chat:${chat.id}`, chat)
    console.log('✅ Chat created successfully:', chat.id)
    
    return c.json({ chat })
  } catch (error) {
    console.error('❌ Create chat error:', error)
    return c.json({ error: 'Failed to create chat: ' + error.message }, 500)
  }
})

// Mark messages as read
app.post('/make-server-e5dee741/messages/chats/:chatId/read', async (c) => {
  const user = await getAuthenticatedUser(c.req)
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  try {
    const chatId = c.req.param('chatId')
    const chat = await kv.get(`chat:${chatId}`)
    
    if (!chat || !chat.participants.includes(user.id)) {
      return c.json({ error: 'Chat not found or unauthorized' }, 404)
    }
    
    // Get all messages for this chat and mark unread ones as read
    const allMessages = await kv.getByPrefix(`message:${chatId}:`)
    const updates = []
    
    for (const message of allMessages) {
      if (message && message.receiverId === user.id && !message.isRead) {
        message.isRead = true
        updates.push(kv.set(`message:${chatId}:${message.id}`, message))
      }
    }
    
    await Promise.all(updates)
    
    return c.json({ 
      message: 'Messages marked as read',
      updatedCount: updates.length
    })
  } catch (error) {
    console.error('Mark messages as read error:', error)
    return c.json({ error: 'Failed to mark messages as read' }, 500)
  }
})

// Helper function to ensure user profile exists in database
async function ensureUserProfile(userId: string, userEmail?: string) {
  try {
    console.log('🔍 Checking profile for user:', userId, userEmail)
    
    // First check if profile exists in database
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (existingProfile) {
      console.log('✅ Profile exists in database for:', existingProfile.email)
      return existingProfile
    }
    
    // If no profile exists, try to get user from auth.users and create profile
    console.log('🔄 Profile not found, attempting to create...')
    
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId)
    
    if (authError || !authUser?.user) {
      console.log('⚠️ Auth user not found, creating minimal profile with provided email')
      // Create minimal profile with available data
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          username: userEmail ? userEmail.split('@')[0] : `user_${userId.substring(0, 8)}`,
          email: userEmail || `${userId}@unknown.com`,
          name: 'User',
          role: 'user',
          auth_provider: 'unknown'
        })
        .select()
        .single()
      
      if (createError) {
        console.error('❌ Failed to create minimal profile:', createError)
        throw new Error(`Failed to create user profile: ${createError.message}`)
      }
      
      console.log('✅ Created minimal profile for user:', userId)
      return newProfile
    }
    
    // Create profile from auth user data
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        id: authUser.user.id,
        username: authUser.user.user_metadata?.username || authUser.user.email?.split('@')[0] || `user_${userId.substring(0, 8)}`,
        email: authUser.user.email || userEmail || `${userId}@unknown.com`,
        name: authUser.user.user_metadata?.name || authUser.user.user_metadata?.full_name || 'User',
        role: 'user',
        auth_provider: authUser.user.app_metadata?.provider || 'email'
      })
      .select()
      .single()
    
    if (createError) {
      console.error('❌ Failed to create profile from auth user:', createError)
      throw new Error(`Failed to create user profile: ${createError.message}`)
    }
    
    console.log('✅ Created profile from auth user data:', newProfile.email)
    return newProfile
    
  } catch (error) {
    console.error('❌ ensureUserProfile error:', error)
    throw error
  }
}

// Helper function to check admin access
async function requireAdminAccess(c: any) {
  try {
    if (!c || !c.req) {
      console.error('❌ requireAdminAccess: Invalid context object')
      return { error: c?.json ? c.json({ error: 'Invalid request' }, 400) : null }
    }
    
    const user = await getAuthenticatedUser(c.req)
    if (!user) {
      return { error: c.json({ error: 'Unauthorized' }, 401) }
    }
    
    console.log('🔐 requireAdminAccess: Checking admin access for user:', user.id, user.email)
    
    let userData = await safeKV.get(`user:${user.id}`)
    console.log('🔐 Current userData role:', userData?.role)
    
    // Auto-promote admin email and user ID
    if ((user.email === 'ommzadeh@gmail.com' || user.id === 'user_93ijk5a5h') && (!userData || userData.role !== 'admin')) {
      console.log('🔐 Auto-promoting admin user to admin role in requireAdminAccess:', user.id, user.email)
      
      if (!userData) {
        // Create new user profile
        userData = {
          id: user.id,
          username: user.email?.split('@')[0] || 'admin',
          email: user.email || '',
          name: user.user_metadata?.full_name || user.user_metadata?.name || 'Admin',
          role: 'admin',
          authProvider: user.app_metadata?.provider || 'email',
          createdAt: user.created_at || new Date().toISOString(),
          isBlocked: false
        }
      } else {
        userData.role = 'admin'
      }
      
      await safeKV.set(`user:${user.id}`, userData)
      console.log('✅ Admin email promoted to admin role')
    }
    
    if (!userData || userData.role !== 'admin') {
      console.log('❌ Access denied - user role:', userData?.role, 'required: admin')
      return { error: c.json({ error: 'Admin access required' }, 403) }
    }
    
    console.log('✅ Admin access granted')
    
    return { user, userData }
  } catch (error) {
    console.error('❌ requireAdminAccess error:', error)
    return { error: c?.json ? c.json({ error: 'Internal server error' }, 500) : null }
  }
}

// Admin Routes

// Dashboard stats
app.get('/make-server-e5dee741/admin/stats', async (c) => {
  const auth = await requireAdminAccess(c)
  if (auth.error) return auth.error
  
  try {
    const [allAds, allUsers, allChats, allPayments] = await Promise.all([
      kv.getByPrefix('ad:'),
      kv.getByPrefix('user:'),
      kv.getByPrefix('chat:'),
      kv.getByPrefix('payment:')
    ])
    
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    
    // Filter valid data
    const validUsers = allUsers.filter(user => user && user.id && !user.id.includes(':'))
    const validAds = allAds.filter(ad => ad && ad.id)
    const validPayments = allPayments.filter(payment => payment && payment.id)
    
    // Calculate revenue
    const completedPayments = validPayments.filter(p => p.status === 'completed')
    const totalRevenue = completedPayments.reduce((sum, p) => sum + (p.amount || 0), 0) / 100 // Convert cents to dollars
    const monthlyRevenue = completedPayments
      .filter(p => new Date(p.completedAt || p.createdAt) >= thisMonth)
      .reduce((sum, p) => sum + (p.amount || 0), 0) / 100
    
    // User analytics
    const activeUsers = validUsers.filter(u => !u.isBlocked).length
    const newUsersToday = validUsers.filter(u => {
      const userDate = new Date(u.createdAt)
      return userDate >= today
    }).length
    const newUsersThisMonth = validUsers.filter(u => {
      const userDate = new Date(u.createdAt)
      return userDate >= thisMonth
    }).length
    
    // Ad analytics
    const activeAds = validAds.filter(ad => ad.status === 'approved').length
    const pendingAds = validAds.filter(ad => ad.status === 'pending').length
    const rejectedAds = validAds.filter(ad => ad.status === 'rejected').length
    const featuredAds = validAds.filter(ad => ad.featured).length
    const adsToday = validAds.filter(ad => {
      const adDate = new Date(ad.createdAt)
      return adDate >= today
    }).length
    
    // Country analytics
    const usersByCountry = validUsers.reduce((acc, user) => {
      const country = user.location?.country || 'Unknown'
      acc[country] = (acc[country] || 0) + 1
      return acc
    }, {})
    
    const adsByCountry = validAds.reduce((acc, ad) => {
      const country = ad.location?.country || 'Unknown'
      acc[country] = (acc[country] || 0) + 1
      return acc
    }, {})
    
    // Category analytics
    const adsByCategory = validAds.reduce((acc, ad) => {
      const category = ad.category || 'Unknown'
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {})
    
    const stats = {
      // Overview
      totalUsers: validUsers.length,
      activeUsers,
      newUsersToday,
      newUsersThisMonth,
      
      // Ads
      totalAds: validAds.length,
      activeAds,
      pendingAds,
      rejectedAds,
      featuredAds,
      adsToday,
      
      // Revenue
      totalRevenue,
      monthlyRevenue,
      totalPayments: validPayments.length,
      
      // Communication
      totalChats: allChats.length,
      
      // Analytics
      usersByCountry: Object.entries(usersByCountry)
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count),
      adsByCountry: Object.entries(adsByCountry)
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => b.count - a.count),
      adsByCategory: Object.entries(adsByCategory)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
    }
    
    return c.json({ stats })
  } catch (error) {
    console.error('Get admin stats error:', error)
    return c.json({ error: 'Failed to fetch admin stats' }, 500)
  }
})

// User management
app.get('/make-server-e5dee741/admin/users', async (c) => {
  const auth = await requireAdminAccess(c)
  if (auth.error) return auth.error
  
  try {
    const { page = '1', limit = '20', search = '', status = '' } = c.req.query()
    
    const allUsers = await kv.getByPrefix('user:')
    console.log('👥 Raw users from KV store:', allUsers.length)
    console.log('👥 Sample user keys:', allUsers.map(u => u?.id || 'no-id').slice(0, 5))
    
    const validUsers = allUsers.filter(user => user && user.id && !user.id.includes(':'))
    console.log('👥 Valid users after filtering:', validUsers.length)
    console.log('👥 Valid user details:', validUsers.map(u => ({ 
      id: u.id, 
      email: u.email, 
      username: u.username,
      name: u.name 
    })))
    
    // Filter users
    let filteredUsers = validUsers
    
    if (search) {
      const searchLower = search.toLowerCase()
      filteredUsers = filteredUsers.filter(user => 
        user.username?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.name?.toLowerCase().includes(searchLower)
      )
    }
    
    if (status) {
      filteredUsers = filteredUsers.filter(user => {
        if (status === 'active') return !user.isBlocked
        if (status === 'blocked') return user.isBlocked
        return true
      })
    }
    
    // Sort by creation date (newest first)
    filteredUsers.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
    
    // Pagination
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const startIndex = (pageNum - 1) * limitNum
    const endIndex = startIndex + limitNum
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex)
    
    // Get user ad counts
    const allAds = await kv.getByPrefix('ad:')
    const userAdCounts = {}
    allAds.forEach(ad => {
      if (ad && ad.userId) {
        userAdCounts[ad.userId] = (userAdCounts[ad.userId] || 0) + 1
      }
    })
    
    const usersWithStats = paginatedUsers.map(user => ({
      ...user,
      adsPosted: userAdCounts[user.id] || 0
    }))
    
    return c.json({
      users: usersWithStats,
      totalCount: filteredUsers.length,
      currentPage: pageNum,
      totalPages: Math.ceil(filteredUsers.length / limitNum),
      hasMore: endIndex < filteredUsers.length
    })
  } catch (error) {
    console.error('Get admin users error:', error)
    return c.json({ error: 'Failed to fetch users' }, 500)
  }
})

// Block/unblock user
app.put('/make-server-e5dee741/admin/users/:userId/status', async (c) => {
  const auth = await requireAdminAccess(c)
  if (auth.error) return auth.error
  
  try {
    const userId = c.req.param('userId')
    const { isBlocked, reason } = await c.req.json()
    
    const user = await kv.get(`user:${userId}`)
    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }
    
    if (user.role === 'admin') {
      return c.json({ error: 'Cannot block admin users' }, 400)
    }
    
    const updatedUser = {
      ...user,
      isBlocked,
      blockReason: isBlocked ? reason : undefined,
      blockedAt: isBlocked ? new Date().toISOString() : undefined,
      blockedBy: isBlocked ? auth.userData.username : undefined
    }
    
    await kv.set(`user:${userId}`, updatedUser)
    
    return c.json({
      message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
      user: updatedUser
    })
  } catch (error) {
    console.error('Update user status error:', error)
    return c.json({ error: 'Failed to update user status' }, 500)
  }
})

// Update user role
app.put('/make-server-e5dee741/admin/users/:userId/role', async (c) => {
  const auth = await requireAdminAccess(c)
  if (auth.error) return auth.error
  
  try {
    const userId = c.req.param('userId')
    const { role } = await c.req.json()
    
    if (!['user', 'admin'].includes(role)) {
      return c.json({ error: 'Invalid role' }, 400)
    }
    
    const user = await kv.get(`user:${userId}`)
    if (!user) {
      return c.json({ error: 'User not found' }, 404)
    }
    
    const updatedUser = {
      ...user,
      role,
      roleUpdatedAt: new Date().toISOString(),
      roleUpdatedBy: auth.userData.username
    }
    
    await kv.set(`user:${userId}`, updatedUser)
    
    return c.json({
      message: `User role updated to ${role} successfully`,
      user: updatedUser
    })
  } catch (error) {
    console.error('Update user role error:', error)
    return c.json({ error: 'Failed to update user role' }, 500)
  }
})

// Ad moderation
app.get('/make-server-e5dee741/admin/ads', async (c) => {
  const auth = await requireAdminAccess(c)
  if (auth.error) return auth.error
  
  try {
    const { page = '1', limit = '20', status = '', category = '', search = '' } = c.req.query()
    
    const allAds = await kv.getByPrefix('ad:')
    let filteredAds = allAds.filter(ad => ad && ad.id)
    
    // Filter by status
    if (status) {
      filteredAds = filteredAds.filter(ad => ad.status === status)
    }
    
    // Filter by category
    if (category && category !== 'all') {
      filteredAds = filteredAds.filter(ad => ad.category === category)
    }
    
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filteredAds = filteredAds.filter(ad =>
        ad.title?.toLowerCase().includes(searchLower) ||
        ad.description?.toLowerCase().includes(searchLower) ||
        ad.username?.toLowerCase().includes(searchLower)
      )
    }
    
    // Sort by creation date (newest first)
    filteredAds.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    // Pagination
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const startIndex = (pageNum - 1) * limitNum
    const endIndex = startIndex + limitNum
    const paginatedAds = filteredAds.slice(startIndex, endIndex)
    
    return c.json({
      ads: paginatedAds,
      totalCount: filteredAds.length,
      currentPage: pageNum,
      totalPages: Math.ceil(filteredAds.length / limitNum),
      hasMore: endIndex < filteredAds.length
    })
  } catch (error) {
    console.error('Get admin ads error:', error)
    return c.json({ error: 'Failed to fetch ads' }, 500)
  }
})

// Update ad status
app.put('/make-server-e5dee741/admin/ads/:adId/status', async (c) => {
  const auth = await requireAdminAccess(c)
  if (auth.error) return auth.error
  
  try {
    const adId = c.req.param('adId')
    const { status, reason } = await c.req.json()
    
    if (!['pending', 'approved', 'rejected', 'under_review'].includes(status)) {
      return c.json({ error: 'Invalid status' }, 400)
    }
    
    const ad = await kv.get(`ad:${adId}`)
    if (!ad) {
      return c.json({ error: 'Ad not found' }, 404)
    }
    
    const updatedAd = {
      ...ad,
      status,
      moderationReason: status === 'rejected' ? reason : undefined,
      moderatedAt: new Date().toISOString(),
      moderatedBy: auth.userData.username
    }
    
    await kv.set(`ad:${adId}`, updatedAd)
    
    return c.json({
      message: `Ad ${status} successfully`,
      ad: updatedAd
    })
  } catch (error) {
    console.error('Update ad status error:', error)
    return c.json({ error: 'Failed to update ad status' }, 500)
  }
})

// Delete ad
app.delete('/make-server-e5dee741/admin/ads/:adId', async (c) => {
  const auth = await requireAdminAccess(c)
  if (auth.error) return auth.error
  
  try {
    const adId = c.req.param('adId')
    
    const ad = await kv.get(`ad:${adId}`)
    if (!ad) {
      return c.json({ error: 'Ad not found' }, 404)
    }
    
    // Delete the ad
    await kv.del(`ad:${adId}`)
    
    // Also remove from user's ads if exists
    if (ad.userId) {
      await kv.del(`user:${ad.userId}:ads:${adId}`)
    }
    
    return c.json({ message: 'Ad deleted successfully' })
  } catch (error) {
    console.error('Delete ad error:', error)
    return c.json({ error: 'Failed to delete ad' }, 500)
  }
})

// Analytics - Revenue data
app.get('/make-server-e5dee741/admin/analytics/revenue', async (c) => {
  const auth = await requireAdminAccess(c)
  if (auth.error) return auth.error
  
  try {
    const { period = '30d' } = c.req.query()
    
    const allPayments = await kv.getByPrefix('payment:')
    const completedPayments = allPayments.filter(p => p && p.status === 'completed')
    
    const now = new Date()
    let startDate: Date
    
    switch (period) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        break
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        break
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    }
    
    const periodPayments = completedPayments.filter(p => {
      const paymentDate = new Date(p.completedAt || p.createdAt)
      return paymentDate >= startDate
    })
    
    // Group by day
    const revenueByDay = {}
    periodPayments.forEach(payment => {
      const date = new Date(payment.completedAt || payment.createdAt).toISOString().split('T')[0]
      revenueByDay[date] = (revenueByDay[date] || 0) + (payment.amount || 0) / 100
    })
    
    // Group by payment type
    const revenueByType = periodPayments.reduce((acc, payment) => {
      const type = payment.type || 'unknown'
      acc[type] = (acc[type] || 0) + (payment.amount || 0) / 100
      return acc
    }, {})
    
    return c.json({
      totalRevenue: periodPayments.reduce((sum, p) => sum + (p.amount || 0), 0) / 100,
      revenueByDay: Object.entries(revenueByDay).map(([date, revenue]) => ({ date, revenue })),
      revenueByType: Object.entries(revenueByType).map(([type, revenue]) => ({ type, revenue })),
      totalTransactions: periodPayments.length
    })
  } catch (error) {
    console.error('Get revenue analytics error:', error)
    return c.json({ error: 'Failed to fetch revenue analytics' }, 500)
  }
})

// Admin settings
app.get('/make-server-e5dee741/admin/settings', async (c) => {
  const auth = await requireAdminAccess(c)
  if (auth.error) return auth.error
  
  try {
    // Get platform settings from KV store
    let settings = await kv.get('platform:settings')
    
    if (!settings) {
      // Default settings
      settings = {
        siteName: 'Persian Connect',
        siteDescription: 'The premier Persian marketplace for classified ads',
        maintenanceMode: false,
        registrationsEnabled: true,
        adModerationEnabled: true,
        autoApproveAds: false,
        featuredAdPrice: 10.00,
        adPostingPrice: 2.00,
        maxImagesPerAd: 8,
        adExpirationDays: 30,
        maxAdTitleLength: 100,
        maxAdDescriptionLength: 2000,
        supportEmail: 'support@persian-connect.com',
        termsVersion: '1.0',
        privacyVersion: '1.0',
        updatedAt: new Date().toISOString()
      }
      
      await kv.set('platform:settings', settings)
    }
    
    return c.json({ settings })
  } catch (error) {
    console.error('Get admin settings error:', error)
    return c.json({ error: 'Failed to fetch admin settings' }, 500)
  }
})

// Update admin settings
app.put('/make-server-e5dee741/admin/settings', async (c) => {
  const auth = await requireAdminAccess(c)
  if (auth.error) return auth.error
  
  try {
    const updates = await c.req.json()
    
    // Get current settings
    let settings = await kv.get('platform:settings') || {}
    
    // Update settings
    const updatedSettings = {
      ...settings,
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: auth.userData.username
    }
    
    await kv.set('platform:settings', updatedSettings)
    
    return c.json({
      message: 'Settings updated successfully',
      settings: updatedSettings
    })
  } catch (error) {
    console.error('Update admin settings error:', error)
    return c.json({ error: 'Failed to update admin settings' }, 500)
  }
})

// System settings
app.get('/make-server-e5dee741/admin/settings', async (c) => {
  const auth = await requireAdminAccess(c)
  if (auth.error) return auth.error
  
  try {
    const settings = await kv.get('system:settings') || {
      adPostingPrice: 200, // $2.00 in cents
      adBoostPrice: 1000, // $10.00 in cents
      adExpiryDays: 30,
      featuredAdDays: 7,
      autoApproveAds: false,
      maintenanceMode: false,
      maxImagesPerAd: 5,
      maxAdDescriptionLength: 1000
    }
    
    return c.json({ settings })
  } catch (error) {
    console.error('Get settings error:', error)
    return c.json({ error: 'Failed to fetch settings' }, 500)
  }
})

// Update system settings
app.put('/make-server-e5dee741/admin/settings', async (c) => {
  const auth = await requireAdminAccess(c)
  if (auth.error) return auth.error
  
  try {
    const newSettings = await c.req.json()
    
    const currentSettings = await kv.get('system:settings') || {}
    const updatedSettings = {
      ...currentSettings,
      ...newSettings,
      updatedAt: new Date().toISOString(),
      updatedBy: auth.userData.username
    }
    
    await kv.set('system:settings', updatedSettings)
    
    return c.json({
      message: 'Settings updated successfully',
      settings: updatedSettings
    })
  } catch (error) {
    console.error('Update settings error:', error)
    return c.json({ error: 'Failed to update settings' }, 500)
  }
})

// File upload endpoint - handles both FormData and binary uploads
app.post('/make-server-e5dee741/upload', async (c) => {
  const user = await getAuthenticatedUser(c.req)
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  try {
    console.log('📤 Processing file upload request...')
    console.log('📋 Content-Type:', c.req.header('content-type'))
    
    let body: ArrayBuffer
    let fileName: string = 'unknown'
    let fileSize: number = 0
    let mimeType: string = 'image/jpeg'
    const { type = 'ad-image' } = c.req.query()
    
    // Check if it's FormData or binary upload
    const contentType = c.req.header('content-type') || ''
    
    if (contentType.includes('multipart/form-data')) {
      console.log('📦 Handling FormData upload')
      // Handle FormData upload
      const formData = await c.req.formData()
      const file = formData.get('file') as File
      
      if (!file) {
        return c.json({ error: 'No file provided in FormData' }, 400)
      }
      
      fileName = file.name
      fileSize = file.size
      mimeType = file.type
      body = await file.arrayBuffer()
      
      console.log(`📁 FormData file: ${fileName} (${fileSize} bytes, ${mimeType})`)
    } else {
      console.log('📦 Handling binary upload')
      // Handle binary upload
      body = await c.req.arrayBuffer()
      fileSize = body.byteLength
      fileName = `upload-${Date.now()}`
    }
    
    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (fileSize > maxSize) {
      return c.json({ error: 'File size too large. Maximum allowed size is 10MB.' }, 400)
    }
    
    // Validate file type for FormData uploads
    if (contentType.includes('multipart/form-data')) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!validTypes.includes(mimeType)) {
        return c.json({ error: 'Invalid file type. Please upload JPEG, PNG, GIF, or WebP images only.' }, 400)
      }
    }
    
    console.log('📁 Processing file upload for user:', user.id, 'type:', type, 'size:', fileSize, 'name:', fileName)
    
    let bucketName = 'make-e5dee741-ad-images'
    if (type === 'avatar') {
      bucketName = 'make-e5dee741-user-avatars'
    } else if (type === 'video') {
      bucketName = 'make-e5dee741-ad-videos'
    }
    
    const fileName = `${user.id}/${Date.now()}-${crypto.randomUUID()}`
    
    // For demo reliability, convert to base64 and store that in KV
    // This avoids CORS issues with signed URLs
    try {
      console.log('🔄 Attempting base64 conversion for file size:', body.byteLength)
      
      // Convert ArrayBuffer to base64 using a more robust method
      const uint8Array = new Uint8Array(body)
      
      // For large files, process in chunks to avoid memory issues
      let base64String = ''
      const chunkSize = 8192 // 8KB chunks
      
      if (uint8Array.length <= chunkSize) {
        // Small file - convert directly
        base64String = btoa(String.fromCharCode.apply(null, Array.from(uint8Array)))
      } else {
        // Large file - process in chunks
        const chunks = []
        for (let i = 0; i < uint8Array.length; i += chunkSize) {
          const chunk = uint8Array.slice(i, i + chunkSize)
          chunks.push(String.fromCharCode.apply(null, Array.from(chunk)))
        }
        base64String = btoa(chunks.join(''))
      }
      
      // For binary uploads, determine MIME type from file headers
      if (!contentType.includes('multipart/form-data') && uint8Array.length >= 4) {
        const header = Array.from(uint8Array.slice(0, 4)).map(b => b.toString(16).padStart(2, '0')).join('')
        console.log('📝 File header detection:', header)
        
        if (header.startsWith('89504e47')) {
          mimeType = 'image/png'
        } else if (header.startsWith('ffd8ff')) {
          mimeType = 'image/jpeg'
        } else if (header.startsWith('47494638')) {
          mimeType = 'image/gif'
        } else if (header.startsWith('52494646')) {
          mimeType = 'image/webp'
        }
      }
      
      const dataUrl = `data:${mimeType};base64,${base64String}`
      
      // Validate the data URL length is reasonable (not too large for storage)
      if (dataUrl.length > 10 * 1024 * 1024) { // 10MB limit
        throw new Error(`File too large for base64 conversion: ${dataUrl.length} bytes`)
      }
      
      // Store metadata in KV for potential future retrieval
      await kv.set(`file:${fileName}`, {
        fileName,
        mimeType,
        userId: user.id,
        type,
        uploadedAt: new Date().toISOString(),
        size: fileSize,
        base64Size: dataUrl.length
      })
      
      console.log('✅ File converted to base64 successfully!')
      console.log('📏 Original size:', fileSize, 'Base64 size:', dataUrl.length)
      console.log('🎯 MIME type detected:', mimeType)
      
      return c.json({ 
        url: dataUrl,
        filename: fileName,
        path: fileName,
        mimeType: mimeType,
        type: mimeType,
        size: fileSize,
        originalSize: body.byteLength,
        base64Size: dataUrl.length,
        uploadedAt: new Date().toISOString()
      })
      
    } catch (conversionError) {
      console.log('⚠️ Base64 conversion failed:', conversionError)
      console.log('📋 Falling back to Supabase Storage...')
      
      // Fallback to Supabase Storage with signed URL
      console.log('📤 Uploading to Supabase bucket:', bucketName)
      
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, body)
      
      if (error) {
        console.error('❌ Supabase upload error:', error)
        return c.json({ error: 'Failed to upload file to storage' }, 500)
      }
      
      console.log('✅ Supabase upload successful, file data:', data)
      
      // Get signed URL for the uploaded file
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(fileName, 60 * 60 * 24 * 365) // 1 year expiry
      
      if (signedUrlError) {
        console.error('❌ Signed URL creation error:', signedUrlError)
        return c.json({ error: 'Failed to create signed URL' }, 500)
      }
      
      console.log('📤 Signed URL created successfully')
      console.log('🔗 Signed URL:', signedUrlData?.signedUrl?.substring(0, 100) + '...')
      
      // Validate the signed URL before returning
      if (!signedUrlData?.signedUrl || typeof signedUrlData.signedUrl !== 'string') {
        console.error('❌ Invalid signed URL format:', signedUrlData)
        return c.json({ error: 'Invalid signed URL generated' }, 500)
      }
      
      return c.json({ 
        url: signedUrlData.signedUrl,
        filename: fileName,
        path: fileName,
        mimeType: mimeType,
        type: mimeType,
        size: fileSize,
        uploadedAt: new Date().toISOString(),
        storage: 'supabase'
      })
    }
    
  } catch (error) {
    console.error('Upload error:', error)
    return c.json({ error: 'Failed to upload file' }, 500)
  }
})

// Stripe payment processing
app.post('/make-server-e5dee741/payments/create-checkout-session', async (c) => {
  const user = await getAuthenticatedUser(c.req)
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  try {
    const { adData, totalAmount, includeBoost = false, lineItems } = await c.req.json()
    
    // Validate pricing
    const basePrice = 200; // $2.00 for ad posting
    const boostPrice = 1000; // $10.00 for boost
    const expectedTotal = basePrice + (includeBoost ? boostPrice : 0);
    
    if (totalAmount !== expectedTotal) {
      return c.json({ error: 'Invalid payment amount' }, 400)
    }
    
    // Create payment record
    const payment = {
      id: crypto.randomUUID(),
      userId: user.id,
      adId: adData?.id || crypto.randomUUID(),
      amount: totalAmount,
      currency: 'usd',
      type: includeBoost ? 'ad_posting_with_boost' : 'ad_posting',
      includeBoost,
      lineItems,
      status: 'pending',
      adDuration: 30, // 30 days
      boostDuration: includeBoost ? 7 : 0, // 7 days if boosted
      createdAt: new Date().toISOString()
    }
    
    await kv.set(`payment:${payment.id}`, payment)
    
    console.log(`💰 Creating Stripe session: ${payment.type} - ${(totalAmount/100).toFixed(2)}`, {
      includeBoost,
      userId: user.id,
      adTitle: adData?.title
    })
    
    // Get Stripe secret key
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      console.error('❌ STRIPE_SECRET_KEY not found in environment')
      return c.json({ error: 'Payment service not configured' }, 500)
    }
    
    // Create real Stripe checkout session
    const origin = c.req.header('origin') || 'https://persian-connect.com'
    
    const checkoutSessionData = new URLSearchParams({
      'mode': 'payment',
      'success_url': `${origin}?page=payment-success&session_id={CHECKOUT_SESSION_ID}`,
      'cancel_url': `${origin}?page=payment-failed`,
      'customer_email': user.email,
      'client_reference_id': payment.id,
      'line_items[0][price_data][currency]': 'usd',
      'line_items[0][price_data][product_data][name]': 'Ad Posting - 30 Days',
      'line_items[0][price_data][product_data][description]': `Post your ad: "${adData?.title || 'Classified Ad'}" for 30 days`,
      'line_items[0][price_data][unit_amount]': basePrice.toString(),
      'line_items[0][quantity]': '1',
      'metadata[payment_id]': payment.id,
      'metadata[user_id]': user.id,
      'metadata[ad_id]': payment.adId,
      'metadata[include_boost]': includeBoost.toString(),
    })
    
    if (includeBoost) {
      checkoutSessionData.append('line_items[1][price_data][currency]', 'usd')
      checkoutSessionData.append('line_items[1][price_data][product_data][name]', 'Featured Boost - 7 Days')
      checkoutSessionData.append('line_items[1][price_data][product_data][description]', 'Boost your ad to featured status for 1 week')
      checkoutSessionData.append('line_items[1][price_data][unit_amount]', boostPrice.toString())
      checkoutSessionData.append('line_items[1][quantity]', '1')
    }
    
    const checkoutSession = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: checkoutSessionData
    })
    
    if (!checkoutSession.ok) {
      const errorText = await checkoutSession.text()
      console.error('��� Stripe session creation failed:', errorText)
      return c.json({ error: 'Failed to create payment session' }, 500)
    }
    
    const session = await checkoutSession.json()
    
    // Store session ID for webhook verification
    payment.stripeSessionId = session.id
    await kv.set(`payment:${payment.id}`, payment)
    
    console.log(`✅ Stripe session created: ${session.id}`)
    
    return c.json({
      sessionId: session.id,
      url: session.url,
      paymentId: payment.id
    })
  } catch (error) {
    console.error('Create checkout session error:', error)
    return c.json({ error: 'Failed to create checkout session' }, 500)
  }
})

// Confirm payment (called after successful Stripe checkout)
app.post('/make-server-e5dee741/payments/confirm', async (c) => {
  const user = await getAuthenticatedUser(c.req)
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  try {
    const { sessionId, paymentId } = await c.req.json()
    
    // Get payment record
    const payment = await kv.get(`payment:${paymentId}`)
    if (!payment || payment.userId !== user.id) {
      return c.json({ error: 'Payment not found' }, 404)
    }
    
    // Update payment status
    payment.status = 'completed'
    payment.completedAt = new Date().toISOString()
    payment.stripeSessionId = sessionId
    
    await kv.set(`payment:${paymentId}`, payment)
    
    return c.json({ 
      payment,
      message: 'Payment confirmed successfully' 
    })
  } catch (error) {
    console.error('Confirm payment error:', error)
    return c.json({ error: 'Failed to confirm payment' }, 500)
  }
})

// Create payment record
app.post('/make-server-e5dee741/payments/create', async (c) => {
  const user = await getAuthenticatedUser(c.req)
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  try {
    const paymentData = await c.req.json()
    
    const payment = {
      id: crypto.randomUUID(),
      userId: paymentData.userId || user.id,
      adId: paymentData.adId,
      amount: paymentData.amount,
      currency: paymentData.currency || 'USD',
      type: paymentData.type,
      status: paymentData.status || 'pending',
      createdAt: new Date().toISOString()
    }
    
    await kv.set(`payment:${payment.id}`, payment)
    
    return c.json({ payment })
  } catch (error) {
    console.error('Create payment error:', error)
    return c.json({ error: 'Failed to create payment' }, 500)
  }
})

// Verify payment session (called from payment success page)
app.post('/make-server-e5dee741/payments/verify-session', async (c) => {
  const user = await getAuthenticatedUser(c.req)
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  try {
    const { sessionId, paymentId, adId } = await c.req.json()
    
    console.log('🔍 Verifying payment session:', { sessionId, paymentId, adId, userId: user.id })
    
    // Get payment record
    const payment = await kv.get(`payment:${paymentId}`)
    if (!payment || payment.userId !== user.id) {
      return c.json({ error: 'Payment not found' }, 404)
    }
    
    // Get Stripe secret key for verification
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      console.error('❌ STRIPE_SECRET_KEY not found in environment')
      return c.json({ error: 'Payment verification not configured' }, 500)
    }
    
    // Verify with Stripe
    const stripeResponse = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
      },
    })
    
    if (!stripeResponse.ok) {
      console.error('❌ Stripe session verification failed')
      return c.json({ error: 'Failed to verify payment with Stripe' }, 500)
    }
    
    const stripeSession = await stripeResponse.json()
    
    // Check if payment was successful
    if (stripeSession.payment_status === 'paid') {
      console.log('✅ Payment verified with Stripe - updating records...')
      
      // Update payment status
      payment.status = 'completed'
      payment.completedAt = new Date().toISOString()
      payment.stripeSessionId = sessionId
      await kv.set(`payment:${paymentId}`, payment)
      
      // Activate the ad
      const ad = await kv.get(`ad:${adId}`)
      if (ad) {
        console.log('📢 Activating ad after successful payment...')
        
        // Handle different payment types
        if (payment.type === 'ad_boost') {
          // This is a boost payment - mark ad as featured
          console.log('🌟 Boosting existing ad to featured status')
          ad.featured = true
          ad.featuredUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          ad.boostPaymentId = paymentId
        } else {
          // This is a regular ad posting payment
          ad.status = 'approved'
          ad.paymentStatus = 'completed'
          ad.paymentId = paymentId
          ad.featuredUntil = payment.includeBoost ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : undefined
          ad.featured = !!payment.includeBoost
        }
        
        await kv.set(`ad:${adId}`, ad)
        console.log('✅ Ad activated successfully:', {
          id: ad.id,
          type: payment.type,
          featured: ad.featured,
          featuredUntil: ad.featuredUntil
        })
      } else {
        console.warn('⚠️ Ad not found for activation:', adId)
      }
      
      return c.json({ 
        verified: true, 
        payment,
        ad: ad || null,
        message: 'Payment verified and ad activated' 
      })
    } else {
      console.log('❌ Payment not completed on Stripe side:', stripeSession.payment_status)
      return c.json({ 
        verified: false, 
        error: 'Payment not completed',
        stripeStatus: stripeSession.payment_status
      })
    }
    
  } catch (error) {
    console.error('❌ Payment verification error:', error)
    return c.json({ error: 'Failed to verify payment' }, 500)
  }
})

// Handle payment failure/cancellation
app.post('/make-server-e5dee741/payments/handle-failure', async (c) => {
  const user = await getAuthenticatedUser(c.req)
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  try {
    const { sessionId, paymentId, adId, reason = 'cancelled' } = await c.req.json()
    
    console.log('❌ Handling payment failure:', { sessionId, paymentId, adId, reason, userId: user.id })
    
    // Update payment status to failed
    const payment = await kv.get(`payment:${paymentId}`)
    if (payment && payment.userId === user.id) {
      payment.status = 'failed'
      payment.failReason = reason
      payment.failedAt = new Date().toISOString()
      payment.stripeSessionId = sessionId
      await kv.set(`payment:${paymentId}`, payment)
      console.log('💾 Payment marked as failed')
    }
    
    // Handle the associated ad
    const ad = await kv.get(`ad:${adId}`)
    if (ad && ad.userId === user.id) {
      if (ad.status === 'pending_payment') {
        // Delete the ad completely since payment was not successful
        await kv.del(`ad:${adId}`)
        await kv.del(`user:${user.id}:ads:${adId}`)
        console.log('🗑️ Ad deleted due to payment failure')
      }
    }
    
    return c.json({ 
      success: true,
      message: 'Payment failure handled - ad removed',
      action: 'deleted'
    })
    
  } catch (error) {
    console.error('❌ Payment failure handling error:', error)
    return c.json({ error: 'Failed to handle payment failure' }, 500)
  }
})

// Cleanup expired pending payments (should be run periodically)
app.post('/make-server-e5dee741/payments/cleanup-expired', async (c) => {
  const user = await getAuthenticatedUser(c.req)
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  try {
    // Only allow admin or the user themselves to trigger cleanup
    const userData = await kv.get(`user:${user.id}`)
    const isAdmin = userData?.role === 'admin'
    
    if (!isAdmin) {
      return c.json({ error: 'Admin access required' }, 403)
    }
    
    console.log('🧹 Starting cleanup of expired pending payments...')
    
    // Get all ads with pending_payment status older than 1 hour
    const allAds = await kv.getByPrefix('ad:')
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000) // 1 hour
    
    let cleanedCount = 0
    
    for (const ad of allAds) {
      if (ad && ad.status === 'pending_payment' && new Date(ad.createdAt) < oneHourAgo) {
        console.log(`🗑️ Cleaning up expired pending ad: ${ad.id}`)
        
        // Delete the ad
        await kv.del(`ad:${ad.id}`)
        await kv.del(`user:${ad.userId}:ads:${ad.id}`)
        
        // Mark any associated payment as expired
        const allPayments = await kv.getByPrefix('payment:')
        const relatedPayment = allPayments.find(p => p && p.adId === ad.id)
        if (relatedPayment) {
          relatedPayment.status = 'expired'
          relatedPayment.expiredAt = new Date().toISOString()
          await kv.set(`payment:${relatedPayment.id}`, relatedPayment)
        }
        
        cleanedCount++
      }
    }
    
    console.log(`✅ Cleanup complete: ${cleanedCount} expired ads removed`)
    
    return c.json({ 
      success: true,
      message: `Cleanup complete: ${cleanedCount} expired ads removed`,
      cleanedCount
    })
    
  } catch (error) {
    console.error('❌ Cleanup error:', error)
    return c.json({ error: 'Failed to cleanup expired payments' }, 500)
  }
})

// Update payment status
app.put('/make-server-e5dee741/payments/:paymentId', async (c) => {
  const user = await getAuthenticatedUser(c.req)
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  try {
    const paymentId = c.req.param('paymentId')
    const updates = await c.req.json()
    
    const payment = await kv.get(`payment:${paymentId}`)
    if (!payment) {
      return c.json({ error: 'Payment not found' }, 404)
    }
    
    const updatedPayment = {
      ...payment,
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    await kv.set(`payment:${paymentId}`, updatedPayment)
    
    return c.json({ payment: updatedPayment })
  } catch (error) {
    console.error('Update payment error:', error)
    return c.json({ error: 'Failed to update payment' }, 500)
  }
})

// Get payment by ID
app.get('/make-server-e5dee741/payments/:paymentId', async (c) => {
  const user = await getAuthenticatedUser(c.req)
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  try {
    const paymentId = c.req.param('paymentId')
    const payment = await kv.get(`payment:${paymentId}`)
    
    if (!payment) {
      return c.json({ error: 'Payment not found' }, 404)
    }
    
    return c.json({ payment })
  } catch (error) {
    console.error('Get payment error:', error)
    return c.json({ error: 'Failed to get payment' }, 500)
  }
})

// Create boost checkout session
app.post('/make-server-e5dee741/payments/create-boost-session', async (c) => {
  const user = await getAuthenticatedUser(c.req)
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  try {
    const { adId, adTitle } = await c.req.json()
    
    // Create payment record for boost
    const payment = {
      id: crypto.randomUUID(),
      userId: user.id,
      adId,
      amount: 1000, // $10.00 in cents
      currency: 'usd',
      type: 'ad_boost',
      status: 'pending',
      createdAt: new Date().toISOString()
    }
    
    await kv.set(`payment:${payment.id}`, payment)
    
    console.log(`💰 Creating Stripe boost session for ad: ${adId} - $10.00`, {
      userId: user.id,
      adTitle
    })
    
    // Get Stripe secret key
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      console.error('❌ STRIPE_SECRET_KEY not found in environment')
      return c.json({ error: 'Payment service not configured' }, 500)
    }
    
    // Create real Stripe checkout session for boost
    const origin = c.req.header('origin') || 'https://persian-connect.com'
    
    const checkoutSessionData = new URLSearchParams({
      'mode': 'payment',
      'success_url': `${origin}?page=boost-success&session_id={CHECKOUT_SESSION_ID}`,
      'cancel_url': `${origin}?page=boost-failed`,
      'customer_email': user.email,
      'client_reference_id': payment.id,
      'line_items[0][price_data][currency]': 'usd',
      'line_items[0][price_data][product_data][name]': 'Ad Boost - 7 Days Featured',
      'line_items[0][price_data][product_data][description]': `Boost your ad "${adTitle}" to featured status for 1 week`,
      'line_items[0][price_data][unit_amount]': '1000', // $10.00 in cents
      'line_items[0][quantity]': '1',
      'metadata[payment_id]': payment.id,
      'metadata[user_id]': user.id,
      'metadata[ad_id]': adId,
      'metadata[type]': 'ad_boost',
    })
    
    const checkoutSession = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: checkoutSessionData
    })
    
    if (!checkoutSession.ok) {
      const errorText = await checkoutSession.text()
      console.error('❌ Stripe boost session creation failed:', errorText)
      return c.json({ error: 'Failed to create boost payment session' }, 500)
    }
    
    const session = await checkoutSession.json()
    
    // Store session ID for webhook verification
    payment.stripeSessionId = session.id
    await kv.set(`payment:${payment.id}`, payment)
    
    console.log(`✅ Stripe boost session created: ${session.id}`)
    
    return c.json({
      sessionId: session.id,
      url: session.url,
      paymentId: payment.id
    })
  } catch (error) {
    console.error('Create boost checkout session error:', error)
    return c.json({ error: 'Failed to create boost checkout session' }, 500)
  }
})

// Verify payment session (called from frontend after Stripe redirect)
app.post('/make-server-e5dee741/payments/verify-session', async (c) => {
  const user = await getAuthenticatedUser(c.req)
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  try {
    const { sessionId, paymentId, adId } = await c.req.json()
    
    console.log(`🔍 Verifying session ${sessionId} for payment ${paymentId}`)
    
    // Get the payment record
    const payment = await kv.get(`payment:${paymentId}`)
    if (!payment) {
      return c.json({ error: 'Payment not found' }, 404)
    }
    
    // Verify session with Stripe
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      return c.json({ error: 'Payment service not configured' }, 500)
    }
    
    const sessionResponse = await fetch(`https://api.stripe.com/v1/checkout/sessions/${sessionId}`, {
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
      },
    })
    
    if (!sessionResponse.ok) {
      console.error('❌ Failed to verify session with Stripe')
      return c.json({ error: 'Session verification failed' }, 400)
    }
    
    const stripeSession = await sessionResponse.json()
    
    // Check if payment was successful
    if (stripeSession.payment_status === 'paid') {
      // Update payment status if not already done
      if (payment.status !== 'completed') {
        payment.status = 'completed'
        payment.completedAt = new Date().toISOString()
        payment.stripeSessionId = sessionId
        await kv.set(`payment:${paymentId}`, payment)
      }
      
      // Update ad status
      const ad = await kv.get(`ad:${adId}`)
      if (ad) {
        ad.status = 'published'
        ad.publishedAt = new Date().toISOString()
        ad.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        
        // Apply boost if included
        if (payment.includeBoost || payment.type === 'ad_posting_with_boost') {
          ad.featured = true
          ad.featuredUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          console.log(`🚀 Ad boosted: ${ad.title}`)
        }
        
        await kv.set(`ad:${adId}`, ad)
        console.log(`✅ Ad published: ${ad.title}`)
      }
      
      return c.json({ 
        verified: true, 
        payment: payment,
        ad: ad ? { id: ad.id, title: ad.title, featured: ad.featured } : null
      })
    } else {
      return c.json({ 
        verified: false, 
        error: 'Payment not completed',
        paymentStatus: stripeSession.payment_status
      })
    }
    
  } catch (error) {
    console.error('❌ Session verification error:', error)
    return c.json({ error: 'Verification failed' }, 500)
  }
})

// Stripe webhook for payment verification
app.post('/make-server-e5dee741/stripe/webhook', async (c) => {
  try {
    const body = await c.req.text()
    const signature = c.req.header('stripe-signature')
    
    // For now, we'll process all webhook events
    // In production, you should verify the webhook signature:
    // const stripeSecretKey = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    // if (stripeSecretKey && signature) {
    //   // Verify signature with Stripe's webhook validation
    // }
    
    const event = JSON.parse(body)
    console.log(`🎯 Stripe webhook received: ${event.type}`)
    
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      console.log('💳 Payment completed via webhook:', session.id)
      
      // Get payment using client_reference_id (which is our payment ID)
      const paymentId = session.client_reference_id
      const payment = paymentId ? await kv.get(`payment:${paymentId}`) : null
      
      // Fallback: search by session ID if client_reference_id not found
      if (!payment) {
        const allPayments = await kv.getByPrefix('payment:')
        const foundPayment = allPayments.find(p => p.value && p.value.stripeSessionId === session.id)
        if (foundPayment) {
          payment = foundPayment.value
        }
      }
      
      if (payment) {
        // Update payment status
        payment.status = 'completed'
        payment.completedAt = new Date().toISOString()
        payment.stripeSessionId = session.id
        await kv.set(`payment:${payment.id}`, payment)
        
        console.log(`✅ Payment completed: ${payment.id} - ${(payment.amount/100).toFixed(2)}`)
        
        // Update the ad status to published
        const ad = await kv.get(`ad:${payment.adId}`)
        if (ad) {
          ad.status = 'published'
          ad.publishedAt = new Date().toISOString()
          ad.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
          
          // If this includes boost, make it featured
          if (payment.type === 'ad_boost' || payment.type === 'ad_posting_with_boost' || payment.includeBoost) {
            ad.featured = true
            ad.featuredUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
            console.log(`🚀 Ad boosted to featured: ${ad.title} until ${ad.featuredUntil}`)
          }
          
          await kv.set(`ad:${payment.adId}`, ad)
          console.log(`📢 Ad published: ${ad.title}`)
        }
      } else {
        console.warn(`⚠️ Payment not found for session: ${session.id}`)
      }
    }
    
    return c.json({ received: true })
  } catch (error) {
    console.error('❌ Webhook error:', error)
    return c.json({ error: 'Webhook processing failed' }, 500)
  }
})

// Role Management Routes
// Helper function to check if user is admin
async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const userData = await kv.get(`user:${userId}`)
    return userData?.role === 'admin'
  } catch (error) {
    console.error('❌ Error checking admin status:', error)
    return false
  }
}

// Debug endpoint to inspect KV store (admin only)
app.get('/make-server-e5dee741/admin/debug/kv', async (c) => {
  const user = await getAuthenticatedUser(c.req)
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  // Check if current user is admin
  const isAdmin = await isUserAdmin(user.id)
  if (!isAdmin) {
    return c.json({ error: 'Access denied. Admin privileges required.' }, 403)
  }
  
  try {
    console.log('🔍 Admin debugging KV store...')
    // Get all items with user: prefix
    const allUserItems = await kv.getByPrefix('user:')
    console.log('📋 All KV items with user: prefix:', allUserItems.length)
    
    // Log each item for debugging
    const itemsByType = {
      userProfiles: [],
      emailLookups: [],
      usernameLookups: [],
      other: []
    }
    
    allUserItems.forEach(item => {
      console.log('🔑 KV Key:', item.key)
      if (item.key.includes(':email:')) {
        itemsByType.emailLookups.push(item)
      } else if (item.key.includes(':username:')) {
        itemsByType.usernameLookups.push(item)
      } else if (item.key.startsWith('user:') && !item.key.includes(':')) {
        itemsByType.userProfiles.push(item)
      } else {
        itemsByType.other.push(item)
      }
    })
    
    return c.json({
      totalItems: allUserItems.length,
      breakdown: {
        userProfiles: itemsByType.userProfiles.length,
        emailLookups: itemsByType.emailLookups.length,
        usernameLookups: itemsByType.usernameLookups.length,
        other: itemsByType.other.length
      },
      userProfiles: itemsByType.userProfiles.map(item => ({
        key: item.key,
        email: item.value?.email,
        name: item.value?.name,
        role: item.value?.role,
        createdAt: item.value?.createdAt
      })),
      emailLookups: itemsByType.emailLookups.map(item => ({
        key: item.key,
        value: item.value
      })),
      usernameLookups: itemsByType.usernameLookups.map(item => ({
        key: item.key,
        value: item.value
      }))
    })
  } catch (error) {
    console.error('❌ Error debugging KV store:', error)
    return c.json({ error: 'Failed to debug KV store' }, 500)
  }
})

// Admin debug endpoint to check admin user status
app.get('/make-server-e5dee741/admin/debug-status', async (c) => {
  const user = await getAuthenticatedUser(c.req)
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  try {
    console.log('🔍 Admin debug for user:', user.id, user.email)
    
    // Get user data from KV store
    const userData = await kv.get(`user:${user.id}`)
    
    // Get all ads 
    const allAds = await kv.getByPrefix('ad:')
    
    // Find ads by current user ID
    const userIdAds = allAds.filter(ad => ad && ad.userId === user.id)
    
    // Find ads by email (for admin with changed user ID)
    const emailAds = allAds.filter(ad => ad && ad.userEmail === user.email)
    
    // Get all users for admin panel
    const allUsers = await kv.getByPrefix('user:')
    const validUsers = allUsers.filter(user => user && user.id && !user.id.includes(':'))
    
    return c.json({
      currentUser: {
        id: user.id,
        email: user.email,
        role: userData?.role || 'user',
        isAdmin: userData?.role === 'admin'
      },
      userData: userData,
      adAnalysis: {
        totalAds: allAds.length,
        userIdMatches: userIdAds.length,
        emailMatches: emailAds.length,
        userIdMatchingAds: userIdAds.map(ad => ({
          id: ad.id,
          title: ad.title?.substring(0, 50),
          status: ad.status,
          userId: ad.userId,
          userEmail: ad.userEmail
        })),
        emailMatchingAds: emailAds.map(ad => ({
          id: ad.id, 
          title: ad.title?.substring(0, 50),
          status: ad.status,
          userId: ad.userId,
          userEmail: ad.userEmail
        }))
      },
      usersAnalysis: {
        totalUsers: validUsers.length,
        adminUsers: validUsers.filter(u => u.role === 'admin').length,
        userEmails: validUsers.map(u => ({ id: u.id, email: u.email, role: u.role }))
      }
    })
  } catch (error) {
    console.error('❌ Admin debug error:', error)
    return c.json({ error: 'Failed to debug admin status' }, 500)
  }
})

// Default 404 handler
app.all('*', (c) => {
  console.log('❌ Route not found:', c.req.url)
  return c.json({ error: 'Route not found' }, 404)
})

// Start the server
Deno.serve(app.fetch)
        name: item.value.name,
        role: item.value.role || 'user',
        authProvider: item.value.authProvider,
        createdAt: item.value.createdAt,
        isBlocked: item.value.isBlocked || false,
        lastLoginAt: item.value.lastLoginAt
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    console.log('👥 Processed user list:', userList.length, 'users')
    console.log('📊 User breakdown:', {
      admins: userList.filter(u => u.role === 'admin').length,
      regular: userList.filter(u => u.role === 'user').length
    })
    
    return c.json({ 
      users: userList,
      total: userList.length,
      admins: userList.filter(u => u.role === 'admin').length,
      regularUsers: userList.filter(u => u.role === 'user').length
    })
  } catch (error) {
    console.error('❌ Error fetching users:', error)
    return c.json({ error: 'Failed to fetch users' }, 500)
  }
})

// DUPLICATE REMOVED - Update user role (admin only)
// Duplicate endpoint removed - using requireAdminAccess version above
  // if (!user) {
  //   return c.json({ error: 'Unauthorized' }, 401)
  // }
  
  // Check if current user is admin
  const isAdmin = await isUserAdmin(user.id)
  if (!isAdmin) {
    return c.json({ error: 'Access denied. Admin privileges required.' }, 403)
  }
  
  try {
    const { userId } = c.req.param()
    const { role } = await c.req.json()
    
    if (!['user', 'admin'].includes(role)) {
      return c.json({ error: 'Invalid role. Must be "user" or "admin"' }, 400)
    }
    
    // Get target user data
    const targetUserData = await kv.get(`user:${userId}`)
    if (!targetUserData) {
      return c.json({ error: 'User not found' }, 404)
    }
    
    // Prevent demoting yourself
    if (userId === user.id && role === 'user') {
      return c.json({ error: 'You cannot demote yourself from admin' }, 400)
    }
    
    // Update user role
    const updatedUser = {
      ...targetUserData,
      role,
      roleUpdatedAt: new Date().toISOString(),
      roleUpdatedBy: user.id
    }
    
    await kv.set(`user:${userId}`, updatedUser)
    
    console.log(`✅ User role updated: ${targetUserData.email} -> ${role} by ${user.email}`)
    
    return c.json({ 
      message: `User role updated to ${role} successfully`,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        roleUpdatedAt: updatedUser.roleUpdatedAt,
        roleUpdatedBy: updatedUser.roleUpdatedBy
      }
    })
  } catch (error) {
    console.error('❌ Error updating user role:', error)
    return c.json({ error: 'Failed to update user role' }, 500)
  }
})

// Block/unblock user (admin only)
app.post('/make-server-e5dee741/admin/users/:userId/block', async (c) => {
  const user = await getAuthenticatedUser(c.req)
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  // Check if current user is admin
  const isAdmin = await isUserAdmin(user.id)
  if (!isAdmin) {
    return c.json({ error: 'Access denied. Admin privileges required.' }, 403)
  }
  
  try {
    const { userId } = c.req.param()
    const { blocked } = await c.req.json()
    
    // Get target user data
    const targetUserData = await kv.get(`user:${userId}`)
    if (!targetUserData) {
      return c.json({ error: 'User not found' }, 404)
    }
    
    // Prevent blocking yourself
    if (userId === user.id) {
      return c.json({ error: 'You cannot block yourself' }, 400)
    }
    
    // Prevent blocking other admins
    if (targetUserData.role === 'admin') {
      return c.json({ error: 'Cannot block admin users' }, 400)
    }
    
    // Update user blocked status
    const updatedUser = {
      ...targetUserData,
      isBlocked: blocked,
      blockedAt: blocked ? new Date().toISOString() : null,
      blockedBy: blocked ? user.id : null
    }
    
    await kv.set(`user:${userId}`, updatedUser)
    
    const action = blocked ? 'blocked' : 'unblocked'
    console.log(`✅ User ${action}: ${targetUserData.email} by ${user.email}`)
    
    return c.json({ 
      message: `User ${action} successfully`,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        name: updatedUser.name,
        isBlocked: updatedUser.isBlocked,
        blockedAt: updatedUser.blockedAt,
        blockedBy: updatedUser.blockedBy
      }
    })
  } catch (error) {
    console.error(`❌ Error updating user block status:`, error)
    return c.json({ error: 'Failed to update user block status' }, 500)
  }
})

// Get current user's role and permissions
app.get('/make-server-e5dee741/auth/profile', async (c) => {
  const user = await getAuthenticatedUser(c.req)
  if (!user) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  
  try {
    // Get user data from KV store
    const userData = await kv.get(`user:${user.id}`)
    if (!userData) {
      // If user not found in KV store, create basic profile
      console.log('📝 User not found in KV store, creating profile:', user.email)
      
      // Check if email should be admin (you can customize this list)
      const adminEmails = ['ommzadeh@gmail.com']
      const isAdminEmail = adminEmails.includes(user.email?.toLowerCase() || '')
      
      const newUserData = {
        id: user.id,
        username: user.user_metadata?.username || `user_${Date.now()}`,
        email: user.email || '',
        name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
        role: isAdminEmail ? 'admin' : 'user',
        authProvider: 'email',
        createdAt: new Date(user.created_at || Date.now()).toISOString(),
        isBlocked: false,
        termsAccepted: {
          accepted: true,
          acceptedAt: new Date().toISOString(),
          version: '1.0'
        }
      }
      
      // Save to KV store
      await kv.set(`user:${user.id}`, newUserData)
      await kv.set(`user:email:${user.email}`, user.id)
      
      return c.json({ user: newUserData })
    }
    
    // Check if this user's email should be promoted to admin
    const adminEmails = ['ommzadeh@gmail.com']
    const isAdminEmail = adminEmails.includes(userData.email?.toLowerCase() || '')
    
    // Auto-promote if email is in admin list but role is not admin
    if (isAdminEmail && userData.role !== 'admin') {
      userData.role = 'admin'
      userData.autoPromotedAt = new Date().toISOString()
      await kv.set(`user:${user.id}`, userData)
      console.log('✅ Auto-promoted user to admin:', userData.email)
    }
    
    return c.json({ user: userData })
  } catch (error) {
    console.error('❌ Error fetching user profile:', error)
    return c.json({ error: 'Failed to fetch user profile' }, 500)
  }
})

// Initialize admin user endpoint (one-time setup)
app.post('/make-server-e5dee741/admin/initialize', async (c) => {
  try {
    const { email, secretKey } = await c.req.json()
    
    // Security check - use a secret key
    if (secretKey !== 'PERSIAN_CONNECT_ADMIN_INIT_2024') {
      return c.json({ error: 'Invalid secret key' }, 403)
    }
    
    // Check if email is in admin list
    const adminEmails = ['ommzadeh@gmail.com']
    if (!adminEmails.includes(email?.toLowerCase() || '')) {
      return c.json({ error: 'Email not authorized for admin access' }, 403)
    }
    
    // Find user by email
    const emailKey = `user:email:${email}`
    const userId = await kv.get(emailKey)
    
    if (!userId) {
      return c.json({ error: 'User not found. Please sign up first.' }, 404)
    }
    
    // Get user data
    const userData = await kv.get(`user:${userId}`)
    if (!userData) {
      return c.json({ error: 'User data not found' }, 404)
    }
    
    // Update user role to admin
    const updatedUser = {
      ...userData,
      role: 'admin',
      adminInitializedAt: new Date().toISOString(),
      initializedBy: 'system'
    }
    
    await kv.set(`user:${userId}`, updatedUser)
    
    console.log('✅ Admin initialized successfully:', email)
    
    return c.json({ 
      message: 'Admin access initialized successfully',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        adminInitializedAt: updatedUser.adminInitializedAt
      }
    })
  } catch (error) {
    console.error('❌ Admin initialization error:', error)
    return c.json({ error: 'Failed to initialize admin access' }, 500)
  }
})

// Temporary admin promotion endpoint - REMOVE AFTER USE
app.post('/make-server-e5dee741/promote-admin', async (c) => {
  try {
    const { email, secretKey } = await c.req.json()
    
    // Security check - use a secret key
    if (secretKey !== 'TEMP_ADMIN_KEY_12345') {
      return c.json({ error: 'Invalid secret key' }, 403)
    }
    
    // Find user by email
    const emailKey = `user:email:${email}`
    const userId = await kv.get(emailKey)
    
    if (!userId) {
      return c.json({ error: 'User not found' }, 404)
    }
    
    // Get user data
    const userData = await kv.get(`user:${userId}`)
    if (!userData) {
      return c.json({ error: 'User data not found' }, 404)
    }
    
    // Update user role to admin
    const updatedUser = {
      ...userData,
      role: 'admin',
      promotedAt: new Date().toISOString(),
      promotedBy: 'system'
    }
    
    await kv.set(`user:${userId}`, updatedUser)
    
    return c.json({ 
      message: 'User promoted to admin successfully',
      user: updatedUser 
    })
  } catch (error) {
    console.error('Promote admin error:', error)
    return c.json({ error: 'Failed to promote user to admin' }, 500)
  }
})

// Global error handler
app.onError((err, c) => {
  console.error('❌ Global error handler:', err)
  return c.json({ 
    error: 'Internal server error',
    message: err.message 
  }, 500)
})

// Handle 404 routes
app.notFound((c) => {
  console.log('❌ Route not found:', c.req.url)
  return c.json({ error: 'Route not found' }, 404)
})

// Start the server
Deno.serve(app.fetch)