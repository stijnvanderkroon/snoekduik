#!/usr/bin/env node
/**
 * Dev-only. Turns data/fotoOordelen.json into the decisions for the next round:
 * which species still need photos, and whether Commons is worth querying at all.
 *
 * Usage: node tools/foto-triage/rapport.mjs
 */

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DOEL_GOED = 5;

const probePath = join(ROOT, 'data', 'fotoProbe.json');
const oordeelPath = join(ROOT, 'data', 'fotoOordelen.json');

if (!existsSync(oordeelPath)) {
  process.stderr.write('Nog geen data/fotoOordelen.json. Draai eerst de triage.\n');
  process.exit(1);
}

const probe = JSON.parse(await readFile(probePath, 'utf8'));
const { oordelen } = JSON.parse(await readFile(oordeelPath, 'utf8'));

const perSoort = new Map();
const perBron = { inat: { goed: 0, misschien: 0, nee: 0 }, commons: { goed: 0, misschien: 0, nee: 0 } };

for (const verdict of Object.values(oordelen)) {
  const { soortId, oordeel, bron } = verdict;
  if (!perSoort.has(soortId)) perSoort.set(soortId, { goed: 0, misschien: 0, nee: 0 });
  perSoort.get(soortId)[oordeel] += 1;
  if (perBron[bron]) perBron[bron][oordeel] += 1;
}

const rijen = Object.entries(probe.soorten)
  .filter(([, s]) => s.gecheckt)
  .map(([id, s]) => {
    const tel = perSoort.get(id) ?? { goed: 0, misschien: 0, nee: 0 };
    const beoordeeld = tel.goed + tel.misschien + tel.nee;
    const beschikbaar =
      (s.inaturalist?.samples?.length ?? 0) + (s.commons?.samples?.length ?? 0);
    return {
      id,
      naam: s.naamNL,
      module: s.module,
      goed: tel.goed,
      misschien: tel.misschien,
      nee: tel.nee,
      beoordeeld,
      beschikbaar,
      pool: s.inaturalist?.bruikbaarTotaal ?? 0,
    };
  })
  .sort((a, b) => a.goed - b.goed);

const pad = (v, n) => String(v).padStart(n);
/** Truncates as well as pads, so a long species name cannot shift the whole row. */
const padr = (v, n) => (String(v).length > n - 1 ? `${String(v).slice(0, n - 2)}… ` : String(v).padEnd(n));

console.log('\n=== Soorten met te weinig goede in-situ foto\'s ===');
console.log(`${padr('soort', 26)}${padr('module', 17)}${pad('goed', 5)}${pad('misschien', 10)}${pad('nee', 5)}${pad('gedaan', 8)}${pad('pool', 7)}`);
const tekort = rijen.filter((r) => r.goed < DOEL_GOED);
for (const r of tekort) {
  console.log(`${padr(r.naam, 26)}${padr(r.module, 17)}${pad(r.goed, 5)}${pad(r.misschien, 10)}${pad(r.nee, 5)}${pad(`${r.beoordeeld}/${r.beschikbaar}`, 8)}${pad(r.pool, 7)}`);
}

console.log(`\n${tekort.length} van ${rijen.length} soorten onder de ${DOEL_GOED}.`);

// Species with a large remaining pool can be fixed by paging deeper; the rest need outreach.
const dieperMogelijk = tekort.filter((r) => r.pool > r.beschikbaar * 2);
const uitbesteden = tekort.filter((r) => r.pool <= r.beschikbaar * 2);

console.log(`\nDieper zoeken kan helpen (grote resterende pool): ${dieperMogelijk.length}`);
console.log(`  ${dieperMogelijk.map((r) => r.id).join(', ') || '-'}`);
console.log(`\nPool is uitgeput, ANEMOON/eigen materiaal nodig: ${uitbesteden.length}`);
console.log(`  ${uitbesteden.map((r) => r.id).join(', ') || '-'}`);

// Species with a surplus: which 5 to actually ship is a ranking question, so show the order.
const overschot = rijen.filter((r) => r.goed > DOEL_GOED);
if (overschot.length) {
  console.log(`\n=== Soorten met meer dan ${DOEL_GOED} goede foto's (kies de beste) ===`);
  for (const r of overschot) {
    const goedeFotos = Object.values(oordelen)
      .filter((v) => v.soortId === r.id && v.oordeel === 'goed')
      .sort((a, b) => (b.ster === true) - (a.ster === true) || (a.volgnummer ?? 0) - (b.volgnummer ?? 0));
    const sterren = goedeFotos.filter((v) => v.ster).length;
    console.log(`\n${r.naam} — ${r.goed} goed${sterren ? `, ${sterren} met ster` : ''}`);
    goedeFotos.forEach((v, i) => {
      const merk = v.ster ? '★' : ' ';
      const top = i < DOEL_GOED ? '→' : ' ';
      console.log(`  ${top}${merk} ${String(i + 1).padStart(2)}. [${v.bron}] ${v.bronUrl}`);
    });
  }
  console.log(`\n→ = huidige top ${DOEL_GOED} (sterren eerst, daarna volgorde van goedkeuren).`);
}

console.log('\n=== Trefkans per bron ===');
for (const [bron, tel] of Object.entries(perBron)) {
  const totaal = tel.goed + tel.misschien + tel.nee;
  if (!totaal) continue;
  const pct = ((tel.goed / totaal) * 100).toFixed(1);
  console.log(`${padr(bron, 9)} ${pad(totaal, 5)} beoordeeld · ${pad(tel.goed, 4)} goed (${pct}%) · ${pad(tel.misschien, 4)} misschien · ${pad(tel.nee, 4)} nee`);
}
console.log('\nAls Commons duidelijk lager scoort, laat die bron in ronde 2 vallen en pagineer dieper op iNaturalist.');
