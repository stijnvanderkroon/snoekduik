/** Kleine hulpjes voor de views. Geen framework: de app is te klein om er een te dragen. */

export const esc = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function el(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

export const $ = (sel, wortel = document) => wortel.querySelector(sel);
export const $$ = (sel, wortel = document) => [...wortel.querySelectorAll(sel)];

/**
 * Route een foto-URL via de wsrv.nl-proxy: die haalt 'm op, schaalt naar de
 * opgegeven breedte, zet 'm om naar webp en cachet het resultaat op een CDN.
 * Dat scheelt vooral op de eerste keer laden, wanneer onze eigen serviceworker
 * de foto nog niet heeft. Werkt bovendien om hotlink-referer-checks heen omdat
 * wsrv.nl de foto server-side ophaalt.
 */
export const wsrv = (url, breedte) =>
  url ? `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=${breedte}&output=webp&q=82&we=1` : url;

/** Bronvermelding onder een foto. Verplicht bij elke foto in de app. */
export function attributie(foto) {
  if (!foto) return '';
  const wie = foto.fotograaf ? esc(foto.fotograaf) : 'onbekende fotograaf';
  const bron = foto.bron === 'commons' ? 'Wikimedia Commons' : 'iNaturalist';
  // De code laat iemand in het feedbackformulier aangeven om welke foto het gaat.
  const code = foto.code ? ` · <span class="fotocode">${esc(foto.code)}</span>` : '';
  return `${wie} · ${esc(foto.licentie ?? 'licentie onbekend')} · ` +
    `<a href="${esc(foto.bronUrl)}" target="_blank" rel="noopener">${bron}</a>${code}`;
}

/** Waarschuwing bij foto's die nog niemand als echte onderwateropname heeft goedgekeurd. */
export const ongekeurdLabel = (foto) =>
  foto && !foto.gekeurd ? '<span class="chip let">nog niet gekeurd</span>' : '';

/**
 * Vrije tekst als alinea's. Een lege regel begint een nieuwe alinea; losse
 * regelafbrekingen zijn opmaak van het bronbestand en worden spaties, anders
 * breekt een zin af op een willekeurige plek. Inhoud wordt ontsmet.
 */
export function alineas(tekst, stijl = 'margin:.2rem 0') {
  const schoon = (tekst ?? '').trim();
  if (!schoon) return '';
  return schoon.split(/\n\s*\n/)
    .map((a) => `<p style="${stijl}">${esc(a.trim().replace(/\s*\n\s*/g, ' '))}</p>`)
    .join('');
}

export function toon(html) {
  const scherm = $('#scherm');
  scherm.replaceChildren(typeof html === 'string' ? el(`<div>${html}</div>`) : html);
  window.scrollTo(0, 0);
}

export function bevestig(vraag) {
  return window.confirm(vraag);
}

export function ringStijl(percentage, kleur = 'var(--teal)') {
  return `background:conic-gradient(${kleur} ${Math.round(percentage * 3.6)}deg, var(--lijn) 0)`;
}

export const datumNL = (ms) =>
  new Date(ms).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', year: 'numeric' });
