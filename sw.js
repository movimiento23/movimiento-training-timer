const CACHE_NAME = 'movimiento-training-v3';
const URLS_TO_CACHE = [
  './',
  './index.html',
  './script.js',
  './style.css',
  './manifest.json',
  './banda de suspension.jpg',
  './wallpaper.jpg',
  './logo.png',
  './icon-192x192.png',
  './icon-512x512.png',
  './start_work.mp3',
  './start_rest.mp3',
  './countdown.mp3',
  './finish.mp3'
];

// Install
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(URLS_TO_CACHE);
      })
      .catch(err => console.error('Error during cache.addAll:', err))
  );
});

// Fetch
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response;

        return fetch(event.request.clone()).then(res => {
          if (!res || res.status !== 200 || res.type === 'error') return res;

          const resToCache = res.clone();
          caches.open(CACHE_NAME).then(cache => {
            if (event.request.method === 'GET') {
              cache.put(event.request, resToCache);
            }
          });

          return res;
        }).catch(err => {
          console.error('Fetch failed:', err);
        });
      })
  );
});

// Activate
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});
