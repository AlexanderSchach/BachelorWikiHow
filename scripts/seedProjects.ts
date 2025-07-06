import { db } from "../lib/firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { generateEmbedding } from "../lib/embedding";
import { marked } from "marked";

const projects = [
  {
    title: "Redesign av internportal",
    slug: "internportal-redesign",
    description:
      "Et prosjekt for å forbedre brukeropplevelsen i en internportal for ansatte.",
    category: "UX-prosjekter",
    content: `## Om prosjektet

Dette prosjektet hadde som mål å redesigne en digital internportal brukt av ansatte for å finne ressurser, nyheter og verktøy.

### Prosess

- Kartla eksisterende brukerreise
- Gjennomførte intervjuer og spørreundersøkelser
- Laget prototyper i Figma

> 💡 Resultatet ble en ny struktur, raskere navigasjon og høyere tilfredshet.

## Teknologier brukt

- Figma
- Google Forms
- Notion for dokumentasjon

## Neste steg

Etter lansering skal vi følge opp med en ny undersøkelse og evaluering etter 3 måneder.`,
  },
  {
    title: "Pilotprosjekt med bærekraftsindikatorer",
    slug: "baerekraft-indikatorer-pilot",
    description:
      "Et pilotprosjekt for å teste visuelle indikatorer på bærekraft.",
    category: "Bærekraftige prosjekter",
    content: `## Hva gjorde vi?

Vi samarbeidet med tre organisasjoner for å teste hvordan fargekoding og symboler kunne hjelpe brukere forstå miljøpåvirkning av produkter.

### Metode

- Utviklet indikatorer basert på Svanemerket og EU's taksonomi
- Brukertestet prototype med 15 personer

> 🔍 Vi fant at brukerne foretrakk enkle fargekoder fremfor tekstbaserte vurderinger.

## Verktøy

- Adobe XD
- Maze for testing
- Google Sheets for datainnsamling`,
  },
];

async function seedProjects() {
  const projectsCollection = collection(db, "projects");

  for (const project of projects) {
    const existing = await getDocs(
      query(projectsCollection, where("slug", "==", project.slug))
    );
    if (!existing.empty) {
      console.warn(`⚠️ Skipping existing project: ${project.slug}`);
      continue;
    }

    const fullText = `${project.title}\n${project.description}\n${project.content}`;
    const embedding = await generateEmbedding(fullText);
    const htmlContent = marked(project.content);

    await addDoc(projectsCollection, {
      ...project,
      content: htmlContent,
      embedding,
    });

    console.log(`✅ Added project with embedding: ${project.title}`);
  }

  console.log("🎉 All projects seeded!");
}

seedProjects()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Error seeding projects:", err);
    process.exit(1);
  });
