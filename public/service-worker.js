const CACHE_NAME = "litisbot-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
  "/litisbot-logo.png",
  "/logo192.png",
  "/logo512.png"
];

// Instala el service worker y cachea recursos
self.addEventListener("install", event => {
  console.log('Service Worker instalado');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Activa el service worker y limpia cachés antiguas
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
  console.log('Service Worker activo');
});

// Responde con recursos cacheados o red
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Devuelve desde caché, o pide a la red si no está cacheado
        return response || fetch(event.request);
      })
      .catch(() => {
        // Si no hay red ni cache, podrías retornar una página offline aquí
        // return caches.match('/offline.html');
      })
  );
});
