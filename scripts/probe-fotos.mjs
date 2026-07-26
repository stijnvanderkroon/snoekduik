#!/usr/bin/env node
/**
 * Photo probe: how much reusable photo material exists per species?
 *
 * Reads data/soorten.seed.json (or ./soorten.seed.json), queries iNaturalist
 * and Wikimedia Commons, and writes data/fotoProbe.json plus a contact-sheet
 * HTML for a human in-situ pass.
 *
 * Neither API can filter on "taken underwater". The counts here measure
 * REUSABLE material, not in-situ material: for a species like Esox lucius most
 * CC photos are angling shots (in hand, on a mat, dead), which the project
 * rejects for quiz use. So the probe also samples thumbnails into a contact
 * sheet; `insituGeschat` stays null until a human fills it in.
 *
 * Requests are paced sequentially with jitter and backoff, never fanned out.
 *
 * Usage:
 *   node scripts/probe-fotos.mjs [--limit N] [--only id,id] [--fresh] [--dry-run]
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const USER_AGENT =
  'snoekduik-photo-probe/1.0 (educational species-ID app for divers; https://github.com/snoekduik/snoekduik)';

/** Licenses usable in the app. ND is excluded: the "uitsnede" question type crops photos, which is a derivative. */
const USABLE_LICENSES = ['cc0', 'cc-by', 'cc-by-sa', 'cc-by-nc'];
/** Counted separately so the "mag CC-BY-NC mee?" decision can be made from probe output without a re-run. */
const COUNTED_LICENSES = [...USABLE_LICENSES, 'cc-by-nd', 'cc-by-nc-sa', 'cc-by-nc-nd'];

const SAMPLE_SIZE = 30;
/** Category members are returned files-first, so this must clear the file count to also see subcategories. */
const COMMONS_FILE_LIMIT = 200;
/** Underwater keywords across the languages Commons descriptions actually use. */
const UNDERWATER_TERMS = ['underwater', 'unterwasser', 'onderwater', 'sous-marine', 'diving'];

// ---------------------------------------------------------------------------
// Pacing
// ---------------------------------------------------------------------------

const PACE = {
  baseDelayMs: 1200,
  /** Delay is base * (0.6 + random * 0.8), so ~720-2160ms, never a detectable fixed cadence. */
  jitterFloor: 0.6,
  jitterSpread: 0.8,
  maxRetries: 4,
  /** Consecutive hard failures before aborting, rather than grinding through 66 species writing zeroes. */
  abortAfterFailures: 5,
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function jitteredDelay(base = PACE.baseDelayMs) {
  return Math.round(base * (PACE.jitterFloor + Math.random() * PACE.jitterSpread));
}

let lastRequestAt = 0;
let requestCount = 0;

/** Serialises every outbound request and spaces them apart, regardless of host. */
async function paced(fn) {
  const wait = lastRequestAt + jitteredDelay() - Date.now();
  if (wait > 0) await sleep(wait);
  lastRequestAt = Date.now();
  requestCount += 1;
  return fn();
}

/**
 * Fetches JSON with backoff. Throws on persistent failure; callers must record
 * that as an error status, never as a count of 0.
 */
async function fetchJson(url, { label } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= PACE.maxRetries; attempt += 1) {
    if (attempt > 0) {
      const backoff = jitteredDelay(PACE.baseDelayMs * 2 ** attempt);
      log(`  retry ${attempt}/${PACE.maxRetries} in ${backoff}ms (${label})`);
      await sleep(backoff);
    }
    try {
      const res = await paced(() =>
        fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' } }),
      );

      if (res.status === 429 || res.status === 503) {
        const retryAfter = Number(res.headers.get('retry-after'));
        const waitMs = Number.isFinite(retryAfter) && retryAfter > 0
          ? retryAfter * 1000
          : jitteredDelay(PACE.baseDelayMs * 2 ** (attempt + 2));
        log(`  ${res.status} throttled, honouring wait of ${waitMs}ms (${label})`);
        await sleep(waitMs);
        lastError = new Error(`HTTP ${res.status}`);
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      lastError = err;
    }
  }
  throw new Error(`${label}: ${lastError?.message ?? 'unknown error'}`);
}

// ---------------------------------------------------------------------------
// iNaturalist
// ---------------------------------------------------------------------------

const INAT = 'https://api.inaturalist.org/v1';

/** Strips open-nomenclature suffixes ("Aeshna sp.") that the taxa endpoint cannot match. */
function cleanTaxonName(name) {
  return name.replace(/\s+(sp|spp|cf|aff)\.?$/i, '').trim();
}

/**
 * Resolves a scientific name to a taxon id, demanding an exact name match.
 *
 * The `/taxa?q=` endpoint fuzzy-matches common names and synonyms and will
 * happily rank a plant genus above the fish you asked for (Anguilla anguilla ->
 * Ardisia, Barbus barbus -> Megalaimidae). Accepting its top hit silently
 * probes the wrong organism, so a near miss is reported, never used.
 */
async function resolveTaxon(sciName) {
  const query = cleanTaxonName(sciName);
  const wanted = query.toLowerCase();

  const seen = new Map();
  const collect = (results) => {
    for (const r of results ?? []) if (!seen.has(r.id)) seen.set(r.id, r);
    return (results ?? []).find((r) => r.name?.toLowerCase() === wanted);
  };

  // Autocomplete ranks the exact binomial first; the broader search is the fallback.
  const auto = await fetchJson(
    `${INAT}/taxa/autocomplete?q=${encodeURIComponent(query)}&per_page=10`,
    { label: `autocomplete:${query}` },
  );
  let pick = collect(auto.results);

  if (!pick) {
    const search = await fetchJson(`${INAT}/taxa?q=${encodeURIComponent(query)}&per_page=30`, {
      label: `taxa:${query}`,
    });
    pick = collect(search.results);
  }

  const alternatives = [...seen.values()]
    .slice(0, 6)
    .map((r) => ({ id: r.id, name: r.name, rank: r.rank }));

  if (pick) {
    return {
      status: 'ok',
      query,
      taxonId: pick.id,
      matchedName: pick.name,
      rank: pick.rank,
      observationsTotal: pick.observations_count ?? null,
    };
  }

  // No exact hit. A same-genus species is usually a synonym (Dreissena rostriformis
  // bugensis -> Dreissena bugensis) and is worth probing, but flagged for review.
  const genus = wanted.split(' ')[0];
  const synonym = [...seen.values()].find(
    (r) => ['species', 'subspecies'].includes(r.rank) && r.name?.toLowerCase().startsWith(`${genus} `),
  );
  if (synonym) {
    return {
      status: 'synoniem',
      query,
      taxonId: synonym.id,
      matchedName: synonym.name,
      rank: synonym.rank,
      observationsTotal: synonym.observations_count ?? null,
      alternatives,
    };
  }

  return { status: 'not-found', query, alternatives };
}

async function countObservations(taxonId, photoLicense) {
  const params = new URLSearchParams({
    taxon_id: String(taxonId),
    quality_grade: 'research',
    photos: 'true',
    per_page: '0',
  });
  // photo_license filters the PHOTO's license; the `license` param filters the
  // observation record instead and gives materially different numbers.
  if (photoLicense) params.set('photo_license', photoLicense);
  const data = await fetchJson(`${INAT}/observations?${params}`, {
    label: `obs:${taxonId}:${photoLicense ?? 'all'}`,
  });
  return data.total_results ?? 0;
}

/**
 * Fetches sample pages until SAMPLE_SIZE unjudged photos are collected.
 * `alGezien` holds bronUrls already triaged, so later rounds surface new
 * material instead of re-showing photos that were already rejected.
 */
async function sampleObservations(taxonId, { pages = 1, alGezien = new Set() } = {}) {
  const samples = [];
  let totaal = 0;

  for (let page = 1; page <= pages; page += 1) {
    const params = new URLSearchParams({
      taxon_id: String(taxonId),
      quality_grade: 'research',
      photos: 'true',
      photo_license: USABLE_LICENSES.join(','),
      order_by: 'votes',
      order: 'desc',
      per_page: String(SAMPLE_SIZE),
      page: String(page),
    });
    const data = await fetchJson(`${INAT}/observations?${params}`, {
      label: `sample:${taxonId}:p${page}`,
    });
    totaal = data.total_results ?? 0;

    for (const obs of data.results ?? []) {
      for (const photo of obs.photos ?? []) {
        if (!USABLE_LICENSES.includes(photo.license_code)) continue;
        const bronUrl = `https://www.inaturalist.org/observations/${obs.id}`;
        if (alGezien.has(bronUrl)) break;
        samples.push({
          thumb: photo.url?.replace('/square.', '/medium.') ?? photo.url,
          licentie: photo.license_code,
          fotograaf: photo.attribution ?? null,
          bronUrl,
          plaats: obs.place_guess ?? null,
        });
        break; // one photo per observation keeps the contact sheet diverse
      }
    }

    if (samples.length >= SAMPLE_SIZE) break;
    if ((data.results ?? []).length < SAMPLE_SIZE) break; // pool exhausted
  }

  return { totaal, samples };
}

async function probeInaturalist(sciName, opties = {}) {
  const taxon = await resolveTaxon(sciName);
  if (!taxon.taxonId) {
    return { status: taxon.status, query: taxon.query, licenties: null, samples: [] };
  }

  const usable = await sampleObservations(taxon.taxonId, opties);

  const licenties = {};
  for (const license of COUNTED_LICENSES) {
    licenties[license] = await countObservations(taxon.taxonId, license);
  }

  return {
    status: taxon.status,
    taxonId: taxon.taxonId,
    matchedName: taxon.matchedName,
    rank: taxon.rank,
    alternatives: taxon.status === 'ok' ? undefined : taxon.alternatives,
    onderzoeksKwaliteitTotaal: taxon.observationsTotal,
    bruikbaarTotaal: usable.totaal,
    licenties,
    samples: usable.samples,
  };
}

// ---------------------------------------------------------------------------
// Wikimedia Commons
// ---------------------------------------------------------------------------

const COMMONS = 'https://commons.wikimedia.org/w/api.php';

function commonsUrl(params) {
  return `${COMMONS}?${new URLSearchParams({ format: 'json', formatversion: '2', ...params })}`;
}

async function commonsCategory(sciName) {
  const data = await fetchJson(
    commonsUrl({
      action: 'query',
      list: 'categorymembers',
      cmtitle: `Category:${cleanTaxonName(sciName)}`,
      cmtype: 'file|subcat',
      cmlimit: String(COMMONS_FILE_LIMIT),
    }),
    { label: `commons-cat:${sciName}` },
  );
  const members = data.query?.categorymembers ?? [];
  return {
    bestaat: members.length > 0,
    files: members.filter((m) => m.ns === 6).map((m) => m.title),
    subcats: members.filter((m) => m.ns === 14).map((m) => m.title),
  };
}

/**
 * Counts files in the taxon category whose text mentions an underwater term.
 * A weak in-situ proxy only: Commons has no per-taxon "Underwater photographs
 * of X" categories for these species, so this is a hint, not evidence.
 */
async function commonsUnderwaterHits(sciName) {
  const clean = cleanTaxonName(sciName);
  const search = `incategory:"${clean}" (${UNDERWATER_TERMS.join(' OR ')})`;
  const data = await fetchJson(
    commonsUrl({
      action: 'query',
      list: 'search',
      srnamespace: '6',
      srsearch: search,
      srlimit: '10',
      srinfo: 'totalhits',
    }),
    { label: `commons-uw:${clean}` },
  );
  return {
    aantal: data.query?.searchinfo?.totalhits ?? 0,
    titels: (data.query?.search ?? []).map((r) => r.title),
  };
}

function normaliseCommonsLicense(short, usage) {
  const text = `${short ?? ''} ${usage ?? ''}`.toLowerCase();
  if (text.includes('public domain') || text.includes('cc0')) return 'cc0';
  if (text.includes('nd')) return 'cc-by-nd';
  if (text.includes('nc') && text.includes('sa')) return 'cc-by-nc-sa';
  if (text.includes('nc')) return 'cc-by-nc';
  if (text.includes('sa')) return 'cc-by-sa';
  if (text.includes('cc by') || text.includes('cc-by')) return 'cc-by';
  return 'anders';
}

function stripHtml(value) {
  return value ? value.replace(/<[^>]*>/g, '').trim() : null;
}

async function commonsFileMeta(titles) {
  if (titles.length === 0) return [];
  const data = await fetchJson(
    commonsUrl({
      action: 'query',
      titles: titles.slice(0, 50).join('|'),
      prop: 'imageinfo',
      iiprop: 'url|extmetadata',
      iiurlwidth: '320',
      iiextmetadatafilter: 'LicenseShortName|UsageTerms|Artist|LicenseUrl',
    }),
    { label: `commons-meta:${titles.length}` },
  );
  return (data.query?.pages ?? [])
    .map((page) => {
      const info = page.imageinfo?.[0];
      if (!info) return null;
      const meta = info.extmetadata ?? {};
      return {
        titel: page.title,
        thumb: info.thumburl ?? null,
        bronUrl: info.descriptionurl ?? null,
        licentie: normaliseCommonsLicense(meta.LicenseShortName?.value, meta.UsageTerms?.value),
        licentieRuw: stripHtml(meta.LicenseShortName?.value),
        fotograaf: stripHtml(meta.Artist?.value),
      };
    })
    .filter(Boolean);
}

async function probeCommons(sciName) {
  const category = await commonsCategory(sciName);
  if (!category.bestaat) {
    return { categorieBestaat: false, bestandenInCategorie: 0, licenties: {}, onderwaterHits: null, samples: [] };
  }

  const underwater = await commonsUnderwaterHits(sciName);
  // Files whose text matched an underwater term are sampled first.
  const ranked = [
    ...underwater.titels.filter((t) => category.files.includes(t)),
    ...category.files.filter((t) => !underwater.titels.includes(t)),
  ];
  const meta = await commonsFileMeta(ranked);

  const licenties = {};
  for (const file of meta) {
    licenties[file.licentie] = (licenties[file.licentie] ?? 0) + 1;
  }

  return {
    categorieBestaat: true,
    bestandenInCategorie: category.files.length,
    /** True when the category listing hit the page limit, so the count is a floor. */
    afgekapt: category.files.length >= COMMONS_FILE_LIMIT,
    /** Members come back files-first: once truncated, subcategories were never reached, so null means unknown, not none. */
    subcategorieen: category.files.length >= COMMONS_FILE_LIMIT ? null : category.subcats,
    onderwaterHits: underwater.aantal,
    licenties,
    samples: meta
      .filter((f) => USABLE_LICENSES.includes(f.licentie))
      .slice(0, 12)
      .map((f) => ({
        ...f,
        onderwaterTrefwoord: underwater.titels.includes(f.titel),
      })),
  };
}

// ---------------------------------------------------------------------------
// Contact sheet
// ---------------------------------------------------------------------------

const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

function contactSheet(entries) {
  const cards = entries
    .map((entry) => {
      const photos = [
        ...(entry.inaturalist?.samples ?? []).map((s) => ({ ...s, bron: 'iNat' })),
        ...(entry.commons?.samples ?? []).map((s) => ({ ...s, bron: 'Commons' })),
      ];
      const thumbs = photos
        .map(
          (p) => `<a class="thumb" href="${escapeHtml(p.bronUrl)}" target="_blank" rel="noopener"
        title="${escapeHtml(p.fotograaf)} — ${escapeHtml(p.licentie)}">
        <img loading="lazy" src="${escapeHtml(p.thumb)}" alt="">
        <span class="badge">${escapeHtml(p.bron)} ${escapeHtml(p.licentie)}</span></a>`,
        )
        .join('\n');
      const inat = entry.inaturalist ?? {};
      return `<section>
  <h2>${escapeHtml(entry.naamNL)} <em>${escapeHtml(entry.naamWetenschappelijk)}</em></h2>
  <p class="meta">module ${escapeHtml(entry.module)} · iNat bruikbaar ${inat.bruikbaarTotaal ?? '?'}
     · Commons categorie ${entry.commons?.bestandenInCategorie ?? 0}
     · onderwater-hits ${entry.commons?.onderwaterHits ?? 0}
     · status <strong>${escapeHtml(inat.status ?? 'error')}</strong></p>
  <div class="grid">${thumbs || "<p class='leeg'>geen bruikbare foto&rsquo;s gevonden</p>"}</div>
</section>`;
    })
    .join('\n');

  return `<!doctype html>
<html lang="nl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Snoekduik fotoprobe — contactblad</title>
<style>
 body{font:15px/1.5 system-ui,sans-serif;margin:0;padding:1rem;background:#0f1720;color:#e6edf3}
 h1{font-size:1.3rem} h2{font-size:1.05rem;margin:0 0 .2rem}
 h2 em{font-weight:400;opacity:.7}
 section{border-top:1px solid #24313f;padding:1rem 0}
 .meta{margin:0 0 .6rem;font-size:.82rem;opacity:.75}
 .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:.5rem}
 .thumb{position:relative;display:block;aspect-ratio:4/3;overflow:hidden;border-radius:6px;background:#1b2733}
 .thumb img{width:100%;height:100%;object-fit:cover}
 .badge{position:absolute;left:0;bottom:0;background:#000b;font-size:.65rem;padding:.1rem .3rem}
 .leeg{opacity:.6;font-style:italic}
 .intro{background:#1b2733;padding:.8rem;border-radius:6px}
</style></head><body>
<h1>Fotoprobe contactblad</h1>
<p class="intro">Geen enkele API kan filteren op "onder water genomen". Beoordeel hieronder per soort
hoeveel foto's echte in-situ onderwateropnames zijn en vul dat in als
<code>fotoProbe.insituGeschat</code>. Streefwaarde: minimaal 5 per soort.</p>
${cards}
</body></html>`;
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

function log(message) {
  process.stdout.write(`${message}\n`);
}

function parseArgs(argv) {
  const args = { limit: Infinity, only: null, fresh: false, dryRun: false, dieper: 0, doelGoed: 5 };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--limit') args.limit = Number(argv[++i]);
    else if (argv[i] === '--only') args.only = new Set(argv[++i].split(','));
    else if (argv[i] === '--fresh') args.fresh = true;
    else if (argv[i] === '--dry-run') args.dryRun = true;
    else if (argv[i] === '--dieper') args.dieper = Number(argv[++i] ?? 4);
  }
  return args;
}

/**
 * Round 2+: reads triage verdicts and returns the species still short of the
 * target, along with every bronUrl already judged so those are not re-sampled.
 */
async function leesOordelen(doelGoed) {
  const path = join(ROOT, 'data', 'fotoOordelen.json');
  if (!existsSync(path)) return null;
  const { oordelen } = JSON.parse(await readFile(path, 'utf8'));

  const goedPerSoort = new Map();
  const gezienPerSoort = new Map();
  for (const [sleutel, verdict] of Object.entries(oordelen)) {
    const soortId = verdict.soortId ?? sleutel.split('|')[0];
    if (!gezienPerSoort.has(soortId)) gezienPerSoort.set(soortId, new Set());
    gezienPerSoort.get(soortId).add(verdict.bronUrl ?? sleutel.split('|').slice(1).join('|'));
    if (verdict.oordeel === 'goed') {
      goedPerSoort.set(soortId, (goedPerSoort.get(soortId) ?? 0) + 1);
    }
  }

  const tekort = new Set();
  for (const soortId of gezienPerSoort.keys()) {
    if ((goedPerSoort.get(soortId) ?? 0) < doelGoed) tekort.add(soortId);
  }
  return { tekort, gezienPerSoort, goedPerSoort };
}

function findSeed() {
  for (const candidate of ['data/soorten.seed.json', 'soorten.seed.json']) {
    const path = join(ROOT, candidate);
    if (existsSync(path)) return path;
  }
  throw new Error('soorten.seed.json niet gevonden');
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const seedPath = findSeed();
  const seed = JSON.parse(await readFile(seedPath, 'utf8'));

  const outDir = join(ROOT, 'data');
  await mkdir(outDir, { recursive: true });
  const outPath = join(outDir, 'fotoProbe.json');
  const sheetPath = join(outDir, 'fotoProbe-contactblad.html');

  // The seed is hand-assembled and unreproducible: it is only ever read.
  let previous = { soorten: {} };
  if (!args.fresh && existsSync(outPath)) {
    previous = JSON.parse(await readFile(outPath, 'utf8'));
    log(`Hervat: ${Object.keys(previous.soorten).length} soorten al geprobed.`);
  }

  // --dieper re-samples only the species that triage left short of the target.
  const oordelen = args.dieper ? await leesOordelen(args.doelGoed) : null;
  if (args.dieper && !oordelen) {
    throw new Error('--dieper vereist data/fotoOordelen.json; draai eerst de triage');
  }

  const queue = seed.soorten.filter((s) => {
    if (args.only && !args.only.has(s.id)) return false;
    if (oordelen) return oordelen.tekort.has(s.id);
    return !previous.soorten[s.id]?.gecheckt;
  });
  const todo = queue.slice(0, args.limit);

  if (oordelen) {
    log(`Ronde 2: ${todo.length} soorten onder de ${args.doelGoed} goede foto's, tot ${args.dieper} pagina's diep.`);
    // Species nobody has triaged yet are not "short", they are unknown. Saying so
    // prevents a run over a handful of species reading as full coverage.
    const ongetrieerd = seed.soorten.filter((s) => !oordelen.gezienPerSoort.has(s.id));
    if (ongetrieerd.length) {
      log(`LET OP: ${ongetrieerd.length} soorten zijn nog niet getrieerd en blijven buiten deze ronde.`);
      log(`  Triage die eerst, anders zegt deze ronde niets over hun haalbaarheid.`);
    }
  }
  log(`Seed: ${seed.soorten.length} soorten. Te doen: ${todo.length}.`);
  log(`Pacing: ~${PACE.baseDelayMs}ms + jitter, sequentieel. Ruwe schatting ${Math.round((todo.length * 12 * 1.45) / 60)} min.`);
  if (args.dryRun) {
    todo.forEach((s) => log(`  zou proben: ${s.id} (${s.naamWetenschappelijk})`));
    return;
  }

  const results = { ...previous.soorten };
  let consecutiveFailures = 0;
  const startedAt = Date.now();

  for (const [index, soort] of todo.entries()) {
    const prefix = `[${index + 1}/${todo.length}] ${soort.id}`;
    try {
      log(`${prefix} — ${soort.naamWetenschappelijk}`);
      const inaturalist = await probeInaturalist(soort.naamWetenschappelijk, {
        pages: args.dieper || 1,
        alGezien: oordelen?.gezienPerSoort.get(soort.id) ?? new Set(),
      });
      // Commons is skipped in round 2: triage measures its hit rate, and it is the weaker source.
      const commons = args.dieper
        ? previous.soorten[soort.id]?.commons ?? { categorieBestaat: false, bestandenInCategorie: 0, licenties: {}, onderwaterHits: null, samples: [] }
        : await probeCommons(soort.naamWetenschappelijk);

      results[soort.id] = {
        naamNL: soort.naamNL,
        naamWetenschappelijk: soort.naamWetenschappelijk,
        module: soort.module,
        gecheckt: true,
        inaturalist,
        commons,
        /** Only a human looking at the contact sheet can fill this in. */
        insituGeschat: null,
      };
      consecutiveFailures = 0;
      log(
        `${prefix} ok — iNat bruikbaar ${inaturalist.bruikbaarTotaal ?? 0} (${inaturalist.status}), ` +
          `Commons ${commons.bestandenInCategorie} bestanden / ${commons.onderwaterHits ?? 0} onderwater-hits`,
      );
    } catch (err) {
      consecutiveFailures += 1;
      results[soort.id] = {
        naamNL: soort.naamNL,
        naamWetenschappelijk: soort.naamWetenschappelijk,
        module: soort.module,
        gecheckt: false,
        fout: String(err.message ?? err),
      };
      log(`${prefix} MISLUKT: ${err.message} (${consecutiveFailures} op rij)`);
      if (consecutiveFailures >= PACE.abortAfterFailures) {
        log(`Gestopt na ${consecutiveFailures} mislukkingen op rij. Draai opnieuw om te hervatten.`);
        break;
      }
    }

    // Flushed every species so a kill mid-run keeps what it got.
    await writeFile(
      outPath,
      `${JSON.stringify(
        { schemaVersion: 1, bron: 'scripts/probe-fotos.mjs', soorten: results },
        null,
        2,
      )}\n`,
    );
  }

  const done = Object.values(results).filter((r) => r.gecheckt);
  await writeFile(sheetPath, contactSheet(done));

  const minutes = ((Date.now() - startedAt) / 60000).toFixed(1);
  log(`\nKlaar in ${minutes} min, ${requestCount} requests.`);
  log(`Data: ${outPath}`);
  log(`Contactblad: ${sheetPath}`);

  const ranked = done
    .map((r) => ({
      id: r.naamWetenschappelijk,
      nl: r.naamNL,
      module: r.module,
      inat: r.inaturalist?.bruikbaarTotaal ?? 0,
      uw: r.commons?.onderwaterHits ?? 0,
      status: r.inaturalist?.status,
    }))
    .sort((a, b) => a.inat - b.inat);

  log('\nMinste bruikbare iNat-fotos (aandacht nodig):');
  ranked.slice(0, 15).forEach((r) => log(`  ${String(r.inat).padStart(5)}  uw:${String(r.uw).padStart(3)}  ${r.nl} (${r.module}, ${r.status})`));

  const problems = done.filter((r) => r.inaturalist?.status && r.inaturalist.status !== 'ok');
  if (problems.length) {
    log('\nNaamresolutie niet eenduidig:');
    problems.forEach((r) => log(`  ${r.naamNL}: ${r.inaturalist.status} -> ${r.inaturalist.matchedName ?? '-'} (${r.inaturalist.rank ?? '-'})`));
  }
}

main().catch((err) => {
  process.stderr.write(`${err.stack ?? err}\n`);
  process.exit(1);
});
