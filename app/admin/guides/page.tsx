"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../../lib/firebase";

interface Guide {
  id: string;
  title: string;
  slug: string;
  category: string;
  createdAt?: Timestamp;
}

export default function AdminGuidesPage() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Alle");
  const [sortBy, setSortBy] = useState("newest");

  // Fetch all guides from Firestore on page load
  useEffect(() => {
    const fetchGuides = async () => {
      const snapshot = await getDocs(collection(db, "guides"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Guide[];
      setGuides(data);
    };
    fetchGuides();
  }, []);

  // Handle guide deletion with confirmation prompt
  const handleDelete = async (id: string) => {
    const guide = guides.find((g) => g.id === id);
    if (!guide) return;

    if (confirm(`Slett "${guide.title}"?`)) {
      await deleteDoc(doc(db, "guides", id));
      setGuides((prev) => prev.filter((g) => g.id !== id));
      alert("Guide slettet.");
    }
  };

  // Get unique categories for filtering dropdown
  const uniqueCategories = Array.from(new Set(guides.map((g) => g.category)));

  // Apply search, category filter, and sorting
  const filtered = guides
    .filter(
      (g) =>
        g.title.toLowerCase().includes(search.toLowerCase()) &&
        (category === "Alle" || g.category === category)
    )
    .sort((a, b) => {
      if (sortBy === "newest") {
        return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
      } else {
        return a.title.localeCompare(b.title);
      }
    });

  return (
    <main className="p-6 max-w-5xl mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-purple-800">📚 Guider</h1>
        <Link href="/admin" className="text-sm text-gray-500 hover:underline">
          ← Tilbake til admin
        </Link>
      </div>

      {/* Filters: search, category, sorting */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          type="text"
          placeholder="🔍 Søk etter tittel..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 border rounded-md w-full sm:w-64"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2 border rounded-md w-full sm:w-48"
        >
          <option value="Alle">🗂️ Alle kategorier</option>
          {uniqueCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border rounded-md w-full sm:w-48"
        >
          <option value="newest">⬇️ Nyeste først</option>
          <option value="title">🔤 A–Å</option>
        </select>
      </div>

      {/* Create button */}
      <div className="mb-6">
        <Link
          href="/admin/guides/create"
          className="inline-block px-4 py-2 rounded-md bg-purple-700 text-white text-sm hover:bg-purple-800 transition"
        >
          ➕ Opprett ny guide
        </Link>
      </div>

      {/* Guide list or empty message */}
      {filtered.length === 0 ? (
        <p className="text-gray-600 text-sm italic">Ingen guider funnet.</p>
      ) : (
        <ul className="grid gap-4">
          {filtered.map((guide) => (
            <li
              key={guide.id}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold text-purple-900">
                    {guide.title}
                  </h2>
                  <p className="text-sm text-gray-600">{guide.category}</p>
                </div>
                <div className="flex gap-4 text-sm mt-1">
                  <Link
                    href={`/admin/guides/edit/${guide.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    ✏️ Rediger
                  </Link>
                  <button
                    onClick={() => handleDelete(guide.id)}
                    className="text-red-500 hover:underline"
                  >
                    🗑️ Slett
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
