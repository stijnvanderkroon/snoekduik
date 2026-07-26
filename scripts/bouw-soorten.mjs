#!/usr/bin/env node
/**
 * Bouwt data/soorten.json: de bron van waarheid voor de app.
 *
 * Combineert drie bestanden die met de hand of door de probe zijn gemaakt:
 *   soorten.seed.json    structuur en soortenlijst
 *   data/fotoProbe.json  gevonden foto's per soort
 *   data/fotoOordelen.json  welke daarvan echt in-situ zijn
 *
 * Inhoudelijke teksten komen uit scripts/soortteksten.mjs. Alleen soorten die
 * daar staan hebben tekst; de rest houdt null en toont in de app "nog niet
 * ingevuld". Dat is bewust: onjuiste herkenningskenmerken zijn schadelijker dan
 * ontbrekende.
 *
 * Draait read-only over data/fotoOordelen.json, zodat het veilig is terwijl er
 * getrieerd wordt.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TEKSTEN } from './soortteksten.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Aantal gekeurde in-situ foto's dat een soort nodig heeft om in de quiz te komen. */
export const DREMPEL_QUIZ = 5;

/** Ongekeurde foto's per soort in de uitvoer. Alleen om de app te kunnen bekijken tijdens de triage. */
const MAX_ONGEKEURD = 8;

const lees = async (p, fallback = null) =>
  existsSync(p) ? JSON.parse(await readFile(p, 'utf8')) : fallback;

function seedPad() {
  for (const p of ['data/soorten.seed.json', 'soorten.seed.json']) {
    if (existsSync(join(ROOT, p))) return join(ROOT, p);
  }
  throw new Error('soorten.seed.json niet gevonden');
}

/** iNaturalist-attributie is "(c) naam, some rights reserved (CC BY-NC)". Alleen de naam is bruikbaar. */
function schoonFotograaf(ruw) {
  if (!ruw) return null;
  const m = ruw.match(/^\(c\)\s*([^,]+)/i);
  return (m ? m[1] : ruw).trim() || null;
}

/**
 * Kort, stabiel kenmerk per foto, zodat iemand in een formulier kan aangeven om
 * welke foto het gaat. Afgeleid van de bron-URL, dus hij verandert niet als de
 * data opnieuw wordt gebouwd of de volgorde wijzigt.
 *
 * Alfabet zonder I, L, O, U en 0/1: die worden verkeerd overgetypt.
 */
const ALFABET = '23456789ABCDEFGHJKMNPQRSTVWXYZ';

function fotoCode(bronUrl) {
  // FNV-1a, 32 bits. Geen cryptografie nodig, alleen een stabiel kort kenmerk.
  let hash = 0x811c9dc5;
  for (let i = 0; i < bronUrl.length; i += 1) {
    hash ^= bronUrl.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    code += ALFABET[hash % ALFABET.length];
    hash = Math.floor(hash / ALFABET.length);
  }
  return `F-${code}`;
}

const groterUrl = (thumb, bron) =>
  !thumb ? thumb
    : bron === 'commons' ? thumb.replace(/\/\d+px-/, '/1280px-')
    : thumb.replace('/medium.', '/large.');

async function main() {
  const seed = JSON.parse(await readFile(seedPad(), 'utf8'));
  const probe = (await lees(join(ROOT, 'data/fotoProbe.json'), { soorten: {} })).soorten;
  const oordelen = (await lees(join(ROOT, 'data/fotoOordelen.json'), { oordelen: {} })).oordelen;

  // bronUrl -> oordeel, zodat een foto weet of hij gekeurd is
  const perFoto = new Map();
  for (const v of Object.values(oordelen)) {
    if (v.bronUrl) perFoto.set(`${v.soortId}|${v.bronUrl}`, v);
  }

  const soorten = seed.soorten.map((s) => {
    const p = probe[s.id] ?? {};
    const rauw = [
      ...(p.inaturalist?.samples ?? []).map((f) => ({ ...f, bron: 'inaturalist' })),
      ...(p.commons?.samples ?? []).map((f) => ({ ...f, bron: 'commons' })),
    ];

    const fotos = rauw.map((f) => {
      const oordeel = perFoto.get(`${s.id}|${f.bronUrl}`);
      return {
        code: fotoCode(f.bronUrl),
        thumb: f.thumb,
        groot: groterUrl(f.thumb, f.bron === 'commons' ? 'commons' : 'inat'),
        // Alleen een goedgekeurde foto telt als echte onderwateropname.
        tier: oordeel?.oordeel === 'goed' ? 'insitu' : 'onbekend',
        gekeurd: oordeel?.oordeel === 'goed',
        twijfel: oordeel?.oordeel === 'misschien',
        ster: Boolean(oordeel?.ster),
        volgnummer: oordeel?.volgnummer ?? null,
        fotograaf: schoonFotograaf(f.fotograaf),
        licentie: f.licentie ?? null,
        bron: f.bron,
        bronUrl: f.bronUrl,
      };
    })
      // Afgekeurde foto's horen niet in de app, ook niet als plaatsvervanger.
      .filter((f) => perFoto.get(`${s.id}|${f.bronUrl}`)?.oordeel !== 'nee')
      // Beste eerst: ster, dan gekeurd, dan volgorde van goedkeuren.
      .sort((a, b) =>
        (b.ster - a.ster) || (b.gekeurd - a.gekeurd) ||
        ((a.volgnummer ?? 1e9) - (b.volgnummer ?? 1e9)));

    // Alle goedgekeurde foto's blijven; ongekeurde zijn alleen bedoeld om de app
    // te kunnen bekijken zolang de triage loopt, dus daarvan is een handvol
    // genoeg. Scheelt bijna de helft van de bestandsgrootte op mobiel.
    const gekeurd = fotos.filter((f) => f.gekeurd);
    const ongekeurd = fotos.filter((f) => !f.gekeurd).slice(0, MAX_ONGEKEURD);
    const beperkt = [...gekeurd, ...ongekeurd];

    const insitu = gekeurd;
    const tekst = TEKSTEN[s.id] ?? {};

    return {
      id: s.id,
      naamNL: s.naamNL,
      naamWetenschappelijk: s.naamWetenschappelijk,
      groep: s.groep,
      module: s.module,
      leefgebied: s.leefgebied,
      zone: s.zone,
      status: s.status,
      maxLengteCm: s.maxLengteCm,
      verwardMet: s.verwardMet,

      herkenningOnderWater: tekst.herkenningOnderWater ?? null,
      gedragBijDuiker: tekst.gedragBijDuiker ?? null,
      seizoen: tekst.seizoen ?? null,
      weetje: tekst.weetje ?? null,
      // Alleen onderscheidtekst voor soorten die ook echt in verwardMet staan.
      // De rest zou nooit getoond worden; hij blijft in soortteksten.mjs staan
      // en gaat vanzelf meedoen zodra het paar aan de seed wordt toegevoegd.
      onderscheid: tekst.onderscheid
        ? Object.fromEntries(
          Object.entries(tekst.onderscheid).filter(([ander]) => s.verwardMet.includes(ander)),
        )
        : null,
      meldenBij: s.meldenBij ?? tekst.meldenBij ?? null,
      /** false zolang een duiker de tekst niet heeft nagekeken. */
      tekstGecontroleerd: Boolean(tekst.gecontroleerd),

      fotos: beperkt,
      aantalInsitu: insitu.length,
      /** Bepaalt of de soort in de quiz mag. Zie DREMPEL_QUIZ. */
      quizKlaar: insitu.length >= DREMPEL_QUIZ,
    };
  });

  const perModule = {};
  for (const s of soorten) {
    const m = (perModule[s.module] ??= { totaal: 0, quizKlaar: 0, metTekst: 0 });
    m.totaal += 1;
    if (s.quizKlaar) m.quizKlaar += 1;
    if (s.herkenningOnderWater) m.metTekst += 1;
  }

  const uit = {
    schemaVersion: 1,
    gegenereerd: 'scripts/bouw-soorten.mjs',
    drempelQuiz: DREMPEL_QUIZ,
    modules: perModule,
    soorten,
  };

  await writeFile(join(ROOT, 'data/soorten.json'), `${JSON.stringify(uit, null, 1)}\n`);

  // Onderscheidtekst voor een soort die niet in verwardMet staat wordt nooit
  // getoond, en een verwarpaar dat maar van één kant genoemd wordt levert
  // asymmetrische quizvragen op. Beide zijn stille fouten, dus melden.
  const opId = new Map(soorten.map((s) => [s.id, s]));
  const klachten = [];
  for (const s of soorten) {
    for (const ander of Object.keys(TEKSTEN[s.id]?.onderscheid ?? {})) {
      if (!s.verwardMet.includes(ander)) {
        klachten.push(`${s.id}: onderscheidtekst voor "${ander}" is weggelaten, want die staat niet in verwardMet`);
      }
    }
    for (const ander of s.verwardMet) {
      if (!opId.has(ander)) klachten.push(`${s.id}: verwardMet verwijst naar onbekende soort "${ander}"`);
      else if (!opId.get(ander).verwardMet.includes(s.id)) {
        klachten.push(`${s.id} noemt ${ander} als verwarsoort, maar niet andersom`);
      }
    }
  }

  // Een fotocode moet uniek zijn: mensen gebruiken hem om aan te geven welke
  // foto ze bedoelen, dus een botsing wijst naar de verkeerde opname.
  const codes = new Map();
  for (const s of soorten) {
    for (const f of s.fotos) {
      if (codes.has(f.code) && codes.get(f.code) !== f.bronUrl) {
        klachten.push(`fotocode ${f.code} wordt door twee verschillende foto's gebruikt`);
      }
      codes.set(f.code, f.bronUrl);
    }
  }

  const metFoto = soorten.filter((s) => s.fotos.length).length;
  const klaar = soorten.filter((s) => s.quizKlaar);
  console.log(`data/soorten.json geschreven: ${soorten.length} soorten`);
  console.log(`  met foto's: ${metFoto}, quizklaar (>=${DREMPEL_QUIZ} gekeurd): ${klaar.length}`);
  console.log(`  met tekst: ${soorten.filter((s) => s.herkenningOnderWater).length}`);
  console.log('\nper module:');
  for (const [m, v] of Object.entries(perModule)) {
    console.log(`  ${m.padEnd(18)} ${String(v.quizKlaar).padStart(2)}/${v.totaal} quizklaar, ${v.metTekst} met tekst`);
  }

  if (klachten.length) {
    console.log(`\n${klachten.length} aandachtspunten in de verwarparen:`);
    for (const k of klachten) console.log(`  ${k}`);
  }
}

main().catch((err) => {
  process.stderr.write(`${err.stack ?? err}\n`);
  process.exit(1);
});
