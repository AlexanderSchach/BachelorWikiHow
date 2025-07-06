import { db } from "../lib/firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { generateEmbedding } from "../lib/embedding";
import { marked } from "marked";

const guides = [
  {
    title: "Hvordan lage en effektiv PowerPoint-presentasjon",
    slug: "effektiv-powerpoint-presentasjon",
    description:
      "En steg-for-steg guide for å lage en profesjonell og engasjerende PowerPoint-presentasjon.",
    category: "Kommunikasjon og merkevare",
    content: `## 1. Velg et profesjonelt design

Etik non ex tincidunt Nunc eu tincidunt quis quis placerat Ut felis, lobortis, ac facilisis adipiscing vitae lacus. Nunc amet, elit elementum quis porta Donec enim. ex. nisl. ex tincidunt tincidunt leo. porta ultrices at tincidunt lobortis, amet,

dolor Donec scelerisque Donec consectetur varius at quis nibh Cras nec odio amet, cursus sodales. ullamcorper placerat. amet, odio risus Ut tortor. ipsum Quisque Nunc volutpat est. Nam ultrices eget eu sollicitudin. Donec odio diam ex Nam

> 💡 *Tips: Bruk nøytrale bakgrunner og lette farger for tekst, og sørg for at designet er konsekvent gjennom hele presentasjonen.*

## 2. Strukturér innholdet

Etik non ex tincidunt Nunc eu tincidunt quis quis placerat Ut felis, lobortis, ac facilisis adipiscing vitae lacus. Nunc amet, elit elementum quis porta Donec enim. ex. nisl. ex tincidunt tincidunt leo. porta ultrices at tincidunt lobortis, amet,

### Eksempel:

- Introduksjon
- Hoveddel
- Konklusjon

![Eksempelillustrasjon](/example-image.png)

Etik non ex tincidunt Nunc eu tincidunt quis quis placerat Ut felis, lobortis, ac facilisis adipiscing vitae lacus. Nunc amet, elit elementum quis porta Donec enim. ex. nisl. ex tincidunt tincidunt leo. porta ultrices at tincidunt lobortis, amet,

> **PowerPoint:** En oversikt med moduler du kan enkelt søke opp & presentasjon  
> ⏱️ 2 min lest

## 3. Bruk bilder og visualiseringer

Bilder, diagrammer og grafer gjør informasjonen mer tilgjengelig og minneverdig. Sørg for at visualiseringene er relevante for innholdet og at det er kvalitet, ikke kvantitet, som prioriteres.

> 💡 *Tips: Bruk bilder der det er nødvendig, og diagrammer som kan være nyttige for å forklare data på en enkel måte.*

## 4. Enkle animasjoner og overganger

Animasjoner og overganger kan hjelpe med å fremheve informasjon, men bør brukes varsomt. Bruk enkle fade-effekter og unngå overdreven bevegelse. Dette kan distrahere publikum – “hold det rent”.

## 5. Øv på presentasjonen

Å øve hjelper deg å forbedre presentasjonen. Dette gir deg trygghet og hjelper deg å holde deg til tiden. Test også teknisk utstyr og presentasjonsmodus i god tid før fremføring.`,
  },
  {
    title: "Hvordan lage wireframes",
    slug: "lage-wireframes",
    description: "En steg-for-steg guide for wireframing i produktdesign.",
    category: "Produkt- og tjenestedesign",
    content: `## Hva er en wireframe?

Wireframes er grunnleggende skisser av en nettside eller app. De hjelper deg med å planlegge layout og struktur uten distraksjon fra farger eller detaljer.

### Verktøy du kan bruke

- Figma
- Balsamiq
- Pen og papir

> Husk: Det viktigste er funksjon, ikke form!

### Neste steg

Etter wireframes går du gjerne videre til prototyping og testing.`,
  },
  {
    title: "Hvordan skrive en god spørreundersøkelse",
    slug: "sporreundersokelse-guide",
    description: "Tips og triks for å lage effektive spørreundersøkelser.",
    category: "Data og analyse",
    content: `## Hva gjør en undersøkelse god?

1. Ha et klart mål
2. Still én ting om gangen per spørsmål
3. Bruk skalaer konsekvent
4. Test på et par personer før du sender

### Eksempel

> *"Hvor fornøyd er du med produktet?"*  
Skala fra 1 til 5.

Unngå ledende spørsmål som:  
*"Hvor bra synes du dette produktet er?"*`,
  },
  {
    title: "Hva er GDPR og hvorfor er det viktig?",
    slug: "gdpr-personvern",
    description:
      "Alt du trenger å vite om personvern og etikk i datahåndtering.",
    category: "Etikk",
    content: `## GDPR kort forklart

GDPR er EUs personvernforordning som gir brukere kontroll over egne data.

### Viktige prinsipper

- Samtykke må være frivillig og tydelig
- Dataminimering: ikke samle mer enn nødvendig
- Brukeren har rett til innsyn og sletting

> Brudd på GDPR kan gi store bøter.`,
  },
  {
    title: "Skissering og prototyping for nye tjenester",
    slug: "skissering-prototyping",
    description: "Bruk skisser og prototyper for å teste ideer raskt.",
    category: "Produkt- og tjenestedesign",
    content: `## Hvorfor skissere?

Skisser hjelper deg å tenke visuelt og dele idéer med andre.

## Prototyping

En prototype er en enkel versjon av produktet, enten digitalt eller fysisk.

Verktøy:
- Figma
- Marvel
- PowerPoint (ja faktisk!)

### Tips

- Fail fast: test tidlig, lær fort.
- Ikke vær redd for å tegne dårlig.`,
  },
  {
    title: "Digital transformasjon i praksis",
    slug: "digital-transformasjon",
    description: "Hvordan bedrifter kan modernisere seg gjennom teknologi.",
    category: "Digital transformasjon",
    content: `## Hva er digital transformasjon?

Det handler om å endre måten man jobber på — med hjelp av teknologi.

### Eksempler

- Fra manuell kundeservice til chatbot
- Automatisering av regnskap
- Bruke data for beslutninger

### Risikoer

- Krever endringsledelse
- Ikke bare “kjøp et nytt system” – det handler om mennesker.`,
  },
  {
    title: "Grunnprinsipper for bærekraftige prosjekter",
    slug: "baerekraftige-prosjekter",
    description: "Hvordan integrere bærekraft i prosjektarbeid.",
    category: "Bærekraft og miljøprosjekter",
    content: `## Bærekraft = mer enn miljø

FN definerer bærekraft som balanse mellom miljø, sosialt og økonomisk.

### I praksis

- Velg miljøvennlige leverandører
- Tenk livssykluskostnad
- Planlegg for gjenbruk og resirkulering

> Bærekraft er også god business.`,
  },
  {
    title: "Lag en markedsstrategi fra bunnen av",
    slug: "markedsstrategi-nybegynner",
    description: "Fra målgruppe til kanaler og budskap – alt du trenger.",
    category: "Markedsanalyse og strategi",
    content: `## Før du begynner

1. Hvem er målgruppen?
2. Hvilket problem løser du?
3. Hva er verdiforslaget ditt?

### Kanaler

- Sosiale medier
- E-post
- Events

Lag budskap som snakker direkte til målgruppen din.`,
  },
  {
    title: "Brukerreise og touchpoints forklart",
    slug: "brukerreise-touchpoints",
    description: "Kartlegg kundereisen og forbedre opplevelsen.",
    category: "Kommunikasjon og merkevare",
    content: `## Hva er en brukerreise?

Det er hele opplevelsen en person har med din tjeneste, fra start til slutt.

### Touchpoints

- Første møte (f.eks. nettside)
- Bruk (f.eks. support)
- Etterpå (e-post, lojalitet)

Lag en brukerreise-kart og finn forbedringsområder.`,
  },
  {
    title: "Fra idé til forretningsmodell",
    slug: "forretningsutvikling-idetilmodell",
    description: "Hvordan du går fra idé til faktisk verdi for brukere.",
    category: "Forretningsutvikling",
    content: `## Start med problemet

- Hva sliter folk med?
- Finn ett klart behov

### Så bygg løsningen

1. Lag en “value proposition”
2. Velg målgruppe
3. Velg kanal

Bruk f.eks. Business Model Canvas.`,
  },
  {
    title: "Hvordan bruke data til innsikt",
    slug: "data-analyse-innsikt",
    description: "Fra rådata til beslutningsgrunnlag – steg for steg.",
    category: "Data og analyse",
    content: `## Data er kun nyttig med kontekst

### Få innsikt slik:

1. Samle data fra riktige kilder
2. Visualiser i dashboards (eks. Looker)
3. Tolk og del funn

> Husk: Ikke alt som kan måles er viktig.`,
  },
];

async function seedGuides() {
  const guidesCollection = collection(db, "guides");

  for (const guide of guides) {
    const existing = await getDocs(
      query(guidesCollection, where("slug", "==", guide.slug))
    );
    if (!existing.empty) {
      console.warn(`⚠️ Skipping existing guide: ${guide.slug}`);
      continue;
    }

    const fullText = `${guide.title}\n${guide.description}\n${guide.content}`;
    const embedding = await generateEmbedding(fullText);

    const htmlContent = marked(guide.content);

    await addDoc(guidesCollection, {
      ...guide,
      content: htmlContent,
      embedding,
    });

    console.log(`✅ Added guide with embedding: ${guide.title}`);
  }

  console.log("🎉 All guides seeded!");
}

seedGuides()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Error seeding guides:", err);
    process.exit(1);
  });

// npx tsx scripts/seedGuides.ts to run
