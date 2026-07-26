/** Startscherm, de sessie zelf en de afsluiting. */

import { esc, el, $, toon, attributie, ongekeurdLabel } from './ui.js';
import { ga } from './router.js';
import { soorten, soortOpId } from './data.js';
import { bouwSessie, watStaatKlaar, quizFotos, leerFoto, heeftQuizFoto, LABELS } from './sessie.js';
import { verwerkAntwoord, markeerGezien } from './leitner.js';
import { instellingen, noteerPaar, bewaarSessie, lopendeSessie, wisSessie, standVan } from './store.js';

/** Zichtniveau 0 tot 3. Automatisch volgt het boekje, zodat het moeilijker wordt naarmate je het beter kent. */
function zichtNiveau(box) {
  const gekozen = instellingen().zichtniveau;
  if (gekozen !== 'auto') return Number(gekozen);
  return { 1: 0, 2: 0, 3: 1, 4: 2, 5: 3 }[box] ?? 0;
}

const ZICHT_NAAM = ['helder', 'groenzweem', 'troebel', 'nachtduik'];

// ---- start ------------------------------------------------------------------

export function toonStart() {
  document.body.classList.remove('quiz');
  const klaar = watStaatKlaar(soorten());
  const bezig = lopendeSessie();

  const regel = klaar.bruikbaar === 0
    ? 'Er zijn nog geen soorten met goedgekeurde onderwaterfoto\'s.'
    : `${klaar.herhalen} ${klaar.herhalen === 1 ? 'soort is' : 'soorten zijn'} toe aan herhaling, ` +
      `${klaar.nieuw} nieuw beschikbaar.`;

  toon(`
    <div class="kop"><img class="logo" src="logos/logo-duikvlag.svg" alt=""><h1>Snoekduik</h1></div>

    ${klaar.bruikbaar === 0 ? `<div class="melding">
      Nog geen enkele soort heeft de vijf goedgekeurde onderwaterfoto's die nodig zijn voor de quiz.
      Zet bij <a href="#/ik">Ik</a> de ontwikkelschakelaar aan om met ongekeurde foto's te oefenen.
    </div>` : ''}

    <p class="mini" style="margin:.2rem 0 1rem">${esc(regel)}</p>

    ${bezig ? `<button class="knop groot" id="verder">Verder waar je gebleven was</button>` : ''}
    <button class="knop ${bezig ? 'stil' : 'groot'}" id="oefen" ${klaar.bruikbaar === 0 ? 'disabled' : ''}>
      ${bezig ? 'Nieuwe sessie' : 'Oefenen'}</button>
    <a class="knop stil" href="#/modules">Kies een module</a>
    <a class="knop stil" href="#/soorten">Zoek een soort</a>
  `);

  $('#oefen')?.addEventListener('click', () => { wisSessie(); ga('/sessie'); });
  $('#verder')?.addEventListener('click', () => ga('/sessie'));
}

// ---- sessie -----------------------------------------------------------------

let sessie = null;

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
    <div class="qbeeld">${foto ? `<img src="${esc(foto.groot)}" alt="" referrerpolicy="no-referrer">` : ''}</div>
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

function fotoBlok(vraag, niveau) {
  const uit = vraag.uitsnede;
  const stijl = uit
    ? `--uschaal:${uit.schaal};--ux:${uit.x}%;--uy:${uit.y}%`
    : '';
  return `
    <div class="qbeeld zicht zicht-${niveau} ${uit ? 'uitsnede' : ''}" style="${stijl}">
      <img src="${esc(vraag.foto.groot)}" alt="" referrerpolicy="no-referrer">
      ${niveau > 0 ? `<span class="zichtlabel">zicht: ${ZICHT_NAAM[niveau]}</span>` : ''}
    </div>`;
}

function tekenVraag(vraag) {
  const s = soortOpId(vraag.soortId);
  const niveau = zichtNiveau(standVan(vraag.soortId).box || 1);

  const opties = vraag.type === 'naamFoto'
    ? `<div class="qopties tweekolom">${vraag.opties.map((o) => `
        <button class="optie foto" data-id="${esc(o.id)}">
          <img src="${esc(o.foto.thumb)}" alt="" referrerpolicy="no-referrer"></button>`).join('')}</div>`
    : `<div class="qopties ${vraag.opties.length === 2 ? 'tweekolom' : ''}">
        ${vraag.opties.map((o) => `<button class="optie" data-id="${esc(o.id)}">${esc(o.label)}</button>`).join('')}
       </div>`;

  toon(`
    ${voortgangsbalk()}
    <div class="qvraag">${esc(vraag.vraag)}</div>
    ${vraag.type === 'naamFoto' ? '' : fotoBlok(vraag, niveau)}
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

  const uitkomst = verwerkAntwoord(vraag.soortId, goed);
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

  const doelFoto = quizFotos(doel)[0] ?? doel.fotos[0];
  const foutFoto = gekozenSoort ? (quizFotos(gekozenSoort)[0] ?? gekozenSoort.fotos[0]) : null;
  const zelfdeFoto = foutFoto && doelFoto && foutFoto.bronUrl === doelFoto.bronUrl;

  // De ene regel die de twee soorten scheidt: de belangrijkste tekst in de app.
  const sleutel = !goed && gekozenSoort
    ? doel.onderscheid?.[gekozenSoort.id] ?? gekozenSoort.onderscheid?.[doel.id] ?? null
    : null;

  const vergelijking = !goed && gekozenSoort && foutFoto && !zelfdeFoto
    ? `<div class="verg">
         <figure><img src="${esc(foutFoto.thumb)}" alt="" referrerpolicy="no-referrer">
           <figcaption class="jouw">Jij koos: ${esc(gekozenSoort.naamNL.toLowerCase())}</figcaption></figure>
         <figure><img src="${esc(doelFoto.thumb)}" alt="" referrerpolicy="no-referrer">
           <figcaption class="juist">Juist: ${esc(doel.naamNL.toLowerCase())}</figcaption></figure>
       </div>`
    : '';

  const kop = goed
    ? 'Goed'
    : gekozenSoort ? `Bijna. Dit was een ${doel.naamNL.toLowerCase()}.` : 'Net niet.';

  document.body.appendChild(el(`
    <div class="fb ${goed ? '' : 'mis'}">
      <h2>${esc(kop)}</h2>
      ${vergelijking}
      ${sleutel ? `<div class="sleutel"><strong>Het verschil:</strong> ${esc(sleutel)}</div>` : ''}
      ${!goed && !sleutel && doel.herkenningOnderWater
        ? `<div class="sleutel">${esc(doel.herkenningOnderWater[0])}</div>` : ''}
      <button class="knop" id="verder">Verder</button>
    </div>`));

  $('#verder').addEventListener('click', () => {
    $('.fb')?.remove();
    // Fout materiaal komt later in dezelfde sessie eenmaal terug, zodat je niet
    // weggaat met de fout als laatste indruk. Hooguit een keer: anders raakt wie
    // veel mist nooit aan het einde van de sessie.
    if (!goed && !vraag.herhaling) sessie.items.push({ ...vraag, herhaling: true });
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

  const omhoog = [...new Set(res.filter((r) => r.omhoog).map((r) => r.soortId))];
  const terug = [...new Set(res.filter((r) => !r.goed).map((r) => r.soortId))];

  const lijst = (ids, label) => ids.length ? `
    <div class="kaart">
      <div class="blokkop">${label}</div>
      ${ids.map((id) => {
        const s = soortOpId(id);
        const f = s.fotos[0];
        return `<a class="lijstitem" href="#/soort/${esc(id)}">
          ${f ? `<img src="${esc(f.thumb)}" alt="" referrerpolicy="no-referrer">` : ''}
          <div style="flex:1"><div class="naam">${esc(s.naamNL)}</div></div>
          <span class="chip">boekje ${standVan(id).box}</span></a>`;
      }).join('')}
    </div>` : '';

  wisSessie();
  const module = sessie.module;

  toon(`
    <div class="kop"><img class="logo" src="logos/logo-duikvlag.svg" alt=""><h1>Klaar</h1></div>
    <p class="mini" style="margin:0 0 1rem">${res.length} ${res.length === 1 ? 'vraag' : 'vragen'}, ${goed} goed.</p>
    ${lijst(omhoog, 'Ging omhoog')}
    ${lijst(terug, 'Komt terug')}
    ${!res.length ? '<div class="leeg">Geen vragen beantwoord.</div>' : ''}
    <a class="knop" href="#/">Klaar</a>
    <div style="text-align:center;margin-top:.4rem">
      <button class="tekstknop" id="nog">nog een ronde</button>
    </div>
  `);

  $('#nog').addEventListener('click', () => {
    wisSessie();
    ga(module ? `/sessie/${module}` : '/sessie');
    if ((window.location.hash.slice(1) || '/') === (module ? `/sessie/${module}` : '/sessie')) toonSessie({ module });
  });
}
