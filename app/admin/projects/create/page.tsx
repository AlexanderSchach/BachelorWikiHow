"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../../lib/firebase";
import dynamic from "next/dynamic";
import Link from "next/link";

// load editor
const RichTextEditor = dynamic(
  () => import("../../../components/RichTextEditor"),
  { ssr: false }
);

// Predefined categories and tags for form selection
const mainCategories = [
  "IT-prosjekter",
  "UX-prosjekter",
  "Analyser og innsikt",
  "Bærekraftige prosjekter",
];

const subCategoriesMap: Record<string, string[]> = {
  "IT-prosjekter": ["Front-end prosjekter", "Back-end prosjekter", "Databaser"],
  "UX-prosjekter": ["Brukertesting", "Prototyping", "Designsystem"],
  "Analyser og innsikt": ["Spørreundersøkelser", "Dataanalyse", "Rapportering"],
  "Bærekraftige prosjekter": ["Indikatorer", "Miljødesign", "Datainnsamling"],
};

const availableTags = [
  "Rapporter",
  "Analyse",
  "Testing",
  "Brukerreise",
  "Undersøkelser",
  "Personas",
  "Informasjonsteknologi",
  "Informasjonssikkerhet",
  "Forskning",
  "Kunstig intelligens",
  "AI",
  "Data",
  "Skoleprosjekt",
  "Miljø",
  "Backend",
  "Frontend",
  "Design",
];

// Creates a URL-friendly slug from title input
const generateSlug = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

export default function CreateProjectPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTaken, setSlugTaken] = useState(false);
  const [mainCategory, setMainCategory] = useState(mainCategories[0]);
  const [subCategory, setSubCategory] = useState(
    subCategoriesMap[mainCategories[0]][0]
  );
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  // Sync slug with title
  useEffect(() => {
    setSlug(generateSlug(title));
  }, [title]);

  // Check if generated slug already exists in Firestore
  useEffect(() => {
    const checkSlug = async () => {
      if (!slug) return setSlugTaken(false);
      const q = query(collection(db, "projects"), where("slug", "==", slug));
      const snap = await getDocs(q);
      setSlugTaken(!snap.empty);
    };
    checkSlug();
  }, [slug]);

  // Reset subcategory when main category changes
  useEffect(() => {
    setSubCategory(subCategoriesMap[mainCategory][0]);
  }, [mainCategory]);

  // Form submission to Firestore
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (slugTaken) return alert("⚠️ Slug'en er allerede brukt!");

    try {
      const fullCategory = `${mainCategory} > ${subCategory}`;
      await addDoc(collection(db, "projects"), {
        title,
        slug,
        mainCategory,
        subCategory,
        category: fullCategory,
        description,
        content,
        tags,
      });
      router.push("/admin/projects");
    } catch (err) {
      console.error(err);
      alert("🚨 Feil ved opprettelse.");
    }
  };

  // Call backend to generate template content with optional length
  const generateContent = async (length: "short" | "long") => {
    if (!title || !description) {
      alert("⚠️ Tittel og beskrivelse må fylles ut.");
      return;
    }

    setAiLoading(true);
    setContent("");

    try {
      const res = await fetch("/api/generate-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          context: `Dette er et prosjekt relatert til ${tags.join(", ")}`,
          length,
        }),
      });

      const data = await res.json();
      setContent(data?.content || "⚠️ Ingen respons fra AI.");
    } catch (error) {
      console.error("Feil ved AI-generering:", error);
      setContent("🚨 AI-generering feilet.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-purple-800 mb-2">
        ➕ Opprett nytt prosjekt
      </h1>
      <Link
        href="/admin/projects"
        className="text-sm text-gray-500 hover:underline mb-6 inline-block"
      >
        ← Tilbake til prosjekter
      </Link>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 bg-white p-6 rounded-xl shadow-md border border-gray-200"
      >
        {/* Title input + slug display */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Tittel
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md"
          />
          {slug && (
            <p className="text-sm text-gray-500 mt-1">
              Slug: <code>{slug}</code>
            </p>
          )}
          {slugTaken && (
            <p className="text-sm text-red-500">
              ⚠️ Slug'en er allerede i bruk.
            </p>
          )}
        </div>

        {/* Category selectors */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Hovedkategori
          </label>
          <select
            value={mainCategory}
            onChange={(e) => setMainCategory(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
          >
            {mainCategories.map((cat) => (
              <option key={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Underkategori
          </label>
          <select
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
          >
            {(subCategoriesMap[mainCategory] || []).map((sub) => (
              <option key={sub}>{sub}</option>
            ))}
          </select>
        </div>

        {/* Description field */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Beskrivelse
          </label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>

        {/* Tag selection */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                type="button"
                key={tag}
                className={`px-3 py-1 border rounded-full text-sm ${
                  tags.includes(tag)
                    ? "bg-purple-200 text-purple-900 border-purple-400"
                    : "bg-gray-100 text-gray-700 border-gray-300"
                }`}
                onClick={() =>
                  setTags((prev) =>
                    prev.includes(tag)
                      ? prev.filter((t) => t !== tag)
                      : [...prev, tag]
                  )
                }
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* AI generation buttons */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <button
            type="button"
            onClick={() => generateContent("short")}
            className="px-4 py-2 rounded-md bg-purple-100 hover:bg-purple-200 text-purple-800 text-sm"
            disabled={aiLoading}
          >
            ✨ Generer med AI
          </button>
          <button
            type="button"
            onClick={() => generateContent("long")}
            className="px-4 py-2 rounded-md bg-purple-200 hover:bg-purple-300 text-purple-900 text-sm"
            disabled={aiLoading}
          >
            🧠 Generer med AI (Lang versjon)
          </button>
          {aiLoading && (
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <div className="animate-spin h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full" />
              Genererer innhold...
            </div>
          )}
        </div>

        {/* Content editor */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Innhold
          </label>
          <RichTextEditor content={content} onChange={setContent} />
        </div>

        {/* Final submission */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={slugTaken}
            className={`px-6 py-2 rounded-md text-white ${
              slugTaken
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-purple-700 hover:bg-purple-800"
            }`}
          >
            Opprett prosjekt
          </button>
        </div>
      </form>
    </main>
  );
}
