"use client";

import { useState } from "react";
import clsx from "clsx";
import Link from "next/link";
import Image from "next/image";

// Define the available tabs and their labels
type TabKey = "videoer" | "lesestoff" | "lenker";
const TABS: { key: TabKey; label: string }[] = [
  { key: "videoer", label: "Videoer" },
  { key: "lesestoff", label: "Lesestoff" },
  { key: "lenker", label: "Nyttige Lenker" },
];

// Resource types for structured content
type VideoResource = {
  title: string;
  desc: string;
  length: string;
  videoUrl: string;
};

type ArticleResource = {
  title: string;
  desc: string;
  url: string;
};

type LinkResource = {
  title: string;
  desc: string;
  url: string;
};

// Static resource data grouped by tab
const DATA: {
  videoer: VideoResource[];
  lesestoff: ArticleResource[];
  lenker: LinkResource[];
} = {
  videoer: [
    {
      title: "Grunnleggende prototyping i Figma",
      desc: "Lær hvordan du lager interaktive prototyper raskt.",
      length: "12:34",
      videoUrl: "https://www.youtube.com/embed/jwCmIBJ8Jtc",
    },
    {
      title: "Design Thinking på 5 minutter",
      desc: "En kort og konkret introduksjon til Design Thinking.",
      length: "5:04",
      videoUrl: "https://www.youtube.com/embed/_r0VX-aU_T8",
    },
  ],
  lesestoff: [
    {
      title: "The McKinsey Way",
      desc: "En strukturert mal på hvordan du kan enkelt sette opp din presentasjon",
      url: "https://example.com/mckinsey",
    },
    {
      title: "Effective Problem Solving and Frameworks",
      desc: "En strukturert mal på hvordan du kan enkelt sette opp din presentasjon",
      url: "https://example.com/problem-solving",
    },
    {
      title: "Data Visualization Best Practices",
      desc: "En strukturert mal på hvordan du kan enkelt sette opp din presentasjon",
      url: "https://example.com/data-viz",
    },
    {
      title: "UX/UI–Design prinsipper",
      desc: "En strukturert mal på hvordan du kan enkelt sette opp din presentasjon",
      url: "https://example.com/uxui",
    },
    {
      title: "Etiske retningslinjer",
      desc: "En strukturert mal på hvordan du kan enkelt sette opp din presentasjon",
      url: "https://example.com/etikk",
    },
    {
      title: "Tittel",
      desc: "En strukturert mal på hvordan du kan enkelt sette opp din presentasjon",
      url: "https://example.com/tittel",
    },
  ],
  lenker: [
    {
      title: "Figmas Hjelpesenter",
      desc: "Offisiell dokumentasjon og veiledning for designverktøyet Figma.",
      url: "https://help.figma.com/",
    },
    {
      title: "UX Collective",
      desc: "Nettside for artikler og ressurser om UX og produktdesign.",
      url: "https://uxdesign.cc/",
    },
  ],
};

export default function ResourcesPage() {
  const [active, setActive] = useState<TabKey>("videoer"); // Controls current tab

  return (
    <main className="max-w-5xl mx-auto px-6 py-10 pb-40">
      {/* Breadcrumb navigation */}
      <nav className="text-sm text-purple-700 mb-6">
        <ol className="flex items-center gap-2">
          <li>
            <Link
              href="/"
              className="inline-flex items-center gap-1 hover:underline"
            >
              <Image src="/homeGray.png" alt="Hjem" width={16} height={16} />
            </Link>
          </li>
          <li className="text-gray-400">›</li>
          <li className="font-medium text-purple-800">Ressurser</li>
        </ol>
      </nav>

      {/* Page title and description */}
      <h1 className="text-2xl font-bold text-purple-800 mb-1">Ressurser</h1>
      <p className="text-sm text-gray-600 mb-8">
        Få tilgang til maler, videoer og læremateriell til å støtte din neste
        profesjonelle prosjekt.
      </p>

      {/* Tab navigation */}
      <div className="flex gap-6 border-b border-gray-200 mb-8">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={clsx(
              "pb-2 text-sm font-medium transition border-b-2",
              active === tab.key
                ? "border-purple-600 text-purple-700"
                : "border-transparent text-gray-500 hover:text-purple-600"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content for each tab */}
      <div className="space-y-10">
        {active === "videoer" && (
          <div className="grid sm:grid-cols-2 gap-6">
            {DATA.videoer.map((res, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm"
              >
                <div className="relative w-full aspect-video mb-3 overflow-hidden rounded-md">
                  <iframe
                    src={res.videoUrl}
                    title={res.title}
                    className="w-full h-full rounded-md"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <h3 className="text-purple-800 font-semibold text-sm mb-1">
                  {res.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{res.desc}</p>
                <span className="inline-block bg-gray-100 text-xs text-gray-700 px-2 py-1 rounded">
                  ⏱ {res.length}
                </span>
              </div>
            ))}
          </div>
        )}

        {active === "lesestoff" && (
          <div className="grid sm:grid-cols-2 gap-6">
            {DATA.lesestoff.map((res, i) => (
              <div
                key={i}
                className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm flex flex-col justify-between"
              >
                <div className="mb-3">
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 float-right">
                    Artikkel
                  </span>
                  <h3 className="font-semibold text-purple-800 text-md mb-1">
                    {res.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{res.desc}</p>
                  <p className="text-xs text-gray-500">
                    Estimert lesetid: 15 min
                  </p>
                </div>
                <a
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 bg-purple-700 text-white text-sm px-4 py-2 rounded-md hover:bg-purple-800 transition"
                >
                  Les her
                </a>
              </div>
            ))}
          </div>
        )}

        {active === "lenker" && (
          <ul className="space-y-4">
            {DATA.lenker.map((res, i) => (
              <li
                key={i}
                className="bg-white border border-gray-200 p-5 rounded-lg shadow-sm"
              >
                <h3 className="font-semibold text-purple-800 text-md mb-1">
                  <a href={res.url} target="_blank" className="hover:underline">
                    {res.title}
                  </a>
                </h3>
                <p className="text-sm text-gray-600">{res.desc}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
