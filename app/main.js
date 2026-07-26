/** Startpunt: laadt de data, zet de routes klaar en tekent de tabbalk. */

import { route, start, huidigPad } from './router.js';
import { laadSoorten } from './data.js';
import { laad as laadVoortgang, instellingen } from './store.js';
import { $, toon } from './ui.js';
import { toonStart, toonSessie } from './views-leren.js';
import { toonModules, toonSoorten, toonSoort } from './views-naslag.js';
import { toonLevenslijst, toonIk, toonGemaakt } from './views-ik.js';
import { toonFeedback } from './views-feedback.js';
import { toonWelkom } from './views-welkom.js';

const TABS = [
  ['/', 'Start', '◈'],
  ['/modules', 'Modules', '▦'],
  ['/soorten', 'Soorten', '☰'],
  ['/ik', 'Ik', '●'],
];

function tekenTabs() {
  const pad = huidigPad() ?? '/';
  const actief = (t) => (t === '/' ? pad === '/' : pad.startsWith(t));
  $('#tabs').innerHTML = TABS.map(([t, label, icoon]) =>
    `<a href="#${t}" class="${actief(t) ? 'aan' : ''}"><i>${icoon}</i>${label}</a>`).join('');
}

/** Na elke navigatie de tabbalk bijwerken. */
function metTabs(handler) {
  return (params, query) => { handler(params, query); tekenTabs(); };
}

async function begin() {
  laadVoortgang();

  try {
    await laadSoorten();
  } catch (err) {
    toon(`<div class="kop"><h1>Snoekduik</h1></div>
      <div class="melding">De soortgegevens konden niet geladen worden: ${err.message}<br>
      Draai <code>node scripts/bouw-soorten.mjs</code> en ververs de pagina.</div>`);
    return;
  }

  route('/', metTabs(toonStart));
  route('/sessie', metTabs(() => toonSessie({})));
  route('/sessie/:module', metTabs(({ module }) => toonSessie({ module })));
  route('/modules', metTabs(toonModules));
  route('/soorten', metTabs(toonSoorten));
  route('/soort/:id', metTabs(toonSoort));
  route('/levenslijst', metTabs(toonLevenslijst));
  route('/ik', metTabs(toonIk));
  route('/gemaakt', metTabs(toonGemaakt));
  route('/feedback', metTabs(toonFeedback));
  route('/welkom', metTabs(toonWelkom));

  // Bij de eerste keer openen eerst het welkomsscherm, met de AI-waarschuwing.
  const pad = window.location.hash.slice(1) || '/';
  if (!instellingen().welkomGezien && pad === '/') {
    window.location.replace('#/welkom');
  }

  start();

  // Niet op localhost: de service worker serveert de app cache-first, waardoor je
  // tijdens ontwikkelen je eigen wijzigingen niet ziet tot de cacheversie wijzigt.
  const lokaal = ['localhost', '127.0.0.1', ''].includes(window.location.hostname);
  if ('serviceWorker' in navigator && !lokaal) {
    // Relatief pad zodat de scope onder /<repo>/ klopt.
    navigator.serviceWorker.register('sw.js').catch(() => { /* offline is een extraatje */ });
  }
}

begin();
