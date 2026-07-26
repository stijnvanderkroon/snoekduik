/**
 * Bouwt een oefensessie en de losse vragen.
 *
 * Twee regels sturen alles:
 *  - Afleiders komen uit `verwardMet` van de doelsoort. Willekeurige afleiders
 *    leren niemand iets (snoek versus zwanenmossel).
 *  - Een vraagtype is pas beschikbaar als er foto's voor zijn. Ontbreken die,
 *    dan valt het type terug in plaats van te crashen. Zo verschraalt de quiz
 *    geleidelijk bij weinig materiaal.
 */

import { standVan, alleParen } from './store.js';
import { isToe, isNieuw, achterstand } from './leitner.js';

export const SESSIE_LENGTE = 15;
export const MAX_NIEUW = 3;
export const MAX_HERHALING = 10;

/** Welke vraagtypes bij welk boekje horen. De moeilijkheid loopt op met het boekje. */
const TYPES_PER_BOX = {
  1: ['fotoNaam', 'naamFoto'],
  2: ['fotoNaam', 'aOfB'],
  3: ['aOfB', 'uitsnede', 'zone'],
  4: ['uitsnede', 'gedrag', 'exoot', 'formaat'],
  5: ['uitsnede', 'aOfB', 'gedrag', 'formaat'],
};

/** Waar een type op terugvalt als het niet gebouwd kan worden. null is opgeven. */
const TERUGVAL = {
  aOfB: 'uitsnede',
  uitsnede: 'fotoNaam',
  naamFoto: 'fotoNaam',
  zone: 'fotoNaam',
  gedrag: 'fotoNaam',
  exoot: 'fotoNaam',
  formaat: 'fotoNaam',
  fotoNaam: null,
};

const willekeurig = (lijst) => lijst[Math.floor(Math.random() * lijst.length)];

function schud(lijst) {
  const a = [...lijst];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Foto's die in de quiz mogen: uitsluitend met de hand goedgekeurde in-situ
 * opnames. Een duiker moet herkennen wat hij onder water ziet, niet een strak
 * zijaanzicht op een meetlat.
 */
export const quizFotos = (soort) => soort.fotos.filter((f) => f.gekeurd);

export const heeftQuizFoto = (soort) => quizFotos(soort).length > 0;

/** Foto voor de leerkaart. Daar mag alles, ook een heldere aquariumfoto. */
export const leerFoto = (soort) => soort.fotos[0] ?? null;

// ---- afleiders --------------------------------------------------------------

/**
 * Bij voorkeur uit verwardMet, daarna soorten uit dezelfde groep die een
 * leefgebied delen. Alleen soorten met een bruikbare foto doen mee.
 */
function afleiders(doel, alle, aantal) {
  const bruikbaar = (s) => s.id !== doel.id && heeftQuizFoto(s);
  const opId = new Map(alle.map((s) => [s.id, s]));

  const uitVerward = (doel.verwardMet ?? [])
    .map((id) => opId.get(id))
    .filter((s) => s && bruikbaar(s));

  const gekozen = schud(uitVerward).slice(0, aantal);
  if (gekozen.length >= aantal) return gekozen;

  const rest = alle.filter(
    (s) => bruikbaar(s) && !gekozen.includes(s) &&
      s.groep === doel.groep &&
      s.leefgebied.some((g) => doel.leefgebied.includes(g)),
  );
  gekozen.push(...schud(rest).slice(0, aantal - gekozen.length));

  if (gekozen.length < aantal) {
    const noodgreep = alle.filter((s) => bruikbaar(s) && !gekozen.includes(s));
    gekozen.push(...schud(noodgreep).slice(0, aantal - gekozen.length));
  }
  return gekozen;
}

// ---- vraagbouwers -----------------------------------------------------------

/** Elke bouwer geeft null terug als de benodigde foto's ontbreken. */
const BOUWERS = {
  fotoNaam(doel, alle) {
    const fotos = quizFotos(doel);
    if (!fotos.length) return null;
    const anderen = afleiders(doel, alle, 3);
    if (anderen.length < 1) return null;
    return {
      type: 'fotoNaam',
      vraag: 'Welke soort zie je hier?',
      foto: willekeurig(fotos),
      opties: schud([doel, ...anderen]).map((s) => ({ id: s.id, label: s.naamNL })),
      goed: doel.id,
    };
  },

  naamFoto(doel, alle) {
    const fotos = quizFotos(doel);
    if (!fotos.length) return null;
    const anderen = afleiders(doel, alle, 3);
    if (anderen.length < 3) return null; // vier echte foto's of niets
    const opties = schud([
      { id: doel.id, foto: willekeurig(fotos) },
      ...anderen.map((s) => ({ id: s.id, foto: willekeurig(quizFotos(s)) })),
    ]);
    return { type: 'naamFoto', vraag: `Welke foto is een ${doel.naamNL.toLowerCase()}?`, opties, goed: doel.id };
  },

  uitsnede(doel, alle) {
    const fotos = quizFotos(doel);
    if (!fotos.length) return null;
    const anderen = afleiders(doel, alle, 3);
    if (anderen.length < 1) return null;
    return {
      type: 'uitsnede',
      vraag: 'Alleen dit detail. Welke soort?',
      foto: willekeurig(fotos),
      // Vaste uitsnede rond de kop, waar de meeste kenmerken zitten.
      uitsnede: { schaal: 2.4, x: 32 + Math.random() * 16, y: 34 + Math.random() * 16 },
      opties: schud([doel, ...anderen]).map((s) => ({ id: s.id, label: s.naamNL })),
      goed: doel.id,
    };
  },

  aOfB(doel, alle) {
    const fotos = quizFotos(doel);
    if (!fotos.length) return null;
    const opId = new Map(alle.map((s) => [s.id, s]));
    // Vereist dat beide helften van het paar voorraad hebben.
    const tegen = schud((doel.verwardMet ?? []).map((id) => opId.get(id)).filter((s) => s && heeftQuizFoto(s)))[0];
    if (!tegen) return null;
    return {
      type: 'aOfB',
      vraag: 'Welke van de twee is het?',
      foto: willekeurig(fotos),
      opties: schud([
        { id: doel.id, label: doel.naamNL },
        { id: tegen.id, label: tegen.naamNL },
      ]),
      goed: doel.id,
    };
  },

  zone(doel) {
    const fotos = quizFotos(doel);
    if (!fotos.length || !doel.zone?.length) return null;
    const ALLE = ['open-water', 'talud', 'bodem', 'kruidzone', 'hard-substraat'];
    const fout = schud(ALLE.filter((z) => !doel.zone.includes(z))).slice(0, 3);
    if (fout.length < 2) return null;
    const goed = willekeurig(doel.zone);
    return {
      type: 'zone',
      vraag: `Waar in het water vind je een ${doel.naamNL.toLowerCase()}?`,
      foto: willekeurig(fotos),
      opties: schud([goed, ...fout]).map((z) => ({ id: z, label: LABELS.zone[z] ?? z })),
      goed,
    };
  },

  gedrag(doel, alle) {
    const fotos = quizFotos(doel);
    if (!fotos.length || !doel.gedragBijDuiker) return null;
    const anderen = alle.filter((s) => s.id !== doel.id && s.gedragBijDuiker);
    if (anderen.length < 2) return null;
    const opties = schud([
      { id: doel.id, label: doel.gedragBijDuiker },
      ...schud(anderen).slice(0, 2).map((s) => ({ id: s.id, label: s.gedragBijDuiker })),
    ]);
    return {
      type: 'gedrag',
      vraag: `Wat doet een ${doel.naamNL.toLowerCase()} als je nadert?`,
      foto: willekeurig(fotos),
      opties,
      goed: doel.id,
    };
  },

  exoot(doel) {
    const fotos = quizFotos(doel);
    if (!fotos.length || !doel.status?.length) return null;
    const isExoot = doel.status.includes('exoot');
    return {
      type: 'exoot',
      vraag: `Is de ${doel.naamNL.toLowerCase()} hier van nature thuis?`,
      foto: willekeurig(fotos),
      opties: [
        { id: 'inheems', label: 'Inheems' },
        { id: 'exoot', label: 'Exoot' },
      ],
      goed: isExoot ? 'exoot' : 'inheems',
    };
  },

  formaat(doel) {
    const fotos = quizFotos(doel);
    if (!fotos.length || !doel.maxLengteCm) return null;
    const echt = doel.maxLengteCm;
    const kandidaten = new Set([echt]);
    for (const f of [0.35, 0.6, 1.8, 3]) {
      const v = Math.round((echt * f) / 5) * 5;
      if (v > 0 && v !== echt) kandidaten.add(v);
    }
    const opties = schud([...kandidaten]).slice(0, 4);
    if (!opties.includes(echt)) opties[0] = echt;
    return {
      type: 'formaat',
      vraag: `Hoe lang wordt een ${doel.naamNL.toLowerCase()} maximaal?`,
      foto: willekeurig(fotos),
      opties: schud(opties).map((v) => ({ id: String(v), label: `${v} cm` })),
      goed: String(echt),
      hint: 'Onder water lijkt alles ongeveer een derde groter dan het is.',
    };
  },
};

export const LABELS = {
  zone: {
    'open-water': 'In open water', talud: 'Tegen het talud', bodem: 'Op de bodem',
    kruidzone: 'Tussen de waterplanten', 'hard-substraat': 'Op hard substraat',
  },
  leefgebied: {
    'diepe-plas': 'Diepe plas', 'ondiepe-plas': 'Ondiepe plas', 'sloot-kanaal': 'Sloot of kanaal',
    rivier: 'Rivier', beek: 'Beek', 'groot-open-water': 'Groot open water',
  },
  module: {
    'eerste-duik': 'Eerste duik', witvis: 'Witvis', 'bodem-talud': 'Bodem en talud',
    grondels: 'Grondels', rivier: 'Rivier', kreeften: 'Kreeften',
    'mossels-slakken': 'Mossels en slakken', 'vreemd-spul': 'Vreemd spul',
  },
};

/**
 * Bouwt een vraag van het gevraagde type en volgt de terugvalketen tot er iets
 * lukt. Geeft null als zelfs fotoNaam niet gebouwd kan worden.
 */
export function maakVraag(doel, alle, gewenstType) {
  let type = gewenstType;
  const gezien = new Set();
  while (type && !gezien.has(type)) {
    gezien.add(type);
    const vraag = BOUWERS[type]?.(doel, alle);
    if (vraag) return { ...vraag, soortId: doel.id, gevraagdType: gewenstType };
    type = TERUGVAL[type];
  }
  return null;
}

export function kiesType(box) {
  return willekeurig(TYPES_PER_BOX[Math.min(5, Math.max(1, box))] ?? TYPES_PER_BOX[1]);
}

// ---- sessieopbouw -----------------------------------------------------------

/**
 * Stelt de items samen: eerst achterstallige herhalingen, dan nieuwe soorten.
 * Een nieuwe soort krijgt altijd eerst een leerkaart en daarna direct één
 * makkelijke vraag over diezelfde soort.
 */
/**
 * Soorten om vrij mee te oefenen als er niets te herhalen is en niets nieuws
 * meer. Zonder dit valt de app stil zodra je een module één keer doorlopen hebt:
 * een goed antwoord zet een soort op boekje 2, en die komt pas een dag later
 * terug.
 *
 * Volgorde: eerst soorten uit verwarparen waar je de meeste fouten in maakt,
 * daarna het laagste boekje, daarna het langst niet gezien.
 */
function oefenKandidaten(inScope) {
  const paren = alleParen();
  const foutenVan = (id) => Object.entries(paren)
    .filter(([sleutel]) => sleutel.split('|').includes(id))
    .reduce((n, [, p]) => n + p.fout, 0);

  return inScope
    .filter((s) => standVan(s.id).box > 0)
    .map((s) => ({ soort: s, fouten: foutenVan(s.id), stand: standVan(s.id) }))
    .sort((a, b) =>
      (b.fouten - a.fouten)
      || (a.stand.box - b.stand.box)
      || ((a.stand.laatsteReview ?? 0) - (b.stand.laatsteReview ?? 0)))
    .map((x) => x.soort);
}

export function bouwSessie(alleSoorten, { moduleFilter = null, nu = Date.now() } = {}) {
  const bruikbaar = alleSoorten.filter(heeftQuizFoto);
  const inScope = moduleFilter ? bruikbaar.filter((s) => s.module === moduleFilter) : bruikbaar;

  const herhalen = inScope
    .filter((s) => isToe(s.id, nu))
    .sort((a, b) => achterstand(b.id, nu) - achterstand(a.id, nu))
    .slice(0, MAX_HERHALING);

  const nieuwe = schud(inScope.filter((s) => isNieuw(s.id))).slice(0, MAX_NIEUW);

  const items = [];
  for (const soort of herhalen) {
    const vraag = maakVraag(soort, bruikbaar, kiesType(standVan(soort.id).box));
    if (vraag) items.push({ soort: 'vraag', ...vraag });
  }
  for (const soort of nieuwe) {
    items.push({ soort: 'leerkaart', soortId: soort.id });
    const vraag = maakVraag(soort, bruikbaar, 'fotoNaam');
    if (vraag) items.push({ soort: 'vraag', ...vraag });
  }

  // Niets te herhalen en niets nieuws? Dan een vrije oefenronde, zodat de app
  // niet stilvalt. Deze vragen verzetten het schema niet, zie `extra`.
  if (items.length === 0) {
    for (const soort of oefenKandidaten(inScope).slice(0, SESSIE_LENGTE)) {
      const vraag = maakVraag(soort, bruikbaar, kiesType(standVan(soort.id).box));
      if (vraag) items.push({ soort: 'vraag', extra: true, ...vraag });
    }
  }

  // Nooit twee vragen over dezelfde soort achter elkaar, behalve de koppeling
  // leerkaart plus eerste vraag.
  for (let i = 1; i < items.length - 1; i += 1) {
    if (items[i].soortId !== items[i + 1].soortId) continue;
    if (items[i].soort === 'leerkaart') continue;
    const ruil = items.findIndex((it, j) => j > i + 1 && it.soortId !== items[i].soortId);
    if (ruil > -1) [items[i + 1], items[ruil]] = [items[ruil], items[i + 1]];
  }

  const kort = items.slice(0, SESSIE_LENGTE);
  // Een leerkaart als laatste item betekent dat de bijbehorende vraag is
  // weggeknipt: dan introduceer je een soort zonder hem ooit te toetsen.
  while (kort.length && kort[kort.length - 1].soort === 'leerkaart') kort.pop();
  return kort;
}

/**
 * Een toets: puur vragen over één module, geen leerkaarten en geen herhalingen
 * binnen de sessie. Elke speelbare soort komt precies één keer langs, zodat de
 * uitslag iets zegt over de hele module.
 *
 * Een toets verzet het herhaalschema niet bij een goed antwoord (`extra`): je
 * kunt hem zo vaak doen als je wilt zonder de spreiding te slopen. Fouten tellen
 * wel, want die zeggen echt iets.
 */
export function bouwToets(alleSoorten, module) {
  const bruikbaar = alleSoorten.filter(heeftQuizFoto);
  const inModule = schud(bruikbaar.filter((s) => s.module === module));

  const items = [];
  for (const soort of inModule) {
    const vraag = maakVraag(soort, bruikbaar, kiesType(standVan(soort.id).box || 1));
    if (vraag) items.push({ soort: 'vraag', toets: true, extra: true, ...vraag });
  }
  return items;
}

/** Telt wat er klaarstaat, voor de tekst op het startscherm. */
export function watStaatKlaar(alleSoorten, nu = Date.now()) {
  const bruikbaar = alleSoorten.filter(heeftQuizFoto);
  return {
    herhalen: bruikbaar.filter((s) => isToe(s.id, nu)).length,
    nieuw: bruikbaar.filter((s) => isNieuw(s.id)).length,
    bruikbaar: bruikbaar.length,
    // Soorten die je al kent en dus vrij kunt oefenen.
    geleerd: bruikbaar.filter((s) => standVan(s.id).box > 0).length,
  };
}
