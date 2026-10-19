// Progressive Web App (PWA) Production Service Worker
// Provides offline capability, fast asset loading, and mobile installability

const CACHE_NAME = 'HYBRID-ENGINE-SYNC-V2';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './app_icon.png'
];

// Service Worker Installation: Pre-caches critical shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Pre-caching assets warning:', err);
      });
    })
  );
  self.skipWaiting();
});

// Service Worker Activation: Purges outdated caches and claims active clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Strategy: Network-first for fresh data with reliable cache fallback
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Ignore non-GET requests or backend API requests
  if (request.method !== 'GET' || request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache valid HTTP responses for static asset caching
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache when offline
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          if (request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
      })
  );
});


