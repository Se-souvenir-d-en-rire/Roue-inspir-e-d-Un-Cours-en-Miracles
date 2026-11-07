/* Mode hors connexion pour la Roue inspirée d’Un Cours en Miracles.
   Quand tu modifies la roue, change simplement le numéro de version ci-dessous. */
const CACHE = 'roue-inspiree-v1';
const PAGE = 'index.html';
const SHELL = ['./', PAGE, 'manifest-inspiree.webmanifest', 'inspiree-icon-192.png', 'inspiree-icon-512.png', 'inspiree-apple-touch-icon.png'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => Promise.all(SHELL.map(url => cache.add(url).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Réseau d’abord (tu vois toujours la dernière version), cache en secours hors connexion. */
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    fetch(req)
      .then(res => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then(hit => hit || (req.mode === 'navigate' ? caches.match(PAGE) : undefined))
      )
  );
});
