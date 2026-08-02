const CACHE_NAME = 'attendwise-cache-v1';

// Install event - skip waiting to activate worker immediately
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

// Activate event - claim control of all clients
self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

// Fetch event - Network-first fallback to Cache strategy
self.addEventListener('fetch', (e) => {
  // Only handle GET requests and skip browser extensions or analytics APIs
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Clone response and save to cache
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseClone);
        });
        return response;
      })
      .catch(() => {
        // Fallback to cache when network is offline
        return caches.match(e.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // If resource is not in cache (e.g. initial load offline)
          return new Response('Offline: Resource not available in cache.', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({ 'Content-Type': 'text/plain' })
          });
        });
      })
  );
});
