"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import CategorySidebar from "../components/CategorySidebar";

// Guide type definition
type Guide = {
  title: string;
  slug: string;
  category: string;
  description?: string;
  content: string;
};

const GuidesPage = () => {
  const [guidesByCategory, setGuidesByCategory] = useState<
    Record<string, Guide[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Alle");
  const [isMobile, setIsMobile] = useState(false);

  // Fetch guides from Firestore and group by category
  useEffect(() => {
    const fetchGuides = async () => {
      const snapshot = await getDocs(collection(db, "guides"));
      const data = snapshot.docs.map((doc) => doc.data() as Guide);

      const grouped: Record<string, Guide[]> = {};
      data.forEach((guide) => {
        const cat = guide.category || "Uten kategori";
        (grouped[cat] ||= []).push(guide);
      });

      setGuidesByCategory(grouped);
      setLoading(false);
    };

    fetchGuides();
  }, []);

  // Detect mobile view for conditional rendering
  useEffect(() => {
    const checkWidth = () => setIsMobile(window.innerWidth < 1024);
    checkWidth();
    window.addEventListener("resize", checkWidth);
    return () => window.removeEventListener("resize", checkWidth);
  }, []);

  const categories = Object.keys(guidesByCategory);

  // Filter categories on mobile if a specific one is selected
  const filteredCategories =
    activeCategory === "Alle" || !isMobile
      ? categories
      : categories.filter((c) => c === activeCategory);

  if (loading) {
    return (
      <main className="px-6 py-10 max-w-screen-xl">
        <p className="text-[16px] font-normal font-['Work Sans'] text-[#776c78]">
          Laster guider...
        </p>
      </main>
    );
  }

  return (
    <div className="flex max-w-screen-2xl mx-auto">
      {/* Sidebar with category links */}
      <CategorySidebar
        categories={categories}
        activeId={activeCategory === "Alle" ? "" : activeCategory}
        scrollable={true}
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
            <li className="font-medium text-[#93359a]">Guides</li>
          </ol>
        </div>

        {/* Page header */}
        <header className="mb-4">
          <h1 className="text-[30px] font-bold font-['Domine'] text-[#93359a] mb-2">
            Guides
          </h1>
          <p className="text-[16px] font-normal font-['Work Sans'] text-[#776c78] max-w-2xl mb-6">
            En oversikt over forskjellige guides som skal gi deg en oversikt
            over administrative prosesser og “best-practices” rundt
            profesjonelle prosjekter.
          </p>

          {/* Mobile category selector */}
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

        {/* List guides by category */}
        {filteredCategories.map((category) => (
          <section
            key={category}
            id={category.toLowerCase().replace(/\s+/g, "-")}
            className="mb-14 scroll-mt-28"
          >
            <h2 className="text-[24px] font-bold font-['Domine'] text-[#93359a] mb-6">
              {category}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {guidesByCategory[category].map((guide) => (
                <Link
                  key={guide.slug}
                  href={`/guide/${guide.slug}`}
                  className="flex bg-white rounded-2xl border border-purple-900 transition hover:shadow-md overflow-hidden"
                >
                  <div className="w-[72px] h-full bg-[#93359a] flex items-center justify-center flex-shrink-0">
                    <Image
                      src="/WhiteBook.png"
                      alt="Guide Icon"
                      width={32}
                      height={32}
                    />
                  </div>
                  <div className="flex flex-col justify-center p-4">
                    <h3 className="text-[16px] font-semibold text-[#240943] font-['Work Sans']">
                      {guide.title}
                    </h3>
                    <p className="text-[16px] font-normal font-['Work Sans'] text-[#776c78] mt-1">
                      {guide.description || "Ingen beskrivelse"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default GuidesPage;
