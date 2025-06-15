const CACHE_NAME = 'movimiento-training-timer-v1';
const urlsToCache = [
  '/', // La raíz de tu subdominio, que apunta a index.html
  '/index.html',
  '/style.css',
  '/script.js',
  '/logo.png',
  '/countdown.mp3', // ¡Actualizado con la extensión!
  '/finish.mp3',    // ¡Actualizado con la extensión!
  '/frich.mp3',     // ¡Actualizado con la extensión!
  '/start_rest.mp3',// ¡Actualizado con la extensión!
  '/start_work.mp3',// ¡Actualizado con la extensión!
  '/wallpaper.wiki-Wallpapers-Free-Crossfit-.jpg' 
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
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
  );
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});