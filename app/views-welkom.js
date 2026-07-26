/**
 * Welkomsscherm, één keer getoond bij de eerste keer openen.
 *
 * Blijft daarna bereikbaar via het Ik-scherm, want de AI-waarschuwing hierin is
 * niet iets dat je één keer wegklikt en daarna nooit meer kunt terugvinden.
 */

import { esc, $, toon, alineas } from './ui.js';
import { ga } from './router.js';
import { statistiek, streefFotos } from './data.js';
import { zetInstelling } from './store.js';
import { OVER_MIJ, OVER_MIJ_KOP } from './over-mij.js';

export function toonWelkom() {
  document.body.classList.remove('quiz');
  const st = statistiek();

  toon(`
    <div class="kop"><img class="logo" src="logos/logo-duikvlag.svg" alt=""><h1>Snoekduik</h1></div>

    <p style="font-size:1.05rem;margin:.4rem 0 1rem">
      Leer herkennen wat er in Nederlands zoetwater onder water zwemt.</p>

    <div class="kaart">
      <div class="blokkop">Hoe het werkt</div>
      <p style="margin:.2rem 0">Korte leerkaarten afgewisseld met quizvragen, in sessies van een paar
      minuten. Je hoeft niet bij les één te beginnen: de app houdt zelf bij wat je nog niet goed kent
      en biedt dat vaker aan.</p>
      <p style="margin:.2rem 0">In de quiz zie je <strong>alleen echte onderwaterfoto's</strong>.
      Bijna al het beeld van Nederlandse zoetwatervis komt uit de hengelsport, maar een vis op een
      meetlat leert je niet wat je onder water ziet.</p>
    </div>

    ${alineas(OVER_MIJ) ? `<div class="kaart">
      <div class="blokkop">${esc(OVER_MIJ_KOP)}</div>
      ${alineas(OVER_MIJ)}
    </div>` : ''}

    <div class="melding">
      <strong>Deze app is met AI gemaakt.</strong> Het ontwerp, de code en alle soortteksten zijn door
      een taalmodel geschreven. Dat gaat goed voor bouwen en minder goed voor zeker weten: AI schrijft
      even overtuigend iets juists als iets onjuists op.
      <br><br>
      De soortteksten zijn nog niet door een duiker nagekeken, en dat staat er bij elke soort bij.
      Gebruik dit om te oefenen, niet als veldgids. Zie je een fout, geef die dan door via de
      feedbackknop.
    </div>

    <div class="kaart">
      <div class="blokkop">Wat er niet gebeurt</div>
      <p style="margin:.2rem 0">Geen account, geen server, geen tracking. Geen streak, geen punten,
      geen notificaties. Alles blijft op je eigen telefoon staan, en de app probeert niet je gewoonte
      te worden.</p>
      <p class="mini" style="margin:.2rem 0">Omdat alles lokaal staat, kun je je voortgang bij
      <strong>Ik</strong> exporteren als bestand. Handig, want browsers ruimen opslag soms op.</p>
    </div>

    <p class="mini" style="margin:0 0 1rem">
      Nu ${st.soortenMetGekeurd} soorten met goedgekeurde onderwaterfoto's, van de ${st.soorten} in de
      lijst. Er komen er nog bij: de streefwaarde is ${streefFotos()} foto's per soort.</p>

    <button class="knop groot" id="beginnen">Beginnen</button>
    <a class="knop stil" href="#/gemaakt">Eerst meer lezen over hoe dit gemaakt is</a>
  `);

  $('#beginnen').addEventListener('click', () => {
    zetInstelling('welkomGezien', true);
    ga('/');
  });
}
