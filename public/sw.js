const CACHE_NAME = 'wizlingo-v1';
const STATIC_ASSETS = [
  '/',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/wiziingo-logo.svg',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - Network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip API requests (use network only for realtime data)
  if (event.request.url.includes('/api/')) {
    return;
  }

  // Network first, cache fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Don't cache if response is not ok
        if (!response || response.status !== 200) {
          return response;
        }

        // Clone and cache successful responses
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(event.request).then((response) => {
          // Return cached response or offline page
          return response || caches.match('/');
        });
      })
  );
});

// Background sync for offline actions (optional)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);

  if (event.tag === 'sync-feedback') {
    event.waitUntil(syncFeedback());
  }
});

async function syncFeedback() {
  try {
    const db = await openIndexedDB();
    const pendingFeedback = await getPendingFeedback(db);

    for (const feedback of pendingFeedback) {
      try {
        const response = await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(feedback),
        });

        if (response.ok) {
          await removePendingFeedback(db, feedback.id);
        }
      } catch (error) {
        console.error('[SW] Failed to sync feedback:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}

function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('wizlingo', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function getPendingFeedback(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingFeedback'], 'readonly');
    const store = transaction.objectStore('pendingFeedback');
    const request = store.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function removePendingFeedback(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['pendingFeedback'], 'readwrite');
    const store = transaction.objectStore('pendingFeedback');
    const request = store.delete(id);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Push notifications (optional - for future use)
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  const data = event.data ? event.data.json() : {};
  const title = data.title || 'WizLingo';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    tag: data.tag || 'notification',
    data: data.data || {},
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(urlToOpen);
    })
  );
});
