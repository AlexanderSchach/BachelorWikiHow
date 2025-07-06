"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "../../../../../lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import dynamic from "next/dynamic";
import Link from "next/link";

// Load RichTextEditor
const RichTextEditor = dynamic(
  () => import("../../../../components/RichTextEditor"),
  { ssr: false }
);

// Categories available for selection
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

export default function EditGuidePage() {
  const { id } = useParams();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load existing guide data
  useEffect(() => {
    const fetchGuide = async () => {
      if (!id || typeof id !== "string") return;

      const docRef = doc(db, "guides", id);
      const snap = await getDoc(docRef);

      if (snap.exists()) {
        const data = snap.data();
        setTitle(data.title);
        setSlug(data.slug);
        setCategory(data.category);
        setDescription(data.description);
        setContent(data.content);
      }

      setLoading(false);
    };

    fetchGuide();
  }, [id]);

  // Submit updated data to Firestore + send to embedding API
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || typeof id !== "string") return;

    setSaving(true);

    try {
      const fullText = `${title}\n${description}\n${content}`;

      // Generate embedding from full content
      const embeddingRes = await fetch("/api/guides/embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: fullText }),
      });

      const { embedding } = await embeddingRes.json();

      // Save updated guide with new embedding
      await updateDoc(doc(db, "guides", id), {
        title,
        slug,
        category,
        description,
        content,
        embedding,
        updatedAt: serverTimestamp(),
      });

      router.push("/admin/guides");
    } catch (err) {
      console.error("❌ Error updating guide:", err);
      alert("Noe gikk galt under lagring.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <main className="p-6">Laster inn...</main>;

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-purple-800 mb-2">
        ✏️ Rediger guide
      </h1>

      <Link
        href="/admin/guides"
        className="text-sm text-gray-500 hover:underline mb-6 inline-block"
      >
        ← Tilbake til oversikt
      </Link>

      <form
        onSubmit={handleUpdate}
        className="space-y-5 bg-white p-6 rounded-xl shadow-md border border-gray-200"
      >
        {/* Title and slug (auto-generated from title) */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Tittel
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setSlug(
                e.target.value
                  .toLowerCase()
                  .replace(/[^\w\s-]/g, "")
                  .replace(/\s+/g, "-")
              );
            }}
            required
            className="w-full px-4 py-2 border rounded-md"
          />
          <p className="text-sm text-gray-500 mt-1">
            Slug:{" "}
            <code className="bg-gray-100 px-2 py-0.5 rounded">{slug}</code>
          </p>
        </div>

        {/* Category selection */}
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

        {/* Description field */}
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

        {/* Main content editor */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Innhold
          </label>
          <RichTextEditor content={content} onChange={setContent} />
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 rounded-md text-white bg-purple-700 hover:bg-purple-800 transition disabled:opacity-60"
          >
            {saving ? "Lagrer..." : "Oppdater guide"}
          </button>
        </div>
      </form>
    </main>
  );
}
