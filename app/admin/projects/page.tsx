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

interface Project {
  id: string;
  title: string;
  slug: string;
  category: string;
  createdAt?: Timestamp;
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Alle");
  const [sortBy, setSortBy] = useState("newest");

  // Load all projects on initial mount
  useEffect(() => {
    const fetchProjects = async () => {
      const snapshot = await getDocs(collection(db, "projects"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Project[];
      setProjects(data);
    };
    fetchProjects();
  }, []);

  // Delete a project by ID with user confirmation
  const handleDelete = async (id: string) => {
    const project = projects.find((p) => p.id === id);
    if (!project) return;

    if (confirm(`Slett prosjektet "${project.title}"?`)) {
      try {
        await deleteDoc(doc(db, "projects", id));
        setProjects((prev) => prev.filter((p) => p.id !== id));
        alert("✅ Prosjekt slettet.");
      } catch (error) {
        console.error("Feil under sletting:", error);
        alert("❌ Klarte ikke å slette prosjektet.");
      }
    }
  };

  // Get list of unique categories for filtering
  const uniqueCategories = Array.from(
    new Set(projects.map((p) => p.category))
  ).sort();

  // Apply search, category filter, and sort logic
  const filtered = projects
    .filter((p) => {
      const matchesTitle = p.title.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "Alle" || p.category === category;
      return matchesTitle && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
      }
      return a.title.localeCompare(b.title);
    });

  return (
    <main className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-purple-800">📁 Prosjekter</h1>
        <Link href="/admin" className="text-sm text-gray-500 hover:underline">
          ← Tilbake til admin
        </Link>
      </div>

      {/* Filters */}
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

      {/* New project button */}
      <div className="mb-6">
        <Link
          href="/admin/projects/create"
          className="inline-block px-4 py-2 rounded-md bg-purple-700 text-white text-sm hover:bg-purple-800 transition"
        >
          ➕ Opprett nytt prosjekt
        </Link>
      </div>

      {/* Results list */}
      {filtered.length === 0 ? (
        <p className="text-sm text-gray-600 italic">Ingen prosjekter funnet.</p>
      ) : (
        <ul className="grid gap-4">
          {filtered.map((project) => (
            <li
              key={project.id}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-semibold text-purple-900">
                    {project.title}
                  </h2>
                  <p className="text-sm text-gray-600">{project.category}</p>
                </div>
                <div className="flex gap-4 text-sm mt-1">
                  <Link
                    href={`/admin/projects/edit/${project.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    ✏️ Rediger
                  </Link>
                  <button
                    onClick={() => handleDelete(project.id)}
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
