// OneGlass Service Worker — Instant Shell Caching & Background Message Queueing
const CACHE_NAME = 'oneglass-shell-v2';

const SHELL_ASSETS = [
  '/',
  '/manifest.json',
  '/mobile-ux.js',
  '/display-modes.js',
  '/camera-scanner.js',
  '/screen-portal.js',
  '/webrtc-p2p.js',
  '/continuity-features.js',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(SHELL_ASSETS).catch(() => {});
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) => {
        return Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        );
      }),
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Never cache API, upload, websocket or non-GET requests
  if (
    event.request.method !== 'GET' ||
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/upload') ||
    url.pathname.startsWith('/shared/') ||
    url.protocol.startsWith('ws')
  ) {
    return;
  }

  // HTML Navigation: Network-first with cache fallback for instant offline/flaky boot
  if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then((res) => res || caches.match('/')))
    );
    return;
  }

  // Shell assets: Stale-while-revalidate
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});

// Background Message Queueing & Sync
const backgroundQueue = [];

self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data) return;

  if (data.type === 'QUEUE_MESSAGE') {
    backgroundQueue.push(data.payload);
  } else if (data.type === 'FLUSH_QUEUE') {
    if (backgroundQueue.length > 0) {
      event.ports[0]?.postMessage({ type: 'QUEUED_MESSAGES', messages: backgroundQueue.splice(0) });
    } else {
      event.ports[0]?.postMessage({ type: 'QUEUED_MESSAGES', messages: [] });
    }
  }
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'oneglass-flush-queue') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        for (const client of clients) {
          client.postMessage({ type: 'TRIGGER_FLUSH' });
        }
      })
    );
  }
});
