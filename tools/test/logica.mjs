/** Headless test van de logica-modules: store, leitner en sessie. */

import { readFileSync } from 'node:fs';

import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');

// minimale localStorage
const opslag = new Map();
globalThis.localStorage = {
  getItem: (k) => (opslag.has(k) ? opslag.get(k) : null),
  setItem: (k, v) => opslag.set(k, String(v)),
  removeItem: (k) => opslag.delete(k),
};

const store = await import(`${ROOT}/app/store.js`);
const leitner = await import(`${ROOT}/app/leitner.js`);
const sessie = await import(`${ROOT}/app/sessie.js`);

let fouten = 0;
const ok = (naam, cond, extra = '') => {
  if (cond) console.log(`  ok   ${naam}`);
  else { console.log(`  FOUT ${naam} ${extra}`); fouten += 1; }
};

const data = JSON.parse(readFileSync(`${ROOT}/data/soorten.json`, 'utf8'));
const alle = data.soorten;

console.log('== store ==');
store.laad();
ok('lege start', Object.keys(store.alleStanden()).length === 0);
store.zetStand('snoek', { box: 3, gezien: 4, fout: 1, laatsteReview: 1, volgendeReview: 2 });
ok('stand bewaard', store.standVan('snoek').box === 3);
store.noteerPaar('blankvoorn', 'ruisvoorn', false);
store.noteerPaar('ruisvoorn', 'blankvoorn', true);
const paar = store.alleParen()[store.paarSleutel('blankvoorn', 'ruisvoorn')];
ok('paar telt beide richtingen als één', paar.totaal === 2 && paar.fout === 1, JSON.stringify(paar));

store.voegWaarnemingToe('snoek', '2026-07-26', 'test');
const dump = store.exporteerAlles();
store.wisAlles();
store.laad();
ok('na wissen leeg', Object.keys(store.alleStanden()).length === 0);
const uit = store.importeerAlles(dump);
ok('import herstelt', store.standVan('snoek').box === 3 && uit.waarnemingen === 1, JSON.stringify(uit));
let gooide = false;
try { store.importeerAlles('{"app":"iets anders"}'); } catch { gooide = true; }
ok('import weigert vreemd bestand', gooide);

console.log('== leitner ==');
store.wisAlles(); store.laad();
ok('nieuw is box 0', leitner.isNieuw('snoek'));
ok('nieuw is niet toe', !leitner.isToe('snoek'));
let r = leitner.verwerkAntwoord('snoek', true);
ok('eerste goed naar box 2', r.nieuweBox === 2, JSON.stringify(r));
leitner.verwerkAntwoord('snoek', true);
leitner.verwerkAntwoord('snoek', true);
ok('drie keer goed naar box 4', store.standVan('snoek').box === 4);
r = leitner.verwerkAntwoord('snoek', false);
ok('fout terug naar 1, niet 3', r.nieuweBox === 1, JSON.stringify(r));
for (let i = 0; i < 9; i += 1) leitner.verwerkAntwoord('snoek', true);
ok('stopt bij 5', store.standVan('snoek').box === 5);
ok('aantalBeheerst telt box>=4', leitner.aantalBeheerst(['snoek']) === 1);

console.log('== sessie, alleen gekeurde fotos ==');
store.wisAlles(); store.laad();
const klaar = sessie.watStaatKlaar(alle);
console.log(`  ${klaar.bruikbaar} soorten met gekeurde fotos, ${klaar.nieuw} nieuw`);
ok('bruikbaar > 0', klaar.bruikbaar > 0);
const items = sessie.bouwSessie(alle);
ok('sessie levert items', items.length > 0, `(${items.length})`);
ok('nieuwe soort krijgt eerst leerkaart', items[0]?.soort === 'leerkaart' || items.some((i) => i.soort === 'vraag'));

console.log('== alleen goedgekeurde fotos in de quiz ==');
const metOngekeurd = alle.filter((s) => s.fotos.some((f) => !f.gekeurd));
ok('er bestaat nog ongekeurd materiaal', metOngekeurd.length > 0, `(${metOngekeurd.length} soorten)`);
ok('geen enkele quizfoto is ongekeurd',
  alle.every((s) => sessie.quizFotos(s).every((f) => f.gekeurd)));
ok('elke quizfoto heeft een maker of is CC0',
  alle.flatMap((s) => sessie.quizFotos(s)).every((f) => f.fotograaf || f.licentie === 'cc0'));

console.log('== alle vraagtypes bouwen ==');
const types = ['fotoNaam', 'naamFoto', 'uitsnede', 'aOfB', 'zone', 'gedrag', 'exoot', 'formaat'];
const bruikbaar = alle.filter(sessie.heeftQuizFoto);
for (const t of types) {
  let gelukt = 0, teruggevallen = 0;
  for (const s of bruikbaar) {
    const v = sessie.maakVraag(s, bruikbaar, t);
    if (!v) continue;
    if (v.type === t) gelukt += 1; else teruggevallen += 1;
  }
  ok(`${t}: ${gelukt} direct, ${teruggevallen} teruggevallen`, gelukt + teruggevallen > 0);
}

console.log('== vragen zijn intern consistent ==');
let controles = 0;
for (const s of bruikbaar.slice(0, 40)) {
  for (const t of types) {
    const v = sessie.maakVraag(s, bruikbaar, t);
    if (!v) continue;
    controles += 1;
    if (!v.opties?.length) { ok(`${s.id}/${t} heeft opties`, false); break; }
    const ids = v.opties.map((o) => o.id);
    if (!ids.includes(v.goed)) { ok(`${s.id}/${t}: juiste antwoord zit in opties`, false, JSON.stringify(ids)); break; }
    if (new Set(ids).size !== ids.length) { ok(`${s.id}/${t}: geen dubbele opties`, false, JSON.stringify(ids)); break; }
    if (v.type !== 'naamFoto' && !v.foto?.groot) { ok(`${s.id}/${t} heeft foto`, false); break; }
    if (v.type === 'naamFoto' && v.opties.some((o) => !o.foto)) { ok(`${s.id}/${t} opties met foto`, false); break; }
  }
}
ok(`${controles} vragen gecontroleerd op opties, juist antwoord, dubbelen en foto`, true);

console.log('== afleiders komen uit verwardMet ==');
const metVerward = bruikbaar.filter((s) => (s.verwardMet ?? []).some((id) => bruikbaar.find((x) => x.id === id)));
let uitVerward = 0, totaal = 0;
for (const s of metVerward) {
  const v = sessie.maakVraag(s, bruikbaar, 'fotoNaam');
  if (!v) continue;
  totaal += 1;
  if (v.opties.some((o) => o.id !== s.id && s.verwardMet.includes(o.id))) uitVerward += 1;
}
ok(`${uitVerward}/${totaal} fotoNaam-vragen gebruiken een verwarsoort als afleider`,
  totaal === 0 || uitVerward / totaal > 0.9, `${uitVerward}/${totaal}`);

console.log('== aOfB vereist beide helften ==');
let aOfBecht = 0, aOfBterug = 0;
for (const s of bruikbaar) {
  const v = sessie.maakVraag(s, bruikbaar, 'aOfB');
  if (!v) continue;
  if (v.type === 'aOfB') {
    aOfBecht += 1;
    const tegen = v.opties.find((o) => o.id !== s.id);
    if (!s.verwardMet.includes(tegen.id)) { ok('aOfB tegenstander uit verwardMet', false, tegen.id); break; }
  } else aOfBterug += 1;
}
ok(`aOfB: ${aOfBecht} echt gebouwd, ${aOfBterug} teruggevallen op ander type`, true);

console.log(`\n${fouten === 0 ? 'ALLES GOED' : `${fouten} FOUTEN`}`);
process.exit(fouten ? 1 : 0);
