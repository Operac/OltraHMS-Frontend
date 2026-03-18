/// <reference lib="webworker" />

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

const sw = self;

// Precache static assets
precacheAndRoute(sw.__WB_MANIFEST);

// Clean old caches
cleanupOutdatedCaches();

// Cache API responses with network first strategy
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60 // 5 minutes
      }),
      // Background sync for failed requests
      new BackgroundSyncPlugin('queue-api-sync', {
        maxRetentionTime: 24 * 60 // Retry for up to 24 hours
      })
    ]
  })
);

// Cache images
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'image-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
      })
    ]
  })
);

// Cache static assets
registerRoute(
  ({ request }) => 
    request.destination === 'style' || 
    request.destination === 'script' ||
    request.destination === 'font',
  new StaleWhileRevalidate({
    cacheName: 'static-cache'
  })
);

// Handle navigation requests
registerRoute(
  new NavigationRoute(
    new NetworkFirst({
      cacheName: 'navigation-cache'
    })
  )
);

// Background sync queue handler
sw.addEventListener('sync', (event) => {
  if (event.tag === 'queue-api-sync') {
    event.waitUntil(syncQueue());
  }
});

async function syncQueue() {
  // Get pending requests from IndexedDB and retry them
  // This is handled by workbox-background-sync automatically
  console.log('[SW] Syncing queue...');
}

// Handle messages from main thread
sw.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    sw.skipWaiting();
  }
});

// Notify clients of updates
sw.addEventListener('activate', (event) => {
  event.waitUntil(
    sw.clients.claim().then(() => {
      sw.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'CACHE_UPDATED' });
        });
      });
    })
  );
});

export {};
