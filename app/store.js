/**
 * Voortgang in localStorage, met versienummer en migratieketen.
 *
 * Het datamodel gaat veranderen. Zonder migratie gooi je voortgang van
 * gebruikers weg, dus de keten staat er vanaf de eerste versie in, net als
 * export en import: Safari wist script-writable storage na zeven dagen zonder
 * bezoek, en dat treft precies de gebruiker die je terug wil winnen.
 *
 * Bewust niet opgeslagen: streak, XP, badges, laatste bezoek. Deze app houdt
 * niet bij of je gisteren ook geoefend hebt.
 */

const SLEUTEL_VOORTGANG = 'snoekduik.progress.v1';
const SLEUTEL_LEVENSLIJST = 'snoekduik.levenslijst.v1';

export const HUIDIGE_VERSIE = 1;

const leegVoortgang = () => ({
  schemaVersion: HUIDIGE_VERSIE,
  soorten: {},
  instellingen: {},
  verwarparen: {},
  sessie: null,
});

const leegLevenslijst = () => ({ schemaVersion: HUIDIGE_VERSIE, waarnemingen: [] });

/**
 * Migraties van versie n naar n+1, op volgorde toegepast. Een nieuwe versie
 * voegt hier een functie toe en verhoogt HUIDIGE_VERSIE. Nooit een bestaande
 * migratie aanpassen: die is al bij gebruikers gedraaid.
 */
const MIGRATIES = {
  // 1: (data) => { ...; return data; },
};

function migreer(data, naam) {
  if (!data || typeof data !== 'object') return null;
  let versie = data.schemaVersion ?? 0;

  if (versie > HUIDIGE_VERSIE) {
    // Nieuwere versie dan deze app kent: niets wissen, wel melden.
    console.warn(`${naam}: opgeslagen versie ${versie} is nieuwer dan ${HUIDIGE_VERSIE}`);
    return { ...data, _teNieuw: true };
  }

  while (versie < HUIDIGE_VERSIE) {
    const stap = MIGRATIES[versie];
    if (!stap) { versie = HUIDIGE_VERSIE; break; }
    data = stap(data);
    versie += 1;
  }
  return { ...data, schemaVersion: HUIDIGE_VERSIE };
}

function lees(sleutel, maakLeeg, naam) {
  try {
    const ruw = localStorage.getItem(sleutel);
    if (!ruw) return maakLeeg();
    return migreer(JSON.parse(ruw), naam) ?? maakLeeg();
  } catch (err) {
    console.warn(`${naam} onleesbaar, begin opnieuw:`, err);
    return maakLeeg();
  }
}

let voortgang = null;
let levenslijst = null;

export function laad() {
  voortgang = lees(SLEUTEL_VOORTGANG, leegVoortgang, 'voortgang');
  levenslijst = lees(SLEUTEL_LEVENSLIJST, leegLevenslijst, 'levenslijst');
  // Oudere opslag kende deze sleutels nog niet.
  voortgang.instellingen ??= leegVoortgang().instellingen;
  voortgang.verwarparen ??= {};
  voortgang.soorten ??= {};
  return voortgang;
}

function bewaar() {
  if (voortgang?._teNieuw) return; // alleen-lezen modus
  try {
    localStorage.setItem(SLEUTEL_VOORTGANG, JSON.stringify(voortgang));
    localStorage.setItem(SLEUTEL_LEVENSLIJST, JSON.stringify(levenslijst));
  } catch (err) {
    console.warn('Opslaan mislukt:', err);
  }
}

export const alleenLezen = () => Boolean(voortgang?._teNieuw);

// ---- soortvoortgang ---------------------------------------------------------

export function standVan(soortId) {
  return voortgang.soorten[soortId] ?? {
    box: 0, gezien: 0, fout: 0, extraGoed: 0, laatsteReview: null, volgendeReview: null,
  };
}

export function zetStand(soortId, stand) {
  voortgang.soorten[soortId] = stand;
  bewaar();
}

export const alleStanden = () => voortgang.soorten;

// ---- verwarparen ------------------------------------------------------------

/** Sleutel is alfabetisch, zodat A|B en B|A hetzelfde paar zijn. */
export const paarSleutel = (a, b) => [a, b].sort().join('|');

export function noteerPaar(doelId, gekozenId, goed) {
  if (doelId === gekozenId) return;
  const k = paarSleutel(doelId, gekozenId);
  const p = (voortgang.verwarparen[k] ??= { fout: 0, totaal: 0 });
  p.totaal += 1;
  if (!goed) p.fout += 1;
  bewaar();
}

export const alleParen = () => voortgang.verwarparen;

// ---- instellingen -----------------------------------------------------------

export const instellingen = () => voortgang.instellingen;

export function zetInstelling(sleutel, waarde) {
  voortgang.instellingen[sleutel] = waarde;
  bewaar();
}

// ---- onderbroken sessie -----------------------------------------------------

export function bewaarSessie(sessie) {
  voortgang.sessie = sessie;
  bewaar();
}

export const lopendeSessie = () => voortgang.sessie;

export function wisSessie() {
  voortgang.sessie = null;
  bewaar();
}

// ---- levenslijst ------------------------------------------------------------

export const waarnemingen = () => levenslijst.waarnemingen;

export function voegWaarnemingToe(soortId, datum, notitie) {
  levenslijst.waarnemingen.unshift({ soortId, datum, notitie: notitie || null });
  bewaar();
}

export function verwijderWaarneming(index) {
  levenslijst.waarnemingen.splice(index, 1);
  bewaar();
}

// ---- export en import -------------------------------------------------------

export function exporteerAlles() {
  return JSON.stringify(
    { app: 'snoekduik', schemaVersion: HUIDIGE_VERSIE, voortgang, levenslijst },
    null,
    2,
  );
}

/**
 * Leest een eerder geexporteerd bestand terug. Gooit bij onherkenbare inhoud,
 * zodat de aanroeper een nette melding kan tonen in plaats van stil te falen.
 */
export function importeerAlles(tekst) {
  const data = JSON.parse(tekst);
  if (data.app !== 'snoekduik') throw new Error('Dit lijkt geen Snoekduik-export');

  const nieuweVoortgang = migreer(data.voortgang, 'import voortgang');
  const nieuweLijst = migreer(data.levenslijst, 'import levenslijst');
  if (!nieuweVoortgang) throw new Error('Geen voortgang in dit bestand');

  voortgang = { ...leegVoortgang(), ...nieuweVoortgang };
  levenslijst = nieuweLijst ?? leegLevenslijst();
  delete voortgang._teNieuw;
  bewaar();
  return { soorten: Object.keys(voortgang.soorten).length, waarnemingen: levenslijst.waarnemingen.length };
}

export function wisAlles() {
  localStorage.removeItem(SLEUTEL_VOORTGANG);
  localStorage.removeItem(SLEUTEL_LEVENSLIJST);
  voortgang = leegVoortgang();
  levenslijst = leegLevenslijst();
}
