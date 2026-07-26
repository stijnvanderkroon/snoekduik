/** Modules, soortenlijst en soortdetail. Werken zonder leervoortgang: dit is het
 *  deel dat je na een duik gebruikt om op te zoeken wat je gezien hebt. */

import { esc, $, $$, toon, attributie, ongekeurdLabel, ringStijl } from './ui.js';
import { ga } from './router.js';
import { soorten, soortOpId, modules, streefFotos } from './data.js';
import { LABELS, heeftQuizFoto, quizFotos } from './sessie.js';
import { aantalBeheerst, voortgangPercentage } from './leitner.js';
import { voegWaarnemingToe, standVan } from './store.js';

// ---- modules ----------------------------------------------------------------

export function toonModules() {
  document.body.classList.remove('quiz');
  const alle = soorten();
  const perModule = new Map();
  for (const s of alle) {
    if (!perModule.has(s.module)) perModule.set(s.module, []);
    perModule.get(s.module).push(s);
  }

  const kaarten = [...perModule.entries()].map(([mod, lijst]) => {
    const speelbaar = lijst.filter(heeftQuizFoto);
    const pct = voortgangPercentage(lijst.map((s) => s.id));
    const uit = speelbaar.length === 0;

    return `<a class="mod ${uit ? 'uit' : ''}" href="${uit ? '#/soorten' : `#/sessie/${esc(mod)}`}">
      <div class="ring" style="${ringStijl(pct, uit ? 'var(--dim)' : 'var(--teal)')}"><span>${pct}%</span></div>
      <div>
        <div style="font-size:.86rem;font-weight:650;line-height:1.2">${esc(LABELS.module[mod] ?? mod)}</div>
        <div class="mini">${uit ? 'in voorbereiding' : `${speelbaar.length} van ${lijst.length} speelbaar`}</div>
      </div></a>`;
  }).join('');

  const totaalBeheerst = aantalBeheerst(alle.map((s) => s.id));

  toon(`
    <div class="kop"><h1>Modules</h1><span class="spacer"></span>
      <span class="chip">${totaalBeheerst} van ${alle.length} blijft zitten</span></div>
    <p class="mini" style="margin:.1rem 0 .8rem">
      Modules zijn ingangen, geen volgorde. Je kunt overal beginnen.</p>
    <div class="modrooster">${kaarten}</div>
    <p class="mini" style="margin-top:.8rem">
      Een module is speelbaar zodra er een soort met een goedgekeurde onderwaterfoto in zit.
      De ring loopt mee met hoe goed elke soort zit: hij vult zich naarmate soorten in hogere
      boekjes komen, en is pas vol als alles in boekje 5 staat.</p>
  `);
}

// ---- soortenlijst -----------------------------------------------------------

let filterTekst = '';
let filterGroep = 'alles';

export function toonSoorten() {
  document.body.classList.remove('quiz');
  const alle = soorten();

  const filters = [
    ['alles', 'Alles'],
    ['quiz', 'Speelbaar'],
    ['exoot', 'Exoot'],
    ['vis', 'Vissen'],
    ['kreeftachtige', 'Kreeften'],
    ['weekdier', 'Weekdieren'],
  ];

  toon(`
    <div class="kop"><h1>Soorten</h1><span class="spacer"></span>
      <span class="chip">${alle.length}</span></div>
    <input class="zoek" id="zoek" placeholder="Zoek op naam" value="${esc(filterTekst)}">
    <div class="wikkel" style="margin-bottom:.6rem;overflow-x:auto">
      ${filters.map(([k, label]) => `<button class="chip ${filterGroep === k ? '' : 'uit'}"
        data-f="${k}" style="${filterGroep === k ? 'background:var(--teal);color:#fff;border-color:var(--teal)' : ''}"
        >${esc(label)}</button>`).join('')}
    </div>
    <div id="lijst"></div>
  `);

  const zoekveld = $('#zoek');
  zoekveld.addEventListener('input', () => { filterTekst = zoekveld.value; tekenLijst(); });
  for (const knop of $$('[data-f]')) {
    knop.addEventListener('click', () => { filterGroep = knop.dataset.f; toonSoorten(); });
  }
  tekenLijst();
}

function tekenLijst() {
  const term = filterTekst.trim().toLowerCase();
  const lijst = soorten().filter((s) => {
    if (term && !`${s.naamNL} ${s.naamWetenschappelijk}`.toLowerCase().includes(term)) return false;
    if (filterGroep === 'quiz') return heeftQuizFoto(s);
    if (filterGroep === 'exoot') return s.status?.includes('exoot');
    if (['vis', 'kreeftachtige', 'weekdier'].includes(filterGroep)) return s.groep === filterGroep;
    return true;
  });

  $('#lijst').innerHTML = lijst.length === 0
    ? '<div class="leeg">Niets gevonden.</div>'
    : lijst.map((s) => {
      const f = s.fotos[0];
      const box = standVan(s.id).box;
      return `<a class="lijstitem" href="#/soort/${esc(s.id)}">
        ${f ? `<img src="${esc(f.thumb)}" alt="" referrerpolicy="no-referrer">`
             : '<div style="width:58px;height:44px;border-radius:8px;background:var(--lijn)"></div>'}
        <div style="flex:1;min-width:0">
          <div class="naam">${esc(s.naamNL)}</div>
          <div class="mini" style="font-style:italic">${esc(s.naamWetenschappelijk)}</div>
        </div>
        ${box ? `<span class="chip">${box}/5</span>` : ''}</a>`;
    }).join('');
}

// ---- soortdetail ------------------------------------------------------------

export function toonSoort({ id }) {
  document.body.classList.remove('quiz');
  const s = soortOpId(id);
  if (!s) return ga('/soorten', { vervang: true });

  const box = standVan(s.id).box;
  const insitu = s.fotos.filter((f) => f.gekeurd);
  const teTonen = s.fotos.slice(0, 8);

  const carrousel = teTonen.length ? `
    <div class="carrousel">
      ${teTonen.map((f) => `<figure>
        <img src="${esc(f.groot)}" alt="" referrerpolicy="no-referrer" loading="lazy">
        <figcaption class="attrib">${attributie(f)} ${ongekeurdLabel(f)}</figcaption>
      </figure>`).join('')}
    </div>` : '<div class="leeg">Nog geen foto\'s voor deze soort.</div>';

  const verward = (s.verwardMet ?? []).map((vid) => soortOpId(vid)).filter(Boolean);

  toon(`
    <div class="kop"><a class="chip" href="#/soorten">terug</a><span class="spacer"></span>
      ${box ? `<span class="chip">boekje ${box} van 5</span>` : ''}</div>

    ${carrousel}

    <div style="display:flex;align-items:baseline;gap:.4rem;flex-wrap:wrap;margin-top:.6rem">
      <strong style="font-size:1.25rem">${esc(s.naamNL)}</strong>
      <span class="wet">${esc(s.naamWetenschappelijk)}</span>
    </div>

    <div class="wikkel" style="margin:.5rem 0 .8rem">
      ${s.maxLengteCm ? `<span class="chip">tot ${s.maxLengteCm} cm</span>` : ''}
      ${(s.zone ?? []).map((z) => `<span class="chip">${esc(LABELS.zone[z] ?? z)}</span>`).join('')}
      ${(s.leefgebied ?? []).map((g) => `<span class="chip">${esc(LABELS.leefgebied[g] ?? g)}</span>`).join('')}
      ${(s.status ?? []).map((st) => `<span class="chip ${st === 'exoot' ? 'let' : ''}">${esc(st)}</span>`).join('')}
      <span class="chip ${insitu.length >= streefFotos() ? '' : 'let'}">${insitu.length} gekeurde onderwaterfoto's</span>
    </div>

    ${s.tekstGecontroleerd === false && s.herkenningOnderWater ? `<div class="melding">
      De teksten bij deze soort zijn nog niet door een duiker nagekeken.</div>` : ''}

    <div class="kaart">
      <div class="blokkop">Onder water herkennen</div>
      ${s.herkenningOnderWater
        ? `<ul style="margin:.2rem 0 0;padding-left:1.1rem">${s.herkenningOnderWater.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>`
        : '<span class="mini">Nog niet ingevuld.</span>'}
    </div>

    <div class="kaart gedrag">
      <div class="blokkop">Gedrag bij een duiker</div>
      ${s.gedragBijDuiker ? esc(s.gedragBijDuiker) : '<span class="mini">Nog niet ingevuld.</span>'}
    </div>

    ${s.seizoen ? `<div class="kaart"><div class="blokkop">Seizoen</div>${esc(s.seizoen)}</div>` : ''}
    ${s.weetje ? `<div class="kaart"><div class="blokkop">Weetje</div>${esc(s.weetje)}</div>` : ''}
    ${s.meldenBij ? `<div class="melding">Waarneming melden bij ${esc(s.meldenBij)}.</div>` : ''}

    ${verward.length ? `<div class="kaart">
      <div class="blokkop">Wordt verward met</div>
      ${verward.map((v) => {
        const regel = s.onderscheid?.[v.id] ?? v.onderscheid?.[s.id] ?? null;
        const f = v.fotos[0];
        return `<a class="lijstitem" href="#/soort/${esc(v.id)}">
          ${f ? `<img src="${esc(f.thumb)}" alt="" referrerpolicy="no-referrer">` : ''}
          <div style="flex:1;min-width:0">
            <div class="naam">${esc(v.naamNL)}</div>
            ${regel ? `<div class="mini">${esc(regel)}</div>` : ''}
          </div></a>`;
      }).join('')}
      ${verward.some((v) => heeftQuizFoto(v)) && heeftQuizFoto(s)
        ? '<button class="knop stil" id="trainpaar" style="margin-top:.6rem">Train dit paar</button>' : ''}
    </div>` : ''}

    <button class="knop" id="gezien">Gezien tijdens duik</button>
  `);

  $('#trainpaar')?.addEventListener('click', () => ga(`/sessie/${s.module}`));
  $('#gezien').addEventListener('click', () => {
    voegWaarnemingToe(s.id, new Date().toISOString().slice(0, 10), null);
    ga('/levenslijst');
  });
}
