# Snoekduik

Leer-app voor het herkennen van Nederlands onderwaterleven. Duolingo-achtig:
korte leerkaarten afgewisseld met quizvragen, met spaced repetition.

**Doelgroep: uitsluitend duikers.** Dat is geen marketingdetail maar een
ontwerpbeperking — zie "Fotobeleid" hieronder.

Volledige achtergrond en afwegingen: `docs/brief.md`. Lees dat bij twijfel over
het waaróm van een keuze; dit bestand bevat alleen wat elke sessie nodig heeft.

## Harde randvoorwaarden

- **Volledig statisch.** Geen backend, geen database, geen server-side rendering.
  Gehost op GitHub Pages.
- **Mobile-first.** Ontwerp voor een duim op een telefoon van 380px breed.
  Desktop is een bijvangst, geen doel.
- **Offline bruikbaar.** PWA met service worker. Mensen gebruiken dit aan de
  waterkant zonder bereik.
- **Alle voortgang in localStorage.** Geen accounts, geen inloggen, geen tracking.
- **`tools/` en `scripts/` zijn dev-only.** Ze staan in de repo maar horen niet
  op GitHub Pages. Als de Vite-config er komt: houd ze buiten `root` en buiten
  `build.rollupOptions.input`, anders worden ze alsnog meegedeployed.

## Fotobeleid — de belangrijkste regel

Elke soort heeft foto's in twee tiers:

- `referentie` — helder en scherp. Mag een aquarium- of in-de-handfoto zijn.
  **Alleen op de leerkaart.**
- `insitu` — echte onderwaterfoto in natuurlijke omgeving.
  **Uitsluitend deze in de quiz.**

Reden: een duiker moet herkennen wat hij ónder water ziet, niet een strak
zijaanzicht op een meetlat. Quizzen op referentiefoto's traint het verkeerde.

Alleen CC0 / CC-BY / CC-BY-SA / CC-BY-NC. Bronnen: iNaturalist API en Wikimedia
Commons. **Fotograaf, licentie en bron-URL zijn verplichte velden** en moeten
zichtbaar zijn in de UI. Geen foto zonder attributie in de repo.

Zoek op soort, niet op land — een snoek in Tsjechië ziet er hetzelfde uit.

## Didactische keuzes (niet zomaar omgooien)

- **Verwarparen zijn de kern.** Afleiders in multiple choice komen bij voorkeur
  uit `verwardMet` van de doelsoort. Willekeurige afleiders maken de quiz
  waardeloos (snoek vs. zwanenmossel leert niemand iets).
- **Spaced repetition, Leitner met 5 boxen.** Geen lineaire "les 1, les 2".
  Modules zijn ingangen, geen verplichte volgorde.
- **Moeilijkheid loopt via het vraagtype, niet via zeldzamere soorten.**
  Boekje 1 is foto naar naam, hoger op komen uitsnede en A-of-B, want daar zit
  de leerwinst bij verwarparen. Zichtsimulatie (een filter over de quizfoto) is
  overwogen en bewust geschrapt: niet ondersteund.
- **Geen verslavende patronen.** Geen levens/hartjes, maar ook geen streak, XP,
  badges of notificaties. Dit is een hulpmiddel, geen spel: het mag laten zien
  waar je staat, maar nooit iets doen om je terug te halen. Falen mag geen sessie
  afbreken. Zie hoofdstuk 7 van `ontwerp.md`.

## Datamodel

`data/soorten.json` is de bron van waarheid. Zie `data/soorten.seed.json` voor
66 startsoorten met structuur al ingevuld en inhoudelijke velden op `null`.

Velden die nog gevuld moeten worden per soort: `herkenningOnderWater`,
`gedragBijDuiker`, `seizoen`, `weetje`, `fotos`.

`leefgebied` is bewust globaal (diepe-plas, ondiepe-plas, sloot-kanaal, rivier,
beek, groot-open-water). **Geen duikstekken** — de data daarvoor is te dun.
`zone` beschrijft waar in het water: open-water, talud, bodem, kruidzone,
hard-substraat.

## Valkuilen die me al eens hebben gebeten

- **Safari wist script-writable storage na 7 dagen zonder bezoek.** Precies de
  gebruiker die je wil terugwinnen raakt zijn voortgang kwijt. Mitigatie:
  PWA-install aanmoedigen (home-screen apps zijn uitgezonderd) én een
  export/import van de voortgang als JSON. Bouw die export vanaf dag één.
- **Voortgangsdata krijgt een `schemaVersion` met migratiefunctie.** Het
  datamodel gaat veranderen; zonder migratie gooi je voortgang van gebruikers weg.
- **GitHub Pages serveert onder `/<repo>/`.** Zet `base` goed in de Vite-config
  en gebruik nergens hardcoded absolute paden.
- **Client-side routing breekt op Pages.** Los op met een `404.html`-redirect of
  gebruik hash-routing.

## Werkafspraken

- Nederlands in de UI en in soortnamen. Code en commits in het Engels.
- Nieuwe soort toevoegen = alleen JSON + foto's. Nooit code aanpassen.
- Bij twijfel over scope: eerst modules `eerste-duik` en `witvis` compleet
  (20 soorten, 8 in-situ foto's elk). Twintig soorten goed gedaan is een
  product; zeventig soorten met wazige foto's niet.
- Zoutwater (Grevelingen, Oosterschelde) komt later. Houd het datamodel
  daarvoor open, maar bouw het nu niet.
