"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import Link from "next/link";
import Image from "next/image";

// Define valid template categories
type CategoryKey =
  | "analyse"
  | "undersokelser"
  | "planlegging"
  | "leveranser"
  | "presentasjoner";

// Static category configuration
const CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: "analyse", label: "Analyse" },
  { key: "undersokelser", label: "Undersøkelser" },
  { key: "planlegging", label: "Planlegging" },
  { key: "leveranser", label: "Leveranser" },
  { key: "presentasjoner", label: "Presentasjoner" },
];

// Template type
type Template = {
  title: string;
  desc: string;
  tags: string[];
};

// Static template data per category
const TEMPLATE_DATA: Record<CategoryKey, Template[]> = {
  analyse: [
    {
      title: "SWOT Analyse Mal",
      desc: "Analyser styrker, svakheter, muligheter og trusler med denne strukturerte malen.",
      tags: ["Filer: PPTX – PowerPoint Presentasjon"],
    },
    {
      title: "Porter's Five Forces Mal",
      desc: "Forstå en konkurransesituasjon i en industri med denne strukturerte modellen.",
      tags: ["Filer: PDF – PowerPoint Analyse"],
    },
  ],
  undersokelser: [
    {
      title: "Spørreundersøkelse Mal",
      desc: "Mal for å samle inn brukertilbakemelding med tydelige spørsmål.",
      tags: ["Filer: DOCX – Word", "Filer: PDF – Printklar"],
    },
  ],
  planlegging: [
    {
      title: "Prosjektplan Mal",
      desc: "Mal for å planlegge prosjektets milepæler, ansvar og tidsfrister.",
      tags: ["Filer: XLSX – Excel", "Filer: PDF – Planvisning"],
    },
  ],
  leveranser: [],
  presentasjoner: [],
};

export default function TemplatesPage() {
  const [active, setActive] = useState<CategoryKey>("analyse");
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Update container height when active panel changes
  useEffect(() => {
    const section = containerRef.current?.querySelector("section[data-active]");
    if (section) setHeight(section.scrollHeight);
  }, [active]);

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      {/* Breadcrumb navigation */}
      <nav className="text-sm text-purple-700 mb-6">
        <ol className="flex items-center gap-2">
          <li>
            <Link
              href="/"
              className="inline-flex items-center gap-1 hover:underline"
            >
              <Image src="/homeGray.png" alt="Home" width={16} height={16} />
            </Link>
          </li>
          <li className="text-gray-800">›</li>
          <li className="font-medium text-purple-800">Maler</li>
        </ol>
      </nav>

      {/* Page title and intro */}
      <h1 className="text-2xl font-bold text-purple-800 mb-2">Maler</h1>
      <p className="text-sm text-gray-600 mb-8">
        Forhåndsdesignede maler som er klare til å brukes på ditt neste prosjekt
      </p>

      {/* Mobile: Category dropdown */}
      <div className="mb-8 md:hidden relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="w-full border border-gray-300 rounded-md px-4 py-3 text-sm text-gray-800 text-left flex justify-between items-center"
        >
          {CATEGORIES.find((c) => c.key === active)?.label}
          <span className="text-gray-500">▾</span>
        </button>

        {dropdownOpen && (
          <div className="absolute top-full left-0 w-full mt-2 z-10 bg-white border border-gray-200 rounded-md shadow-lg">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                onClick={() => {
                  setActive(cat.key);
                  setDropdownOpen(false);
                }}
                className="block w-full text-left px-4 py-3 text-sm text-gray-800 hover:bg-purple-100 transition"
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Desktop: Tab navigation */}
      <div className="hidden md:flex gap-4 border-b border-gray-200 mb-10">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActive(cat.key)}
            className={clsx(
              "pb-3 px-2 text-sm font-medium transition border-b-2",
              active === cat.key
                ? "border-purple-600 text-purple-700"
                : "border-transparent text-gray-500 hover:text-purple-600"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Category panels */}
      <div
        ref={containerRef}
        className="relative transition-all duration-500 overflow-hidden"
        style={{ height }}
      >
        {CATEGORIES.map(({ key }) => (
          <section
            key={key}
            data-active={key === active || undefined}
            className={clsx(
              "absolute left-0 top-0 w-full transition-all duration-500 ease-in-out transform",
              key === active
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-full pointer-events-none"
            )}
          >
            <h2 className="text-xl font-semibold text-purple-900 mb-6">
              {key[0].toUpperCase() + key.slice(1)} Maler
            </h2>

            {TEMPLATE_DATA[key].length === 0 ? (
              <p className="text-sm text-gray-500">
                Ingen maler i denne kategorien ennå.
              </p>
            ) : (
              <div className="flex flex-col gap-6 pb-10">
                {TEMPLATE_DATA[key].map((template, i) => (
                  <div
                    key={i}
                    className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold text-purple-800 text-md mb-1">
                        {template.title}
                      </h3>
                      <p className="text-sm text-gray-700 mb-3">
                        {template.desc}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {template.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="inline-block bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button className="bg-purple-700 text-white text-sm px-4 py-2 rounded-md hover:bg-purple-800 transition w-fit self-start sm:self-auto">
                      Last Ned
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>

      {/* Static how-to section */}
      <section className="mt-20 bg-purple-50 p-6 rounded-xl">
        <h3 className="text-purple-800 font-semibold text-md mb-3">
          💡 Slik bruker du disse malene
        </h3>
        <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
          <li>Last ned malen som best passer dine behov.</li>
          <li>Rediger malen med din prosjekt-spesifikke informasjon.</li>
          <li>Bruk veiledningene for å få best utbytte av malen.</li>
          <li>Fjern midlertidig tekst før innsending.</li>
          <li>Pass på konsistent branding og formatering.</li>
        </ol>
      </section>
    </main>
  );
}
