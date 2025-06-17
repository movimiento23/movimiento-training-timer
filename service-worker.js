const CACHE_NAME = 'movimiento-training-timer-v3'; // ¡CAMBIADO A V3! Excelente.
const urlsToCache = [
  './', 
  './index.html',
  './style.css',
  './script.js',
  './manifest.json', 
  './logo.png',     
  './icon-192x192.png', 
  './icon-512x512.png', 
  './finish.mp3',
  './frich.mp3',
  './start_rest.mp3',
  './start_work.mp3',
  './wallpaper.jpg' 
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache. Caching files: ', urlsToCache);
        return cache.addAll(urlsToCache)
          .catch(error => {
            console.error('Error al cachear algunas URLs durante la instalación:', error);
          });
      })
      .catch(error => {
        console.error('Error al abrir el caché durante la instalación:', error);
      })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
      .catch(error => {
        console.error('Fetch failed:', event.request.url, error);
      })
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
