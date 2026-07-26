/**
 * Inhoudelijke teksten per soort.
 *
 * BELANGRIJK: alles staat op `gecontroleerd: false` tot een duiker het heeft
 * nagekeken, en de app toont dat ook. Deze teksten zijn door AI geschreven op
 * basis van openbare bronnen. Dat levert plausibele tekst op, en plausibel is
 * niet hetzelfde als juist: tijdens het schrijven is een kenmerk al eens
 * omgedraaid. Het veld `bron` zegt waarop een tekst gebaseerd is, zodat
 * controleren neerkomt op naslaan in plaats van opnieuw uitzoeken.
 *
 * `herkenningOnderWater` beschrijft alleen wat je onder water kunt zien.
 * Schubbentellingen en kieuwboogtellingen horen hier dus niet, hoe
 * betrouwbaar ze in een veldgids ook zijn.
 *
 * `gedragBijDuiker` is bewust maar bij een deel ingevuld. Dat gedrag staat in
 * geen veldgids, dus daar is geen bron voor; het is alleen ingevuld waar het uit
 * de projectbrief komt of waar het rechtstreeks uit de leefwijze volgt.
 *
 * `onderscheid` is per verwarsoort één regel voor het feedbackscherm na een
 * fout antwoord. Dat is de belangrijkste tekst in de hele app. Sleutels moeten
 * in `verwardMet` van de soort staan, anders wordt de tekst nooit getoond;
 * scripts/bouw-soorten.mjs waarschuwt daarvoor.
 */

const RAVON = 'RAVON soortinformatie';
const NATURALIS = 'Naturalis, Zoetwatervissen van Nederland';
const KREEFT = 'Kennisplatform Rivierkreeft (rivierkreeft.nl)';
const OWF = 'onderwaterfauna.nl zoetwatergids';
const WIKI = 'Wikipedia NL';

export const TEKSTEN = {
  // ---- eerste-duik ----------------------------------------------------------

  snoek: {
    gecontroleerd: false,
    bron: `${NATURALIS}, ${OWF}`,
    herkenningOnderWater: [
      'Langgerekt en cilindrisch, met een platte, brede bek als van een eend.',
      'Eén rugvin, ver naar achteren geplaatst vlak boven de staartaanzet.',
      'Olijfgroene tot bruine flanken met lichte dwarsbanden en vlekken.',
    ],
    gedragBijDuiker:
      'Blijft roerloos hangen tot je te dichtbij komt en vertrouwt op camouflage. ' +
      'Vaak kun je tot op een meter naderen, waarna hij met één klap wegschiet.',
    seizoen: 'Het hele jaar zichtbaar. In het voorjaar in ondiep, begroeid water om te paaien.',
    weetje: 'De snoek jaagt vanuit stilstand en versnelt in een fractie van een seconde.',
  },

  baars: {
    gecontroleerd: false,
    bron: `${NATURALIS}, ${OWF}`,
    herkenningOnderWater: [
      'Twee duidelijk gescheiden rugvinnen; de voorste bestaat uit harde stekels.',
      'Zwarte vlek achterin die voorste stekelvin.',
      'Vijf tot negen donkere dwarsbanden op een groengeel lijf, buikvinnen oranjerood.',
    ],
    gedragBijDuiker:
      'Komt nieuwsgierig terug nadat je gepasseerd bent. Jaagt vaak in groepjes langs het talud.',
    seizoen: 'Het hele jaar. Jonge baarzen staan in de zomer in scholen bij structuur.',
    weetje: 'Baars jaagt op zicht en staat daarom graag op plekken waar licht en schaduw elkaar raken.',
    onderscheid: {
      snoekbaars:
        'De baars heeft brede donkere dwarsbanden, rode buikvinnen en een zwarte vlek in de ' +
        'voorste rugvin. De snoekbaars is slanker, bleker en heeft die vlek niet.',
      pos:
        'De baars heeft twee losse rugvinnen; bij de pos is het één doorlopende vin. ' +
        'De pos is ook veel kleiner en heeft geen dwarsbanden maar donkere spikkels.',
    },
  },

  snoekbaars: {
    gecontroleerd: false,
    bron: `${NATURALIS}, ${WIKI}`,
    herkenningOnderWater: [
      'Slank en langgerekt, zilvergrijs met vage donkere dwarsbanden.',
      'Twee rugvinnen, de voorste met harde stekels en zonder zwarte vlek.',
      'Groot glazig oog dat in lamplicht duidelijk terugkaatst, en hoektanden in de bek.',
    ],
    gedragBijDuiker:
      'Houdt afstand en zakt bij verstoring naar dieper of troebeler water. Overdag vaak bij ' +
      'de bodem of langs steile taluds.',
    seizoen: 'Het hele jaar. Actief in schemer en bij troebel water.',
    weetje:
      'Het spiegelende laagje achter in het oog laat de snoekbaars jagen bij licht waarbij ' +
      'zijn prooi vrijwel niets ziet.',
    onderscheid: {
      baars:
        'De snoekbaars is slank en bleek met een glazig oog. De baars is gedrongen met brede ' +
        'donkere banden, rode buikvinnen en een zwarte vlek in de voorste rugvin.',
      pos:
        'De snoekbaars wordt tientallen centimeters lang met twee losse rugvinnen; de pos blijft ' +
        'klein en heeft één doorlopende rugvin.',
    },
  },

  pos: {
    gecontroleerd: false,
    bron: `Kennisdocument pos (Sportvisserij Nederland), ${NATURALIS}`,
    herkenningOnderWater: [
      'Klein en gedrongen, zelden groter dan een hand.',
      'Eén doorlopende rugvin: voorin harde stekels, achterin zachte stralen.',
      'Vuilbruin tot olijf met donkere spikkels, ook op de rug- en staartvin.',
    ],
    gedragBijDuiker:
      'Zit meestal stil op of vlak boven de bodem en zwemt pas op het laatste moment een klein stukje weg.',
    seizoen: 'Het hele jaar, vaak in groepjes op zandige of slikkige bodems.',
    weetje: 'De pos redt zich prima in troebel water: hij vindt voedsel op de tast en op trilling.',
    onderscheid: {
      baars:
        'De pos heeft één doorlopende rugvin en donkere spikkels. De baars heeft twee losse ' +
        'rugvinnen en brede dwarsbanden.',
      snoekbaars:
        'De pos blijft klein en heeft één doorlopende rugvin; de snoekbaars wordt veel groter ' +
        'en heeft twee losse rugvinnen.',
    },
  },

  karper: {
    gecontroleerd: false,
    bron: `${NATURALIS}, ${WIKI}`,
    herkenningOnderWater: [
      'Zwaar gebouwd en hoog van lijf, koperbruin tot goudgeel.',
      'Vier baarddraden: twee korte op de bovenlip, twee lange in de mondhoeken.',
      'Lange rugvin die over een groot deel van de rug doorloopt.',
    ],
    gedragBijDuiker:
      'Wroet in de bodem en laat daarbij slibwolken achter. Trekt zich rustig maar beslist terug ' +
      'als je te dichtbij komt.',
    seizoen: 'Vooral zichtbaar van het late voorjaar tot in de herfst; in de winter weinig actief.',
    weetje:
      'Er bestaan kweekvormen met weinig of geen schubben, zoals spiegel- en naaktkarper. ' +
      'Onder water zie je dus soms een vrijwel schubloze karper.',
    onderscheid: {
      kroeskarper:
        'De karper heeft vier baarddraden, de kroeskarper geen enkele. De kroeskarper is ook ' +
        'kleiner en ronder met een bolle rugvin.',
      giebel:
        'De karper heeft vier baarddraden, de giebel geen. De giebel is grijzer en zilveriger.',
      graskarper:
        'De graskarper is langgerekt en cilindrisch zonder baarddraden; de karper is hoog gebouwd ' +
        'met vier baarddraden.',
    },
  },

  zeelt: {
    gecontroleerd: false,
    bron: `${NATURALIS}, ${OWF}`,
    herkenningOnderWater: [
      'Donker olijfgroen tot bronskleurig, met een dikke slijmlaag die het lijf laat glanzen.',
      'Zeer kleine schubben, waardoor de huid bijna glad lijkt.',
      'Alle vinnen afgerond, met een kleine baarddraad in elke mondhoek en een oranjerood oog.',
    ],
    gedragBijDuiker:
      'Blijft laag tussen de waterplanten en zwemt traag weg. Laat zich vaak dicht naderen.',
    seizoen: 'Vooral in de zomer actief in begroeide, ondiepe delen. In de winter nauwelijks te zien.',
    weetje: 'De zeelt verdraagt zuurstofarm water waar de meeste andere vissen het niet redden.',
  },

  paling: {
    gecontroleerd: false,
    bron: `${RAVON}, ${NATURALIS}`,
    herkenningOnderWater: [
      'Slangvormig lijf met één vinzoom die van de rug om de staart naar de buik doorloopt.',
      'Kleine borstvinnen vlak achter de kop, geen buikvinnen.',
      'Donkerbruin tot groengrijs met een gelere buik; volwassen trekdieren worden zilverachtig.',
    ],
    gedragBijDuiker:
      'Overdag meestal weggekropen tussen stenen, in holen of in de bodem. Wat je ziet is vaak ' +
      'alleen een kop die uit een spleet steekt.',
    seizoen: 'Het hele jaar aanwezig, maar vooral in de schemer en s nachts actief.',
    weetje:
      'Elke Europese paling wordt geboren in de Sargassozee en zwemt als glasaaltje de ' +
      'Nederlandse wateren binnen.',
  },

  'driedoornige-stekelbaars': {
    gecontroleerd: false,
    bron: `${RAVON}, ${NATURALIS}`,
    herkenningOnderWater: [
      'Heel klein en spits, met drie losse stekels voor de rugvin.',
      'Zilverig met een smalle staartsteel en benige zijplaten in plaats van gewone schubben.',
      'Mannetjes in het voorjaar met felrode keel en buik en blauwe ogen.',
    ],
    gedragBijDuiker:
      'Blijft in de kruidzone en schiet met korte rukjes van dekking naar dekking.',
    seizoen: 'Het opvallendst in het voorjaar, wanneer de mannetjes rood kleuren en een nest bewaken.',
    weetje: 'Het mannetje bouwt een nestje van plantenresten en waaiert er vers water doorheen.',
    onderscheid: {
      'tiendoornige-stekelbaars':
        'Tel de losse stekels voor de rugvin: drie bij deze soort, negen tot elf bij de ' +
        'tiendoornige stekelbaars.',
    },
  },

  zwanenmossel: {
    gecontroleerd: false,
    bron: `${OWF}, ${WIKI}`,
    herkenningOnderWater: [
      'Grote ovale tweekleppige, tot ongeveer twintig centimeter.',
      'Dunne, vrij lichte schelp met een gelijkmatig gebogen bovenrand.',
      'Staat meestal half ingegraven rechtop in zachte bodem, met alleen de achterrand zichtbaar.',
    ],
    gedragBijDuiker:
      'Reageert op verstoring door de kleppen te sluiten en zich dieper in de bodem terug te trekken.',
    seizoen: 'Het hele jaar.',
    weetje:
      'De larven liften een tijd mee op de kieuwen van vissen; zo verspreidt een dier dat ' +
      'nauwelijks beweegt zich toch door een heel water.',
    onderscheid: {
      vijvermossel:
        'De zwanenmossel wordt duidelijk groter en heeft een gelijkmatig gebogen bovenrand; ' +
        'de vijvermossel blijft kleiner met een hoekiger, meer opstaande achterkant.',
      schildersmossel:
        'De schildersmossel is smaller en langwerpiger met een dikkere schelp, de zwanenmossel ' +
        'is breed ovaal met een dunne schelp.',
    },
  },

  'gevlekte-amerikaanse-rivierkreeft': {
    gecontroleerd: false,
    bron: KREEFT,
    herkenningOnderWater: [
      'Blijft klein, ongeveer tien tot twaalf centimeter.',
      'Oranje tot roodbruine schaarpunten met een donkere band erachter.',
      'Roodbruine dwarsvlekken op het achterlijf, bij oudere dieren vaak vervaagd.',
    ],
    seizoen: 'Het hele jaar, s nachts het actiefst.',
    weetje: 'Dit is de meest algemene uitheemse rivierkreeft van Nederland.',
    meldenBij: 'waarneming.nl',
    onderscheid: {
      'californische-rivierkreeft':
        'De Californische wordt veel groter, is glad en heeft een witte vlek op de scharnierplek ' +
        'van de schaar. De gevlekte blijft klein met oranje-zwarte schaarpunten.',
      'rode-amerikaanse-rivierkreeft':
        'De rode Amerikaanse is over het hele lijf felrood met rode knobbels op de scharen; ' +
        'de gevlekte is bruin met oranje-zwarte schaarpunten.',
      'turkse-rivierkreeft':
        'De Turkse heeft opvallend smalle, lange scharen en een ruw pantser; de gevlekte is ' +
        'klein met oranje-zwarte schaarpunten.',
    },
  },

  // ---- witvis ---------------------------------------------------------------

  blankvoorn: {
    gecontroleerd: false,
    bron: `${NATURALIS}, ${OWF}`,
    herkenningOnderWater: [
      'Zilverkleurig en slank, met een duidelijk rood tot oranje oog.',
      'De rugvin begint recht boven de aanzet van de buikvin.',
      'Bek eindstandig, dus de punt van de snuit en de bek liggen op één lijn.',
    ],
    gedragBijDuiker:
      'Zwemt in losse scholen in open water en houdt afstand. Draait rustig weg zodra je nadert.',
    seizoen: 'Het hele jaar. In de winter in dichtere scholen op diepere plekken.',
    weetje: 'Veruit de meest algemene vis van Nederland, en daardoor de beste ijkmaat voor de rest.',
    onderscheid: {
      ruisvoorn:
        'Kijk naar het oog en de rugvin: de blankvoorn heeft een rood oog en de rugvin recht ' +
        'boven de buikvin. De ruisvoorn heeft een goudgeel oog en de rugvin duidelijk verder naar achteren.',
      kolblei:
        'De kolblei is hoger gebouwd en heeft een opvallend groot oog. De blankvoorn is slanker ' +
        'met een rood oog.',
      winde:
        'De winde wordt veel groter en forser, met een kleiner oog en een stompere kop.',
    },
  },

  ruisvoorn: {
    gecontroleerd: false,
    bron: `${NATURALIS}, ${OWF}`,
    herkenningOnderWater: [
      'Messing- tot goudkleurige flanken, feller dan de blankvoorn, met oranjerode vinnen.',
      'Bek staat schuin omhoog, gebouwd om van het oppervlak te eten.',
      'De rugvin staat duidelijk achter de aanzet van de buikvin.',
    ],
    gedragBijDuiker:
      'Blijft in en vlak boven de kruidzone en zoekt dekking tussen planten in plaats van weg ' +
      'te zwemmen naar open water.',
    seizoen: 'Vooral in de zomer in begroeide, ondiepe delen.',
    weetje: 'De opwaartse bek verraadt de leefwijze: de ruisvoorn eet van bovenaf, niet van de bodem.',
    onderscheid: {
      blankvoorn:
        'Het oog is goudgeel bij de ruisvoorn en rood bij de blankvoorn. De rugvin staat bij de ' +
        'ruisvoorn achter de buikvinaanzet, bij de blankvoorn er recht boven.',
    },
  },

  kolblei: {
    gecontroleerd: false,
    bron: `${NATURALIS}, ${OWF}`,
    herkenningOnderWater: [
      'Zilverachtig en hoog gebouwd, maar minder hoog dan een volwassen brasem.',
      'Opvallend groot oog, ongeveer even groot als de lengte van de snuit.',
      'Aanzet van de borstvinnen vaak roodachtig.',
    ],
    gedragBijDuiker: 'Beweegt rustig in kleine groepen, meestal dichter bij de bodem dan blankvoorn.',
    seizoen: 'Het hele jaar zichtbaar.',
    weetje:
      'Kolblei en jonge brasem zijn onder water bijna niet te onderscheiden. Het oog is het ' +
      'betrouwbaarste kenmerk.',
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
    bron: `${NATURALIS}, ${OWF}`,
    herkenningOnderWater: [
      'Sterk zijdelings afgeplat en hoog van lijf, bij oudere dieren donker bronsbruin.',
      'Kleine kop met een klein oog en een uitstulpbare bek.',
      'Lange aarsvin die tot ver naar de staart doorloopt.',
    ],
    gedragBijDuiker:
      'Draait als school weg zodra je nadert. Jonge brasems zijn zilver en lastiger te ' +
      'onderscheiden dan de donkere volwassen dieren.',
    seizoen: 'Het hele jaar. Foerageert vaak op de bodem en laat dan wolken slib achter.',
    weetje:
      'Een groep foeragerende brasems is soms eerder te zien aan het opgewoelde slib dan aan ' +
      'de vissen zelf.',
    onderscheid: {
      kolblei:
        'De brasem heeft een klein oog en is donkerder brons; de kolblei heeft een groot oog ' +
        'en blijft zilverachtig.',
    },
  },

  winde: {
    gecontroleerd: false,
    bron: `${NATURALIS}, ${WIKI}`,
    herkenningOnderWater: [
      'Fors en tamelijk hoog gebouwd, met een stompe kop en een klein oog.',
      'Zilverig met een donkere rug; vinnen aan de buikzijde vaak roodachtig.',
      'Wordt duidelijk groter dan blankvoorn, tot ver over een halve meter.',
    ],
    seizoen: 'Het hele jaar, in stromend water het opvallendst.',
    weetje: 'De winde trekt in het voorjaar stroomopwaarts om op grind en zand te paaien.',
    onderscheid: {
      blankvoorn:
        'De winde is veel groter en gedrongener met een klein oog; de blankvoorn is slank met ' +
        'een opvallend rood oog.',
      kopvoorn:
        'De kopvoorn is cilindrischer met een brede stompe kop en een aarsvin met bolle rand; ' +
        'bij de winde is die rand hol.',
    },
  },

  alver: {
    gecontroleerd: false,
    bron: `${NATURALIS}, ${WIKI}`,
    herkenningOnderWater: [
      'Klein, slank en sterk zilverglanzend, zelden meer dan een handlengte.',
      'Bek staat schuin omhoog, geschikt om aan het oppervlak te happen.',
      'Scherpe kiel op de buik tussen buikvin en aarsvin.',
    ],
    gedragBijDuiker: 'Zwemt in dichte scholen vlak onder het oppervlak en blijft in beweging.',
    seizoen: 'Vooral in de zomer aan de oppervlakte te zien.',
    weetje: 'Grote scholen alvers aan het oppervlak verraden vaak dat er roofvis onder staat.',
    onderscheid: {
      vetje:
        'Het vetje blijft nog kleiner en heeft een korte, onvolledige zijlijn; de alver is ' +
        'slanker met een scherpe buikkiel.',
    },
  },

  vetje: {
    gecontroleerd: false,
    bron: `${RAVON}, ${NATURALIS}`,
    herkenningOnderWater: [
      'Zeer klein, meestal niet groter dan een vinger, en doorschijnend zilverig.',
      'Bek staat opvallend schuin omhoog.',
      'De zijlijn is onvolledig en stopt al na een klein aantal schubben.',
    ],
    seizoen: 'Vooral in de zomer in kleine, stilstaande en sterk begroeide wateren.',
    weetje: 'Het vetje houdt van kleine, plantenrijke wateren waar grotere roofvis ontbreekt.',
    onderscheid: {
      alver:
        'Het vetje is kleiner en heeft een zijlijn die halverwege ophoudt; bij de alver loopt ' +
        'die helemaal door en is er een scherpe buikkiel.',
    },
  },

  kroeskarper: {
    gecontroleerd: false,
    bron: `${RAVON}, ${WIKI}`,
    herkenningOnderWater: [
      'Rond en hoog gebouwd, koperkleurig tot goudbruin.',
      'Geen enkele baarddraad.',
      'De bovenrand van de rugvin is bol naar buiten gebogen.',
    ],
    seizoen: 'Het hele jaar, vooral in ondiepe, plantenrijke en zuurstofarme wateren.',
    weetje: 'De kroeskarper overleeft winters onder ijs waarbij vrijwel alle zuurstof verdwijnt.',
    onderscheid: {
      giebel:
        'De kroeskarper is warm koperkleurig met een bolle rugvinrand; de giebel is grijzig ' +
        'zilver met een rechte tot holle rugvinrand.',
      karper:
        'De karper heeft vier baarddraden, de kroeskarper geen enkele.',
    },
  },

  giebel: {
    gecontroleerd: false,
    bron: `${WIKI}, ${NATURALIS}`,
    herkenningOnderWater: [
      'Hoog gebouwd maar grijzig zilver in plaats van koperkleurig.',
      'Geen baarddraden.',
      'De bovenrand van de rugvin is recht tot licht hol.',
    ],
    seizoen: 'Het hele jaar.',
    weetje:
      'Bij de giebel bestaan populaties die vrijwel alleen uit vrouwtjes bestaan en zich ' +
      'voortplanten met sperma van verwante soorten.',
    meldenBij: 'waarneming.nl',
    onderscheid: {
      kroeskarper:
        'De giebel is grijzig zilver met een rechte of holle rugvinrand; de kroeskarper is ' +
        'koperkleurig met een bolle rugvinrand.',
      karper:
        'De karper heeft vier baarddraden en is langgerekter; de giebel heeft er geen.',
    },
  },

  graskarper: {
    gecontroleerd: false,
    bron: `${WIKI}, ${NATURALIS}`,
    herkenningOnderWater: [
      'Langgerekt en bijna cilindrisch, niet hoog gebouwd zoals een karper.',
      'Geen baarddraden, met een brede platte kop en een laag geplaatste bek.',
      'Grote, duidelijk afgetekende schubben en een korte rugvin.',
    ],
    seizoen: 'Vooral in de zomer zichtbaar, tussen en boven waterplanten.',
    weetje:
      'De graskarper is uitgezet om waterplanten kort te houden en eet per dag een flink deel ' +
      'van zijn eigen gewicht aan groen.',
    onderscheid: {
      karper:
        'De graskarper is slank en cilindrisch zonder baarddraden; de karper is hoog gebouwd ' +
        'met vier baarddraden.',
    },
  },

  // ---- bodem-talud ----------------------------------------------------------

  rivierdonderpad: {
    gecontroleerd: false,
    bron: `${RAVON}, herkenningskaart bodemvissen`,
    herkenningOnderWater: [
      'Brede, platte kop met een grote bek, breder dan de rest van het lijf.',
      'Zeer grote waaiervormige borstvinnen waarop het dier op de bodem steunt.',
      'Geen schubben; gemarmerd bruin, waardoor het dier vrijwel samenvalt met de stenen.',
    ],
    gedragBijDuiker:
      'Zit doodstil op een steen en vertrouwt op camouflage. Schiet bij verstoring een klein ' +
      'stukje weg en zit dan weer roerloos.',
    seizoen: 'Het hele jaar, overdag weggekropen tussen stenen en stortsteen.',
    weetje:
      'De rivierdonderpad heeft geen zwemblaas en kan daardoor niet zweven; hij verplaatst zich ' +
      'in sprongetjes over de bodem.',
    onderscheid: {
      bermpje:
        'De rivierdonderpad heeft een brede platte kop met enorme borstvinnen en geen ' +
        'baarddraden; het bermpje is worstvormig met zes baarddraden om de bek.',
    },
  },

  bermpje: {
    gecontroleerd: false,
    bron: `${RAVON}, herkenningskaart modderkruipers en bermpje`,
    herkenningOnderWater: [
      'Worstvormig en rond in doorsnede, met een licht afgeplatte buikzijde.',
      'Zes baarddraden rond de bek.',
      'Onregelmatig gemarmerd bruin, ook op de vinnen.',
    ],
    gedragBijDuiker: 'Ligt stil op de bodem en schiet bij verstoring onder een steen.',
    seizoen: 'Het hele jaar, vooral in stromend water met grind of zand.',
    weetje: 'Het bermpje is s nachts actief en houdt zich overdag schuil onder stenen.',
    onderscheid: {
      'kleine-modderkruiper':
        'Het bermpje is rond en gemarmerd; de kleine modderkruiper is zijdelings afgeplat met ' +
        'een rij losse donkere vlekken op de flank en een stekeltje onder het oog.',
      rivierdonderpad:
        'Het bermpje heeft zes baarddraden en een smalle kop; de rivierdonderpad heeft een brede ' +
        'platte kop met zeer grote borstvinnen en geen baarddraden.',
    },
  },

  'kleine-modderkruiper': {
    gecontroleerd: false,
    bron: `${RAVON}, herkenningskaart modderkruipers en bermpje`,
    herkenningOnderWater: [
      'Slank en zijdelings afgeplat, geelwit tot lichtgrijs.',
      'Een regelmatige rij losse donkere vlekken langs de flank en een donkere vlek bovenaan de staartaanzet.',
      'Klein opklapbaar stekeltje onder het oog.',
    ],
    gedragBijDuiker:
      'Ligt half ingegraven in zand of tussen fijn materiaal en beweegt kronkelend weg.',
    seizoen: 'Het hele jaar, op zandige en slikkige bodems.',
    weetje:
      'De kleine modderkruiper heeft een kleine zwemblaas en blijft daardoor bijna vanzelf op de bodem.',
    onderscheid: {
      bermpje:
        'De kleine modderkruiper is afgeplat met een nette rij vlekken en een stekeltje onder ' +
        'het oog; het bermpje is rond en onregelmatig gemarmerd.',
      'grote-modderkruiper':
        'De grote modderkruiper wordt veel langer en heeft brede donkere lengtestrepen; de kleine ' +
        'blijft klein met losse vlekjes.',
    },
  },

  'grote-modderkruiper': {
    gecontroleerd: false,
    bron: `${RAVON}, herkenningskaart modderkruipers en bermpje`,
    herkenningOnderWater: [
      'Lang en palingachtig, tot ongeveer dertig centimeter.',
      'Duidelijke brede donkere lengtestrepen over een geelbruine flank.',
      'Tien baarddraden rond de bek.',
    ],
    gedragBijDuiker:
      'Leeft grotendeels in de modder en komt zelden vrij zwemmend in beeld.',
    seizoen: 'Het hele jaar, in sloten en moerassen met een dikke modderlaag.',
    weetje:
      'De grote modderkruiper kan lucht happen en zuurstof opnemen via de darm, waardoor hij ' +
      'in vrijwel zuurstofloos water overleeft.',
    onderscheid: {
      'kleine-modderkruiper':
        'De grote modderkruiper is veel langer met brede lengtestrepen; de kleine heeft losse ' +
        'vlekjes en blijft klein.',
      paling:
        'De paling heeft één doorlopende vinzoom en geen baarddraden; de grote modderkruiper ' +
        'heeft losse vinnen en tien baarddraden.',
    },
  },

  riviergrondel: {
    gecontroleerd: false,
    bron: `${NATURALIS}, ${RAVON}`,
    herkenningOnderWater: [
      'Klein en spoelvormig, met een duidelijke rij donkere vlekken langs de zijlijn.',
      'Eén baarddraad in elke mondhoek, bek onderstandig.',
      'Gespikkelde rug- en staartvin.',
    ],
    gedragBijDuiker: 'Staat in groepjes vlak boven zand- en grindbodems en zwemt met korte rukjes.',
    seizoen: 'Het hele jaar.',
    weetje:
      'Ondanks de naam is dit geen familie van de uitheemse grondels; de riviergrondel is ' +
      'inheems en hoort bij de karperachtigen.',
    onderscheid: {
      bermpje:
        'De riviergrondel heeft twee baarddraden en een nette rij vlekken langs de zijlijn; ' +
        'het bermpje heeft er zes en is gemarmerd.',
    },
  },

  'tiendoornige-stekelbaars': {
    gecontroleerd: false,
    bron: `${RAVON}, ${NATURALIS}`,
    herkenningOnderWater: [
      'Zeer klein en slank, met negen tot elf losse stekeltjes voor de rugvin.',
      'Grauw bruingroen zonder de felle kleuren van de driedoornige.',
      'Zeer smalle staartsteel.',
    ],
    seizoen: 'Het hele jaar, in dichtbegroeide sloten en vennen.',
    weetje: 'Verdraagt zuur en voedselarm water waar veel andere vissen ontbreken.',
    onderscheid: {
      'driedoornige-stekelbaars':
        'Tel de losse stekels voor de rugvin: negen tot elf bij de tiendoornige, drie bij de driedoornige.',
    },
  },

  bittervoorn: {
    gecontroleerd: false,
    bron: `${RAVON}, ${NATURALIS}`,
    herkenningOnderWater: [
      'Klein, hoog gebouwd en zilverglanzend met een paarsblauwe weerschijn.',
      'Een glanzende blauwgroene lengtestreep op de achterste helft van de flank.',
      'Geen baarddraden; mannetjes in het voorjaar rozerood met een felle streep.',
    ],
    gedragBijDuiker: 'Blijft in kleine groepjes vlak bij de bodem, altijd in de buurt van mossels.',
    seizoen: 'In het voorjaar het opvallendst door de paarkleuren van de mannetjes.',
    weetje:
      'Het vrouwtje legt haar eitjes met een lange legbuis in een levende zoetwatermossel. ' +
      'Zonder mossels geen bittervoorns.',
    onderscheid: {
      blankvoorn:
        'De bittervoorn blijft veel kleiner en heeft een glanzende streep op de achterste flank; ' +
        'de blankvoorn is groter met een rood oog.',
      vetje:
        'De bittervoorn is hoog gebouwd met een blauwgroene streep; het vetje is slanker en ' +
        'heeft een onvolledige zijlijn.',
    },
  },

  meerval: {
    gecontroleerd: false,
    bron: `${NATURALIS}, ${WIKI}`,
    herkenningOnderWater: [
      'Zeer groot en schubloos, met een brede afgeplatte kop en een enorme bek.',
      'Twee lange baarddraden op de bovenkaak en vier kortere op de onderkaak.',
      'Zeer lange aarsvin die bijna tot de staart doorloopt; de rugvin is juist klein.',
    ],
    gedragBijDuiker:
      'Ligt overdag stil in diepe kuilen, onder overhangende oevers of tussen boomstammen.',
    seizoen: 'Vooral in de zomer actief; s nachts op jacht in ondieper water.',
    weetje: 'De meerval is de grootste zoetwatervis van Europa en kan meer dan twee meter worden.',
    onderscheid: {
      kwabaal:
        'De meerval is schubloos met zes baarddraden en een enorme bek; de kwabaal heeft één ' +
        'baarddraad op de kin en twee rugvinnen.',
    },
  },

  kwabaal: {
    gecontroleerd: false,
    bron: `${RAVON}, ${WIKI}`,
    herkenningOnderWater: [
      'Langgerekt met een afgeplatte kop en een gemarmerd geelbruin patroon.',
      'Eén enkele baarddraad midden op de kin.',
      'Twee rugvinnen, waarvan de tweede zeer lang is, en een lange aarsvin.',
    ],
    seizoen: 'Actief in de koudste maanden; paait midden in de winter.',
    weetje:
      'De kwabaal is de enige echte zoetwaterkabeljauw en is in Nederland zeer zeldzaam geworden.',
    meldenBij: 'RAVON',
    onderscheid: {
      meerval:
        'De kwabaal heeft één baarddraad op de kin en twee rugvinnen; de meerval is veel groter, ' +
        'schubloos en heeft zes baarddraden.',
      paling:
        'De kwabaal heeft losse rug- en staartvinnen en een gemarmerd patroon; de paling heeft ' +
        'één doorlopende vinzoom.',
    },
  },

  rivierprik: {
    gecontroleerd: false,
    bron: `${RAVON}, ${NATURALIS}`,
    herkenningOnderWater: [
      'Aalvormig en zonder kaken, met een ronde zuignapbek vol hoorntandjes.',
      'Zeven ronde kieuwopeningen achter elk oog, als een rij gaatjes.',
      'Geen borst- of buikvinnen; twee gescheiden rugvinnen achterop.',
    ],
    seizoen: 'Vooral in de winter en het vroege voorjaar, wanneer de dieren stroomopwaarts trekken.',
    weetje:
      'De volwassen rivierprik leeft parasitair op andere vissen en hecht zich met zijn zuignap vast.',
    meldenBij: 'RAVON',
    onderscheid: {
      beekprik:
        'De rivierprik wordt duidelijk groter en heeft een tandenrijke zuignap; de beekprik ' +
        'blijft klein, eet als volwassene niet meer en heeft stompe tandjes.',
      paling:
        'De prik heeft een ronde zuignap zonder kaken en zeven kieuwgaatjes; de paling heeft ' +
        'een gewone bek met kaken en borstvinnen.',
    },
  },

  // ---- grondels -------------------------------------------------------------

  zwartbekgrondel: {
    gecontroleerd: false,
    bron: `${RAVON} herkenningskaart grondels, duikersgids.nl`,
    herkenningOnderWater: [
      'Gedrongen bodemvis met hoog geplaatste ogen en een zuignap van vergroeide buikvinnen.',
      'Duidelijke zwarte vlek achterin de voorste rugvin.',
      'Grijsbruin gevlekt; paaiende mannetjes worden vrijwel geheel zwart.',
    ],
    gedragBijDuiker:
      'Zit op stenen en hard substraat en schiet bij nadering een klein stukje weg, om daarna ' +
      'meteen weer stil te zitten.',
    seizoen: 'Het hele jaar, vooral op stortsteen en harde oevers.',
    weetje: 'Aangekomen via ballastwater en scheepsrompen, en inmiddels bijna overal aanwezig.',
    meldenBij: 'waarneming.nl',
    onderscheid: {
      marmergrondel:
        'De marmergrondel heeft twee kleine buisjes als neusgaten die over de bovenlip steken; ' +
        'de zwartbekgrondel niet, maar wel een zwarte vlek in de voorste rugvin.',
      'pontische-stroomgrondel':
        'De zwartbekgrondel heeft een zwarte vlek achterin de voorste rugvin; de pontische ' +
        'stroomgrondel heeft die niet.',
      'kesslers-grondel':
        'Kesslers grondel heeft een opvallend brede, platte kop; de zwartbekgrondel heeft een ' +
        'smallere kop en een zwarte vlek in de voorste rugvin.',
    },
  },

  marmergrondel: {
    gecontroleerd: false,
    bron: `${RAVON} herkenningskaart grondels, duikersgids.nl`,
    herkenningOnderWater: [
      'Twee korte buisjes als neusgaten die duidelijk over de bovenlip uitsteken.',
      'Klein, meestal niet meer dan een tiental centimeters.',
      'Gemarmerd bruin met een lichte vlek aan de staartwortel.',
    ],
    gedragBijDuiker: 'Zit stil tussen stenen en waterplanten en laat zich dicht naderen.',
    seizoen: 'Het hele jaar.',
    weetje: 'De eerste van de Ponto-Kaspische grondels die Nederland bereikte, rond 2001.',
    meldenBij: 'waarneming.nl',
    onderscheid: {
      zwartbekgrondel:
        'Kijk naar de neus: de marmergrondel heeft twee uitstekende buisjes, de zwartbekgrondel ' +
        'niet maar wel een zwarte vlek in de voorste rugvin.',
      'pontische-stroomgrondel':
        'De marmergrondel heeft uitstekende neusbuisjes en blijft kleiner dan de pontische stroomgrondel.',
    },
  },

  'pontische-stroomgrondel': {
    gecontroleerd: false,
    bron: `${RAVON} herkenningskaart grondels, duikersgids.nl`,
    herkenningOnderWater: [
      'Slanker gebouwd dan de andere grondels, met een spitsere snuit.',
      'Geen zwarte vlek in de voorste rugvin en geen uitstekende neusbuisjes.',
      'Bleek zandkleurig; paaiende mannetjes krijgen gele vinnen met zwarte randen.',
    ],
    gedragBijDuiker: 'Staat op open zandbodems en schiet bij verstoring over de bodem weg.',
    seizoen: 'Het hele jaar, met voorkeur voor zandige bodems.',
    weetje: 'Van de vier uitheemse grondels heeft deze de duidelijkste voorkeur voor zand.',
    meldenBij: 'waarneming.nl',
    onderscheid: {
      zwartbekgrondel:
        'De pontische stroomgrondel mist de zwarte vlek achterin de voorste rugvin die de ' +
        'zwartbekgrondel wel heeft.',
      marmergrondel:
        'De pontische stroomgrondel heeft geen uitstekende neusbuisjes en is slanker.',
      'kesslers-grondel':
        'Kesslers grondel heeft een brede platte kop en duidelijke lobben aan de zuignap; ' +
        'de pontische stroomgrondel heeft die lobben niet.',
    },
  },

  'kesslers-grondel': {
    gecontroleerd: false,
    bron: `${RAVON} herkenningskaart grondels, duikersgids.nl`,
    herkenningOnderWater: [
      'Opvallend brede en platte kop, breder dan bij de andere grondels.',
      'Roodbruin gevlekt patroon, ook op de vinnen.',
      'Duidelijk zichtbare lobben aan de zuignap op de buik.',
    ],
    gedragBijDuiker: 'Zit tussen stortsteen en zwaar substraat en blijft graag in dekking.',
    seizoen: 'Het hele jaar, vooral in stromend water.',
    weetje: 'De brede kop hoort bij een leven tussen grote stenen in stroming.',
    meldenBij: 'waarneming.nl',
    onderscheid: {
      zwartbekgrondel:
        'Kesslers grondel heeft een brede platte kop en geen zwarte vlek in de voorste rugvin.',
      'pontische-stroomgrondel':
        'Kesslers grondel heeft duidelijke lobben aan de zuignap en een bredere kop.',
      marmergrondel:
        'Kesslers grondel is groter met een brede platte kop; de marmergrondel heeft uitstekende neusbuisjes.',
    },
  },

  // ---- rivier ---------------------------------------------------------------

  kopvoorn: {
    gecontroleerd: false,
    bron: `${NATURALIS}, ${WIKI}`,
    herkenningOnderWater: [
      'Fors en cilindrisch met een brede, stompe kop en een grote bek.',
      'Grote, donker omrande schubben die een netpatroon vormen.',
      'De aarsvin heeft een bolle, naar buiten gebogen achterrand.',
    ],
    seizoen: 'Het hele jaar in stromend water; in de zomer vaak hoog in de waterkolom.',
    weetje: 'De kopvoorn is schuw en verdwijnt vaak al voordat je hem goed gezien hebt.',
    onderscheid: {
      serpeling:
        'De kopvoorn wordt veel groter met een brede stompe kop en een bolle aarsvinrand; ' +
        'de serpeling blijft klein met een spitsere kop en een holle aarsvinrand.',
      winde:
        'De kopvoorn heeft een bolle aarsvinrand en een bredere kop; bij de winde is die rand hol.',
    },
  },

  serpeling: {
    gecontroleerd: false,
    bron: `${NATURALIS}, ${RAVON}`,
    herkenningOnderWater: [
      'Slank en zilverig, blijft duidelijk kleiner dan kopvoorn en winde.',
      'Betrekkelijk spitse kop met een kleine, licht onderstandige bek.',
      'De aarsvin heeft een holle, naar binnen gebogen achterrand.',
    ],
    seizoen: 'Het hele jaar in helder stromend water.',
    weetje: 'De serpeling stelt hoge eisen aan zuurstof en helderheid en is daarmee een goede graadmeter.',
    onderscheid: {
      kopvoorn:
        'De serpeling blijft klein met een spitse kop en een holle aarsvinrand; de kopvoorn is ' +
        'fors met een brede stompe kop en een bolle aarsvinrand.',
    },
  },

  barbeel: {
    gecontroleerd: false,
    bron: `${NATURALIS}, ${RAVON}`,
    herkenningOnderWater: [
      'Langgerekt en rolrond met een duidelijk afgeplatte buik.',
      'Vier baarddraden aan een onderstandige, vlezige bek.',
      'Groenbruine rug met een gelige buik; wordt tot bijna een meter lang.',
    ],
    gedragBijDuiker: 'Staat vlak boven grind in de stroming en houdt zich laag bij de bodem.',
    seizoen: 'Vooral in de zomer actief in snelstromende trajecten.',
    weetje: 'De barbeel zoekt met zijn baarddraden voedsel tussen grindstenen op de bodem.',
    meldenBij: 'RAVON',
  },

  sneep: {
    gecontroleerd: false,
    bron: `${RAVON}, ${NATURALIS}`,
    herkenningOnderWater: [
      'Slank en zilverig met een opvallend stompe, vooruitstekende snuit.',
      'Dwarse, hoornige onderlip waarmee algen van stenen worden geschraapt.',
      'Donkere rug met vaak roodachtige vinnen aan de buikzijde.',
    ],
    gedragBijDuiker: 'Graast in groepen over stenen en grind in de stroming.',
    seizoen: 'Het hele jaar in stromend water; paait in het voorjaar op grindbanken.',
    weetje: 'De rechte hoornlip laat op begroeide stenen zichtbare schraapsporen achter.',
    meldenBij: 'RAVON',
  },

  roofblei: {
    gecontroleerd: false,
    bron: `${NATURALIS}, ${WIKI}`,
    herkenningOnderWater: [
      'Groot, slank en zilverig, met een duidelijk spitse kop.',
      'Grote eindstandige bek die tot achter het oog inkeept, zonder tanden.',
      'Vooruitstekende onderkaak met een knobbel die in de bovenkaak past.',
    ],
    gedragBijDuiker: 'Jaagt in open water en verdwijnt meestal snel uit beeld.',
    seizoen: 'Vooral in de zomer aan de oppervlakte jagend te zien.',
    weetje:
      'De roofblei is de enige Europese karperachtige die als volwassen dier vrijwel uitsluitend vis eet.',
    meldenBij: 'waarneming.nl',
  },

  beekforel: {
    gecontroleerd: false,
    bron: `${RAVON}, ${WIKI}`,
    herkenningOnderWater: [
      'Gespierd en spoelvormig, met een kleine vetvin tussen rugvin en staart.',
      'Rode vlekjes met lichte ringen eromheen, naast donkere vlekken.',
      'Staartvin vrijwel recht afgesneden, nauwelijks ingesneden.',
    ],
    seizoen: 'Het hele jaar in koele, zuurstofrijke beken.',
    weetje: 'De beekforel is de standvastige vorm van dezelfde soort als de zeeforel.',
    meldenBij: 'RAVON',
    onderscheid: {
      regenboogforel:
        'De beekforel heeft rode vlekjes met lichte ringen en een ongevlekte staartvin; de ' +
        'regenboogforel heeft een roze flankband en zwarte stippen tot in de staartvin.',
    },
  },

  regenboogforel: {
    gecontroleerd: false,
    bron: `${WIKI}, ${NATURALIS}`,
    herkenningOnderWater: [
      'Zilverig met een brede roze tot paarse band over het midden van de flank.',
      'Dicht bezaaid met kleine zwarte stippen, ook op rugvin en staartvin.',
      'Vetvin aanwezig, net als bij de beekforel.',
    ],
    seizoen: 'Vooral aanwezig in wateren waar wordt uitgezet.',
    weetje: 'Afkomstig uit Noord-Amerika en in Nederland vooral aanwezig door uitzetting.',
    meldenBij: 'waarneming.nl',
    onderscheid: {
      beekforel:
        'De regenboogforel heeft een roze flankband en zwarte stippen tot in de staartvin; ' +
        'de beekforel heeft rode vlekjes met lichte ringen en een ongevlekte staart.',
    },
  },

  beekprik: {
    gecontroleerd: false,
    bron: `${RAVON}, ${NATURALIS}`,
    herkenningOnderWater: [
      'Klein en aalvormig zonder kaken, met een ronde zuignapbek.',
      'Zeven ronde kieuwgaatjes achter elk oog.',
      'De twee rugvinnen raken elkaar bijna of vloeien in elkaar over.',
    ],
    seizoen: 'Larven leven jarenlang ingegraven; volwassen dieren zie je vooral in het voorjaar.',
    weetje:
      'De volwassen beekprik eet niet meer: hij paait en sterft daarna. Alleen als larve, ' +
      'ingegraven in fijn sediment, groeit hij.',
    meldenBij: 'RAVON',
    onderscheid: {
      rivierprik:
        'De beekprik blijft klein met stompe tandjes en rugvinnen die elkaar bijna raken; de ' +
        'rivierprik wordt groter met scherpe tandjes en duidelijk gescheiden rugvinnen.',
    },
  },

  // ---- kreeften -------------------------------------------------------------

  'rode-amerikaanse-rivierkreeft': {
    gecontroleerd: false,
    bron: KREEFT,
    herkenningOnderWater: [
      'Fel rood over het hele lijf en de scharen, zonder vlekken of strepen.',
      'Duidelijke rode knobbels op de scharen.',
      'Smalle, langgerekte scharen en een fors lijf.',
    ],
    seizoen: 'Het hele jaar, het actiefst in warm water.',
    weetje: 'Graaft diepe holen in oevers en kan daarmee kades en dijken verzwakken.',
    meldenBij: 'waarneming.nl',
    onderscheid: {
      'gevlekte-amerikaanse-rivierkreeft':
        'De rode Amerikaanse is over het hele lijf felrood met rode knobbels; de gevlekte is ' +
        'bruin en klein met oranje-zwarte schaarpunten.',
      'californische-rivierkreeft':
        'De Californische is glad en bruin met een witte vlek op de scharnierplek van de schaar; ' +
        'de rode Amerikaanse is felrood met knobbelige scharen.',
    },
  },

  'californische-rivierkreeft': {
    gecontroleerd: false,
    bron: KREEFT,
    herkenningOnderWater: [
      'Groot en zwaar gebouwd, tot ongeveer vijfentwintig centimeter.',
      'Opvallend gladde, brede scharen met een witte tot turkooizen vlek op de scharnierplek.',
      'Onderzijde van de scharen rood.',
    ],
    seizoen: 'Het hele jaar.',
    weetje:
      'Draagt de kreeftenpest bij zich zonder er zelf ziek van te worden, wat funest is voor ' +
      'de inheemse Europese rivierkreeft.',
    meldenBij: 'waarneming.nl',
    onderscheid: {
      'europese-rivierkreeft':
        'De Californische heeft gladde scharen met een witte vlek op de scharnierplek; de ' +
        'Europese heeft ruwe, korrelige scharen zonder die vlek.',
      'gevlekte-amerikaanse-rivierkreeft':
        'De Californische wordt veel groter en is glad met een witte schaarvlek; de gevlekte ' +
        'blijft klein met oranje-zwarte schaarpunten.',
      'rode-amerikaanse-rivierkreeft':
        'De Californische is bruin en glad met een witte schaarvlek; de rode Amerikaanse is felrood en knobbelig.',
    },
  },

  'europese-rivierkreeft': {
    gecontroleerd: false,
    bron: KREEFT,
    herkenningOnderWater: [
      'Bruin tot zwartbruin, soms blauwig, met een stevig gebouwd lijf.',
      'Brede maar ruwe, korrelige scharen met een felrode onderzijde.',
      'Geen witte vlek op de scharnierplek van de schaar.',
    ],
    seizoen: 'Het hele jaar, maar in Nederland vrijwel verdwenen.',
    weetje:
      'De enige inheemse rivierkreeft van Nederland, sterk teruggedrongen door kreeftenpest ' +
      'die met uitheemse soorten meekwam.',
    meldenBij: 'RAVON',
    onderscheid: {
      'californische-rivierkreeft':
        'De Europese heeft ruwe, korrelige scharen zonder witte vlek; de Californische is glad ' +
        'met een witte vlek op de scharnierplek.',
      'turkse-rivierkreeft':
        'De Turkse heeft opvallend smalle, lange scharen en een zeer ruw pantser; de Europese ' +
        'heeft bredere scharen.',
    },
  },

  'turkse-rivierkreeft': {
    gecontroleerd: false,
    bron: KREEFT,
    herkenningOnderWater: [
      'Opvallend smalle, lange scharen, veel slanker dan bij de andere soorten.',
      'Zeer ruw pantser, bezaaid met kleine knobbeltjes.',
      'Olijfgroen tot geelbruin, vaak met roodbruine schaarpunten.',
    ],
    seizoen: 'Het hele jaar.',
    weetje: 'De wetenschappelijke naam betekent letterlijk dunvinger, naar die smalle scharen.',
    meldenBij: 'waarneming.nl',
    onderscheid: {
      'europese-rivierkreeft':
        'De Turkse heeft smalle lange scharen en een zeer ruw pantser; de Europese heeft ' +
        'bredere scharen met een felrode onderzijde.',
    },
  },

  'geknobbelde-amerikaanse-rivierkreeft': {
    gecontroleerd: false,
    bron: KREEFT,
    herkenningOnderWater: [
      'Middelgroot, tot ongeveer dertien centimeter.',
      'Grote lichte knobbels op het lijf en vooral op de scharen.',
      'Donkerbruin met een bruingroene tint bovenop de scharen.',
    ],
    seizoen: 'Het hele jaar.',
    weetje: 'In Nederland veel minder algemeen dan de gevlekte en de rode Amerikaanse rivierkreeft.',
    meldenBij: 'waarneming.nl',
    onderscheid: {
      'gevlekte-amerikaanse-rivierkreeft':
        'De geknobbelde heeft grove lichte knobbels op de scharen; de gevlekte heeft gladdere ' +
        'scharen met oranje-zwarte punten.',
    },
  },

  'chinese-wolhandkrab': {
    gecontroleerd: false,
    bron: `${WIKI}, ${OWF}`,
    herkenningOnderWater: [
      'Een echte krab met een vierkant, licht bol schild, niet te verwarren met een kreeft.',
      'Dichte bruine haarbossen op beide scharen, als wanten.',
      'Vier stekels aan elke zijkant van het schild.',
    ],
    gedragBijDuiker: 'Loopt over de bodem en trekt zich terug in holen in de oever.',
    seizoen: 'Volwassen dieren trekken in het najaar massaal stroomafwaarts.',
    weetje: 'Groeit op in zoet water maar plant zich voort in zee, en legt daarvoor honderden kilometers af.',
    meldenBij: 'waarneming.nl',
  },

  zoetwatergarnaal: {
    gecontroleerd: false,
    bron: `${OWF}, ${WIKI}`,
    herkenningOnderWater: [
      'Klein en vrijwel doorzichtig, ongeveer twee tot vier centimeter.',
      'Zijdelings afgeplat garnaaltje met een gebogen rug.',
      'Zwemt vrij rond in plaats van over de bodem te kruipen.',
    ],
    seizoen: 'Vooral in de zomer talrijk tussen waterplanten.',
    weetje: 'Door de doorzichtige huid zijn bij dit garnaaltje de darmen en soms de eitjes goed te zien.',
  },

  killergarnaal: {
    gecontroleerd: false,
    bron: `${OWF}, ${WIKI}`,
    herkenningOnderWater: [
      'Vlokreeftje van ongeveer een tot drie centimeter, zijdelings afgeplat.',
      'Duidelijke lichte en donkere dwarsbanden over het lijf.',
      'Twee kegelvormige uitsteeksels achterop het lijf.',
    ],
    gedragBijDuiker: 'Schiet met een schokkende beweging weg tussen stenen en spleten.',
    seizoen: 'Het hele jaar, vooral op hard substraat.',
    weetje:
      'Deze vlokreeft doodt ook prooien die hij niet opeet, en dringt daarmee inheemse ' +
      'vlokreeften snel terug.',
    meldenBij: 'waarneming.nl',
  },

  waterpissebed: {
    gecontroleerd: false,
    bron: `${OWF}, ${WIKI}`,
    herkenningOnderWater: [
      'Afgeplat van boven naar beneden, als een pissebed op het land.',
      'Grijsbruin met zeven paar ongeveer even lange pootjes.',
      'Kruipt over de bodem en zwemt niet.',
    ],
    gedragBijDuiker: 'Kruipt traag over dood blad en detritus en vlucht nauwelijks.',
    seizoen: 'Het hele jaar.',
    weetje:
      'De waterpissebed eet vooral rottend blad en verdraagt water met weinig zuurstof.',
    onderscheid: {
      killergarnaal:
        'De waterpissebed is van boven afgeplat en kruipt; de killergarnaal is zijdelings ' +
        'afgeplat en schiet weg.',
    },
  },

  // ---- mossels en slakken ---------------------------------------------------

  driehoeksmossel: {
    gecontroleerd: false,
    bron: `${OWF}, ${WIKI}`,
    herkenningOnderWater: [
      'Klein en driehoekig, meestal niet meer dan drie tot vier centimeter.',
      'Zigzaggende donkere strepen op een lichte schelp.',
      'Zit met byssusdraden vastgehecht op hard substraat, vaak in dichte matten.',
    ],
    seizoen: 'Het hele jaar.',
    weetje: 'Eén dier filtert per dag ruim een liter water, waardoor deze soort het zicht flink verbetert.',
    onderscheid: {
      quaggamossel:
        'De driehoeksmossel heeft een platte buikzijde en blijft rechtop staan als je hem ' +
        'neerzet; de quaggamossel heeft een ronde buikzijde en valt om.',
    },
  },

  quaggamossel: {
    gecontroleerd: false,
    bron: `${OWF}, ${WIKI}`,
    herkenningOnderWater: [
      'Lijkt op de driehoeksmossel maar is boller en ronder van vorm.',
      'De buikzijde is afgerond in plaats van plat.',
      'Vaak bleker van kleur met een vager streeppatroon, en ook op zachte bodems te vinden.',
    ],
    seizoen: 'Het hele jaar, ook op grotere diepte dan de driehoeksmossel.',
    weetje: 'De quaggamossel verdringt op veel plekken de driehoeksmossel, ook in dieper en kouder water.',
    meldenBij: 'waarneming.nl',
    onderscheid: {
      driehoeksmossel:
        'Zet hem op zijn buikzijde: de driehoeksmossel blijft rechtop staan door zijn platte ' +
        'buik, de quaggamossel valt om.',
    },
  },

  schildersmossel: {
    gecontroleerd: false,
    bron: `${OWF}, ${WIKI}`,
    herkenningOnderWater: [
      'Langwerpig en betrekkelijk smal, met vrijwel evenwijdige boven- en onderrand.',
      'Olijfgroene tot geelbruine, tamelijk dikke schelp.',
      'Zit meestal rechtop half ingegraven in zand of grind.',
    ],
    seizoen: 'Het hele jaar.',
    weetje: 'De naam komt van het gebruik van de schelphelften als verfbakje door schilders.',
    onderscheid: {
      zwanenmossel:
        'De schildersmossel is smal en langwerpig met een dikke schelp; de zwanenmossel is ' +
        'breed ovaal, veel groter en dunschaliger.',
      vijvermossel:
        'De schildersmossel is smaller en rechter van vorm; de vijvermossel is hoger en ' +
        'hoekiger aan de achterkant.',
    },
  },

  vijvermossel: {
    gecontroleerd: false,
    bron: `${OWF}, ${WIKI}`,
    herkenningOnderWater: [
      'Ovaal maar duidelijk hoekiger dan de zwanenmossel, met een opstaande achterrand.',
      'Ongeveer tien centimeter, dus kleiner dan een volwassen zwanenmossel.',
      'Geelbruine tot groenbruine schelp met duidelijke groeiringen.',
    ],
    seizoen: 'Het hele jaar.',
    weetje: 'Vijvermossels zijn samen met zwanenmossels de kraamkamer voor de bittervoorn.',
    onderscheid: {
      zwanenmossel:
        'De vijvermossel blijft kleiner en heeft een hoekiger achterkant; de zwanenmossel is ' +
        'groter met een gelijkmatig gebogen bovenrand.',
      schildersmossel:
        'De vijvermossel is hoger en hoekiger; de schildersmossel is smal en langwerpig.',
    },
  },

  poelslak: {
    gecontroleerd: false,
    bron: `${OWF}, ${WIKI}`,
    herkenningOnderWater: [
      'Grote spitse slakkenhuis met een lange, puntige top.',
      'Hoornbruin en dunwandig, met een zeer wijde laatste winding.',
      'Driehoekige, platte voelsprieten.',
    ],
    gedragBijDuiker: 'Kruipt over planten en komt regelmatig naar het oppervlak om lucht te halen.',
    seizoen: 'Het hele jaar, het talrijkst in de zomer.',
    weetje: 'De poelslak ademt met een long en moet daarvoor naar het wateroppervlak.',
    onderscheid: {
      posthoornslak:
        'De poelslak heeft een spits, torenvormig huisje; de posthoornslak heeft een plat huisje ' +
        'dat als een schijf is opgerold.',
    },
  },

  posthoornslak: {
    gecontroleerd: false,
    bron: `${OWF}, ${WIKI}`,
    herkenningOnderWater: [
      'Plat huisje dat in één vlak is opgerold, als een opgerolde posthoorn.',
      'Donker hoornbruin, tot ongeveer drie centimeter breed.',
      'Draadvormige voelsprieten en vaak roodachtig lichaam.',
    ],
    gedragBijDuiker: 'Kruipt over stengels en bladeren van waterplanten.',
    seizoen: 'Het hele jaar.',
    weetje:
      'Het bloed van de posthoornslak bevat hemoglobine, waardoor het dier roodachtig oogt en ' +
      'in zuurstofarm water kan leven.',
    onderscheid: {
      poelslak:
        'De posthoornslak heeft een plat, in één vlak opgerold huisje; de poelslak heeft een ' +
        'spitse toren.',
    },
  },

  zoetwaterneriet: {
    gecontroleerd: false,
    bron: `${OWF}, ${WIKI}`,
    herkenningOnderWater: [
      'Klein halfbolvormig huisje met een zeer korte, nauwelijks zichtbare top.',
      'Een fijn patroon van lichte vlekjes of zigzaglijnen op een donkere ondergrond.',
      'Zit vastgezogen op stenen en hard substraat.',
    ],
    gedragBijDuiker: 'Zit stil op stenen en graast algen; laat zich makkelijk van dichtbij bekijken.',
    seizoen: 'Het hele jaar.',
    weetje: 'Elk huisje heeft een eigen tekening; geen twee zijn precies gelijk.',
  },

  // ---- vreemd spul ----------------------------------------------------------

  zoetwaterkwal: {
    gecontroleerd: false,
    bron: `${OWF}, ${WIKI}`,
    herkenningOnderWater: [
      'Klein doorzichtig kwalletje van ongeveer een tot twee centimeter.',
      'Vier duidelijke kanalen in een kruis in de klok.',
      'Een rand met tientallen fijne tentakels.',
    ],
    gedragBijDuiker: 'Zweeft langzaam pulserend in open water, meestal in de bovenste meters.',
    seizoen: 'Alleen in late zomer en vroege herfst, en niet elk jaar.',
    weetje:
      'Het grootste deel van het jaar bestaat deze soort als een onopvallend poliepje; ' +
      'alleen bij warm water verschijnen de kwalletjes.',
    meldenBij: 'waarneming.nl',
  },

  zoetwaterspons: {
    gecontroleerd: false,
    bron: `${OWF}, ${WIKI}`,
    herkenningOnderWater: [
      'Onregelmatige, vaak vertakte of korstvormige massa op takken, stenen en palen.',
      'Groen als er algen in leven, verder vuilwit tot geelbruin.',
      'Bezaaid met kleine gaatjes; bij aanraking bros en broodkruimelig.',
    ],
    seizoen: 'Groeit in de zomer; in de winter sterft het weefsel grotendeels af.',
    weetje: 'Het groen komt van algen die in de spons leven en hem suikers leveren.',
    onderscheid: {
      zoetwatermosdiertje:
        'De spons is bros en heeft losse gaatjes; het mosdiertje voelt glibberig en gelei-achtig ' +
        'en heeft een patroon van kleine kroontjes.',
    },
  },

  zoetwatermosdiertje: {
    gecontroleerd: false,
    bron: `${OWF}, ${WIKI}`,
    herkenningOnderWater: [
      'Gelei-achtige, langgerekte kolonie die als een rups over takken kruipt.',
      'Aan de bovenkant een regelmatig patroon van kleine tentakelkroontjes.',
      'Doorschijnend, zelden meer dan een decimeter lang.',
    ],
    seizoen: 'Vooral in de nazomer zichtbaar.',
    weetje:
      'Deze kolonie kan zich als geheel langzaam verplaatsen, wat voor een mosdiertje uitzonderlijk is.',
    onderscheid: {
      zoetwaterspons:
        'Het mosdiertje is glibberig en gelei-achtig met kleine kroontjes; de spons is bros ' +
        'met losse gaatjes.',
      'amerikaans-mosdiertje':
        'Het zoetwatermosdiertje vormt langgerekte rupsachtige kolonies; het Amerikaanse ' +
        'mosdiertje vormt grote gladde bollen.',
    },
  },

  'amerikaans-mosdiertje': {
    gecontroleerd: false,
    bron: `${OWF}, ${WIKI}`,
    herkenningOnderWater: [
      'Grote gladde geleibol, soms tot voetbalformaat, meestal om een tak of paal.',
      'Stevig en doorschijnend, met een rozetpatroon aan het oppervlak.',
      'Voelt vast en rubberachtig aan, niet bros.',
    ],
    seizoen: 'Vooral in de late zomer, wanneer de kolonies hun grootste omvang bereiken.',
    weetje: 'Deze soort komt oorspronkelijk uit Noord-Amerika en duikt in Nederland steeds vaker op.',
    meldenBij: 'waarneming.nl',
    onderscheid: {
      zoetwatermosdiertje:
        'Het Amerikaanse mosdiertje vormt grote gladde bollen; het zoetwatermosdiertje vormt ' +
        'langgerekte rupsachtige kolonies.',
      zoetwaterspons:
        'Het mosdiertje is een gladde stevige geleibol; de spons is bros en onregelmatig vertakt.',
    },
  },

  'libellenlarve-glazenmaker': {
    gecontroleerd: false,
    bron: `${OWF}, ${WIKI}`,
    herkenningOnderWater: [
      'Fors gedrongen insectenlarve met zes poten en een stevig, gedrongen achterlijf.',
      'Grote ogen en een uitklapbaar vangmasker onder de kop.',
      'Bruin tot groen gecamoufleerd; beweegt traag over planten en bodem.',
    ],
    gedragBijDuiker: 'Zit doodstil op een stengel en verplaatst zich pas als je heel dichtbij komt.',
    seizoen: 'Het hele jaar aanwezig; larven leven één tot enkele jaren onder water.',
    weetje:
      'De larve schiet zijn vangmasker in een fractie van een seconde uit om prooi te grijpen, ' +
      'en kan zich voortstuwen door water uit zijn achterlijf te persen.',
  },

  kokerjuffer: {
    gecontroleerd: false,
    bron: `${OWF}, ${WIKI}`,
    herkenningOnderWater: [
      'Rupsachtige larve in een zelfgebouwd kokertje van zandkorrels, takjes of plantendeeltjes.',
      'Alleen kop en pootjes steken uit de koker naar buiten.',
      'Het kokertje kruipt langzaam over de bodem of zit vastgehecht aan een steen.',
    ],
    gedragBijDuiker: 'Trekt zich bij verstoring volledig in de koker terug.',
    seizoen: 'Het hele jaar.',
    weetje:
      'De soort is vaak beter te herkennen aan het bouwmateriaal van de koker dan aan de larve zelf.',
  },

  paardenbloedzuiger: {
    gecontroleerd: false,
    bron: `${OWF}, ${WIKI}`,
    herkenningOnderWater: [
      'Grote afgeplatte bloedzuiger, uitgestrekt tot ongeveer tien centimeter.',
      'Donker olijfgroen tot zwart met een gelige zijrand.',
      'Zwemt met golvende bewegingen van het hele lijf.',
    ],
    gedragBijDuiker: 'Zwemt sierlijk golvend door open water of kruipt met zuignappen over de bodem.',
    seizoen: 'Vooral in de zomer.',
    weetje:
      'Ondanks de naam zuigt deze soort geen bloed bij mensen: hij eet wormen, slakken en ' +
      'insectenlarven, die hij in hun geheel doorslikt.',
  },

  bootsmannetje: {
    gecontroleerd: false,
    bron: `${OWF}, ${WIKI}`,
    herkenningOnderWater: [
      'Waterwants van ongeveer anderhalve centimeter die op zijn rug zwemt.',
      'Lange achterpoten met haren, die als roeispanen worden gebruikt.',
      'Zilverglanzende buik door een meegenomen luchtlaagje.',
    ],
    gedragBijDuiker: 'Hangt op zijn rug net onder het oppervlak en schiet bij verstoring omlaag.',
    seizoen: 'Het hele jaar, het opvallendst in de zomer.',
    weetje:
      'Het bootsmannetje zwemt ondersteboven en neemt lucht mee onder zijn vleugels, wat de ' +
      'zilveren glans veroorzaakt. Hij kan flink prikken.',
  },
};
