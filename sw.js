const CACHE_NAME = 'movimiento-training-v3';
const URLS_TO_CACHE = [
  './',
  './index.html',
  './script.js',
  './style.css',
  './manifest.json',
  './banda de suspension.jpg',
  './wallpaper.wiki-Wallpapers-Free-Crossfit-Download-PIC-WPB004205-1024x683 (1).jpg',
  './logo.png',
  './icon-192x192.png',
  './icon-512x512.png',
  './start_work.mp3',
  './start_rest.mp3',
  './countdown.mp3',
  './finish.mp3'
  'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Roboto+Mono:wght@700&display=swap',
  'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmEU9fBBc4.woff2',
  'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc4.woff2',
  'https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmYUtfBBc4.woff2',
  'https://fonts.gstatic.com/s/robotomono/v23/L0xuDF4xlVMF-BfR8bXMIhJHg45mwgGEFl0_3vrtSM1J-g.woff2'
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
