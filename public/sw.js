const CACHE_NAME = 'hydromart-v2'; // Kita naikkan versinya ke v2 biar cache lama otomatis kebuang
const urlsToCache = ['/', '/index.html', '/hui-logo.png'];

// Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); // Paksa SW baru langsung aktif
});

// Activate & Bersihkan Cache Versi Lama Otomatis
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Menghapus cache PWA jadul:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Resource - STRATEGI NETWORK FIRST (Biar gak hobi nge-blank)
self.addEventListener('fetch', event => {
  // Hanya tangani request HTTP/HTTPS biasa
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Kalau sukses dapet file baru dari Vercel, simpan salinannya ke cache
        if (networkResponse && networkResponse.status === 200 && event.request.method === 'GET') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Kalau internet mati atau offline, baru ambil dari cache lokal
        return caches.match(event.request);
      })
  );
});