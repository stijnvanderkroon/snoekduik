/**
 * Inhoudelijke teksten per soort.
 *
 * BELANGRIJK: alles hier staat op `gecontroleerd: false` tot een duiker het heeft
 * nagekeken. De app toont dat ook. Een omgedraaid herkenningskenmerk leert de
 * gebruiker precies de fout die de app moet voorkomen, dus liever geen tekst dan
 * onjuiste tekst.
 *
 * Alleen snoek en het witviskwartet zijn ingevuld: samen vormen ze een echt
 * verwarcluster, genoeg om alle schermen en vraagtypes te laten werken. De
 * overige 61 soorten hebben bewust nog niets en tonen "nog niet ingevuld".
 *
 * `onderscheid` is per verwarsoort één regel, gebruikt in het feedbackscherm na
 * een fout antwoord. Dat is de belangrijkste tekst in de hele app.
 */

export const TEKSTEN = {
  snoek: {
    gecontroleerd: false,
    herkenningOnderWater: [
      'Langgerekt en cilindrisch, met een platte, brede bek als van een eend.',
      'Eén rugvin, ver naar achteren geplaatst vlak boven de staartaanzet.',
      'Olijfgroene tot bruine flanken met lichte dwarsbanden en vlekken.',
    ],
    gedragBijDuiker:
      'Blijft roerloos hangen tot je te dichtbij komt en vertrouwt op camouflage. ' +
      'Vaak kun je tot op een meter naderen, waarna hij met één klap wegschiet.',
    seizoen: 'Het hele jaar zichtbaar. In het voorjaar in ondiep, begroeid water om te paaien.',
    weetje:
      'De snoek jaagt vanuit stilstand en versnelt in een fractie van een seconde. ' +
      'Zijn vlekkenpatroon is net als bij een vingerafdruk voor elk dier anders.',
  },

  blankvoorn: {
    gecontroleerd: false,
    herkenningOnderWater: [
      'Zilverkleurig en slank, met een duidelijk rood tot oranje oog.',
      'De rugvin begint recht boven de aanzet van de buikvin.',
      'Bek eindstandig, dus de punt van de snuit en de bek liggen op één lijn.',
    ],
    gedragBijDuiker:
      'Zwemt in losse scholen in open water en houdt afstand. Draait rustig weg ' +
      'zodra je nadert, zonder in paniek te schieten.',
    seizoen: 'Het hele jaar. In de winter in dichtere scholen op diepere plekken.',
    weetje: 'Veruit de meest algemene vis van Nederland, en daardoor de beste ijkmaat voor de rest.',
    onderscheid: {
      ruisvoorn:
        'Kijk naar het oog en de rugvin: de blankvoorn heeft een rood oog en de rugvin ' +
        'recht boven de buikvin. De ruisvoorn heeft een goudgeel oog en de rugvin duidelijk verder naar achteren.',
      kolblei:
        'De kolblei is hoger gebouwd en heeft een opvallend groot oog. De blankvoorn is slanker ' +
        'met een rood oog.',
      winde:
        'De winde wordt veel groter en is forser gebouwd, met een kleiner oog en een meer ' +
        'gedrongen kop.',
    },
  },

  ruisvoorn: {
    gecontroleerd: false,
    herkenningOnderWater: [
      'Messing- tot goudkleurige flanken, feller dan de blankvoorn.',
      'Bek staat schuin omhoog, gebouwd om van het oppervlak te eten.',
      'De rugvin staat duidelijk achter de aanzet van de buikvin.',
    ],
    gedragBijDuiker:
      'Blijft graag in en vlak boven de kruidzone en zoekt dekking tussen planten ' +
      'in plaats van weg te zwemmen naar open water.',
    seizoen: 'Vooral in de zomer zichtbaar in begroeide, ondiepe delen.',
    weetje: 'De opwaartse bek verraadt de leefwijze: de ruisvoorn eet van bovenaf, niet van de bodem.',
    onderscheid: {
      blankvoorn:
        'Het oog is goudgeel bij de ruisvoorn en rood bij de blankvoorn. De rugvin staat ' +
        'bij de ruisvoorn achter de buikvinaanzet, bij de blankvoorn er recht boven.',
    },
  },

  kolblei: {
    gecontroleerd: false,
    herkenningOnderWater: [
      'Zilverachtig en hoog gebouwd, maar minder hoog dan een volwassen brasem.',
      'Opvallend groot oog, ongeveer even groot als de lengte van de snuit.',
      'Aanzet van de borstvinnen vaak roodachtig.',
    ],
    gedragBijDuiker:
      'Beweegt rustig in kleine groepen, meestal wat dichter bij de bodem dan blankvoorn.',
    seizoen: 'Het hele jaar zichtbaar.',
    weetje:
      'Kolblei en jonge brasem zijn onder water bijna niet te onderscheiden. ' +
      'Het oog is het betrouwbaarste kenmerk.',
    onderscheid: {
      brasem:
        'Het oog van de kolblei is groot ten opzichte van de kop; bij de brasem is het klein. ' +
        'De brasem is bovendien donkerder brons en heeft een langere aarsvin.',
      blankvoorn:
        'De kolblei is hoger gebouwd met een groot oog; de blankvoorn is slank met een rood oog.',
    },
  },

  brasem: {
    gecontroleerd: false,
    herkenningOnderWater: [
      'Sterk zijdelings afgeplat en hoog van lijf, bij oudere dieren donker bronsbruin.',
      'Kleine kop met een klein oog en een uitstulpbare bek.',
      'Lange aarsvin die tot ver naar de staart doorloopt.',
    ],
    gedragBijDuiker:
      'Draait als school weg zodra je nadert. Jonge brasems zijn zilver en lastiger ' +
      'te onderscheiden dan de donkere volwassen dieren.',
    seizoen: 'Het hele jaar. Foerageert vaak op de bodem en laat dan wolken slib achter.',
    weetje:
      'Een groep foeragerende brasems is soms eerder te zien aan het opgewoelde slib dan aan de vissen zelf.',
    onderscheid: {
      kolblei:
        'De brasem heeft een klein oog en is donkerder brons; de kolblei heeft een groot oog ' +
        'en blijft zilverachtig.',
    },
  },
};
