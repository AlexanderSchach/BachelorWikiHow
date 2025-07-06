"use client";

import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../../../lib/firebase";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Load editor
const RichTextEditor = dynamic(
  () => import("../../../components/RichTextEditor"),
  { ssr: false }
);

// Predefined categories for dropdown
const categories = [
  "Produkt- og tjenestedesign",
  "Bærekraft og miljøprosjekter",
  "Data og analyse",
  "Kommunikasjon og merkevare",
  "Forretningsutvikling",
  "Etikk",
  "Digital transformasjon",
  "Markedsanalyse og strategi",
];

// Local fallback images
const localPlaceholderImages = [
  "/guide-images/placeholder1.jpg",
  "/guide-images/placeholder2.jpg",
  "/guide-images/placeholder3.jpg",
];

// Generates a URL-safe slug from title
const generateSlug = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

// Starter content for new guides
const defaultTemplate = `
<h2>Introduksjon</h2>
<p>Skriv en kort introduksjon til guiden her.</p>

<h2>Steg-for-steg</h2>
<ul>
  <li>Første steg</li>
  <li>Andre steg</li>
  <li>Tredje steg</li>
</ul>

<h2>Tips</h2>
<blockquote>💡 Bruk dette området til å dele nyttige tips med brukeren.</blockquote>
`;

export default function CreateGuidePage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTaken, setSlugTaken] = useState(false);
  const [category, setCategory] = useState(categories[0]);
  const [description, setDescription] = useState("");
  const [content, setContent] = useState(defaultTemplate);
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // Auto-generate slug when title changes
  useEffect(() => {
    setSlug(generateSlug(title));
  }, [title]);

  // Check if the slug already exists in Firestore
  useEffect(() => {
    if (!slug) return;
    const checkSlug = async () => {
      const q = query(collection(db, "guides"), where("slug", "==", slug));
      const snapshot = await getDocs(q);
      setSlugTaken(!snapshot.empty);
    };
    checkSlug();
  }, [slug]);

  // Randomly assign a local placeholder image when category changes
  useEffect(() => {
    const randomImage =
      localPlaceholderImages[
        Math.floor(Math.random() * localPlaceholderImages.length)
      ];
    setSelectedImage(randomImage);
  }, [category]);

  // Submit form and save new guide to Firestore
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (slugTaken || !title || !description || !content) return;

    setLoading(true);

    try {
      // Generate embedding for search relevance
      const fullText = `${title}\n${description}\n${content}`;
      const embeddingRes = await fetch("/api/guides/embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: fullText }),
      });
      const { embedding } = await embeddingRes.json();

      // Save new guide to Firestore
      await addDoc(collection(db, "guides"), {
        title,
        slug,
        category,
        description,
        content,
        image: selectedImage,
        embedding,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      router.push("/admin/guides");
    } catch (err) {
      console.error("❌ Error creating guide:", err);
      alert("Noe gikk galt. Prøv igjen.");
    } finally {
      setLoading(false);
    }
  };

  // Request AI-generated content for the guide
  const generateAiContent = async (length: "short" | "long") => {
    if (!title || !description) {
      alert("Skriv inn tittel og beskrivelse først!");
      return;
    }

    setAiLoading(true);
    setContent("");

    try {
      const res = await fetch("/api/generate-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, length }),
      });

      const data = await res.json();
      setContent(data?.content || "⚠️ Kunne ikke generere innhold.");
    } catch (err) {
      console.error(err);
      setContent("🚨 Noe gikk galt med AI.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-purple-800 mb-6">
        ➕ Opprett ny guide
      </h1>

      <button
        onClick={() => router.push("/admin/guides")}
        className="mb-6 text-sm text-gray-500 hover:underline transition"
      >
        ← Tilbake til oversikt
      </button>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 bg-white p-6 rounded-xl shadow-md border border-gray-200"
      >
        {/* Title + slug display */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Tittel
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md"
          />
          {slug && (
            <p className="text-sm text-gray-500 mt-1">
              Slug:{" "}
              <code className="bg-gray-100 px-2 py-0.5 rounded">{slug}</code>
            </p>
          )}
          {slugTaken && (
            <p className="text-sm text-red-500">
              ⚠️ En guide med denne tittelen finnes allerede.
            </p>
          )}
        </div>

        {/* Category select */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Kategori
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border rounded-md"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Description input */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Beskrivelse
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-md"
          />
        </div>

        {/* AI content generation buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <button
            type="button"
            disabled={aiLoading}
            onClick={() => generateAiContent("short")}
            className="px-4 py-2 rounded-md bg-purple-100 hover:bg-purple-200 text-purple-800 text-sm transition disabled:opacity-50"
          >
            ✨ Generer med AI
          </button>
          <button
            type="button"
            disabled={aiLoading}
            onClick={() => generateAiContent("long")}
            className="px-4 py-2 rounded-md bg-purple-200 hover:bg-purple-300 text-purple-900 text-sm transition disabled:opacity-50"
          >
            🧠 Generer med AI (Lang versjon)
          </button>
          {aiLoading && (
            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1 sm:mt-0">
              <div className="animate-spin h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full" />
              Genererer innhold...
            </div>
          )}
        </div>

        {/* Main content editor */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Innhold (visuelt)
          </label>
          <RichTextEditor content={content} onChange={setContent} />
        </div>

        {/* Submit button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={slugTaken || loading}
            className={`px-6 py-2 rounded-md text-white ${
              slugTaken || loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-purple-700 hover:bg-purple-800"
            }`}
          >
            {loading ? "Lagrer..." : "Opprett guide"}
          </button>
        </div>
      </form>
    </main>
  );
}
