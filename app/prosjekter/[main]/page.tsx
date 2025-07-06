"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useFilterContext } from "../../context/FilterContext";

// Type definition for project items
type Project = {
  title: string;
  slug: string;
  category: string;
  description?: string;
  mainCategory: string;
  subCategory: string;
  tags?: string[];
};

// Utility to convert string to URL-friendly slug
function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

// Predefined tag list for filtering
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

export default function ProjectsByMainCategory() {
  const { main } = useParams();
  const { selectedTags, setSelectedTags } = useFilterContext();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [tempTags, setTempTags] = useState<string[]>([]);

  const mainSlug = slugify(main as string);
  const mainLabel = (main as string)?.replace(/-/g, " ");

  // Fetch all projects and filter by selected main category
  useEffect(() => {
    const fetchProjects = async () => {
      const snapshot = await getDocs(collection(db, "projects"));
      const all = snapshot.docs.map((doc) => doc.data() as Project);
      const filtered = all.filter((p) => slugify(p.mainCategory) === mainSlug);
      setProjects(filtered);
      setLoading(false);
    };

    fetchProjects();
  }, [mainSlug]);

  // Apply tag filtering if tags are selected
  const filteredProjects = selectedTags.length
    ? projects.filter((p) => p.tags?.some((tag) => selectedTags.includes(tag)))
    : projects;

  // Group projects by subcategory
  const subCategoryMap: Record<string, Project[]> = {};
  filteredProjects.forEach((proj) => {
    if (!subCategoryMap[proj.subCategory]) {
      subCategoryMap[proj.subCategory] = [];
    }
    subCategoryMap[proj.subCategory].push(proj);
  });

  // Tag toggle helpers
  const toggleTempTag = (tag: string) => {
    setTempTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const removeSelectedTag = (tag: string) => {
    setSelectedTags(selectedTags.filter((t) => t !== tag));
  };

  return (
    <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-10">
      {/* Breadcrumb navigation */}
      <div className="text-sm text-purple-700 mb-6">
        <ol className="flex items-center gap-2">
          <li>
            <Link
              href="/"
              className="inline-flex items-center gap-1 hover:underline"
            >
              <Image src="/HomeGray.png" alt="Home" width={16} height={16} />
            </Link>
          </li>
          <li className="text-gray-500">›</li>
          <li>
            <Link href="/prosjekter" className="hover:underline text-[#93359a]">
              Prosjekter
            </Link>
          </li>
          <li className="text-gray-500">›</li>
          <li className="capitalize text-[#240943]">{mainLabel}</li>
        </ol>
      </div>

      {/* Page title and intro */}
      <header className="mb-10">
        <h1 className="text-[30px] font-bold font-['Domine'] text-[#93359a] capitalize mb-2">
          {mainLabel}
        </h1>
        <p className="text-[16px] font-normal font-['Work Sans'] text-[#776c78] max-w-2xl">
          Se alle prosjekter i kategorien "{mainLabel}" gruppert etter
          underkategori.
        </p>
      </header>

      {/* Filter trigger button */}
      <div className="mb-4">
        <button
          onClick={() => {
            setTempTags(selectedTags);
            setModalOpen(true);
          }}
          className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2"
        >
          <Image src="/icons/filter.png" alt="Filtrer" width={16} height={16} />
          Filtrer
        </button>
      </div>

      {/* Selected tags display */}
      {selectedTags.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="bg-pink-200 text-black px-3 py-1 rounded-full text-sm flex items-center gap-2"
            >
              {tag}
              <button
                onClick={() => removeSelectedTag(tag)}
                className="hover:text-red-600"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Filter modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 backdrop-blur-sm bg-white/30 flex items-center justify-center">
          <div className="bg-[#6e5a78] text-white p-8 rounded-xl max-w-2xl w-full relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-white text-xl font-bold"
              aria-label="Close"
            >
              ×
            </button>

            <h2 className="text-xl mb-4">Filtrer</h2>

            <div className="mb-6 flex flex-wrap gap-2">
              {tempTags.map((tag) => (
                <span
                  key={tag}
                  className="bg-pink-300 text-black px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {tag}
                  <button onClick={() => toggleTempTag(tag)}>✕</button>
                </span>
              ))}
            </div>

            <hr className="border-gray-400 my-4" />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTempTag(tag)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    tempTags.includes(tag)
                      ? "bg-pink-400 text-black"
                      : "bg-pink-200 text-black"
                  }`}
                >
                  {tag} {tempTags.includes(tag) ? "✕" : "＋"}
                </button>
              ))}
            </div>

            <div className="text-right">
              <button
                className="bg-purple-500 hover:bg-purple-600 px-5 py-2 rounded-full text-white"
                onClick={() => {
                  setSelectedTags(tempTags);
                  setModalOpen(false);
                }}
              >
                Filtrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project output */}
      {loading ? (
        <p className="text-[#776c78] font-['Work Sans']">
          Laster prosjekter...
        </p>
      ) : filteredProjects.length === 0 ? (
        <p className="text-[#776c78] font-['Work Sans']">
          Ingen prosjekter funnet i denne kategorien.
        </p>
      ) : (
        Object.entries(subCategoryMap).map(([sub, items]) => (
          <section key={sub} className="mb-14 scroll-mt-28">
            <Link href={`/prosjekter/${mainSlug}/${slugify(sub)}`}>
              <h2 className="text-[24px] font-bold font-['Domine'] text-[#93359a] mb-6 hover:underline transition">
                {sub}
              </h2>
            </Link>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((proj) => (
                <Link
                  key={proj.slug}
                  href={`/prosjekter/${mainSlug}/${slugify(proj.subCategory)}/${
                    proj.slug
                  }`}
                  className="flex bg-white rounded-2xl border border-purple-900 hover:shadow-md transition overflow-hidden"
                >
                  <div className="w-[72px] h-full bg-[#93359a] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-lg font-bold font-['Work Sans']">
                      {proj.title.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex flex-col justify-between p-4">
                    <div>
                      <h3 className="text-[16px] font-semibold text-[#240943] font-['Work Sans']">
                        {proj.title}
                      </h3>
                      <p className="text-[16px] font-normal text-[#776c78] mt-1 font-['Work Sans']">
                        {proj.description || "Ingen beskrivelse"}
                      </p>
                    </div>
                    {proj.tags && proj.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {proj.tags.slice(0, 3).map((tag) => (
                          <span
                            key={`${proj.slug}-${tag}`}
                            className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))
      )}
    </main>
  );
}
