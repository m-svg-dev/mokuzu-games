const CACHE_NAME = 'mokuzu-v3';
const ASSETS = [
  '/mokuzu-games/',
  '/mokuzu-games/index.html',
  '/mokuzu-games/style.css',
  '/mokuzu-games/script.js',
  '/mokuzu-games/manifest.json',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' }).catch(() => caches.match(e.request))
  );
});
