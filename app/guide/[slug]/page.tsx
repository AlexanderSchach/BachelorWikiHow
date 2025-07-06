"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { db } from "../../../lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useParams, notFound } from "next/navigation";
import FeedbackBox from "../../components/FeedbackBox";

// Type definitions for guide and linked resources
interface Guide {
  title: string;
  slug: string;
  category: string;
  description: string;
  content: string;
}

interface Resource {
  type: "guide" | "template" | "link";
  label: string;
  href: string;
}

// Extracts all <h2> tags for Table of Contents
function extractHeadings(html: string) {
  return Array.from(html.matchAll(/<h2[^>]*>(.*?)<\/h2>/gi)).map(
    (match, i) => ({
      id: `section-${i + 1}`,
      text: match[1].replace(/(<([^>]+)>)/gi, ""),
    })
  );
}

// Adds ID anchors + horizontal lines above <h2> tags
function addAnchors(content: string, headings: { id: string }[]) {
  let i = 0;
  return content.replace(/<h2[^>]*>(.*?)<\/h2>/gi, (_match, title) => {
    const id = headings[i++]?.id || `section-${i}`;
    return `<hr class="my-8 border-gray-300" /><h2 id="${id}">${title}</h2>`;
  });
}

export default function GuidePageClient() {
  const { slug } = useParams();
  const [guide, setGuide] = useState<Guide | null>(null);
  const [categories, setCategories] = useState<Record<string, Guide[]>>({});
  const [headings, setHeadings] = useState<{ id: string; text: string }[]>([]);
  const [content, setContent] = useState("");
  const [recommended, setRecommended] = useState<Resource[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  // Fetch guide and related content based on URL slug
  useEffect(() => {
    if (!slug || typeof slug !== "string") return;

    const fetch = async () => {
      const q = query(collection(db, "guides"), where("slug", "==", slug));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return notFound();

      const current = snapshot.docs[0].data() as Guide;

      // Load all guides to group by category
      const allDocs = await getDocs(collection(db, "guides"));
      const all = allDocs.docs.map((doc) => doc.data() as Guide);

      // Group guides by category for sidebar
      const grouped = all.reduce((acc, g) => {
        const cat = g.category || "Uten kategori";
        (acc[cat] ||= []).push(g);
        return acc;
      }, {} as Record<string, Guide[]>);

      // Select a random recommended guide (not the current one)
      const otherGuides = all.filter((g) => g.slug !== slug);
      const randomGuide =
        otherGuides[Math.floor(Math.random() * otherGuides.length)];

      // Define recommended resources to show below the guide
      const recommendedResources: Resource[] = [
        randomGuide && {
          type: "guide",
          label: randomGuide.title,
          href: `/guide/${randomGuide.slug}`,
        },
        {
          type: "template",
          label: "Se alle maler og sjekklister",
          href: "http://localhost:3000/templates",
        },
        {
          type: "link",
          label: "Fortell om det selv! I møte med arbeidslivet.",
          href: "https://example.com",
        },
      ].filter(Boolean) as Resource[];

      // Extract TOC headings and inject anchors
      const foundHeadings = extractHeadings(current.content);
      const htmlWithAnchors = addAnchors(current.content, foundHeadings);

      // Set state
      setGuide(current);
      setCategories(grouped);
      setHeadings(foundHeadings);
      setContent(htmlWithAnchors);
      setRecommended(recommendedResources);
    };

    fetch();
  }, [slug]);

  // Listen to sidebar toggle events from global state
  useEffect(() => {
    const handler = (event: CustomEvent) => setIsSidebarOpen(event.detail.open);
    window.addEventListener("sidebarToggle", handler as EventListener);
    return () =>
      window.removeEventListener("sidebarToggle", handler as EventListener);
  }, []);

  // Update active section highlight based on scroll position
  useEffect(() => {
    const updateActive = () => {
      const visible = headings
        .map((h) => {
          const el = document.getElementById(h.id);
          return el ? { id: h.id, top: el.getBoundingClientRect().top } : null;
        })
        .filter(Boolean) as { id: string; top: number }[];

      const current = visible.find((s) => s.top >= 0) || visible.at(-1);
      if (current) setActiveSection(current.id);
    };

    window.addEventListener("scroll", updateActive, { passive: true });
    return () => window.removeEventListener("scroll", updateActive);
  }, [headings]);

  // Expand/collapse category in sidebar
  const toggleCategory = (category: string) =>
    setOpenCategory((prev) => (prev === category ? null : category));

  if (!guide) return null;

  const sidebarOffset = isSidebarOpen ? "left-[340px]" : "left-[80px]";

  return (
    <div className="flex w-full relative">
      {/* Category Sidebar (Left) */}
      <nav
        className={`fixed top-0 h-full w-[260px] pt-24 pl-6 pr-4 overflow-y-auto hidden lg:block transition-all duration-300 bg-[#e2daea] z-10 ${sidebarOffset}`}
        aria-label="Navigasjon over guider"
      >
        <h2 className="text-sm font-semibold text-[#1D0B1F] mb-4">Guides</h2>
        {Object.entries(categories).map(([category, guides]) => {
          const isOpen = openCategory === category;
          return (
            <div key={category} className="mb-4">
              <button
                onClick={() => toggleCategory(category)}
                className={`flex items-center text-sm font-small ${
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
                {category}
              </button>
              {isOpen && (
                <ul className="ml-5 mt-1">
                  {guides.map((g) => (
                    <li key={g.slug} className="mb-5">
                      <Link
                        href={`/guide/${g.slug}`}
                        className={`block ${
                          g.slug === guide.slug
                            ? "text-[#93359a] font-medium"
                            : "text-[#4b4b4b] hover:text-[#93359a]"
                        }`}
                        style={{
                          fontWeight: g.slug === guide.slug ? 800 : 400,
                          fontSize: "14px",
                          lineHeight: "100%",
                          letterSpacing: "0.5%",
                        }}
                      >
                        {g.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </nav>

      {/* Main content area with TOC */}
      <div className="flex flex-col lg:flex-row lg:ml-[280px] px-4 sm:px-8 py-12 w-full max-w-screen-2xl mx-auto gap-12">
        {/* Guide content */}
        <div className="flex-1 min-w-0">
          {/* Breadcrumbs */}
          <nav
            className="text-sm font-medium text-purple-700 mb-4"
            aria-label="Brødsmulesti"
          >
            <ol className="flex gap-2">
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
                <Link href="/guides" className="hover:underline text-[#93359a]">
                  Guides
                </Link>
              </li>
              <li aria-current="page" className="text-purple-900">
                › {guide.title}
              </li>
            </ol>
          </nav>

          {/* Guide title + description */}
          <header className="mb-8">
            <h1 className="text-[30px] font-bold text-[#93359a] mb-2">
              {guide.title}
            </h1>
            <p className="text-[16px] text-[#776c78] mb-4">
              {guide.description}
            </p>
          </header>

          {/* Guide HTML content */}
          <article
            className="prose max-w-none [&_h2]:text-[24px] [&_h2]:text-[#93359a] [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:scroll-mt-28
            [&_h3]:text-[20px] [&_h3]:text-[#7e22ce] [&_h3]:font-bold [&_h3]:mt-6 [&_h3]:mb-3
            [&_p]:text-[16px] [&_p]:text-[#333] [&_p]:mb-4
            [&_blockquote]:bg-[#f3e8ff] [&_blockquote]:border-l-4 [&_blockquote]:border-[#93359a] [&_blockquote]:p-4 [&_blockquote]:rounded-lg [&_blockquote]:italic [&_blockquote]:text-[#5b0f6f]
            [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4
            [&_img]:w-full [&_img]:h-auto [&_img]:max-w-[400px] [&_img]:rounded-lg [&_img]:my-8 [&_img]:mx-auto"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {/* Suggested links section */}
          <section className="mt-12 pt-6 border-t border-gray-200">
            <h2 className="text-[20px] font-bold text-[#93359a] mb-4">
              Anbefalte Ressurser
            </h2>
            <ul className="space-y-2">
              {recommended.map((res, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="w-5 h-5 mt-0.5">
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
                  </span>
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
            <hr className="mt-6 border-gray-200" />
          </section>

          {/* Feedback section */}
          <FeedbackBox pageType="guide" slug={guide.slug} />
        </div>

        {/* Table of contents (right sidebar) */}
        <aside className="hidden xl:block w-[260px] sticky top-36 self-start h-fit max-h-[calc(100vh-100px)] overflow-y-auto">
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
