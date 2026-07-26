# Fototriage (dev-only)

Hulpmiddel om per soort te bepalen welke gevonden foto's échte in-situ
onderwateropnames zijn. Hoort **niet** op GitHub Pages: zie de dev-only regel in
`CLAUDE.md`.

Geen enkele API kan filteren op "onder water genomen", dus dit is de menselijke
stap tussen de probe en het echte ophalen van foto's.

## Gebruik

```sh
node scripts/probe-fotos.mjs          # ronde 1: data/fotoProbe.json
node tools/foto-triage/server.mjs     # http://localhost:8787
node tools/foto-triage/rapport.mjs    # wat is er nog nodig?
```

Klik **Beoordelen (volledig scherm)** of druk `V`. Eén foto tegelijk, onbijgesneden
op volledig scherm, met automatisch doorspringen na elk oordeel.

| Toets | Actie |
| --- | --- |
| `1` / `2` / `3` | nee / misschien / goed, springt door naar de volgende |
| `0` | oordeel wissen |
| `S` | topfoto markeren (★) |
| `←` / `→` of spatie | handmatig terug/vooruit |
| `Esc` | sluiten, terug naar het raster |

Het vinkje *alleen onbeoordeelde* staat aan, zodat je nooit twee keer dezelfde
foto ziet. Zet het uit om eerdere oordelen te herzien. Klikken op een foto in het
raster opent hem ook op volledig scherm.

Opslaan gaat automatisch naar `data/fotoOordelen.json`; de knop *Exporteer JSON*
is de terugvaloptie als de server niet draait.

Soorten staan gesorteerd op minste bruikbare foto's eerst. Beoordeel per soort
de hele set, ook als je de 5 al gehaald hebt: het totaal bepaalt of een soort
haalbaar is of naar de ANEMOON-lijst moet.

## Meer dan 5 goede foto's

Elk oordeel krijgt een `volgnummer`, dus de volgorde waarin je foto's goedkeurt
blijft bewaard, en `S` markeert uitschieters met een ster. `rapport.mjs` toont
per soort alle goedgekeurde foto's op volgorde (sterren eerst) en markeert welke
op dit moment de top 5 vormen. Zo blijft de keuze "welke 5 gebruiken we echt"
open tot je alles gezien hebt, zonder dat er iets weggegooid wordt.

## Volgende ronde

```sh
node scripts/probe-fotos.mjs --dieper 4
```

Pakt alleen soorten met minder dan 5 goede foto's, haalt tot 4 pagina's dieper
op iNaturalist, en slaat foto's over die al beoordeeld zijn. Commons wordt in
ronde 2 overgeslagen; `rapport.mjs` laat de trefkans per bron zien zodat die
keuze op cijfers rust.

## Bestanden

| Bestand | Rol |
| --- | --- |
| `index.html` | de triage-UI |
| `server.mjs` | serveert de UI, schrijft `data/fotoOordelen.json` (atomair) |
| `rapport.mjs` | tekort per soort + trefkans per bron |

Oordelen worden gesleuteld op `soortId\|bronUrl`, niet op index, zodat ze
blijven kloppen als een volgende ronde andere foto's ophaalt.
