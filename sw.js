/**
 * Service worker. Twee strategieen:
 *  - de app zelf: cache-first met achtergrondvernieuwing, zodat starten zonder
 *    bereik werkt aan de waterkant
 *  - foto's van iNaturalist en Commons: cache-first met een limiet, want die
 *    veranderen nooit en zijn het zwaarste onderdeel
 */

const VERSIE = 'snoekduik-v1';
const SCHIL = `${VERSIE}-schil`;
const FOTOS = `${VERSIE}-fotos`;
const MAX_FOTOS = 400;

/** Relatieve paden, zodat dit ook onder /<repo>/ op GitHub Pages klopt. */
const SCHIL_BESTANDEN = [
  '.', 'index.html', 'manifest.webmanifest',
  'app/app.css', 'app/main.js', 'app/router.js', 'app/data.js', 'app/store.js',
  'app/ui.js', 'app/leitner.js', 'app/sessie.js',
  'app/views-leren.js', 'app/views-naslag.js', 'app/views-ik.js',
  'data/soorten.json',
  'logos/logo-duikvlag.svg', 'logos/favicon.svg', 'logos/icon-app.svg',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(SCHIL)
      // Individueel toevoegen: één ontbrekend bestand mag de installatie niet slopen.
      .then((c) => Promise.all(SCHIL_BESTANDEN.map((p) => c.add(p).catch(() => null))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((namen) => Promise.all(namen.filter((n) => !n.startsWith(VERSIE)).map((n) => caches.delete(n))))
      .then(() => self.clients.claim()),
  );
});

async function snoei(cacheNaam, max) {
  const cache = await caches.open(cacheNaam);
  const sleutels = await cache.keys();
  for (let i = 0; i < sleutels.length - max; i += 1) await cache.delete(sleutels[i]);
}

self.addEventListener('fetch', (e) => {
  const { request } = e;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const isFoto = /inaturalist|wikimedia|wikipedia/.test(url.hostname);

  if (isFoto) {
    e.respondWith((async () => {
      const cache = await caches.open(FOTOS);
      const gecacht = await cache.match(request);
      if (gecacht) return gecacht;
      try {
        const res = await fetch(request);
        if (res.ok || res.type === 'opaque') {
          await cache.put(request, res.clone());
          snoei(FOTOS, MAX_FOTOS);
        }
        return res;
      } catch {
        return new Response('', { status: 504 });
      }
    })());
    return;
  }

  if (url.origin !== self.location.origin) return;

  e.respondWith((async () => {
    const cache = await caches.open(SCHIL);
    const gecacht = await cache.match(request, { ignoreSearch: true });
    const netwerk = fetch(request)
      .then((res) => { if (res.ok) cache.put(request, res.clone()); return res; })
      .catch(() => null);

    // Cache eerst, netwerk op de achtergrond, zodat een update de volgende keer klaarstaat.
    return gecacht ?? (await netwerk) ?? cache.match('index.html') ??
      new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
  })());
});
