# Snoekduik — projectbrief

Achtergronddocument. `CLAUDE.md` in de root bevat de samenvatting die elke
sessie nodig heeft; dit bestand bevat de redenering erachter en de details die
je er af en toe bij pakt.

## Wat het is

Een leer-app waarmee duikers Nederlands onderwaterleven leren herkennen. Korte
leerkaarten afgewisseld met quizvragen, in sessies van een paar minuten. Onder de
motorkap geen vaste lessenreeks maar spaced repetition.

De vorm is aan Duolingo ontleend, de verslavingsmechaniek nadrukkelijk niet: geen
dagelijkse sessies, geen streak, geen notificaties. Zie "Gamification" hieronder.

Statische site, GitHub Pages, mobile-first, alles offline bruikbaar, voortgang
in localStorage. Geen accounts.

**Naam:** Snoekduik. Een snoekduik is letterlijk een duik voorover, én de snoek
is de iconische soort van Nederlands zoetwater. Logo-richting: een snoek in
verticale duikhouding, of een duikerssilhouet dat de lijn van een snoekbek volgt.

## Waarom "duikers" het ontwerp bepaalt

Vrijwel al het beschikbare fotomateriaal van Nederlandse zoetwatervis komt uit
de hengelsport: vis in de hand, op een mat, of dood. Dat is prima om kenmerken
te leren benoemen, maar het is niet wat een duiker ziet. Een duiker ziet een vis
van opzij in groen licht, half achter een tak, meestal wegzwemmend, op drie
meter zicht.

Daarom de tweedeling in fotoTiers (zie `CLAUDE.md`). En daarom draait de
moeilijkheid om verwarparen in plaats van om zeldzamere soorten: de realistische
uitdaging is niet "welke obscure soort is dit", maar "is die vage zilveren vorm
een blankvoorn of een kolblei". Dat loopt via het vraagtype, dat oploopt met het
Leitner-boekje.

Er is ook een zichtsimulatie overwogen, een filter over de quizfoto dat groen
zicht of een nachtduik nabootst. Die is gebouwd en daarna geschrapt: te veel
onderhoud voor wat het toevoegt, en op foto's die zelf al troebel zijn werkt het
averechts.

Verder betekent het dat gedrag telt. Een snoek blijft roerloos hangen tot je te
dichtbij komt, brasem draait als school weg, baars komt nieuwsgierig terug. Dat
staat in geen enkele veldgids en is precies wat duikers herkennen. Vandaar het
veld `gedragBijDuiker`.

## Vraagtypes

1. Foto → naam (multiple choice, 4 opties, afleiders uit `verwardMet`)
2. Naam → kies de juiste foto uit vier
3. **Uitsnede**: ingezoomd detail — bekstand, oogkleur, vinaanzet, staartvorm.
   Het sterkste type voor verwarparen.
4. **A of B**: twee foto's van een verwarpaar naast elkaar
5. Leefgebied: waar zou je dit tegenkomen?
6. Zone: waar in het water — talud, bodem, kruid, open water?
7. Inheems of exoot?
8. Gedrag: wat doet dit dier als je nadert?
9. Formaat schatten (onder water lijkt alles 33% groter — leuke twist)

Type 3 en 4 zijn waar de leerwinst zit. Type 1 is de instap.

## Verwarclusters

De belangrijkste, in volgorde van hoe vaak ze misgaan:

- Blankvoorn / ruisvoorn / kolblei / brasem — het witvisprobleem
- Karper / kroeskarper / giebel
- Baars / snoekbaars / pos
- De vier grondels onderling, plus riviergrondel
- De rivierkreeften onderling (echte vaardigheid, en meldwaardig)
- Bermpje / kleine modderkruiper / rivierdonderpad
- Driehoeksmossel / quaggamossel
- Zoetwaterspons / mosdiertjes
- Beekforel / regenboogforel

## Fotopijplijn

**Stap 1 — probe.** Bouw eerst een script dat per soort telt hoeveel
CC-gelicenseerde in-situ foto's beschikbaar zijn, vóór je aan de app begint.
Bronnen: iNaturalist API (`quality_grade=research`, licentiefilter) en Wikimedia
Commons (kijk naar categorieën in de trant van "Underwater photographs of ...").
Resultaat schrijf je terug in `fotoProbe` per soort. Dan weet je binnen een
avond welke soorten haalbaar zijn in plaats van er halverwege achter te komen.

**Stap 2 — ophalen.** Download, converteer naar WebP/AVIF in twee formaten
(thumbnail ~400px, full ~1200px), en schrijf fotograaf/licentie/bron-URL mee in
de JSON. Reken op 20–30 MB totaal — ruim binnen wat GitHub Pages aankan.

**Stap 3 — gaten vullen.** Voor soorten zonder bruikbaar materiaal: de
Nederlandse onderwaterfotografiehoek benaderen. ANEMOON en duikers die aan
soortmonitoring doen hebben archieven én zijn zelf doelgroep.

Minimaal 5 in-situ foto's per soort. Met minder leren mensen de fóto herkennen
in plaats van de soort.

## Voortgang in localStorage

Schets:

```
snoekduik.progress.v1
  schemaVersion
  soorten: { <id>: { box, gezien, fout, laatsteReview, volgendeReview } }
  instellingen: {}

snoekduik.levenslijst.v1
  waarnemingen: [ { soortId, datum, notitie } ]
```

De levenslijst staat los van de leervoortgang: "gezien tijdens een duik", met
datum en eventueel notitie. Duikers houden toch al een logboek bij. Het is er
omdat het op zichzelf nuttig is, niet als middel om mensen terug te laten komen.

Export/import van beide keys als één JSON-bestand of copy-pastebare string.
Dit is geen luxe — zie de Safari-valkuil in `CLAUDE.md`.

## Gamification

Geen. Zie hoofdstuk 7 van `ontwerp.md`.

Oorspronkelijk stonden hier streak, XP en badges per module en leefgebied. Die
keuze is teruggedraaid: dit wordt een eenvoudig, op zichzelf staand hulpmiddel
zonder mechanieken die je terugroepen. Geen streak, XP, badges, notificaties,
levens, tijdsdruk of leaderboards.

Wel blijft de voortgangsring per module, maar als stand van zaken die je zelf
opvraagt, niet als score om vol te maken.

## Bouwvolgorde

1. Probe-script draaien op alle 66 soorten → weten wat haalbaar is
2. Datamodel vastzetten, seed-JSON aanvullen voor modules `eerste-duik` en `witvis`
3. Fotopijplijn: ophalen, converteren, attributie
4. Leerkaart + quiz met twee vraagtypes (foto→naam, A of B)
5. Leitner-engine en localStorage met export/import
6. PWA: manifest, service worker, install-prompt
7. Resterende vraagtypes
8. Levenslijst
9. Resterende modules
10. Later: zoutwater

## Bewust niet gedaan

- **Duikstekken.** Er is geen fatsoenlijke database van kleinere Nederlandse
  duikstekken. Vervangen door globaal `leefgebied`.
- **Geluid.** Zou werken voor amfibieën, maar die vallen buiten scope
  (onderwaterleven, geen oeverleven).
- **Determinatiesleutel.** Ander product. Misschien later, als de soortdata er
  toch al ligt.
- **Backend / accounts / cloud-sync.** Expliciet buiten scope.

## Open punten

- Licentiekeuze voor de repo zelf, en apart voor de soortdata
- Of CC-BY-NC foto's meemogen (app is niet-commercieel, dus waarschijnlijk wel —
  maar leg de keuze vast)

