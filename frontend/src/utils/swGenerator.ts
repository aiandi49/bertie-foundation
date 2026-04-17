/**
 * Service Worker Generator
 * 
 * This file creates the content for our service worker
 * which will be placed in the public directory.
 * 
 * Features:
 * - Caching static assets (HTML, CSS, JS, images)
 * - Offline fallback page
 * - Network-first strategy for API requests
 * - Cache-first strategy for static assets
 * - Background sync for failed requests
 */

// These files will be precached during service worker installation
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/static/favicon.ico',
  '/static/logo.png',
  '/static/hero-image.jpg',
];

// These routes will use a network-first strategy
const NETWORK_FIRST_ROUTES = [
  '/api/',
  'api.databutton.com'
];

// File types that should use a cache-first strategy
const CACHE_FIRST_EXTENSIONS = [
  '.css',
  '.js',
  '.jpg',
  '.jpeg',
  '.png',
  '.svg',
  '.webp',
  '.woff',
  '.woff2',
  '.ttf',
  '.otf',
  '.eot'
];

/**
 * Generate the content for the service worker JavaScript file
 */
export function generateServiceWorkerContent(): string {
  // Generate a unique version based on current timestamp
  const version = `v${new Date().toISOString().split('T')[0].replace(/-/g, '')}`;
  
  return `
    // Bertie Foundation Service Worker ${version}
    // ==================================================
    // Cache names - update version to force cache refresh
    const STATIC_CACHE_NAME = 'bertie-static-${version}';
    const IMAGE_CACHE_NAME = 'bertie-images-${version}';
    const API_CACHE_NAME = 'bertie-api-${version}';
    const PAGES_CACHE_NAME = 'bertie-pages-${version}';
    
    // Precache assets list
    const PRECACHE_ASSETS = ${JSON.stringify(PRECACHE_ASSETS)};
    
    // Installation - cache core assets
    self.addEventListener('install', (event) => {
      console.log('[Service Worker] Installing new version');
      
      // Skip waiting ensures the service worker activates right away
      self.skipWaiting();
      
      event.waitUntil(
        (async () => {
          const cacheStatic = await caches.open(STATIC_CACHE_NAME);
          const cachePages = await caches.open(PAGES_CACHE_NAME);
          
          // Cache static assets first
          await cacheStatic.addAll(PRECACHE_ASSETS);
          
          // Try to cache the homepage
          try {
            const homeResponse = await fetch('/');
            await cachePages.put('/', homeResponse.clone());
          } catch (e) {
            console.error('[Service Worker] Failed to cache homepage');
          }
          
          console.log('[Service Worker] Installation complete');
        })()
      );
    });
    
    // Activation - clean up old caches
    self.addEventListener('activate', (event) => {
      console.log('[Service Worker] Activating new version');
      
      // Take control immediately
      self.clients.claim();
      
      event.waitUntil(
        (async () => {
          // Get all cache keys
          const cacheKeys = await caches.keys();
          
          // Identify old caches to delete
          const oldCaches = cacheKeys.filter(key => 
            key.startsWith('bertie-') && 
            !key.includes('${version}')
          );
          
          // Delete old versions
          await Promise.all(oldCaches.map(key => caches.delete(key)));
          console.log('[Service Worker] Old caches cleaned up');
        })()
      );
    });
    
    // Intercept fetch requests
    self.addEventListener('fetch', (event) => {
      const { request } = event;
      const url = new URL(request.url);
      
      // Skip non-GET requests or browser extensions
      if (request.method !== 'GET' || url.protocol !== 'https:' && url.protocol !== 'http:') {
        return;
      }
      
      // Handle API requests (network-first with timeout fallback)
      if (NETWORK_FIRST_ROUTES.some(route => request.url.includes(route))) {
        event.respondWith(networkFirstWithFallback(request));
        return;
      }
      
      // Handle static assets (cache-first)
      if (CACHE_FIRST_EXTENSIONS.some(ext => request.url.endsWith(ext))) {
        event.respondWith(cacheFirstWithNetworkFallback(request));
        return;
      }
      
      // Default strategy - network with cache fallback
      event.respondWith(networkWithCacheFallback(request));
    });
    
    // Network-first strategy with timeout fallback
    async function networkFirstWithFallback(request) {
      try {
        // Try network first with timeout
        const networkPromise = fetch(request);
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Network timeout')), 3000);
        });
        
        const response = await Promise.race([networkPromise, timeoutPromise]);
        
        // Cache successful responses
        if (response.ok) {
          const cache = await caches.open(API_CACHE_NAME);
          cache.put(request, response.clone());
        }
        
        return response;
      } catch (error) {
        // Fallback to cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) return cachedResponse;
        
        // If no cache and it's an API request, return generic error response
        return new Response(JSON.stringify({ error: 'Network request failed', offline: true }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    // Cache-first strategy with network fallback
    async function cacheFirstWithNetworkFallback(request) {
      // Check cache first
      const cachedResponse = await caches.match(request);
      if (cachedResponse) return cachedResponse;
      
      // Fallback to network
      try {
        const response = await fetch(request);
        
        // Cache successful responses
        if (response.ok) {
          const cache = await caches.open(
            request.url.includes('/static/') ? IMAGE_CACHE_NAME : STATIC_CACHE_NAME
          );
          cache.put(request, response.clone());
        }
        
        return response;
      } catch (error) {
        // If it's an image, try to return a placeholder
        if (request.destination === 'image') {
          return caches.match('/static/placeholder.png') || 
                 new Response('', { status: 404, statusText: 'Image not available offline' });
        }
        
        return new Response('Not available offline', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
    }
    
    // Network with cache fallback strategy
    async function networkWithCacheFallback(request) {
      try {
        const response = await fetch(request);
        
        // Cache successful page responses
        if (response.ok && (request.mode === 'navigate' || request.destination === 'document')) {
          const cache = await caches.open(PAGES_CACHE_NAME);
          cache.put(request, response.clone());
        }
        
        return response;
      } catch (error) {
        // Try the cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) return cachedResponse;
        
        // For navigation, try to show the offline page
        if (request.mode === 'navigate' || request.destination === 'document') {
          return caches.match('/offline.html') || 
                 new Response('You are offline and this page is not available.', {
                   status: 503,
                   headers: { 'Content-Type': 'text/html' }
                 });
        }
        
        // For other resources, return error
        return new Response('Not available offline', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
    }
    
    // Periodic background sync to update caches
    if ('periodicSync' in self.registration) {
      self.addEventListener('periodicsync', (event) => {
        if (event.tag === 'update-caches') {
          event.waitUntil(
            (async () => {
              // Update critical resources
              try {
                const cache = await caches.open(STATIC_CACHE_NAME);
                await cache.addAll(PRECACHE_ASSETS);
                console.log('[Service Worker] Periodic sync complete');
              } catch (error) {
                console.error('[Service Worker] Periodic sync failed:', error);
              }
            })()
          );
        }
      });
    }
    
    
    // Resources to cache immediately on install
    const PRECACHE_URLS = [
      '/',
      '/index.html',
      '/App',
      '/Donate',
      '/About',
      '/Contact',
      '/Programs'
    ];
    
    // Max age for cached resources (in seconds)
    const MAX_AGE = {
      images: 30 * 24 * 60 * 60, // 30 days for images
      static: 7 * 24 * 60 * 60,  // 7 days for static assets
      api: 60 * 60              // 1 hour for API responses
    };
    
    // Install event - precache static resources
    self.addEventListener('install', (event) => {
      console.log('[Service Worker] Installing new service worker...');
      
      // Skip waiting to activate immediately
      self.skipWaiting();
      
      event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
          .then(cache => {
            console.log('[Service Worker] Pre-caching static assets');
            return cache.addAll(PRECACHE_URLS);
          })
          .catch(error => {
            console.error('[Service Worker] Pre-caching failed:', error);
          })
      );
    });
    
    // Activate event - clean up old caches
    self.addEventListener('activate', (event) => {
      console.log('[Service Worker] Activating new service worker...');
      
      // Take control of all clients immediately
      event.waitUntil(self.clients.claim());
      
      // Remove outdated caches
      event.waitUntil(
        caches.keys().then(cacheNames => {
          return Promise.all(
            cacheNames.map(cacheName => {
              // If this cache name isn't present in the current set of caches, delete it
              if (
                cacheName !== STATIC_CACHE_NAME && 
                cacheName !== IMAGE_CACHE_NAME && 
                cacheName !== API_CACHE_NAME
              ) {
                console.log('[Service Worker] Removing old cache:', cacheName);
                return caches.delete(cacheName);
              }
              return Promise.resolve();
            })
          );
        })
      );
    });
    
    // Helper function to determine cache strategy based on request URL
    function getResourceType(url) {
      const requestUrl = new URL(url);
      
      // Image files
      if (
        requestUrl.pathname.match(/\.(jpe?g|png|gif|svg|webp)$/i) ||
        requestUrl.hostname.includes('images.unsplash.com') ||
        requestUrl.hostname.includes('static.databutton.com')
      ) {
        return 'image';
      }
      
      // API requests
      if (
        requestUrl.pathname.includes('/api/') ||
        requestUrl.pathname.includes('/_projects/')
      ) {
        return 'api';
      }
      
      // Default to static
      return 'static';
    }
    
    // Helper function to determine appropriate cache for resource type
    function getCacheForResource(resourceType) {
      switch (resourceType) {
        case 'image':
          return IMAGE_CACHE_NAME;
        case 'api':
          return API_CACHE_NAME;
        default:
          return STATIC_CACHE_NAME;
      }
    }
    
    // Helper to check if cache entry is expired
    function isCacheEntryExpired(response, resourceType) {
      if (!response || !response.headers || !response.headers.get('date')) {
        return true; // If we can't determine age, assume expired
      }
      
      const dateHeader = response.headers.get('date');
      if (!dateHeader) return true;
      
      const cacheTime = new Date(dateHeader).getTime();
      const now = Date.now();
      const age = (now - cacheTime) / 1000; // age in seconds
      
      return age > MAX_AGE[resourceType];
    }
    
    // Fetch event
    self.addEventListener('fetch', (event) => {
      // Skip cross-origin requests except for key domains
      if (!event.request.url.startsWith(self.location.origin) && 
          !event.request.url.includes('static.databutton.com') &&
          !event.request.url.includes('images.unsplash.com')) {
        return;
      }
      
      // Skip non-GET requests
      if (event.request.method !== 'GET') {
        return;
      }
      
      // Handle different resource types with appropriate strategies
      const resourceType = getResourceType(event.request.url);
      const cacheName = getCacheForResource(resourceType);
      
      // Use different strategies based on resource type
      if (resourceType === 'image') {
        // For images: Cache first, network as fallback, update cache in background
        event.respondWith(
          caches.open(cacheName).then(cache => {
            return cache.match(event.request).then(response => {
              // Return cached response immediately if we have it and it's not expired
              if (response && !isCacheEntryExpired(response, resourceType)) {
                return response;
              }
              
              // Otherwise fetch from network
              return fetch(event.request).then(networkResponse => {
                // Clone the response before caching it
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
              }).catch(error => {
                console.error('[Service Worker] Fetch failed:', error);
                // Return expired cached response if we have it as a fallback
                if (response) {
                  return response;
                }
                throw error;
              });
            });
          })
        );
      } else if (resourceType === 'api') {
        // For API requests: Stale-while-revalidate strategy
        event.respondWith(
          caches.open(cacheName).then(cache => {
            return cache.match(event.request).then(response => {
              // Start network fetch regardless of cache status
              const fetchPromise = fetch(event.request).then(networkResponse => {
                // Clone and cache the new response
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
              }).catch(error => {
                console.error('[Service Worker] API fetch failed:', error);
                // Let the catch at the end handle this
                throw error;
              });
              
              // Return cached response immediately if available
              if (response && !isCacheEntryExpired(response, resourceType)) {
                return response;
              }
              
              // Otherwise wait for the network response
              return fetchPromise;
            });
          }).catch(error => {
            console.error('[Service Worker] Cache operation failed:', error);
            // Fallback to network
            return fetch(event.request);
          })
        );
      } else {
        // For static assets: Cache first with network fallback
        event.respondWith(
          caches.open(cacheName).then(cache => {
            return cache.match(event.request).then(response => {
              // If we have a cached response, use it
              if (response) {
                // Update cache in the background if it's expired
                if (isCacheEntryExpired(response, resourceType)) {
                  fetch(event.request).then(networkResponse => {
                    cache.put(event.request, networkResponse.clone());
                  }).catch(err => console.error('[SW] Background fetch failed:', err));
                }
                return response;
              }
              
              // Otherwise fetch from network and cache
              return fetch(event.request).then(networkResponse => {
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
              });
            });
          }).catch(error => {
            console.error('[Service Worker] Static fetch failed:', error);
            // No fallback for static resources, let browser handle error
            throw error;
          })
        );
      }
    });
    
    // Handle offline fallbacks for navigation requests
    self.addEventListener('fetch', (event) => {
      // Only handle navigation requests that fail (for HTML pages)
      if (event.request.mode === 'navigate') {
        event.respondWith(
          fetch(event.request).catch(() => {
            // Return cached home page as fallback when offline
            return caches.match('/').then(response => response || new Response(
              'You are offline. Please check your connection.',
              { headers: { 'Content-Type': 'text/plain' } }
            ));
          })
        );
      }
    });
    
    // Handle service worker message events
    self.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
      }
      
      if (event.data && event.data.type === 'CLEAR_CACHE') {
        caches.keys().then(cacheNames => {
          return Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
          );
        });
      }
      
      // Respond to the message sender
      if (event.ports && event.ports[0]) {
        event.ports[0].postMessage({ success: true });
      }
    });
  `;
}