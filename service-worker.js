const CACHE_NAME = 'movimiento-training-v2';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/script.js',
  '/style.css',
  '/manifest.json',
  '/logo.png',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/start_work.mp3',
  '/start_rest.mp3',
  '/countdown.mp3',
  '/finish.mp3'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const r2 = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, r2));
        }
        return networkResponse;
      }).catch(() => {
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
