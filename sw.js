const CACHE = 'vale-futebol-world-v11.0.0-20260804-release';
const SHELL = [
  './', './index.html', './offline.html', './css/app.css?v=11.0.0-20260804', './css/world-edition.css?v=11.0.0-20260804', './css/world-edition-v11.css?v=11.0.0-20260804-release', './js/app-v11.js?v=11.0.0-20260804-release',
  './manifest.webmanifest', './assets/icons/app-icon-v9.png', './assets/placeholders/player-generic.png', './assets/placeholders/club-generic.png',
  './assets/backgrounds/bg-cover.jpg', './assets/backgrounds/bg-lobby.jpg',
  './assets/backgrounds/bg-match.jpg', './assets/backgrounds/bg-team-select.jpg', './data/world-catalog-2026.json'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(() => caches.match('./index.html').then(r => r || caches.match('./offline.html'))));
    return;
  }
  if (requestUrl.pathname.endsWith('.json')) {
    event.respondWith(fetch(event.request).then(response => {
      if (response.ok) caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
      return response;
    }).catch(() => caches.match(event.request).then(r => r || caches.match('./offline.html'))));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response.ok) {
      const copy = response.clone();
      caches.open(CACHE).then(cache => cache.put(event.request, copy));
    }
    return response;
  }).catch(() => caches.match('./offline.html'))));
});
