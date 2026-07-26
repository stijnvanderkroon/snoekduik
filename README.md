# Snoekduik

Leer herkennen wat er in Nederlands zoetwater onder water zwemt. Voor duikers.

Korte leerkaarten afgewisseld met quizvragen, met spaced repetition eronder.
Werkt offline, draait volledig in je browser, en houdt niets over je bij.

## Volledig met AI gebouwd

Het ontwerp, de code en de soortteksten van dit project zijn door AI geschreven,
in samenwerking met één persoon die de richting bepaalde en de foto's beoordeelde.
Dat staat hier omdat het uitmaakt voor hoe je de inhoud moet lezen.

Wat dat goed doet: bouwen. De hele app, de datapijplijn en de hulpmiddelen zijn
er in een paar sessies gekomen.

Wat dat slecht doet: zeker weten. Een taalmodel schrijft even overtuigend op dat
de blankvoorn een rood oog heeft als het omgekeerde, en tijdens de bouw is dat
ook daadwerkelijk een keer misgegaan. Daarom:

- Elke soorttekst heeft een `gecontroleerd`-vlag die pas op `true` gaat als een
  duiker hem heeft nagekeken. De app toont zichtbaar wanneer dat nog niet gebeurd is.
- Bij elke soort staat op welke bron de tekst gebaseerd is.
- Geen enkele foto komt in de quiz zonder dat een mens hem heeft bekeken.

Behandel de soortkennis dus als een concept, niet als een veldgids.

## Randvoorwaarden

- **Volledig statisch.** Geen backend, geen database, geen bouwstap.
- **Mobile-first**, ontworpen voor een duim op een telefoon van 380px breed.
- **Offline bruikbaar** als PWA, want aan de waterkant is vaak geen bereik.
- **Alles lokaal.** Geen accounts, geen tracking, geen notificaties.
- **Geen verslavende patronen.** Geen streak, XP, badges of levens. Dit is een
  hulpmiddel, geen spel.

## Draaien

```sh
node tools/serve.mjs        # http://localhost:8080
```

Een server is nodig omdat de app ES-modules en `fetch` gebruikt; die blokkeert
de browser via `file://`. Node 18 of nieuwer, verder geen afhankelijkheden.

## Publiceren

Push naar `main`. De workflow in `.github/workflows/pages.yml` genereert de
soortgegevens opnieuw, draait de tests, en publiceert alleen de site zelf naar
GitHub Pages. `scripts/` en `tools/` gaan bewust niet mee.

Eenmalig instellen: **Settings → Pages → Source: GitHub Actions**.

De app gebruikt overal relatieve paden en hash-routing, dus hij werkt zonder
aanpassing onder `https://<gebruiker>.github.io/snoekduik/`.

## Testen

```sh
node tools/test/logica.mjs      # opslag, leitner en de vraagbouwers
```

```sh
npm install --no-save jsdom
node tools/test/schermen.mjs    # bouwt elk scherm op en klikt een sessie door
```

De rendertest controleert ook de standaardsituatie waarin er nog nauwelijks
goedgekeurde foto's zijn. `jsdom` staat bewust niet in de repo; zonder jsdom
slaat de test zichzelf over.

## Hoe het in elkaar zit

### De app

| Bestand | Wat het doet |
| --- | --- |
| `index.html` | de hele pagina, verder wordt alles in JS opgebouwd |
| `app/main.js` | startpunt, routes en tabbalk |
| `app/router.js` | hash-routing (`#/soort/snoek`) |
| `app/data.js` | laadt `data/soorten.json` |
| `app/store.js` | localStorage met versienummer, migratie, export en import |
| `app/leitner.js` | de vijf boekjes en wanneer iets terugkomt |
| `app/sessie.js` | stelt sessies samen en bouwt de vragen |
| `app/views-*.js` | de schermen |
| `sw.js` | service worker voor offline gebruik |

### De datapijplijn

De soortgegevens worden gegenereerd, niet met de hand bijgehouden:

```
soorten.seed.json          handgemaakte soortenlijst (alleen lezen)
  +  data/fotoProbe.json      gevonden foto's per soort
  +  data/fotoOordelen.json   welke foto's echte onderwateropnames zijn
  +  scripts/soortteksten.mjs de teksten per soort
  ->  data/soorten.json        wat de app inleest
```

```sh
node scripts/bouw-soorten.mjs
```

Dat script meldt ook inconsistenties, bijvoorbeeld een verwarpaar dat maar van
één kant genoemd wordt, of een onderscheidtekst die nooit getoond kan worden.

### Foto's

```sh
node scripts/probe-fotos.mjs              # zoek foto's bij alle soorten
node tools/foto-triage/server.mjs         # beoordeel ze met de hand
node tools/foto-triage/rapport.mjs        # wat is er nog nodig
node scripts/probe-fotos.mjs --dieper 4   # zoek dieper waar het tekortschiet
```

Foto's komen van iNaturalist en Wikimedia Commons, alleen onder CC0, CC-BY,
CC-BY-SA of CC-BY-NC. Fotograaf, licentie en bron staan overal in beeld.

Het belangrijkste onderscheid in dit project: alleen **echte onderwaterfoto's**
komen in de quiz. Bijna al het beschikbare beeld van Nederlandse zoetwatervis
komt uit de hengelsport, en een vis op een meetlat leert je niet wat je onder
water ziet. Geen enkele zoekmachine kan filteren op "onder water genomen", dus
dat oordeel is handwerk. Een soort komt pas in de quiz bij vijf goedgekeurde
onderwaterfoto's.

Zolang er nog te weinig zijn staat er bij **Ik** een schakelaar om ongekeurde
foto's toe te laten, zodat alle modules te bekijken zijn. Die krijgen overal het
label "nog niet gekeurd".

## Een soort toevoegen of aanvullen

1. Soort erbij? Voeg hem toe aan `soorten.seed.json`.
2. Tekst erbij? Vul hem aan in `scripts/soortteksten.mjs`.
3. `node scripts/bouw-soorten.mjs`

De app hoeft daarvoor niet aangepast te worden.

## Indeling

| Pad | Wat |
| --- | --- |
| `index.html`, `app/`, `sw.js` | de app, dit wordt gepubliceerd |
| `data/soorten.json` | gegenereerde bron van waarheid |
| `soorten.seed.json` | handgemaakte soortenlijst |
| `scripts/` | datapijplijn, niet gepubliceerd |
| `tools/` | server, tests en fototriage, niet gepubliceerd |
| `logos/` | merkbestanden |
| `ontwerp.md` | schermen, leercyclus en de gemaakte keuzes |
| `brief.md` | achtergrond en afwegingen |
| `CLAUDE.md` | randvoorwaarden voor wie eraan werkt |

## Licenties

De foto's houden hun eigen licentie, die per foto in de app staat vermeld. Voor
de code en de soortdata is nog geen licentie gekozen.
