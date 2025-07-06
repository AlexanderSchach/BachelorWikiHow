"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../../../lib/firebase";
import FeedbackBox from "../../../../components/FeedbackBox";

// Types
type Project = {
  title: string;
  slug: string;
  category: string;
  description?: string;
  content: string;
  mainCategory: string;
  subCategory: string;
};

type Resource = {
  type: "guide" | "template" | "link";
  label: string;
  href: string;
};

// Normalize and slugify strings for comparison/URLs
function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

// Extract headings from content for in-page navigation
function extractHeadings(html: string) {
  const matches = Array.from(html.matchAll(/<h2[^>]*>(.*?)<\/h2>/gi));
  return matches.map((match, i) => ({
    id: `section-${i + 1}`,
    text: match[1].replace(/(<([^>]+)>)/gi, ""),
  }));
}

// Add anchor links before headings for TOC linking
function addAnchors(content: string, headings: { id: string }[]) {
  let i = 0;
  return content.replace(/<h2[^>]*>(.*?)<\/h2>/gi, (_match, title) => {
    const id = headings[i]?.id || `section-${i + 1}`;
    i++;
    return `<hr class="my-8 border-gray-300" /><h2 id="${id}">${title}</h2>`;
  });
}

// Main Component
export default function ProjectDetailPage() {
  const { main, sub, slug } = useParams();

  const [project, setProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [headings, setHeadings] = useState<{ id: string; text: string }[]>([]);
  const [activeSection, setActiveSection] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [content, setContent] = useState("");
  const [recommended, setRecommended] = useState<Resource[]>([]);
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const sidebarOffset = isSidebarOpen ? "340px" : "80px";

  // Fetch current project and all projects for context/sidebar
  useEffect(() => {
    const fetchData = async () => {
      if (!slug) return;

      const q = query(collection(db, "projects"), where("slug", "==", slug));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return notFound();

      const current = snapshot.docs[0].data() as Project;
      setProject(current);

      const allSnap = await getDocs(collection(db, "projects"));
      const all = allSnap.docs.map((doc) => doc.data() as Project);
      setProjects(all);

      const foundHeadings = extractHeadings(current.content);
      setHeadings(foundHeadings);
      setContent(addAnchors(current.content, foundHeadings));

      const other = all.find((p) => p.slug !== slug);
      setRecommended(
        [
          other && {
            type: "guide",
            label: other.title,
            href: `/prosjekter/${slugify(other.mainCategory)}/${slugify(
              other.subCategory
            )}/${other.slug}`,
          },
          {
            type: "template",
            label: "Se alle maler og sjekklister",
            href: "/templates",
          },
          {
            type: "link",
            label: "Fortell om det selv! I møte med arbeidslivet.",
            href: "https://example.com",
          },
        ].filter(Boolean) as Resource[]
      );
    };

    fetchData();
  }, [slug]);

  // Listen for global sidebar toggle events
  useEffect(() => {
    const onToggle = (event: CustomEvent) => {
      setIsSidebarOpen(event.detail.open);
    };
    window.addEventListener("sidebarToggle", onToggle as EventListener);
    return () =>
      window.removeEventListener("sidebarToggle", onToggle as EventListener);
  }, []);

  // Track scroll position for heading highlighting
  useEffect(() => {
    const updateActive = () => {
      const offsets = headings
        .map((h) => {
          const el = document.getElementById(h.id);
          return el ? { id: h.id, top: el.getBoundingClientRect().top } : null;
        })
        .filter(Boolean) as { id: string; top: number }[];

      const current =
        offsets.find((s) => s.top >= 0) || offsets[offsets.length - 1];
      if (current) setActiveSection(current.id);
    };

    window.addEventListener("scroll", updateActive, { passive: true });
    return () => window.removeEventListener("scroll", updateActive);
  }, [headings]);

  if (!project) return null;

  // Group all projects by main/sub category for sidebar listing
  const groupedProjects: Record<string, Record<string, Project[]>> = {};
  projects.forEach((proj) => {
    const mainCat = proj.mainCategory || "Uten kategori";
    const subCat = proj.subCategory || "Uten underkategori";
    groupedProjects[mainCat] = groupedProjects[mainCat] || {};
    groupedProjects[mainCat][subCat] = groupedProjects[mainCat][subCat] || [];
    groupedProjects[mainCat][subCat].push(proj);
  });

  return (
    <div className="flex w-full relative">
      {/* Left Sidebar: Category Navigation */}
      <nav
        className={`fixed top-0 h-full w-[260px] pt-24 pl-6 pr-4 overflow-y-auto transition-all duration-300 z-10 ${
          sidebarVisible ? "block" : "hidden"
        } lg:block`}
        style={{ left: sidebarOffset, backgroundColor: "#E2DAEA" }}
        aria-label="Navigasjon over prosjekter"
      >
        <h2 className="text-sm font-semibold text-[#1D0B1F] mb-4">
          Prosjekter
        </h2>
        {Object.entries(groupedProjects).map(([mainCat, subCats]) => {
          const isOpen = openCategory === mainCat;
          return (
            <div key={mainCat} className="mb-4">
              <button
                onClick={() =>
                  setOpenCategory((prev) => (prev === mainCat ? null : mainCat))
                }
                className={`flex items-center text-sm font-medium ${
                  isOpen ? "text-[#93359a]" : "text-[#776C78]"
                } hover:text-[#93359a] transition mb-1`}
                aria-expanded={isOpen}
              >
                <Image
                  src={
                    isOpen ? "/icons/ArrowDown.png" : "/icons/ArrowRight.png"
                  }
                  alt="Toggle"
                  width={6}
                  height={12}
                  className="mr-2"
                />
                {mainCat}
              </button>
              {isOpen && (
                <div className="ml-4 mt-2">
                  {Object.entries(subCats).map(([subCat, projs]) => (
                    <div key={subCat} className="mb-3">
                      <p className="text-xs font-medium text-gray-600 mb-1">
                        {subCat}
                      </p>
                      <ul className="space-y-1">
                        {projs.map((p) => (
                          <li key={p.slug}>
                            <Link
                              href={`/prosjekter/${slugify(
                                p.mainCategory
                              )}/${slugify(p.subCategory)}/${p.slug}`}
                              className={`block text-sm font-['Work Sans'] ${
                                p.slug === project.slug
                                  ? "text-[#93359a] font-semibold"
                                  : "text-[#4b4b4b] hover:text-[#93359a]"
                              }`}
                            >
                              {p.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Main Content Area*/}
      <div className="flex flex-row w-full max-w-7xl mx-auto px-6 gap-12 lg:ml-[320px]">
        <main className="flex-1 py-10 max-w-4xl">
          {/* Breadcrumbs */}
          <nav
            className="text-sm font-medium text-purple-700 mb-4"
            aria-label="Brødsmulesti"
          >
            <ol className="flex flex-wrap gap-x-2 gap-y-1 items-center">
              <li className="flex items-center gap-1 text-purple-300">
                <Link href="/" aria-label="Hjem">
                  <Image
                    src="/homeGray.png"
                    alt="Hjem"
                    width={16}
                    height={16}
                  />
                </Link>
                <span aria-hidden="true">›</span>
              </li>
              <li>
                <Link
                  href="/prosjekter"
                  className="hover:underline text-[#93359a]"
                >
                  Prosjekter
                </Link>
                <span aria-hidden="true">›</span>
              </li>
              <li>
                <Link
                  href={`/prosjekter/${slugify(main as string)}`}
                  className="hover:underline text-[#93359a] capitalize"
                >
                  {main?.toString().replace(/-/g, " ")}
                </Link>
                <span aria-hidden="true">›</span>
              </li>
              <li>
                <Link
                  href={`/prosjekter/${slugify(main as string)}/${slugify(
                    sub as string
                  )}`}
                  className="hover:underline text-[#93359a] capitalize"
                >
                  {sub?.toString().replace(/-/g, " ")}
                </Link>
                <span aria-hidden="true">›</span>
              </li>
              <li className="text-purple-900" aria-current="page">
                {project.title}
              </li>
            </ol>
          </nav>

          {/* Title and description */}
          <h1 className="text-[30px] font-bold font-['Domine'] text-[#93359a] mb-2">
            {project.title}
          </h1>
          <p className="text-[16px] font-['Work Sans'] text-[#776c78] mb-6">
            {project.description}
          </p>

          {/* Main content */}
          <article
            className="prose max-w-none [&_h2]:text-[24px] [&_h2]:text-[#93359a] [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4
                       [&_p]:text-[#333] [&_img]:w-full [&_img]:h-auto [&_img]:max-w-[400px] [&_img]:my-8 [&_img]:rounded-lg [&_img]:mx-auto"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {/* Recommendations */}
          <section className="mt-12 pt-6 border-t border-gray-200">
            <h2 className="text-[20px] font-bold text-[#93359a] mb-4">
              Anbefalte ressurser
            </h2>
            <ul className="space-y-2">
              {recommended.map((res, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <Image
                    src={
                      res.type === "guide"
                        ? "/GuideIcon.png"
                        : res.type === "template"
                        ? "/malIcon.png"
                        : "/icons/linkIcon.png"
                    }
                    alt={res.type}
                    width={20}
                    height={20}
                  />
                  <span>
                    {res.type === "template" && <strong>Mal:</strong>}
                    {res.type === "link" && <strong>Lenke:</strong>}
                    <span className="ml-1">
                      <a
                        href={res.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#4b1d79] hover:underline"
                      >
                        {res.label}
                      </a>
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Feedback */}
          <FeedbackBox pageType="project" slug={project.slug} />
        </main>

        {/* TOC (Right Sidebar) */}
        <aside className="hidden xl:block w-[260px] sticky top-24 self-start h-fit max-h-[calc(100vh-100px)] overflow-y-auto">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">
            På denne siden
          </h4>
          <ul className="text-sm space-y-2">
            {headings.map((heading) => (
              <li key={heading.id}>
                <a
                  href={`#${heading.id}`}
                  className={`block transition ${
                    activeSection === heading.id
                      ? "text-[#93359a] font-semibold"
                      : "text-gray-600 hover:text-purple-700"
                  }`}
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
