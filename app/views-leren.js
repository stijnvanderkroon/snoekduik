/** Startscherm, de sessie zelf en de afsluiting. */

import { esc, el, $, toon, attributie, ongekeurdLabel, wsrv } from './ui.js';
import { ga } from './router.js';
import { soorten, soortOpId } from './data.js';
import { bouwSessie, bouwToets, watStaatKlaar, quizFotos, leerFoto, heeftQuizFoto, LABELS } from './sessie.js';
import { verwerkAntwoord, markeerGezien } from './leitner.js';
import { noteerPaar, bewaarSessie, lopendeSessie, wisSessie, standVan } from './store.js';

// ---- start ------------------------------------------------------------------

export function toonStart() {
  document.body.classList.remove('quiz');
  const klaar = watStaatKlaar(soorten());
  const bezig = lopendeSessie();

  let regel;
  if (klaar.bruikbaar === 0) {
    regel = 'Er zijn nog geen soorten met goedgekeurde onderwaterfoto\'s.';
  } else if (klaar.herhalen === 0 && klaar.nieuw === 0) {
    regel = `Niets staat klaar om te herhalen. Je kunt vrij oefenen met de ${klaar.geleerd} soorten die je al gezien hebt.`;
  } else if (klaar.herhalen === 0) {
    regel = `Niets staat klaar om te herhalen, ${klaar.nieuw} nieuwe ${klaar.nieuw === 1 ? 'soort' : 'soorten'} beschikbaar.`;
  } else {
    regel = `${klaar.herhalen} ${klaar.herhalen === 1 ? 'soort is' : 'soorten zijn'} toe aan herhaling, `
      + `${klaar.nieuw} nieuw beschikbaar.`;
  }

  toon(`
    <div class="kop"><img class="logo" src="logos/logo-duikvlag.svg" alt=""><h1>Snoekduik</h1></div>

    ${klaar.bruikbaar === 0 ? `<div class="melding">
      Nog geen enkele soort heeft een goedgekeurde onderwaterfoto, dus er valt nog niets te oefenen.
    </div>` : ''}

    <p class="mini" style="margin:.2rem 0 1rem">${esc(regel)}</p>

    ${bezig ? `<button class="knop groot" id="verder">Verder waar je gebleven was</button>` : ''}
    <button class="knop ${bezig ? 'stil' : 'groot'}" id="oefen" ${klaar.bruikbaar === 0 ? 'disabled' : ''}>
      ${bezig ? 'Nieuwe sessie' : (klaar.herhalen === 0 && klaar.nieuw === 0 ? 'Vrij oefenen' : 'Oefenen')}</button>
    <a class="knop stil" href="#/toets">Test mijn kennis</a>
    <a class="knop stil" href="#/modules">Kies een module</a>
    <a class="knop stil" href="#/soorten">Zoek een soort</a>
  `);

  $('#oefen')?.addEventListener('click', () => { wisSessie(); ga('/sessie'); });
  $('#verder')?.addEventListener('click', () => ga('/sessie'));
}

// ---- toets ------------------------------------------------------------------

/** Modulekiezer voor de toets. Modules zonder speelbare soorten doen niet mee. */
export function toonToetsKeuze() {
  document.body.classList.remove('quiz');
  const perModule = new Map();
  for (const s of soorten()) {
    const v = perModule.get(s.module) ?? { totaal: 0, speelbaar: 0 };
    v.totaal += 1;
    if (heeftQuizFoto(s)) v.speelbaar += 1;
    perModule.set(s.module, v);
  }

  const kaarten = [...perModule.entries()].map(([mod, v]) => {
    if (v.speelbaar === 0) {
      return `<div class="kaart" style="opacity:.55">
        <strong>${esc(LABELS.module[mod] ?? mod)}</strong>
        <div class="mini">nog geen speelbare soorten</div></div>`;
    }
    return `<a class="kaart" href="#/toets/${esc(mod)}" style="display:block;text-decoration:none;color:inherit">
      <strong>${esc(LABELS.module[mod] ?? mod)}</strong>
      <div class="mini">${v.speelbaar} ${v.speelbaar === 1 ? 'vraag' : 'vragen'}</div></a>`;
  }).join('');

  toon(`
    <div class="kop"><a class="chip" href="#/">terug</a><span class="spacer"></span></div>
    <h1 style="font-size:1.3rem;margin:.2rem 0 .4rem">Test mijn kennis</h1>
    <p class="mini" style="margin:0 0 1rem">Alleen vragen, geen leerkaarten. Elke soort uit de module
      komt één keer langs. Je herhaalschema verandert er niet van, behalve als je iets fout hebt.</p>
    ${kaarten}
  `);
}

// ---- sessie -----------------------------------------------------------------

let sessie = null;

export function toonToets({ module }) {
  const items = bouwToets(soorten(), module);
  if (!items.length) {
    document.body.classList.remove('quiz');
    toon(`<div class="kop"><h1>Toets</h1></div>
      <div class="leeg">Deze module heeft nog geen speelbare soorten.</div>
      <a class="knop stil" href="#/toets">Kies een andere module</a>`);
    return;
  }
  sessie = { items, positie: 0, resultaten: [], module, toets: true };
  bewaarSessie(sessie);
  tekenItem();
}

export function toonSessie(params = {}) {
  const module = params.module ?? null;
  const bewaard = lopendeSessie();

  // Een lopende sessie mag niet stilzwijgend verdwijnen doordat je een module
  // aantikt: dat kost je je plek zonder dat je erom vroeg.
  const hervat = bewaard?.items?.length
    && (!module || bewaard.module === module
        || window.confirm('Je hebt een sessie openstaan. Die verdwijnt als je hier verdergaat. Doorgaan?') === false);

  if (hervat) {
    sessie = bewaard;
  } else {
    const items = bouwSessie(soorten(), { moduleFilter: module });
    if (!items.length) {
      document.body.classList.remove('quiz');
      toon(`<div class="kop"><h1>Oefenen</h1></div>
        <div class="leeg">Er is niets om te oefenen.<br>
        ${module ? 'Deze module heeft nog geen soorten met goedgekeurde foto\'s.' : ''}</div>
        <a class="knop stil" href="#/">Terug</a>`);
      return;
    }
    sessie = { items, positie: 0, resultaten: [], module };
  }
  bewaarSessie(sessie);
  tekenItem();
}

function tekenItem() {
  const item = sessie.items[sessie.positie];
  if (!item) return toonKlaar();

  document.body.classList.add('quiz');
  if (item.soort === 'leerkaart') tekenLeerkaart(item);
  else tekenVraag(item);
}

function voortgangsbalk() {
  const pct = (sessie.positie / sessie.items.length) * 100;
  return `<div class="qbalk"><i style="width:${pct}%"></i></div>`;
}

function tekenLeerkaart(item) {
  const s = soortOpId(item.soortId);
  const foto = leerFoto(s);

  toon(`
    ${voortgangsbalk()}
    <div class="qvraag">Nieuwe soort</div>
    <div class="qbeeld">${foto ? `<img src="${esc(wsrv(foto.groot, 480))}" alt="" referrerpolicy="no-referrer">` : ''}</div>
    <div class="qattrib">${attributie(foto)} ${ongekeurdLabel(foto)}</div>

    <div class="kaart">
      <div style="display:flex;align-items:baseline;gap:.4rem;flex-wrap:wrap">
        <strong style="font-size:1.15rem">${esc(s.naamNL)}</strong>
        <span class="wet">${esc(s.naamWetenschappelijk)}</span>
      </div>
      <div class="wikkel" style="margin:.5rem 0">
        ${s.maxLengteCm ? `<span class="chip">tot ${s.maxLengteCm} cm</span>` : ''}
        ${(s.zone ?? []).map((z) => `<span class="chip">${esc(LABELS.zone[z] ?? z)}</span>`).join('')}
        ${(s.status ?? []).map((st) => `<span class="chip">${esc(st)}</span>`).join('')}
      </div>
      ${s.herkenningOnderWater
        ? `<ul style="margin:.4rem 0 0;padding-left:1.1rem">
             ${s.herkenningOnderWater.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>`
        : '<p class="mini">Herkenningskenmerken zijn nog niet ingevuld voor deze soort.</p>'}
    </div>

    ${s.gedragBijDuiker ? `<div class="kaart gedrag">
      <div class="blokkop">Gedrag bij een duiker</div>${esc(s.gedragBijDuiker)}</div>` : ''}

    <button class="knop" id="snap">Snap ik</button>
  `);

  $('#snap').addEventListener('click', () => {
    markeerGezien(item.soortId);
    volgende();
  });
}

function fotoBlok(vraag) {
  const uit = vraag.uitsnede;
  const stijl = uit
    ? `--uschaal:${uit.schaal};--ux:${uit.x}%;--uy:${uit.y}%`
    : '';
  return `
    <div class="qbeeld ${uit ? 'uitsnede' : ''}" style="${stijl}">
      <img src="${esc(wsrv(vraag.foto.groot, 480))}" alt="" referrerpolicy="no-referrer">
    </div>`;
}

function tekenVraag(vraag) {
  const s = soortOpId(vraag.soortId);

  const opties = vraag.type === 'naamFoto'
    ? `<div class="qopties tweekolom">${vraag.opties.map((o) => `
        <button class="optie foto" data-id="${esc(o.id)}">
          <img src="${esc(wsrv(o.foto.thumb, 400))}" alt="" referrerpolicy="no-referrer"></button>`).join('')}</div>`
    : `<div class="qopties ${vraag.opties.length === 2 ? 'tweekolom' : ''}">
        ${vraag.opties.map((o) => `<button class="optie" data-id="${esc(o.id)}">${esc(o.label)}</button>`).join('')}
       </div>`;

  toon(`
    ${voortgangsbalk()}
    <div class="qvraag">${esc(vraag.vraag)}</div>
    ${vraag.type === 'naamFoto' ? '' : fotoBlok(vraag)}
    ${vraag.type === 'naamFoto' ? '' : `<div class="qattrib">${attributie(vraag.foto)} ${ongekeurdLabel(vraag.foto)}</div>`}
    ${vraag.hint ? `<p class="qattrib">${esc(vraag.hint)}</p>` : ''}
    ${opties}
  `);

  for (const knop of document.querySelectorAll('.optie')) {
    knop.addEventListener('click', () => antwoord(vraag, knop.dataset.id, s));
  }
}

function antwoord(vraag, gekozenId, doelSoort) {
  const goed = gekozenId === vraag.goed;
  for (const knop of document.querySelectorAll('.optie')) {
    knop.disabled = true;
    if (knop.dataset.id === vraag.goed) knop.classList.add('goed');
    else if (knop.dataset.id === gekozenId) knop.classList.add('mis');
    else knop.classList.add('flauw');
  }

  const uitkomst = verwerkAntwoord(vraag.soortId, goed, { extra: Boolean(vraag.extra) });
  sessie.resultaten.push({ soortId: vraag.soortId, goed, ...uitkomst });

  // Alleen soortkeuzes zeggen iets over verwarparen; zone- of formaatvragen niet.
  const gekozenSoort = soortOpId(gekozenId);
  if (gekozenSoort && ['fotoNaam', 'naamFoto', 'uitsnede', 'aOfB'].includes(vraag.type)) {
    noteerPaar(vraag.soortId, gekozenId, goed);
  }

  bewaarSessie(sessie);
  toonFeedback(vraag, gekozenId, goed, doelSoort, gekozenSoort);
}

function toonFeedback(vraag, gekozenId, goed, doel, gekozenSoort) {
  const bestaand = $('.fb');
  if (bestaand) bestaand.remove();

  // De vergelijking moet de foto's tonen die je net gezien hebt, niet zomaar de
  // eerste van die soort. Bij "welke foto is een ..." zaten beide in de opties;
  // bij de andere types is de vraagfoto de juiste. Een andere foto naast het
  // label "juist" zetten is precies het verwarrende dat dit scherm moet oplossen.
  const optieFoto = (id) => vraag.opties?.find((o) => o.id === id)?.foto ?? null;
  const doelFoto = optieFoto(vraag.goed) ?? vraag.foto ?? quizFotos(doel)[0] ?? doel.fotos[0];
  const foutFoto = optieFoto(gekozenId)
    ?? (gekozenSoort ? (quizFotos(gekozenSoort)[0] ?? gekozenSoort.fotos[0]) : null);
  const zelfdeFoto = foutFoto && doelFoto && foutFoto.bronUrl === doelFoto.bronUrl;

  // De ene regel die de twee soorten scheidt: de belangrijkste tekst in de app.
  const sleutel = !goed && gekozenSoort
    ? doel.onderscheid?.[gekozenSoort.id] ?? gekozenSoort.onderscheid?.[doel.id] ?? null
    : null;

  const vergelijking = !goed && gekozenSoort && foutFoto && !zelfdeFoto
    ? `<div class="verg">
         <figure><img src="${esc(wsrv(foutFoto.thumb, 260))}" alt="" referrerpolicy="no-referrer">
           <figcaption class="jouw">Jij koos: ${esc(gekozenSoort.naamNL.toLowerCase())}</figcaption></figure>
         <figure><img src="${esc(wsrv(doelFoto.thumb, 260))}" alt="" referrerpolicy="no-referrer">
           <figcaption class="juist">Juist: ${esc(doel.naamNL.toLowerCase())}</figcaption></figure>
       </div>`
    : '';

  const kop = goed
    ? 'Goed'
    : gekozenSoort ? `Bijna. Dit was een ${doel.naamNL.toLowerCase()}.` : 'Net niet.';

  document.body.classList.add('feedback-open');
  document.body.appendChild(el(`
    <div class="fb ${goed ? '' : 'mis'}" data-type="${esc(vraag.type)}">
      <h2>${esc(kop)}</h2>
      ${vergelijking}
      ${sleutel ? `<div class="sleutel"><strong>Het verschil:</strong> ${esc(sleutel)}</div>` : ''}
      ${!goed && !sleutel && doel.herkenningOnderWater
        ? `<div class="sleutel">${esc(doel.herkenningOnderWater[0])}</div>` : ''}
      <button class="knop" id="verder">Verder</button>
    </div>`));

  $('#verder').addEventListener('click', () => {
    $('.fb')?.remove();
    document.body.classList.remove('feedback-open');
    // Fout materiaal komt later in dezelfde sessie eenmaal terug, zodat je niet
    // weggaat met de fout als laatste indruk. Hooguit een keer: anders raakt wie
    // veel mist nooit aan het einde van de sessie.
    // In een toets komt niets terug: de lengte staat vast, anders zegt de uitslag niets.
    if (!goed && !vraag.herhaling && !sessie.toets) sessie.items.push({ ...vraag, herhaling: true });
    volgende();
  });
}

function volgende() {
  sessie.positie += 1;
  bewaarSessie(sessie);
  tekenItem();
}

// ---- afsluiting -------------------------------------------------------------

function toonKlaar() {
  document.body.classList.remove('quiz');
  const res = sessie.resultaten;
  const goed = res.filter((r) => r.goed).length;
  const wasExtra = sessie.items.some((i) => i.extra);

  const omhoog = [...new Set(res.filter((r) => r.omhoog).map((r) => r.soortId))];
  const terug = [...new Set(res.filter((r) => !r.goed).map((r) => r.soortId))];

  const lijst = (ids, label) => ids.length ? `
    <div class="kaart">
      <div class="blokkop">${label}</div>
      ${ids.map((id) => {
        const s = soortOpId(id);
        const f = s.fotos[0];
        return `<a class="lijstitem" href="#/soort/${esc(id)}">
          ${f ? `<img src="${esc(wsrv(f.thumb, 120))}" alt="" referrerpolicy="no-referrer">` : ''}
          <div style="flex:1"><div class="naam">${esc(s.naamNL)}</div></div>
          <span class="chip">boekje ${standVan(id).box}</span></a>`;
      }).join('')}
    </div>` : '';

  wisSessie();
  const module = sessie.module;

  const isToets = Boolean(sessie.toets);
  const pct = res.length ? Math.round((goed / res.length) * 100) : 0;

  toon(`
    <div class="kop"><img class="logo" src="logos/logo-duikvlag.svg" alt=""><h1>${isToets ? 'Uitslag' : 'Klaar'}</h1></div>
    ${isToets ? `<div class="kaart" style="text-align:center">
      <div style="font-size:2rem;font-weight:700;letter-spacing:-1px">${goed} van de ${res.length}</div>
      <div class="mini">${pct}% goed${module ? ` in ${esc(LABELS.module[module] ?? module)}` : ''}</div>
    </div>` : `<p class="mini" style="margin:0 0 1rem">${res.length} ${res.length === 1 ? 'vraag' : 'vragen'}, ${goed} goed.${
      wasExtra ? ' Dit was een vrije oefenronde, dus goede antwoorden verzetten je herhaalschema niet.' : ''}</p>`}
    ${lijst(omhoog, 'Ging omhoog')}
    ${lijst(terug, 'Komt terug')}
    ${!res.length ? '<div class="leeg">Geen vragen beantwoord.</div>' : ''}
    <a class="knop" href="#/">Klaar</a>
    <div style="text-align:center;margin-top:.4rem">
      <button class="tekstknop" id="nog">${isToets ? 'toets opnieuw doen' : 'nog een ronde'}</button>
    </div>
  `);

  $('#nog').addEventListener('click', () => {
    wisSessie();
    if (isToets) return toonToets({ module });
    const doel = module ? `/sessie/${module}` : '/sessie';
    ga(doel);
    if ((window.location.hash.slice(1) || '/') === doel) toonSessie({ module });
  });
}
