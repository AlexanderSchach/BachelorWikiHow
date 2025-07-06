"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../../lib/firebase";

// Project type definition
type Project = {
  title: string;
  slug: string;
  category: string;
  description?: string;
};

// Converts text to a slug-friendly string for comparison
function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

export default function ProjectsBySubCategory() {
  const { main, sub } = useParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const mainSlug = slugify(main as string);
  const subSlug = slugify(sub as string);

  const readableMain = (main as string)?.replace(/-/g, " ");
  const readableSub = (sub as string)?.replace(/-/g, " ");

  // Fetch all projects and filter those matching the current main/sub category
  useEffect(() => {
    const fetchProjects = async () => {
      const snapshot = await getDocs(collection(db, "projects"));
      const all = snapshot.docs.map((doc) => doc.data() as Project);

      const filtered = all.filter((p) => {
        const [mainCat, subCat] = p.category.split(">").map((c) => slugify(c));
        return mainCat === mainSlug && subCat === subSlug;
      });

      setProjects(filtered);
      setLoading(false);
    };

    fetchProjects();
  }, [mainSlug, subSlug]);

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
              <Image src="/HomeGray.png" alt="Hjem" width={16} height={16} />
            </Link>
          </li>
          <li className="text-gray-500">›</li>
          <li>
            <Link href="/prosjekter" className="hover:underline text-[#93359a]">
              Prosjekter
            </Link>
          </li>
          <li className="text-gray-500">›</li>
          <li>
            <Link
              href={`/prosjekter/${mainSlug}`}
              className="hover:underline capitalize text-[#93359a]"
            >
              {readableMain}
            </Link>
          </li>
          <li className="text-gray-500">›</li>
          <li className="capitalize text-[#240943]">{readableSub}</li>
        </ol>
      </div>

      {/* Section title and description */}
      <header className="mb-10">
        <h1 className="text-[30px] font-bold font-['Domine'] text-[#93359a] capitalize mb-2">
          {readableSub}
        </h1>
        <p className="text-[16px] font-normal font-['Work Sans'] text-[#776c78] max-w-2xl">
          Utforsk alle prosjekter under underkategorien "{readableSub}".
        </p>
      </header>

      {/* Project list grid or fallback messages */}
      {loading ? (
        <p className="text-[16px] font-normal font-['Work Sans'] text-[#776c78]">
          Laster prosjekter...
        </p>
      ) : projects.length === 0 ? (
        <p className="text-[16px] font-normal font-['Work Sans'] text-[#776c78]">
          Ingen prosjekter funnet i denne underkategorien.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => (
            <Link
              key={proj.slug}
              href={`/prosjekter/${mainSlug}/${subSlug}/${proj.slug}`}
              className="flex bg-white rounded-2xl border border-purple-900 hover:shadow-md transition overflow-hidden"
            >
              <div className="w-[72px] h-full bg-[#93359a] flex items-center justify-center flex-shrink-0">
                <span className="text-white text-lg font-bold font-['Work Sans']">
                  {proj.title.slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="flex flex-col justify-center p-4">
                <h3 className="text-[16px] font-semibold text-[#240943] font-['Work Sans']">
                  {proj.title}
                </h3>
                <p className="text-[16px] font-normal text-[#776c78] mt-1 font-['Work Sans']">
                  {proj.description || "Ingen beskrivelse"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
