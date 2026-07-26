/**
 * Leitner met vijf boekjes.
 *
 * Boekje 0 betekent nog nooit gezien. Een goed antwoord is één boekje omhoog,
 * een fout antwoord gaat terug naar 1 en niet één omlaag: bij verwarparen is een
 * misser zelden een halve fout maar een verkeerd aangeleerd kenmerk.
 */

import { standVan, zetStand } from './store.js';

/** Dagen tot de volgende herhaling, per boekje. Boekje 1 komt dezelfde sessie terug. */
export const INTERVALLEN = { 1: 0, 2: 1, 3: 3, 4: 7, 5: 21 };
export const MAX_BOX = 5;

const DAG = 24 * 60 * 60 * 1000;

export function isToe(soortId, nu = Date.now()) {
  const s = standVan(soortId);
  if (s.box === 0) return false; // nog niet geleerd, dat is geen herhaling
  if (!s.volgendeReview) return true;
  return s.volgendeReview <= nu;
}

export const isNieuw = (soortId) => standVan(soortId).box === 0;

/** Hoe lang iets al te laat is, gebruikt om de oudste eerst te plannen. */
export function achterstand(soortId, nu = Date.now()) {
  const s = standVan(soortId);
  if (s.box === 0 || !s.volgendeReview) return 0;
  return Math.max(0, nu - s.volgendeReview);
}

/**
 * Verwerkt een antwoord. Bij vrij oefenen (`extra`) telt een goed antwoord niet
 * mee voor het schema: anders kun je in één middag alles naar boekje 5 tikken en
 * is de spreiding weg. Een fout antwoord telt altijd, want dat is echte
 * informatie over wat je nog niet kent.
 */
export function verwerkAntwoord(soortId, goed, { nu = Date.now(), extra = false } = {}) {
  const vorige = standVan(soortId);

  if (extra && goed) {
    zetStand(soortId, { ...vorige, gezien: vorige.gezien + 1 });
    return { vorigeBox: vorige.box, nieuweBox: vorige.box, omhoog: false };
  }

  const box = goed ? Math.min(MAX_BOX, Math.max(1, vorige.box) + 1) : 1;

  const nieuw = {
    box,
    gezien: vorige.gezien + 1,
    fout: vorige.fout + (goed ? 0 : 1),
    laatsteReview: nu,
    volgendeReview: nu + INTERVALLEN[box] * DAG,
  };
  zetStand(soortId, nieuw);
  return { vorigeBox: vorige.box, nieuweBox: box, omhoog: box > vorige.box };
}

/** Zet een soort op boekje 1 zodra de leerkaart is gezien, nog zonder toetsing. */
export function markeerGezien(soortId, nu = Date.now()) {
  const vorige = standVan(soortId);
  if (vorige.box > 0) return;
  zetStand(soortId, {
    ...vorige, box: 1, gezien: vorige.gezien + 1, laatsteReview: nu, volgendeReview: nu,
  });
}

/** Aantal soorten dat "blijft zitten": boekje 4 of 5. */
export function aantalBeheerst(soortIds) {
  return soortIds.filter((id) => standVan(id).box >= 4).length;
}

/**
 * Voortgang van 0 tot 100 over een groep soorten, als gemiddelde vulling van de
 * boekjes. Anders dan `aantalBeheerst` beweegt dit meteen: wachten tot boekje 4
 * duurt minstens vier dagen, en een ring die dagenlang op nul staat leest als
 * kapot in plaats van als streng.
 */
export function voortgangPercentage(soortIds) {
  if (soortIds.length === 0) return 0;
  const som = soortIds.reduce((n, id) => n + Math.min(MAX_BOX, standVan(id).box), 0);
  return Math.round((som / (soortIds.length * MAX_BOX)) * 100);
}
