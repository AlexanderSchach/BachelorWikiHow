"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import CategorySidebar from "../components/CategorySidebar";

// Type definitions
type Project = {
  title: string;
  slug: string;
  category: string; // Format: "Main > Sub"
};

type CategoryMap = Record<string, string[]>;

// Utility to create URL-friendly slugs from text
function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

export default function ProjectsPage() {
  const [categoryMap, setCategoryMap] = useState<CategoryMap>({});
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Alle");
  const [isMobile, setIsMobile] = useState(false);

  // Fetch all projects and organize them into main > sub category structure
  useEffect(() => {
    const fetchProjects = async () => {
      const snapshot = await getDocs(collection(db, "projects"));
      const data: Project[] = snapshot.docs.map((doc) => doc.data() as Project);

      const map: CategoryMap = {};
      data.forEach((proj) => {
        const [main, sub] = proj.category.split(">").map((c) => c.trim());
        if (!main || !sub) return;
        if (!map[main]) map[main] = [];
        if (!map[main].includes(sub)) map[main].push(sub);
      });

      setCategoryMap(map);
      setLoading(false);
    };

    fetchProjects();
  }, []);

  // Track whether the screen is mobile-size (used for filtering)
  useEffect(() => {
    const updateMobileState = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    updateMobileState();
    window.addEventListener("resize", updateMobileState);
    return () => window.removeEventListener("resize", updateMobileState);
  }, []);

  const categories = Object.keys(categoryMap);
  const filteredCategories =
    activeCategory === "Alle" || !isMobile
      ? categories
      : categories.filter((c) => c === activeCategory);

  // Loading state while fetching data
  if (loading) {
    return (
      <main className="px-6 py-10 max-w-screen-xl">
        <p className="text-[16px] font-normal font-['Work Sans'] text-[#776c78]">
          Laster prosjekter...
        </p>
      </main>
    );
  }

  return (
    <div className="flex max-w-screen-2xl mx-auto">
      {/* Left sidebar for category navigation */}
      <CategorySidebar
        categories={categories}
        activeId={activeCategory === "Alle" ? "" : activeCategory}
        scrollable={false}
      />

      {/* Main content area */}
      <div className="flex-1 px-4 sm:px-6 py-6 lg:ml-[240px]">
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
            <li className="font-medium text-[#93359a]">Prosjekter</li>
          </ol>
        </div>

        {/* Page title and description */}
        <header className="mb-4">
          <h1 className="text-[30px] font-bold font-['Domine'] text-[#93359a] mb-2">
            Prosjekter
          </h1>
          <p className="text-[16px] font-normal font-['Work Sans'] text-[#776c78] max-w-2xl mb-6">
            Velg en prosjektkategori og underkategori for å se relevante caser
            og eksempler.
          </p>

          {/* Mobile-only dropdown filter */}
          <div className="mb-6 block lg:hidden">
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm text-gray-800"
            >
              <option value="Alle">Alle kategorier</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </header>

        {/* Render each main category and its subcategories as cards */}
        {filteredCategories.map((main) => {
          const mainSlug = slugify(main);
          const subs = categoryMap[main];

          return (
            <section key={main} id={mainSlug} className="mb-14 scroll-mt-28">
              <Link href={`/prosjekter/${mainSlug}`}>
                <h2 className="text-[24px] font-bold font-['Domine'] text-[#93359a] mb-6 hover:underline transition">
                  {main}
                </h2>
              </Link>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {subs.map((sub) => (
                  <Link
                    key={sub}
                    href={`/prosjekter/${mainSlug}/${slugify(sub)}`}
                    className="flex bg-white rounded-2xl border border-purple-900 transition hover:shadow-md overflow-hidden"
                  >
                    {/* Icon panel */}
                    <div className="w-[72px] h-full bg-[#93359a] flex items-center justify-center flex-shrink-0">
                      <Image
                        src="/WhiteBook.png"
                        alt="Prosjekt"
                        width={32}
                        height={32}
                      />
                    </div>

                    {/* Subcategory info */}
                    <div className="flex flex-col justify-center p-4">
                      <h3 className="text-[16px] font-semibold text-[#240943] font-['Work Sans']">
                        {sub}
                      </h3>
                      <p className="text-[16px] font-normal text-[#776c78] mt-1 font-['Work Sans']">
                        Gå til prosjekter innen {sub}.
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
