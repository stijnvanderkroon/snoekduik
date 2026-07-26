/** Feedbackmenu: doorverwijzingen naar formulieren, plus wat we het hardst nodig hebben. */

import { esc, $, toon } from './ui.js';
import { soorten, streefFotos } from './data.js';
import { LABELS } from './sessie.js';
import { FORMULIEREN } from './feedback-links.js';

/**
 * Soorten die nog het verst van de drempel af zitten. Dit is de lijst waar
 * iemand met eigen foto's het meeste verschil kan maken.
 */
function meestGewild(maximaal = 20) {
  return soorten()
    .map((s) => ({
      naam: s.naamNL,
      wetenschappelijk: s.naamWetenschappelijk,
      module: s.module,
      heeft: s.fotos.filter((f) => f.gekeurd).length,
    }))
    .filter((s) => s.heeft < streefFotos())
    .sort((a, b) => a.heeft - b.heeft)
    .slice(0, maximaal);
}

function kaart({ sleutel, kop, tekst, knop, extra = '' }) {
  const url = FORMULIEREN[sleutel];
  const actie = url
    ? `<a class="knop" href="${esc(url)}" target="_blank" rel="noopener">${esc(knop)}</a>`
    : '<button class="knop" disabled>Formulier nog niet beschikbaar</button>';
  return `<div class="kaart">
    <div class="blokkop">${esc(kop)}</div>
    ${tekst}
    ${extra}
    ${actie}
  </div>`;
}

export function toonFeedback() {
  document.body.classList.remove('quiz');
  const gewild = meestGewild();
  const tekort = soorten().filter((s) => s.fotos.filter((f) => f.gekeurd).length < streefFotos()).length;

  const gewildLijst = gewild.length ? `
    <details class="uitklap">
      <summary>Waar we de meeste foto's van missen (${tekort} soorten)</summary>
      <p class="mini" style="margin:.4rem 0">
        Een soort doet al mee zodra er één goedgekeurde onderwaterfoto is, maar met één foto
        leer je vooral dat plaatje. We streven naar ${streefFotos()} per soort. Hieronder de
        soorten die er nog het verst vanaf zitten.</p>
      <table class="gewild">
        <tbody>
        ${gewild.map((s) => `<tr>
          <td>${esc(s.naam)}<div class="mini" style="font-style:italic">${esc(s.wetenschappelijk)}</div></td>
          <td class="mini">${esc(LABELS.module[s.module] ?? s.module)}</td>
          <td class="nodig">${s.heeft} van ${streefFotos()}</td>
        </tr>`).join('')}
        </tbody>
      </table>
    </details>` : '';

  toon(`
    <div class="kop"><a class="chip" href="#/">terug</a><span class="spacer"></span></div>
    <h1 style="font-size:1.3rem;margin:.2rem 0 .6rem">Feedback</h1>

    <p class="mini" style="margin:0 0 1rem">
      Fijn dat je meedenkt. Ik doe mijn best, maar ik kan niet op alles reageren.
      Als je niets terughoort is dat niet persoonlijk: dan heb ik het gewoon gemist.
      Ken je me persoonlijk, app me dan gerust rechtstreeks.</p>

    ${kaart({
      sleutel: 'fotoRechten',
      kop: 'Dit is mijn foto en ik wil dit niet',
      knop: 'Foto melden',
      tekst: `<p style="margin:.2rem 0">Alle foto's in deze app komen van iNaturalist of Wikimedia
        Commons en zijn uitgekozen op een vrije licentie. Elke licentie is zo goed mogelijk
        gecontroleerd, maar er kunnen fouten in zitten.</p>
        <p style="margin:.2rem 0">Herken je je eigen werk en klopt er iets niet, meld het dan.
        Ik haal de foto weg zonder discussie.</p>`,
      extra: `<div class="melding" style="margin:.6rem 0">
        Bij elke foto in de app staat een code, bijvoorbeeld <strong>F-FX27MD</strong>.
        Geef die door in het formulier, dan weet ik precies om welke foto het gaat.
        Je vindt hem onder de foto op de soortpagina.</div>`,
    })}

    ${kaart({
      sleutel: 'fotoBijdragen',
      kop: 'Ik heb zelf goede onderwaterfoto\'s',
      knop: 'Foto\'s aanbieden',
      tekst: `<p style="margin:.2rem 0">Van veel soorten zijn nauwelijks bruikbare
        onderwaterfoto's te vinden. Duik je zelf en heb je materiaal, dan help je daar enorm mee.</p>
        <p style="margin:.2rem 0"><strong>Belangrijk:</strong> door foto's aan te leveren geef je
        mij uitdrukkelijk toestemming om ze in deze app te gebruiken. Daar staat geen vergoeding
        tegenover. Je naam komt wel bij de foto te staan. Wil je dat niet, stuur ze dan niet in.</p>`,
      extra: gewildLijst,
    })}

    ${kaart({
      sleutel: 'verbetering',
      kop: 'Verbetering of aanvulling',
      knop: 'Verbetering doorgeven',
      tekst: `<p style="margin:.2rem 0">Klopt een herkenningskenmerk niet, mist er een soort,
        of werkt er iets niet zoals je verwacht? Laat het weten.</p>
        <p class="mini" style="margin:.2rem 0">De soortteksten zijn met AI geschreven en nog niet
        allemaal door een duiker nagekeken. Correcties daarop zijn juist heel welkom.</p>`,
    })}
  `);
}
