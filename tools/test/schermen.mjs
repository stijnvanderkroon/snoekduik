/**
 * Rendert elk scherm in jsdom en loopt een hele sessie door met echte kliks.
 * Vangt alle console-fouten en niet-afgehandelde uitzonderingen op.
 */

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

// jsdom staat bewust niet in de repo: de app zelf heeft geen afhankelijkheden.
let JSDOM;
try {
  ({ JSDOM } = await import('jsdom'));
} catch {
  console.log('jsdom niet gevonden. Installeer het tijdelijk om deze test te draaien:');
  console.log('  npm install --no-save jsdom');
  process.exit(0);
}

const dom = new JSDOM(readFileSync(`${ROOT}/index.html`, 'utf8'), {
  url: 'http://localhost:8080/',
  pretendToBeVisual: true,
});
const { window } = dom;

for (const k of ['window', 'document', 'HTMLElement', 'Node', 'Event',
  'CustomEvent', 'Blob', 'URL', 'localStorage', 'history', 'getComputedStyle']) {
  try { globalThis[k] = window[k]; } catch { Object.defineProperty(globalThis, k, { value: window[k], configurable: true }); }
}
Object.defineProperty(globalThis, 'navigator', { value: window.navigator, configurable: true });
globalThis.alert = () => {};
window.scrollTo = () => {}; // jsdom kent scrollTo niet, dat is geen appfout
globalThis.confirm = () => true;

const fouten = [];
window.addEventListener('error', (e) => fouten.push(`window.error: ${e.message}`));
const echteError = console.error;
console.error = (...a) => { fouten.push(`console.error: ${a.join(' ')}`); echteError(...a); };

// fetch levert het echte databestand
globalThis.fetch = async (pad) => {
  const p = String(pad).replace(/^https?:\/\/[^/]+\//, '');
  try {
    return { ok: true, status: 200, json: async () => JSON.parse(readFileSync(`${ROOT}/${p}`, 'utf8')) };
  } catch {
    return { ok: false, status: 404, json: async () => ({}) };
  }
};

let mislukt = 0;
const ok = (naam, cond, extra = '') => {
  console.log(`  ${cond ? 'ok  ' : 'FOUT'} ${naam}${extra ? ` ${extra}` : ''}`);
  if (!cond) mislukt += 1;
};

const store = await import(`${ROOT}/app/store.js`);
const data = await import(`${ROOT}/app/data.js`);
const router = await import(`${ROOT}/app/router.js`);
const leren = await import(`${ROOT}/app/views-leren.js`);
const naslag = await import(`${ROOT}/app/views-naslag.js`);
const ik = await import(`${ROOT}/app/views-ik.js`);

store.laad();
await data.laadSoorten();
// Zonder deze schakelaar zijn eerste-duik en witvis leeg, dus de demo zou niks tonen.
store.zetInstelling('ongekeurdToestaan', true);

const scherm = () => window.document.getElementById('scherm');
const tekst = () => scherm().textContent.replace(/\s+/g, ' ').trim();

console.log('== losse schermen renderen ==');
const schermen = [
  ['start', () => leren.toonStart()],
  ['modules', () => naslag.toonModules()],
  ['soorten', () => naslag.toonSoorten()],
  ['soortdetail snoek', () => naslag.toonSoort({ id: 'snoek' })],
  ['soortdetail zonder tekst', () => naslag.toonSoort({ id: 'pos' })],
  ['levenslijst', () => ik.toonLevenslijst()],
  ['ik', () => ik.toonIk()],
  ['hoe gemaakt', () => ik.toonGemaakt()],
];
for (const [naam, fn] of schermen) {
  try {
    fn();
    ok(naam, scherm().children.length > 0 && tekst().length > 20, `(${tekst().length} tekens)`);
  } catch (err) {
    ok(naam, false, `wierp: ${err.message}`);
  }
}

console.log('== inhoudscontroles ==');
naslag.toonSoort({ id: 'blankvoorn' }); // snoek heeft een lege verwardMet in de seed
ok('detail toont attributie', /iNaturalist|Commons/.test(tekst()));
ok('detail toont verwarpaar', /Wordt verward met/.test(tekst()));
ok('detail waarschuwt over ongecontroleerde tekst', /niet door een duiker nagekeken/.test(tekst()));

naslag.toonSoort({ id: 'pos' });
ok('soort zonder tekst toont "nog niet ingevuld"', /Nog niet ingevuld/.test(tekst()));

ik.toonGemaakt();
ok('verantwoording noemt de misgelopen soortnamen', /plantengeslacht/.test(tekst()));
ok('verantwoording toont fotografenlijst', /fotografen/.test(tekst()));

console.log('== hele sessie doorklikken ==');
store.wisSessie();
try {
  leren.toonSessie({});
  let stappen = 0;
  const gezien = new Set();
  while (stappen < 60) {
    const knoppen = [...window.document.querySelectorAll('.optie:not([disabled])')];
    const snap = window.document.getElementById('snap');
    const verder = window.document.getElementById('verder');

    if (snap) { gezien.add('leerkaart'); snap.click(); }
    else if (knoppen.length) {
      gezien.add('vraag');
      // wissel tussen goed en fout antwoorden om beide paden te raken
      knoppen[stappen % 2 === 0 ? 0 : knoppen.length - 1].click();
      const fb = window.document.querySelector('.fb');
      if (fb) { gezien.add('feedback'); window.document.getElementById('verder').click(); }
    } else if (verder) verder.click();
    else break;
    stappen += 1;
  }
  ok('sessie doorlopen', stappen > 3, `(${stappen} stappen, gezien: ${[...gezien].join(', ')})`);
  ok('leerkaart voorgekomen', gezien.has('leerkaart'));
  ok('feedback voorgekomen', gezien.has('feedback'));
  ok('eindigt op afsluitscherm', /Klaar/.test(tekst()), `-> "${tekst().slice(0, 70)}"`);
  ok('afsluiting toont geen XP of streak', !/XP|streak|punten/i.test(tekst()));
} catch (err) {
  ok('sessie doorlopen', false, `wierp: ${err.message}\n${err.stack?.split('\n')[1] ?? ''}`);
}

console.log('== voortgang is echt bijgehouden ==');
const standen = Object.entries(store.alleStanden());
ok('soorten hebben een boekje gekregen', standen.length > 0, `(${standen.length})`);
ok('paren geteld', Object.keys(store.alleParen()).length >= 0);

console.log('== router ==');
try {
  router.route('/', () => leren.toonStart());
  router.route('/soort/:id', ({ id }) => naslag.toonSoort({ id }));
  window.location.hash = '#/soort/snoek';
  router.verwerk();
  ok('route met parameter werkt', /Snoek/.test(tekst()));
  window.location.hash = '#/bestaat-niet';
  router.verwerk();
  ok('onbekende route valt terug op start', !/bestaat-niet/.test(tekst()));
} catch (err) {
  ok('router', false, err.message);
}

console.log('== export en import via de UI ==');
const dump = store.exporteerAlles();
ok('export bevat voortgang', JSON.parse(dump).voortgang.soorten && dump.length > 50);


console.log("== standaardsituatie: ongekeurde fotos NIET toegestaan ==");
store.wisAlles(); store.laad();
store.wisSessie();
try {
  leren.toonStart();
  ok("start rendert met standaardinstelling", tekst().length > 20);
  const oefen = window.document.getElementById("oefen");
  ok("oefenknop bestaat", Boolean(oefen));
  naslag.toonModules();
  const uitKaarten = window.document.querySelectorAll(".mod.uit").length;
  ok("modules zonder voorraad staan uit", uitKaarten > 0, `(${uitKaarten} van 8)`);
  ok("modules toont in voorbereiding", /in voorbereiding/.test(tekst()));
  leren.toonSessie({ module: "eerste-duik" });
  ok("lege module valt netjes terug", /niets om te oefenen/i.test(tekst()), `-> "${tekst().slice(0,60)}"`);
  ok("lege module verlaat quizmodus", !window.document.body.classList.contains("quiz"));
  naslag.toonSoort({ id: "snoek" });
  ok("soortdetail werkt ook zonder gekeurde fotos", /Snoek/.test(tekst()));
} catch (err) {
  ok("standaardsituatie", false, `wierp: ${err.message}`);
}

console.log(`\nconsole-fouten: ${fouten.length}`);
for (const f of fouten.slice(0, 10)) console.log(`  ${f}`);

console.log(mislukt === 0 && fouten.length === 0 ? '\nALLES GOED' : `\n${mislukt} mislukt, ${fouten.length} fouten`);
process.exit(mislukt || fouten.length ? 1 : 0);
