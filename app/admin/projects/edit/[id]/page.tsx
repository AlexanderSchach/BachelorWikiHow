"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "../../../../../lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import dynamic from "next/dynamic";
import Link from "next/link";

// Dynamically import the rich text editor
const RichTextEditor = dynamic(
  () => import("../../../../components/RichTextEditor"),
  { ssr: false }
);

// Defined categories and tag options
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

// Create a clean, URL-safe slug from a title
const generateSlug = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

export default function EditProjectPage() {
  const { id } = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [mainCategory, setMainCategory] = useState(mainCategories[0]);
  const [subCategory, setSubCategory] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  // Fetch project data when the page loads
  useEffect(() => {
    const fetchProject = async () => {
      if (!id || typeof id !== "string") return;

      const ref = doc(db, "projects", id);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();

        setTitle(data.title);
        setSlug(data.slug);

        // Validate main category
        const validMain = mainCategories.includes(data.mainCategory)
          ? data.mainCategory
          : mainCategories[0];
        setMainCategory(validMain);

        // Validate subcategory
        const subList = subCategoriesMap[validMain] || [];
        const validSub = subList.includes(data.subCategory)
          ? data.subCategory
          : subList[0];
        setSubCategory(validSub);

        setDescription(data.description || "");
        setContent(data.content || "");
        setTags(data.tags || []);
      }

      setLoading(false);
    };

    fetchProject();
  }, [id]);

  // Keep slug synced with title
  useEffect(() => {
    if (title) setSlug(generateSlug(title));
  }, [title]);

  // Submit updated project to Firestore
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || typeof id !== "string") return;

    const fullCategory = `${mainCategory} > ${subCategory}`;

    try {
      await updateDoc(doc(db, "projects", id), {
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
    } catch (error) {
      console.error("Oppdatering feilet:", error);
      alert("🚨 Kunne ikke oppdatere prosjektet.");
    }
  };

  if (loading) return <main className="p-6">Laster prosjekt...</main>;

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-purple-800 mb-2">
        ✏️ Rediger prosjekt
      </h1>
      <Link
        href="/admin/projects"
        className="text-sm text-gray-500 hover:underline mb-6 inline-block"
      >
        ← Tilbake til prosjekter
      </Link>

      <form
        onSubmit={handleUpdate}
        className="space-y-5 bg-white p-6 rounded-xl shadow-md border border-gray-200"
      >
        {/* Title input */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Tittel
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setSlug(generateSlug(e.target.value));
            }}
            required
            className="w-full px-4 py-2 border rounded-md"
          />
          <p className="text-sm text-gray-500 mt-1">
            Slug: <code>{slug}</code>
          </p>
        </div>

        {/* Main category selector */}
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

        {/* Subcategory selector */}
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

        {/* Description */}
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

        {/* Tag selector */}
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

        {/* Rich text editor for content */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Innhold
          </label>
          <RichTextEditor content={content} onChange={setContent} />
        </div>

        {/* Submit button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2 rounded-md text-white bg-purple-700 hover:bg-purple-800 transition"
          >
            Oppdater prosjekt
          </button>
        </div>
      </form>
    </main>
  );
}
