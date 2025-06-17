self.addEventListener('install', event => {
  console.log('✅ Service Worker instalado');
  event.waitUntil(
    caches.open('movimiento-training-cache-v1').then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/script.js',
        '/style.css',
        '/icon-192x192.png',
        '/icon-512x512.png',
        '/countdown.mp3',
        '/finish.mp3',
        '/start_rest.mp3',
        '/start_work.mp3'
      ]);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
