const CACHE = 'vale-futebol-ultimate-v18.0.0-phase12';
const SHELL = [
  './', './index.html', './loja.html', './offline.html', './css/app.css?v=11.0.0-20260804', './css/world-edition.css?v=11.0.0-20260804', './css/world-edition-v11.css?v=11.0.0-20260804-release', './css/ultimate-v16.css?v=18.0.0-phase12', './js/app-v16.js?v=18.0.0-phase12', './js/systems/matchEngineV2.js', './js/systems/careerPerformanceV3.js', './js/systems/clubEconomy.js', './js/systems/managerCareer.js', './js/systems/competitionCareer.js', './js/systems/competitionWorldV2.js', './js/systems/careerRelations.js', './js/systems/tacticalRoles.js', './js/systems/competitionFormatsV3.js', './js/systems/marketIntelligenceV3.js',
  './manifest.webmanifest', './assets/icons/app-icon-v9.png', './assets/placeholders/player-generic.png', './assets/placeholders/club-generic.png', './assets/players/generic/player-generic.webp', './assets/players/generic/player-generic-128.webp',
  './assets/backgrounds/bg-cover.jpg', './assets/backgrounds/bg-lobby.jpg',
  './assets/backgrounds/bg-store.jpg', './assets/store/screenshot-dashboard.jpg', './assets/store/screenshot-tactics.jpg', './assets/store/screenshot-market.jpg', './assets/store/screenshot-calendar.jpg',
  './assets/backgrounds/bg-match.jpg', './assets/backgrounds/bg-team-select.jpg', './assets/backgrounds/campo-futebol-cinematografico.png',
  './assets/facilities/stadium.jpg', './assets/facilities/training.jpg', './assets/facilities/youth.jpg', './assets/facilities/medical.jpg', './assets/facilities/scouting.jpg', './assets/facilities/commercial.jpg',
  './assets/competitions/real/brasileirao-a.svg', './assets/competitions/real/brasileirao-b.svg', './assets/competitions/real/champions-league.svg', './assets/competitions/real/copa-do-brasil.svg', './assets/competitions/real/europa-league.svg', './assets/competitions/real/libertadores.svg', './assets/competitions/real/sudamericana.svg',
  './data/world-catalog-2026.json', './data/player-media-manifest.json'
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
