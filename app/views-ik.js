/** Levenslijst, instellingen en de verantwoordingspagina. */

import { esc, $, toon, datumNL, bevestig } from './ui.js';
import { OVER_MIJ, OVER_MIJ_KOP } from './over-mij.js';
import { ga } from './router.js';
import { soorten, soortOpId, streefFotos, statistiek } from './data.js';
import { aantalBeheerst } from './leitner.js';
import {
  waarnemingen, voegWaarnemingToe, verwijderWaarneming,
  exporteerAlles, importeerAlles, wisAlles, alleenLezen,
} from './store.js';

// ---- levenslijst ------------------------------------------------------------

export function toonLevenslijst() {
  document.body.classList.remove('quiz');
  const lijst = waarnemingen();

  toon(`
    <div class="kop"><h1>Levenslijst</h1><span class="spacer"></span>
      <span class="chip">${new Set(lijst.map((w) => w.soortId)).size} soorten</span></div>
    <p class="mini" style="margin:.1rem 0 .8rem">Wat je zelf onder water gezien hebt. Staat los van je leervoortgang.</p>

    <div class="kaart">
      <div class="blokkop">Waarneming toevoegen</div>
      <select id="soortkeuze">
        <option value="">Kies een soort</option>
        ${soorten().map((s) => `<option value="${esc(s.id)}">${esc(s.naamNL)}</option>`).join('')}
      </select>
      <input type="date" id="datum" style="margin-top:.4rem" value="${new Date().toISOString().slice(0, 10)}">
      <input type="text" id="notitie" style="margin-top:.4rem" placeholder="Notitie, bijvoorbeeld de duikstek">
      <button class="knop" id="voegtoe" style="margin-top:.5rem">Toevoegen</button>
    </div>

    <div id="lijst">${
      lijst.length === 0
        ? '<div class="leeg">Nog niets genoteerd.</div>'
        : lijst.map((w, i) => {
          const s = soortOpId(w.soortId);
          const f = s?.fotos[0];
          return `<div class="lijstitem">
            ${f ? `<img src="${esc(f.thumb)}" alt="" referrerpolicy="no-referrer">` : ''}
            <div style="flex:1;min-width:0">
              <div class="naam">${esc(s?.naamNL ?? w.soortId)}</div>
              <div class="mini">${esc(w.datum)}${w.notitie ? ` · ${esc(w.notitie)}` : ''}</div>
            </div>
            <button class="tekstknop" data-weg="${i}">wis</button></div>`;
        }).join('')
    }</div>
  `);

  $('#voegtoe').addEventListener('click', () => {
    const id = $('#soortkeuze').value;
    if (!id) return;
    voegWaarnemingToe(id, $('#datum').value, $('#notitie').value.trim());
    toonLevenslijst();
  });
  for (const knop of document.querySelectorAll('[data-weg]')) {
    knop.addEventListener('click', () => {
      verwijderWaarneming(Number(knop.dataset.weg));
      toonLevenslijst();
    });
  }
}

// ---- instellingen -----------------------------------------------------------

export function toonIk() {
  document.body.classList.remove('quiz');
  const alle = soorten();
  const beheerst = aantalBeheerst(alle.map((s) => s.id));

  toon(`
    <div class="kop"><h1>Ik</h1></div>

    ${alleenLezen() ? '<div class="melding">Je opgeslagen voortgang komt van een nieuwere versie van de app. Er wordt niets weggegooid, maar er wordt ook niets bewaard.</div>' : ''}

    <div class="kaart">
      <div class="blokkop">Waar je staat</div>
      <p style="margin:.2rem 0">${beheerst} van de ${alle.length} soorten blijft zitten.</p>
      <span class="mini">Dat is het aantal soorten in boekje 4 of 5. Geen score, alleen een stand van zaken.</span>
    </div>

    <div class="kaart">
      <div class="blokkop">Je voortgang bewaren</div>
      <p class="mini" style="margin:.2rem 0 .5rem">
        Alles staat alleen op dit apparaat. Safari wist opslag na zeven dagen zonder bezoek,
        dus maak af en toe een export, of installeer de app op je beginscherm.</p>
      <button class="knop stil" id="exporteer">Exporteer als bestand</button>
      <button class="knop stil" id="importeer">Importeer bestand</button>
      <input type="file" id="bestand" accept="application/json" hidden>
    </div>

    <a class="knop stil" href="#/welkom">Uitleg en waarschuwing opnieuw lezen</a>
    <a class="knop stil" href="#/gemaakt">Hoe dit gemaakt is</a>
    <button class="knop stil" id="wis" style="color:var(--bijna)">Alles wissen</button>
  `);

  $('#exporteer').addEventListener('click', () => {
    const blob = new Blob([exporteerAlles()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `snoekduik-voortgang-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  });

  $('#importeer').addEventListener('click', () => $('#bestand').click());
  $('#bestand').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const uit = importeerAlles(await file.text());
      alert(`Ingelezen: ${uit.soorten} soorten en ${uit.waarnemingen} waarnemingen.`);
      toonIk();
    } catch (err) {
      alert(`Kon dit bestand niet lezen: ${err.message}`);
    }
  });

  $('#wis').addEventListener('click', () => {
    if (!bevestig('Alle voortgang en je levenslijst wissen? Dit kan niet ongedaan worden gemaakt.')) return;
    wisAlles();
    ga('/');
  });
}

// ---- hoe dit gemaakt is -----------------------------------------------------

/**
 * De tekst uit over-mij.js, als alinea's. Lege regels scheiden alinea's, en de
 * inhoud wordt ontsmet zodat een losse < of & niets sloopt.
 */
function overMijBlok() {
  const tekst = (OVER_MIJ ?? '').trim();
  if (!tekst) return '';
  // Een lege regel scheidt alinea's. Losse regelafbrekingen binnen een alinea
  // zijn opmaak van het bronbestand, geen bedoelde afbreking, dus die worden spaties.
  const alineas = tekst.split(/\n\s*\n/)
    .map((a) => `<p style="margin:.2rem 0">${esc(a.trim().replace(/\s*\n\s*/g, ' '))}</p>`)
    .join('');
  return `<div class="kaart">
      <div class="blokkop">${esc(OVER_MIJ_KOP)}</div>
      ${alineas}
    </div>`;
}

export function toonGemaakt() {
  document.body.classList.remove('quiz');
  const st = statistiek();

  const fotografen = new Map();
  for (const s of soorten()) {
    for (const f of s.fotos) {
      if (!f.fotograaf) continue;
      const k = `${f.fotograaf}|${f.licentie}`;
      if (!fotografen.has(k)) fotografen.set(k, { naam: f.fotograaf, licentie: f.licentie, aantal: 0 });
      fotografen.get(k).aantal += 1;
    }
  }
  const lijst = [...fotografen.values()].sort((a, b) => b.aantal - a.aantal);

  toon(`
    <div class="kop"><a class="chip" href="#/ik">terug</a><span class="spacer"></span></div>
    <h1 style="font-size:1.3rem;margin:.2rem 0 1rem">Hoe dit gemaakt is</h1>

    <div class="kaart">
      <div class="blokkop">Deze app is volledig met AI gemaakt</div>
      <p style="margin:.2rem 0">Het ontwerp, de code en de soortteksten zijn door AI geschreven.
      Er is geen team, geen bureau en geen budget: één persoon met een idee en een taalmodel.</p>
      <p style="margin:.2rem 0">Dat werkt goed voor bouwen, en minder goed voor zeker weten. AI schrijft
      even overtuigend op dat de blankvoorn een rood oog heeft als het omgekeerde. Daarom is alles wat
      met soortkennis te maken heeft gemarkeerd tot een duiker het heeft nagekeken, en zie je bij een
      soort staan of dat al gebeurd is.</p>
    </div>

    <div class="kaart">
      <div class="blokkop">Waarom alleen onderwaterfoto's</div>
      <p style="margin:.2rem 0">Bijna al het beschikbare beeld van Nederlandse zoetwatervis komt uit de
      hengelsport: vis in de hand, op een mat, of dood. Prima om kenmerken te benoemen, maar het is niet
      wat een duiker ziet. Daarom komen in de quiz uitsluitend echte onderwateropnames.</p>
    </div>

    <div class="kaart">
      <div class="blokkop">Waar de foto's vandaan komen</div>
      <p style="margin:.2rem 0">Van iNaturalist en Wikimedia Commons, waar mensen hun waarnemingen
      onder een vrije licentie delen. Voor alle ${st.soorten} soorten is gezocht naar bruikbaar
      materiaal.</p>
      <p style="margin:.2rem 0">Alleen zoeken is niet genoeg: geen enkele zoekmachine kan filteren op
      "onder water genomen". Iemand heeft daarom elke foto met de hand bekeken en beoordeeld. Nu zijn
      er <strong>${st.gekeurd} goedgekeurde foto's</strong> over ${st.soortenMetGekeurd} soorten. Een
      soort doet mee zodra er één goedgekeurde onderwaterfoto is; we streven naar ${streefFotos()},
      want met één foto leer je vooral dat ene plaatje.</p>
    </div>

    <div class="kaart">
      <div class="blokkop">Wat er niet in zit</div>
      <p style="margin:.2rem 0">Geen account, geen server, geen tracking. Geen streak, geen punten,
      geen notificaties. Alles wat je doet blijft op je eigen telefoon. Deze app probeert niet je
      gewoonte te worden.</p>
    </div>

    ${overMijBlok()}

    <div class="kaart">
      <div class="blokkop">Fotografen en licenties</div>
      <p class="mini" style="margin:.2rem 0 .5rem">${lijst.length} fotografen. Bij elke foto in de app
      staat de maker en de licentie ook zelf vermeld.</p>
      ${lijst.map((f) => `<div class="regel" style="padding:.3rem 0">
        <span style="flex:1">${esc(f.naam)}</span>
        <span class="chip">${esc(f.licentie ?? '?')}</span>
        <span class="mini">${f.aantal}</span></div>`).join('')}
    </div>
  `);
}
