// Persian Connect Service Worker
const CACHE_NAME = 'persian-connect-v2-auth-fix';
const urlsToCache = [
  '/',
  '/manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('🔧 PWA Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 PWA Cache opened successfully');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('❌ PWA Cache failed to open:', error);
      })
  );
  
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  // Don't cache authentication-related requests or API calls
  const url = new URL(event.request.url);
  const isAuthRequest = url.pathname.includes('auth') || 
                       url.pathname.includes('login') ||
                       url.pathname.includes('user') ||
                       url.hostname.includes('supabase.co');
  
  if (isAuthRequest) {
    // Always fetch fresh for auth requests
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      })
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('✅ PWA Service Worker activated');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ PWA Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Claim control of all clients
  return self.clients.claim();
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('📨 Push notification received');
  
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      tag: 'persian-connect-notification',
      requireInteraction: true,
      actions: [
        {
          action: 'open',
          title: 'Open App'
        },
        {
          action: 'close',
          title: 'Close'
        }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked');
  
  event.notification.close();

  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});