# Snoekduik: ontwerp

Ontwerpdocument voor de app zelf. `brief.md` beschrijft het waarom, `CLAUDE.md`
de harde randvoorwaarden. Dit bestand beschrijft de schermen, de leercyclus en de
keuzes die nog vastgelegd moesten worden.

Bekijk `ontwerp-mockup.html` in een browser (380px breed) voor de visuele kant.

---

## 1. Visuele identiteit

Basis is `logos/logo-duikvlag.svg`: de duikvlag, waarbij de witte diagonaal de
vorm van een snoek heeft. Dat is meteen de belofte van de app: dit is voor
duikers, en het gaat over vis.

### Palet

| Rol | Kleur | Gebruik |
| --- | --- | --- |
| Merk | `#BE3A2B` duikvlagrood | uitsluitend logo, app-icoon, duikvlagverwijzingen |
| Basis donker | `#1B4B45` diep teal | koppen, tekst op licht, quiz-achtergrond |
| Basis midden | `#2E7D6B` teal | knoppen, actieve staat, voortgangsringen |
| Achtergrond | `#F4F0E3` crème | schermachtergrond |
| Accent | `#E8B44A` amber | spaarzaam: markeringen, "let op", exotenlabel |
| Goed | `#2E7D6B` teal | correct antwoord |
| Bijna | `#C97A2B` oranje | fout antwoord, "kijk nog eens" |

**Rood is bewust géén feedbackkleur.** Het merk is rood, en `CLAUDE.md` is
expliciet dat falen geen straf mag voelen: geen levens, geen afgebroken sessie.
Als foutmeldingen dezelfde rood krijgen als het logo, leest elke misser als
alarm. Fout is daarom warm oranje met de tekst "bijna", en de correctie toont
altijd meteen het verschil tussen de twee soorten.

### Licht, niet donker

Tegen-intuïtief voor een onderwaterapp, maar deze app wordt aan de waterkant in
fel daglicht gebruikt, vaak met natte handen en een telefoon op halve helderheid.
Crème achtergrond met diep teal tekst leest daar aanzienlijk beter dan een donker
thema. De uitzondering is het quizscherm: dat krijgt een donkere teal achtergrond
zodat de foto alle aandacht pakt. `prefers-color-scheme:
dark` wordt gerespecteerd voor wie 's avonds leert.

### Typografie

`system-ui`. Geen webfonts: die kosten laadtijd, moeten in de service worker
gecachet worden en leveren voor een tekstarme app weinig op. Soortnamen
Nederlands en groot, wetenschappelijke namen cursief en klein eronder.

---

## 2. Schermen

Mobiel is de maat. Onderaan een tabbalk met vier items, want dat is met een duim
bereikbaar. Op desktop (>900px) wordt die tabbalk een smalle zijbalk en krijgt de
inhoud een maximumbreedte van ongeveer 720px, zodat het geen uitgerekte
telefoonapp wordt.

### 2.1 Start

Het scherm dat opent. Een keuze, geen aansporing.

- Logo klein, verder geen tellers
- **Oefenen** met daaronder feitelijk wat er klaarstaat: "12 soorten zijn toe aan
  herhaling, 3 nieuwe beschikbaar"
- **Kies een module** als tweede ingang
- **Zoek een soort** als derde, voor wie net uit het water komt
- Bij een onderbroken sessie: "Verder waar je gebleven was"

Geen streak, geen XP-teller, geen dagdoel, geen "je hebt vandaag nog niet
geoefend". De tekst beschrijft wat er is, en nodigt nergens toe uit. Wie niets
wil doen sluit de app zonder ergens aan herinnerd te worden.

Als er niets te herhalen is staat er "Niets staat klaar om te herhalen", zonder
suggestie om dan maar iets anders te doen.

### 2.2 Sessie

De kern. Zie hoofdstuk 3 voor de opbouw. Per item één scherm:

- **Leerkaart**: referentiefoto groot, naam, `herkenningOnderWater` als twee of
  drie korte punten, `gedragBijDuiker` apart met een duikericoontje, formaat en
  zone als kleine chips. Knop: "Snap ik".
- **Quizvraag**: foto (altijd in-situ) op donkere achtergrond, vraag erboven,
  antwoorden als grote knoppen onderaan binnen duimbereik.
- **Feedback**: schuift van onderen in. Goed is teal met korte bevestiging. Fout
  is oranje met naast elkaar de gekozen en de juiste soort, plus de één regel die
  ze uit elkaar houdt. Knop: "Verder".

Bovenaan een dunne voortgangsbalk, geen teller die aftelt en geen hartjes.

### 2.3 Sessie klaar

Een korte, feitelijke afsluiting.

- Welke soorten een boekje opschoven en welke terugvielen, als lijstje met
  miniatuur, zodat je ziet waar je staat
- Wat er is blijven liggen, als dat zo is
- Eén neutrale knop: **Klaar**. Daaronder klein en zonder nadruk "nog een ronde"

Geen confetti, geen puntentelling, geen aanmoediging om door te gaan. Het scherm
is een afsluiting, geen doorstart.

### 2.4 Modules

Acht modules als kaarten met een voortgangsring: eerste-duik (12), witvis (8),
bodem-talud (10), grondels (4), rivier (8), kreeften (9), mossels-slakken (7),
vreemd-spul (8).

Modules zijn ingangen, geen volgorde. Een module is niet "af": de ring loopt mee
met hoe goed elke soort zit, als gemiddelde vulling van de boekjes. Alleen
boekje 4 en 5 tellen zou betekenen dat de ring minstens vier dagen op nul blijft
staan, en dat leest als kapot in plaats van als streng. Dat is een stand van zaken, geen score
om vol te maken, en er is geen beloning aan verbonden. Modules zonder genoeg
gekeurde foto's tonen "in voorbereiding" en zijn niet startbaar, in plaats van te
verschijnen met lege of slechte platen.

### 2.5 Soorten (naslag)

Zoekbare lijst, filterbaar op module, leefgebied, zone en inheems/exoot. Dit is
het scherm dat na een duik gebruikt wordt: "wat was dat nou". Werkt offline en
staat los van de leervoortgang.

### 2.6 Soortdetail

- Fotocarrousel: referentiefoto's en in-situ foto's, elk met fotograaf, licentie
  en bronlink zichtbaar in beeld, niet weggestopt
- Herkenning, gedrag bij duiker, seizoen, weetje
- **Verwarpaar-blok**: de soorten uit `verwardMet` naast elkaar met de kenmerken
  die ze scheiden, en een knop "train dit paar"
- Als `meldenBij` gevuld is (exoten, rivierkreeften): melding-aanmoediging
- Knop: "gezien tijdens duik" voor de levenslijst

### 2.7 Levenslijst

Chronologisch overzicht van waarnemingen met datum en notitie. Toevoegen kan
vanuit soortdetail of met een plusknop. Bewust simpel: duikers houden al een
logboek bij, dit is geen tweede logboek maar een soortenteller.

### 2.8 Ik / instellingen

- Export en import van voortgang als JSON, prominent en met uitleg waarom
- PWA-installatie, met de Safari-reden erbij als praktische waarschuwing en niet
  als verkooppraatje
- Overzicht: hoeveel soorten je betrouwbaar herkent, per module. Feitelijk, geen
  niveau of titel
- Link naar "Hoe dit gemaakt is" (zie 9)
- Reset

---

## 3. Leer- en quizcyclus

### 3.1 Leitner met vijf boekjes

| Boekje | Herhaling na | Betekenis |
| --- | --- | --- |
| 1 | zelfde sessie, later | net gezien of net fout |
| 2 | 1 dag | wankel |
| 3 | 3 dagen | begint te zitten |
| 4 | 7 dagen | zit |
| 5 | 21 dagen | ken je |

Goed antwoord is één boekje omhoog. Fout is terug naar boekje 1, niet één omlaag:
bij verwarparen is een misser zelden een halve fout maar een verkeerd aangeleerd
kenmerk. Fout materiaal komt nog dezelfde sessie terug, zodat je niet weggaat met
de fout als laatste indruk.

### 3.2 Opbouw van een sessie

Een sessie duurt ongeveer drie tot vijf minuten, zo'n twaalf tot vijftien items.
Dat is een praktische lengte, geen dagelijkse opdracht: je bepaalt zelf of en
wanneer je oefent, en er wordt nergens bijgehouden of je dat gisteren ook deed.

1. Alle achterstallige herhalingen, oudste eerst, maximaal tien
2. Aanvullen met nieuwe soorten tot vijftien items, maximaal drie nieuwe per
   sessie
3. Nieuwe soort betekent altijd eerst een leerkaart, daarna direct één makkelijke
   vraag over diezelfde soort
4. Nooit twee vragen over dezelfde soort achter elkaar, behalve die eerste
   koppeling
5. Sluit af met een item dat de gebruiker waarschijnlijk goed heeft

Bij niets te herhalen en niets nieuws meer volgt een **vrije oefenronde**: soorten
die je al kent, met voorrang voor de verwarparen waarin je de meeste fouten maakt.
Zonder dit valt de app stil zodra je een module een keer doorlopen hebt, want een
goed antwoord zet een soort op boekje 2 en die komt pas een dag later terug.

In zo'n vrije ronde telt een goed antwoord **niet** mee voor het schema. Anders
tik je in een middag alles naar boekje 5 en is de spreiding weg. Een fout
antwoord telt wel, want dat zegt iets echts over wat je nog niet kent.

### 3.3 Vraagtype hangt aan het boekje

De moeilijkheid loopt op met het boekje, en dat is precies waar de leerwinst zit.

| Boekje | Vraagtypes |
| --- | --- |
| 1 | foto naar naam (4 opties), naam naar foto |
| 2 | foto naar naam, A of B |
| 3 | A of B, uitsnede, zone of leefgebied |
| 4 | uitsnede, gedrag, inheems of exoot, formaat schatten |
| 5 | uitsnede, A of B, gemengd |

Afleiders komen altijd eerst uit `verwardMet` van de doelsoort. Pas als die op
zijn, uit dezelfde `groep` en `leefgebied`. Willekeurige afleiders bestaan niet.
59 van de 66 soorten hebben `verwardMet` gevuld, dus dat houdt stand.

### 3.4 Wat er gebeurt bij fout

Geen levens, geen einde sessie. Wel:

- Feedback toont de gekozen en de juiste soort naast elkaar, beide in-situ
- Daaronder de ene regel uit `herkenningOnderWater` die ze scheidt
- De soort gaat naar boekje 1 en komt later in dezelfde sessie terug
- Het verwarpaar wordt geteld, zodat het paar vaker terugkomt

---

## 4. Vraagtypes en wat ze aan foto's kosten

Dit is de kritieke afhankelijkheid, want foto's zijn schaars.

| # | Type | Foto's nodig | Voorwaarde |
| --- | --- | --- | --- |
| 1 | foto naar naam | 1 in-situ van doelsoort | altijd |
| 2 | naam naar foto | 1 in-situ van 4 verschillende soorten | 4 soorten met voorraad |
| 3 | uitsnede | 1 in-situ met bruikbaar detail | foto moet scherp genoeg zijn |
| 4 | A of B | 1 in-situ van **beide** soorten in het paar | beide kanten gevuld |
| - | feedback bij fout | 1 extra in-situ van de gekozen soort | zie hieronder |
| 5 | leefgebied | 1 in-situ | altijd |
| 6 | zone | 1 in-situ | altijd |
| 7 | inheems of exoot | 1 in-situ | altijd |
| 8 | gedrag | 1 in-situ | `gedragBijDuiker` gevuld |
| 9 | formaat schatten | 1 in-situ | `maxLengteCm` gevuld |

### Het feedbackscherm kost een extra foto

Bij een fout antwoord staan de gekozen en de juiste soort naast elkaar. De juiste
soort wordt dan bij voorkeur getoond met een **andere** in-situ foto dan de
vraagfoto: dezelfde foto twee keer laten zien leert precies niets over de soort,
alleen over dat ene plaatje. Dat betekent dat een soort die vaak als afleider
dient minstens twee gekeurde in-situ foto's nodig heeft.

Is er maar één foto, dan wordt die hergebruikt met de tekst "dezelfde foto,
nu met de kenmerken erbij" en de kenmerken als overlay. Werkt, maar is de
zwakkere variant.

### Terugvalregels

Type 4 (A of B) is het sterkste type en tegelijk het kwetsbaarste: het vereist
dat **beide** helften van een verwarpaar gekeurde foto's hebben. Bij 59 soorten
met `verwardMet` zullen eenzijdige paren voorkomen.

De engine mag hier niet op stuklopen. Regels:

- Een vraagtype is pas **beschikbaar** als aan zijn fotovoorwaarde is voldaan.
  De sessiebouwer vraagt om een type, krijgt eventueel nee, en valt terug.
- Terugvalketen: 4 valt terug op 3, 3 op 1, 2 op 1. Type 1 is altijd mogelijk
  zodra een soort één in-situ foto heeft.
- Eenzijdige verwarparen worden **niet** onderdrukt in de naslag: het blok in
  soortdetail blijft staan, want de kennis klopt ook zonder foto. Alleen de
  quizvraag vervalt.
- Een soort zonder enkele gekeurde in-situ foto komt niet in de quiz. Wel in de
  naslag, met de referentiefoto en het label "nog geen onderwaterfoto".

Dit maakt van fotoschaarste een graduele verschraling in plaats van een crash.

---

## 5. Zichtsimulatie: geschrapt

Eerder stond hier een uitgewerkt voorstel voor een filter over de quizfoto, met
vier niveaus van helder tot nachtduik, gekoppeld aan het Leitner-boekje. Dat is
gebouwd en weer verwijderd: het wordt niet ondersteund.

De moeilijkheid loopt daardoor volledig via het vraagtype, dat oploopt met het
boekje: foto naar naam onderin, uitsnede en A-of-B bovenin. Nog steeds oplopend
en nog steeds gericht op verwarparen, alleen zonder beeldbewerking.

Wie het alsnog wil: de opzet was een veld `zichtBasis` per foto en een filter
dat het verschil toepast tussen doelniveau en die basis, zodat een al troebele
foto niet dubbel vertroebeld wordt.

---

## 6. Opslag

Uitbreiding op de schets in `brief.md`, niet iets nieuws.

```
snoekduik.progress.v1
  schemaVersion: 1
  soorten: { <id>: { box, gezien, fout, laatsteReview, volgendeReview } }
  instellingen: { ongekeurdToestaan }
  verwarparen: { "<idA>|<idB>": { fout, totaal } }
  sessie: { actief, items, positie }

snoekduik.levenslijst.v1
  schemaVersion: 1
  waarnemingen: [ { soortId, datum, notitie } ]
```

Ten opzichte van de schets in `brief.md` vervallen `streak`, `xp` en `badges`.
Toegevoegd zijn `verwarparen` om te sturen welk paar vaker terugkomt, en `sessie`
zodat een onderbroken sessie hervat wordt in plaats van verloren te gaan.

`laatsteReview` en `volgendeReview` blijven nodig, want spaced repetition kan niet
zonder data. Het verschil met een streak is dat deze data alleen bepaalt wát er
wordt overhoord, en nergens wordt teruggegeven als prestatie of als verzuim.

`schemaVersion` met een migratieketen vanaf dag één. Elke migratie is een functie
van versie n naar n+1, en ze draaien op volgorde bij het laden. Onbekende hogere
versie betekent niet wissen maar in alleen-lezen doorgaan en dat melden.

Export en import van beide sleutels als één JSON-bestand, gebouwd in de eerste
werkende versie. Dit is geen luxe: Safari wist script-writable storage na zeven
dagen zonder bezoek.

---

## 7. Geen verslavende patronen

Uitgangspunt: dit is een naslag- en oefenhulpmiddel, geen spel. Het mag nuttig
zijn zonder een gewoonte te willen worden. Wie het twee keer per jaar gebruikt,
voor een duikweekend, gebruikt het goed.

**Zit er niet in:**

- Streak, dagteller, "je hebt vandaag nog niet geoefend"
- XP, punten, niveaus, titels, badges
- Notificaties en herinneringen, van welke soort dan ook
- Levens, hartjes, tijdsdruk, aftellende klokken
- Leaderboards of vergelijking met anderen
- Aanmoediging om door te gaan aan het eind van een sessie
- Confetti, geluidjes en animaties die een prestatie vieren
- E-mail, account, of iets anders dat je kan terugroepen

**Zit er wel in, als informatie:**

- Welke soorten toe zijn aan herhaling, want dat is de hele functie van spaced
  repetition
- Per module hoeveel soorten blijven zitten, als stand van zaken
- Een levenslijst van wat je zelf onder water gezien hebt

Het onderscheid is steeds hetzelfde: de app mag laten zien waar je staat, maar
mag nooit iets doen om je terug te krijgen. Voortgang die je zelf opvraagt is
informatie. Voortgang die naar je toe komt is een haakje.

Dit wijkt af van de oorspronkelijke opzet in `brief.md` en `CLAUDE.md`, waar
streak, XP en gebiedsbadges wel genoemd stonden. Die keuze is teruggedraaid.

---

## 8. Techniek

- **Geen bouwstap.** Vanilla JS met native ES-modules, rechtstreeks te serveren.
  Dit wijkt af van het oorspronkelijke voorstel om Vite te gebruiken. Reden: met
  relatieve paden verdwijnt het `/<repo>/`-probleem van GitHub Pages helemaal in
  plaats van dat het geconfigureerd moet worden, er is geen `node_modules` nodig
  om iets te wijzigen, en de service worker schrijf je toch met de hand. Voor
  ongeveer 1500 regels code weegt bundelen niet op tegen die eenvoud. Komt er
  later behoefte aan minificatie, dan kan Vite er alsnog overheen
- Geen framework, geen state-bibliotheek: de toestand is één object in
  localStorage en een handvol schermen
- **Hash-routing** (`#/soort/snoek`). Dat lost het GitHub Pages probleem op
  zonder 404-truc en werkt gegarandeerd offline
- Overal relatieve paden, nergens een absoluut pad, zodat de app onder
  `/<repo>/` werkt zonder configuratie
- Service worker: app-shell precache, foto's cache-first met een limiet
- Foto's als WebP in twee maten (400px en 1200px), `srcset` per gebruik
- `tools/` en `scripts/` blijven buiten de build

---

## 9. "Hoe dit gemaakt is"

Een aparte pagina, bereikbaar vanuit instellingen en vanuit de voettekst. Geen
onderdeel van de leerstof, wel onderdeel van het product: het legt uit waarom de
foto's zijn zoals ze zijn, en het is de plek waar de attributie in het groot
staat.

Voorstel voor de inhoud, in deze volgorde:

1. **Waarom alleen onderwaterfoto's.** Het uitgangspunt van het hele project:
   bijna al het beschikbare beeld van Nederlandse zoetwatervis komt uit de
   hengelsport, en een vis op een meetlat leert je niet wat je onder water ziet.
2. **Hoe de foto's gevonden zijn.** Het probe-script langs iNaturalist en
   Wikimedia Commons, met de gemeten cijfers: 66 soorten, 784 verzoeken, en de
   trefkans per bron (iNaturalist duidelijk hoger dan Commons).
3. **Dat een mens ze stuk voor stuk bekeken heeft.** Geen enkele API kan
   filteren op "onder water genomen", dus alle foto's zijn met de hand
   beoordeeld. Met het aantal beoordeelde en goedgekeurde foto's erbij.
4. **Wat er misging.** Kort en eerlijk: de soortnaam-opzoeking gaf aanvankelijk
   voor vijf soorten het verkeerde organisme terug, waaronder een plantengeslacht
   voor paling en een vogelfamilie voor barbeel. Dat is gevonden en hersteld. Dit
   hoort erbij, want het laat zien waarom er handmatig gecontroleerd wordt.
5. **Licenties en fotografen.** Volledige lijst, doorzoekbaar, met bronlinks. Dit
   is de plek waar de CC-verplichting netjes wordt ingelost, naast de attributie
   die al bij elke foto zelf staat.
6. **Wat er niet in zit en waarom.** Geen accounts, geen tracking, geen
   streaks, geen notificaties. Alles blijft op je eigen telefoon.
7. **Zelf meehelpen.** Voor duikers met eigen materiaal van soorten die nu te
   weinig foto's hebben.

Toon: feitelijk, kort, geen marketing. Het is verantwoording, geen etalage.

Deze pagina kan pas af als de fotopijplijn draait, maar de gegevens ervoor
(`fotoProbe.json`, `fotoOordelen.json`) worden nu al verzameld, dus er hoeft
achteraf niets gereconstrueerd te worden.

---

## 10. Bouwvolgorde

1. Datamodel vastzetten en `soorten.json` vullen voor eerste-duik en witvis
2. Fotopijplijn: gekeurde foto's ophalen, converteren, attributie meeschrijven
3. App-shell: routing, tabbalk, Vandaag, Soorten, Soortdetail
4. Sessie-engine met vraagtype 1 en 4, plus de terugvalregels
5. Leitner en localStorage met export/import en migratie
6. PWA: manifest, service worker, installatieprompt
7. Overige vraagtypes
8. Levenslijst
9. Overige modules

---

## 11. Wat ik moet weten van jou

### Dit blokkeert

**Hoeveel in-situ foto's per soort als minimum?** `CLAUDE.md` zegt 8 voor de
prioriteitsmodules, `brief.md` zegt minimaal 5, en de triage meet tot nu toe
ongeveer 5,9 goede foto's per 42 beoordeelde. Drie getallen die niet samengaan.
Beslist: **1 goedgekeurde foto om in de quiz te komen, 5 als streefwaarde.**
Wachten op vijf hield het overgrote deel van de soorten onzichtbaar. De
streefwaarde stuurt nu alleen nog de "gezocht"-lijst in het feedbackscherm en
de markering op de soortpagina.

De keerzijde staat er eerlijk bij: bij één foto leert iemand dat ene plaatje en
niet de soort, en het feedbackscherm na een fout antwoord kan dan niet twee
verschillende foto's naast elkaar zetten. De app vangt dat af door de
vergelijking over te slaan als er maar één foto is.

### Dit heeft een verdedigbare standaard, later beslissen kan

- **CC-BY-NC toestaan?** Standaard: ja. 81,6 procent van al het materiaal is NC,
  zonder NC halen de meeste soorten de vijf niet en de app is niet-commercieel.
- **Licht in plaats van donker?** Standaard: licht, uitgaand van gebruik aan de
  waterkant in daglicht. Draait om als dit vooral avondgebruik op de bank wordt.
- **Blijft Commons erin?** Standaard: alleen voor soorten die het op iNaturalist
  niet redden. Gemeten trefkans 9,0 procent tegen 15,5 procent.

### Nog te verifiëren door jou als duiker

De kenmerkteksten in de mockup zijn mijn invulling, geen gecontroleerde
soortkennis. Het blankvoorn/ruisvoorn-onderscheid staat er nu als: rugvin achter
de buikvinaanzet bij ruisvoorn en er recht boven bij blankvoorn, oog rood bij
blankvoorn en goudgeel bij ruisvoorn. Dat is de kern van het witvisprobleem, dus
als daar iets omgedraaid staat leert de app de fout aan.
