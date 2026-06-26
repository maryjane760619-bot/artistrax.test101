// artistrax Service Worker - PWA Support
const CACHE_NAME = 'artistrax-v4';
const AUDIO_CACHE = 'artistrax-audio-v4';
const STATIC_CACHE = 'artistrax-static-v4';

// Never cache these paths - always fetch from network
const NETWORK_ONLY_PATHS = [
  '/fan/',
  '/artist/',
  '/label/',
  '/admin/',
  '/checkout',
  '/track/',
  '/releases',
  '/labels/',
];

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS.map(url => new Request(url, {credentials: 'same-origin'})));
    }).then(() => {
      console.log('[Service Worker] Skip waiting');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== AUDIO_CACHE && cacheName !== STATIC_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip external requests
  if (url.origin !== location.origin) return;

  // Handle audio files specially
  if (request.url.includes('/audio/') || request.url.includes('.mp3') || request.url.includes('.flac') || request.url.includes('.wav')) {
    event.respondWith(handleAudioRequest(request));
    return;
  }

  // Skip caching for authenticated/dynamic pages - always network
  if (NETWORK_ONLY_PATHS.some(path => url.pathname.startsWith(path))) {
    event.respondWith(fetch(request));
    return;
  }

  // Handle API requests - network first
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(JSON.stringify({ error: 'Offline' }), {
          headers: { 'Content-Type': 'application/json' }
        });
      })
    );
    return;
  }

  // Page navigations: always try the network first. A page should never
  // look stale or show "offline" just because a cached copy exists --
  // cache is only a fallback for genuine network failure.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => cached || caches.match('/offline'));
        })
    );
    return;
  }

  // Other requests (static assets, etc.) - cache first, fallback to network
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        // Clone response for cache
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });
        return response;
      }).catch(() => {
        return new Response('Offline', { status: 503 });
      });
    })
  );
});

// Handle audio file caching with range request support
async function handleAudioRequest(request) {
  const cache = await caches.open(AUDIO_CACHE);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      // Cache audio file
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[Service Worker] Audio fetch failed:', error);
    return new Response('Audio unavailable offline', { status: 503 });
  }
}

// Background sync for offline purchases/favorites
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);
  if (event.tag === 'sync-purchases') {
    event.waitUntil(syncPurchases());
  }
  if (event.tag === 'sync-favorites') {
    event.waitUntil(syncFavorites());
  }
});

async function syncPurchases() {
  // Sync any offline purchases when back online
  console.log('[Service Worker] Syncing purchases...');
  // Implementation would connect to your API
}

async function syncFavorites() {
  // Sync favorites/playlists
  console.log('[Service Worker] Syncing favorites...');
  // Implementation would connect to your API
}

// Handle push notifications (for future use)
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received');
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'artistrax';
  const options = {
    body: data.body || 'New music available!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: data.url || '/',
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'close', title: 'Close' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data || '/')
    );
  }
});

console.log('[Service Worker] Loaded');
