/**
 * Hash-routing. Bewust geen History API: GitHub Pages serveert onder /<repo>/
 * en kan geen onbekende paden afvangen zonder 404-truc. Met hashes werkt elke
 * diepe link ook offline en zonder serverconfiguratie.
 */

const routes = [];
let huidigePad = null;

/** pad is een patroon als '/soort/:id'. */
export function route(pad, handler) {
  const delen = pad.split('/').filter(Boolean);
  routes.push({ delen, handler, pad });
}

function pas(routeDelen, padDelen) {
  if (routeDelen.length !== padDelen.length) return null;
  const params = {};
  for (let i = 0; i < routeDelen.length; i += 1) {
    const r = routeDelen[i];
    if (r.startsWith(':')) params[r.slice(1)] = decodeURIComponent(padDelen[i]);
    else if (r !== padDelen[i]) return null;
  }
  return params;
}

export const huidigPad = () => huidigePad;

export function ga(pad, { vervang = false } = {}) {
  const doel = `#${pad}`;
  if (vervang) window.history.replaceState(null, '', doel);
  else window.location.hash = pad;
  if (vervang) verwerk();
}

export function verwerk() {
  const pad = window.location.hash.slice(1) || '/';
  huidigePad = pad;
  const delen = pad.split('?')[0].split('/').filter(Boolean);

  for (const r of routes) {
    const params = pas(r.delen, delen);
    if (params) {
      const query = Object.fromEntries(new URLSearchParams(pad.split('?')[1] ?? ''));
      r.handler(params, query);
      return;
    }
  }
  // Onbekend pad: terug naar start in plaats van een leeg scherm.
  ga('/', { vervang: true });
}

export function start() {
  window.addEventListener('hashchange', verwerk);
  verwerk();
}
