# Opzet van de drie Google Forms

Maak deze drie formulieren aan op [forms.google.com](https://forms.google.com) en
plak de links daarna in `app/feedback-links.js`. Zolang een link leeg is, toont
het feedbackscherm die knop als "Formulier nog niet beschikbaar" in plaats van
een kapotte link.

De link die je nodig hebt is de deel-URL: **Verzenden** en dan het
koppeling-icoon, niet de bewerk-URL.

## Instellingen die voor alle drie gelden

- **Antwoorden verzamelen zonder aanmelden.** Zet in de instellingen
  "E-mailadressen verzamelen" op *Niet verzamelen*, tenzij je wilt kunnen
  terugmailen. Bij het rechtenformulier wil je dat wel.
- **Eén reactie per persoon uitschakelen**, anders moet iemand inloggen met Google.
- **Voortgangsbalk aan** is prettig bij het bijdrageformulier.
- Zet een korte bevestigingstekst in bij "Bevestigingsbericht" waarin staat dat
  je niet altijd kunt reageren. Dat scheelt teleurstelling.

---

## Formulier 1: Oneigenlijk gebruik van een foto

Sleutel in `feedback-links.js`: **`fotoRechten`**

**Titel:** Snoekduik, melding over een foto

**Beschrijving:**

> Alle foto's in Snoekduik komen van iNaturalist of Wikimedia Commons en zijn
> uitgekozen op een vrije licentie (CC0, CC BY, CC BY-SA of CC BY-NC). Elke
> licentie is zo goed mogelijk gecontroleerd, maar er kunnen fouten in zitten.
>
> Herken je je eigen foto en klopt er iets niet, laat het dan hier weten. Ik haal
> de foto weg zonder discussie, en ik hoef geen bewijs vooraf.
>
> Onder elke foto in de app staat een code, bijvoorbeeld F-FX27MD. Geef die door,
> dan weet ik precies om welke foto het gaat.

**Zet "E-mailadressen verzamelen" hier wel aan**, anders kun je niet laten weten
dat het opgelost is.

| # | Vraag | Type | Verplicht | Toelichting |
| --- | --- | --- | --- | --- |
| 1 | Wat is de code van de foto? | Kort antwoord | Ja | Staat onder de foto, begint met F- gevolgd door zes tekens. Weet je hem niet, vul dan de soortnaam in. |
| 2 | Om welke soort gaat het? | Kort antwoord | Nee | Handig als de code ontbreekt of onleesbaar is. |
| 3 | Wat is er aan de hand? | Meerkeuze | Ja | Zie opties hieronder |
| 4 | Kun je het toelichten? | Alinea | Nee | Bijvoorbeeld waar de foto oorspronkelijk staat, of onder welke voorwaarden hij wel gebruikt mag worden. |
| 5 | Waar staat jouw originele foto? | Kort antwoord | Nee | Een link naar je eigen pagina, profiel of portfolio. |
| 6 | Hoe wil je dat ik het oplos? | Meerkeuze | Ja | Zie opties hieronder |

Opties bij vraag 3:

- Dit is mijn foto en ik heb geen toestemming gegeven
- De licentie klopt niet
- Mijn naam ontbreekt of staat er verkeerd bij
- De foto is bewerkt of uitgesneden op een manier die ik niet wil
- Anders

Opties bij vraag 6:

- Haal de foto weg
- Pas de naamsvermelding aan
- Pas de licentievermelding aan
- Neem eerst contact met me op

---

## Formulier 2: Foto's bijdragen

Sleutel in `feedback-links.js`: **`fotoBijdragen`**

**Titel:** Snoekduik, eigen onderwaterfoto's aanbieden

**Beschrijving:**

> Van veel soorten zijn nauwelijks bruikbare onderwaterfoto's te vinden. Bijna al
> het beschikbare beeld van Nederlandse zoetwatervis komt uit de hengelsport, en
> een vis op een meetlat leert een duiker niet wat hij onder water ziet. Duik je
> zelf en heb je materiaal, dan help je daar enorm mee.
>
> Lees eerst even de voorwaarden hieronder.

**Belangrijk: zet dit als een eigen sectie of als opvallende tekst bovenaan.**

> **Voorwaarden**
>
> Door foto's aan te leveren geef je mij uitdrukkelijk toestemming om ze te
> gebruiken in de Snoekduik-app, inclusief het bijsnijden ervan voor
> detailvragen. Daar staat geen vergoeding tegenover.
>
> Je naam komt bij de foto te staan, tenzij je hieronder aangeeft dat je dat niet
> wilt. Je blijft eigenaar van je eigen foto en kunt er zelf mee doen wat je wilt.
> Wil je later dat een foto weer weggehaald wordt, dan doe ik dat.
>
> Stuur alleen foto's die je zelf gemaakt hebt.

| # | Vraag | Type | Verplicht | Toelichting |
| --- | --- | --- | --- | --- |
| 1 | Ik heb de voorwaarden gelezen en ga akkoord | Selectievakje | Ja | Eén optie: "Ja, ik geef toestemming om deze foto's in de app te gebruiken zonder vergoeding" |
| 2 | Om welke soort of soorten gaat het? | Alinea | Ja | Meerdere soorten mag, zet ze onder elkaar. |
| 3 | Upload je foto's | Bestand uploaden | Ja | Sta afbeeldingen toe, maximaal 10 bestanden, maximaal 100 MB totaal. Vraag om de originelen, niet om verkleinde versies. |
| 4 | Zijn dit echte onderwateropnames? | Meerkeuze | Ja | Zie opties hieronder |
| 5 | Waar en wanneer zijn ze gemaakt? | Kort antwoord | Nee | Alleen het water en het jaar is genoeg, een precieze duikstek hoeft niet. |
| 6 | Onder welke naam wil je vermeld worden? | Kort antwoord | Nee | Leeg laten betekent geen naamsvermelding. |
| 7 | Mag ik contact opnemen als ik een vraag heb? | Kort antwoord | Nee | E-mailadres, alleen als je dat wilt. |
| 8 | Nog iets dat ik moet weten? | Alinea | Nee | |

Opties bij vraag 4:

- Ja, onder water gemaakt in het wild
- Deels, ik geef per foto aan welke
- Nee, dit zijn foto's boven water of in een aquarium

Let op: **bestandsupload in Google Forms vereist dat de invuller met een
Google-account inlogt.** Dat kun je niet uitzetten. Wil je die drempel niet, dan
is het alternatief om in plaats van vraag 3 te vragen om een link naar een
gedeelde map of een online album.

### De lijst met meest gewilde soorten

Die hoef je niet in het formulier te zetten: die staat al in de app zelf, in een
uitklapper onder deze optie, en wordt automatisch bijgewerkt op basis van hoeveel
goedgekeurde foto's een soort heeft. Verwijs er in de beschrijving eventueel naar.

---

## Formulier 3: Verbeteringen en aanvullingen

Sleutel in `feedback-links.js`: **`verbetering`**

**Titel:** Snoekduik, verbetering of aanvulling

**Beschrijving:**

> Klopt een herkenningskenmerk niet, mist er een soort, of werkt er iets niet
> zoals je verwacht? Laat het hier weten.
>
> De soortteksten zijn met AI geschreven en nog niet allemaal door een duiker
> nagekeken. Correcties daarop zijn juist heel welkom, en hoe concreter hoe beter.

| # | Vraag | Type | Verplicht | Toelichting |
| --- | --- | --- | --- | --- |
| 1 | Waar gaat het over? | Meerkeuze | Ja | Zie opties hieronder |
| 2 | Om welke soort gaat het? | Kort antwoord | Nee | Leeg laten als het niet over één soort gaat. |
| 3 | Wat klopt er niet, of wat mis je? | Alinea | Ja | |
| 4 | Wat zou er volgens jou moeten staan? | Alinea | Nee | |
| 5 | Waar baseer je dat op? | Kort antwoord | Nee | Een veldgids, een bron, of gewoon eigen duikervaring. Alle drie zijn nuttig. |
| 6 | Duik je zelf? | Meerkeuze | Nee | Ja / Nee / Vroeger. Helpt me inschatten hoe ik een gedragsopmerking moet wegen. |
| 7 | Mag ik contact opnemen? | Kort antwoord | Nee | E-mailadres, alleen als je dat wilt. |

Opties bij vraag 1:

- Een herkenningskenmerk klopt niet
- Het gedrag bij een duiker klopt niet
- Een soort ontbreekt
- Er zit een fout in de app
- Idee voor een nieuwe functie
- Iets anders

---

## Daarna

Plak de drie links in `app/feedback-links.js`:

```js
export const FORMULIEREN = {
  fotoRechten: 'https://forms.gle/...',
  fotoBijdragen: 'https://forms.gle/...',
  verbetering: 'https://forms.gle/...',
};
```

Committen en pushen is genoeg; de knoppen worden vanzelf actief.
