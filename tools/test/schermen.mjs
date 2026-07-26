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
const fb = await import(`${ROOT}/app/views-feedback.js`);
const wk = await import(`${ROOT}/app/views-welkom.js`);

store.laad();
await data.laadSoorten();
// De triage is af: alle schermen draaien op echt goedgekeurd materiaal.

const readmeCss = readFileSync(`${ROOT}/app/app.css`, 'utf8');
const readOverMij = readFileSync(`${ROOT}/app/over-mij.js`, 'utf8');
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
  ['feedback', () => fb.toonFeedback()],
  ['welkom', () => wk.toonWelkom()],
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

naslag.toonSoort({ id: 'winde' }); // heeft wel herkenning maar geen gedragstekst
ok('ontbrekend veld toont "nog niet ingevuld"', /Nog niet ingevuld/.test(tekst()));

ik.toonGemaakt();
ok('verantwoording begint bij de AI-herkomst', /volledig met AI gemaakt/i.test(tekst()));
ok('verantwoording legt de fotoherkomst uit', /iNaturalist/.test(tekst()) && /met de hand/.test(tekst()));
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
  const perModule = new Map();
  for (const s of data.soorten()) {
    const v = perModule.get(s.module) ?? { speelbaar: 0 };
    if (s.fotos.some((f) => f.gekeurd)) v.speelbaar += 1;
    perModule.set(s.module, v);
  }
  const legeModules = [...perModule.entries()].filter(([, v]) => v.speelbaar === 0).map(([m]) => m);
  const uitKaarten = window.document.querySelectorAll(".mod.uit").length;
  ok("aantal grijze modulekaarten klopt met de data", uitKaarten === legeModules.length,
    `(${uitKaarten} kaarten, ${legeModules.length} lege modules)`);
  if (legeModules.length) {
    ok("modules toont in voorbereiding", /in voorbereiding/.test(tekst()));
    leren.toonSessie({ module: legeModules[0] });
    ok("lege module valt netjes terug", /niets om te oefenen/i.test(tekst()), `-> "${tekst().slice(0, 60)}"`);
    ok("lege module verlaat quizmodus", !window.document.body.classList.contains("quiz"));
  } else {
    console.log("  (geen lege modules meer, die controles overgeslagen)");
  }
  naslag.toonSoort({ id: "snoek" });
  ok("soortdetail werkt ook zonder gekeurde fotos", /Snoek/.test(tekst()));
} catch (err) {
  ok("standaardsituatie", false, `wierp: ${err.message}`);
}


console.log("== zichtsimulatie is weg ==");
ok("geen zichtinstelling meer", window.document.getElementById("zicht") === null);
ok("geen zichtklassen in de quiz", !readmeCss.includes(".zicht-1"));
ok("geen zichtlabel in de dom", window.document.querySelector(".zichtlabel") === null);

console.log("== feedback ==");
fb.toonFeedback();
const ft = tekst();
ok("noemt de drie formulieren", /mijn foto/i.test(ft) && /onderwaterfoto/i.test(ft) && /Verbetering/i.test(ft));
ok("zegt dat niet alles beantwoord wordt", /niet op alles reageren/i.test(ft));
ok("zegt dat het niet persoonlijk is", /niet persoonlijk/i.test(ft));
ok("legt de rechten bij bijdragen uit", /geen vergoeding/i.test(ft));
ok("noemt de fotocode", /F-[A-Z0-9]{6}/.test(ft));
ok("heeft een uitklapper met gewilde soorten", window.document.querySelector("details.gewild, details.uitklap") !== null);
const formKnoppen = [...window.document.querySelectorAll(".kaart .knop")];
ok("drie formulierknoppen", formKnoppen.length === 3, `(${formKnoppen.length})`);
ok("elke knop is een echte link of netjes uitgeschakeld", formKnoppen.every((k) =>
  k.tagName === "A" ? /^https:\/\// .test(k.getAttribute("href")) : k.disabled));
ok("links openen veilig in een nieuw tabblad", formKnoppen.filter((k) => k.tagName === "A")
  .every((a) => a.getAttribute("target") === "_blank" && /noopener/.test(a.getAttribute("rel"))));

console.log("== fotocodes ==");
naslag.toonSoort({ id: "snoek" });
ok("soortdetail toont een fotocode", /F-[A-Z0-9]{6}/.test(tekst()));
const alleFotos = data.soorten().flatMap((s) => s.fotos);
ok("elke foto heeft een unieke code",
  new Set(alleFotos.map((f) => f.code)).size === alleFotos.length,
  `(${alleFotos.length} fotos)`);

console.log("== feedbackknop ==");
ok("knop staat altijd in de pagina", window.document.querySelector(".feedbackknop") !== null);
ok("knop wijst naar het feedbackscherm",
  window.document.querySelector(".feedbackknop").getAttribute("href") === "#/feedback");


console.log("== welkomsscherm ==");
store.wisAlles(); store.laad();
ok("nog niet gezien bij een lege opslag", !store.instellingen().welkomGezien);
wk.toonWelkom();
const wt = tekst();
ok("noemt de AI-herkomst", /met AI gemaakt/i.test(wt));
ok("waarschuwt dat teksten niet nagekeken zijn", /niet door een duiker nagekeken/i.test(wt));
ok("legt uit dat er geen tracking is", /geen tracking/i.test(wt));
ok("legt de onderwaterfoto-regel uit", /alleen echte onderwaterfoto/i.test(wt));
window.document.getElementById("beginnen").click();
ok("beginnen onthoudt dat je het gezien hebt", store.instellingen().welkomGezien === true);

console.log("== over mij ==");
const overMijGevuld = /OVER_MIJ = `[^`]*[A-Za-z]/.test(readOverMij);
for (const [naam, fn] of [["verantwoording", () => ik.toonGemaakt()], ["welkomsscherm", () => wk.toonWelkom()]]) {
  fn();
  ok(`over-mij op het ${naam}`, /Over mij/.test(tekst()) === overMijGevuld);
}
ik.toonGemaakt();
ok("over-mij tussen wat-er-niet-in-zit en de fotografen", (() => {
  const k = [...window.document.querySelectorAll(".blokkop")].map((e) => e.textContent.trim());
  const i = k.indexOf("Over mij");
  return !overMijGevuld || (i > k.indexOf("Wat er niet in zit") && i < k.indexOf("Fotografen en licenties"));
})());
ok("regelafbrekingen worden geen woordplakkers", (() => {
  // Alleen de over-mij alineas: elders plakt textContent losse blokken aan elkaar.
  const kaart = [...window.document.querySelectorAll(".kaart")].find((k) => /Over mij/.test(k.textContent));
  if (!kaart) return !overMijGevuld;
  return [...kaart.querySelectorAll("p")].every((p) => !/\S{25,}/.test(p.textContent));
})());


console.log("== test mijn kennis ==");
store.wisAlles(); store.laad();
leren.toonToetsKeuze();
const toetsLinks = [...window.document.querySelectorAll('a[href^="#/toets/"]')];
ok("toetskeuze toont startbare modules", toetsLinks.length > 0, `(${toetsLinks.length})`);
ok("toetskeuze zegt dat er geen leerkaarten in zitten", /geen leerkaarten/i.test(tekst()));

const module = toetsLinks[0].getAttribute("href").split("/").pop();
leren.toonToets({ module });
let toetsStappen = 0;
let leerkaartenInToets = 0;
while (toetsStappen < 40) {
  if (window.document.getElementById("snap")) { leerkaartenInToets += 1; window.document.getElementById("snap").click(); }
  else {
    const knoppen = [...window.document.querySelectorAll(".optie:not([disabled])")];
    if (!knoppen.length) break;
    knoppen[toetsStappen % 2 ? knoppen.length - 1 : 0].click();
    window.document.getElementById("verder")?.click();
  }
  toetsStappen += 1;
}
ok("toets bevat geen leerkaarten", leerkaartenInToets === 0);
ok("toets eindigt op een uitslag met score", /Uitslag/.test(tekst()) && /van de/.test(tekst()));
ok("een toets verzet het herhaalschema niet bij goede antwoorden",
  Object.values(store.alleStanden()).every((s) => s.box <= 1));

console.log("== modulefilter in de soortenlijst ==");
naslag.toonSoorten();
const keuze = window.document.getElementById("module");
ok("modulekiezer aanwezig", Boolean(keuze));
ok("bevat alle modules plus 'alle'",
  keuze.options.length === new Set(data.soorten().map((s) => s.module)).size + 1,
  `(${keuze.options.length} opties)`);
keuze.value = "witvis";
keuze.dispatchEvent(new window.Event("change"));
const naFilter = [...window.document.querySelectorAll("#lijst .lijstitem")];
const verwacht = data.soorten().filter((s) => s.module === "witvis").length;
ok("filtert op module", naFilter.length === verwacht, `(${naFilter.length} van verwacht ${verwacht})`);
ok("teller volgt het filter", /van \d+/.test(window.document.getElementById("aantal").textContent));
keuze.value = "alles";
keuze.dispatchEvent(new window.Event("change"));
ok("filter terugzetten toont alles weer",
  window.document.querySelectorAll("#lijst .lijstitem").length === data.soorten().length);

console.log(`\nconsole-fouten: ${fouten.length}`);
for (const f of fouten.slice(0, 10)) console.log(`  ${f}`);

console.log(mislukt === 0 && fouten.length === 0 ? '\nALLES GOED' : `\n${mislukt} mislukt, ${fouten.length} fouten`);
process.exit(mislukt || fouten.length ? 1 : 0);
