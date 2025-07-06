"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { Domine, Work_Sans } from "next/font/google";

// Preloading fonts with Tailwind-compatible classNames for consistent styling
const domine = Domine({
  subsets: ["latin"],
  weight: "700",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

// Define tab metadata once to keep render logic clean
const tabs = [
  { key: "students", label: "For Studenter" },
  { key: "businesses", label: "For Bedrifter" },
];

export default function CategoryPage() {
  // Track which tab is active so content switches accordingly
  const [activeTab, setActiveTab] = useState<"students" | "businesses">(
    "students"
  );

  return (
    <section className={`${workSans.className} max-w-6xl mx-auto px-4 py-16`}>
      {/* Tabs for switching user context */}
      <div className="relative mb-10 border-b flex gap-8 text-[18px] font-semibold">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`pb-2 transition-colors cursor-pointer ${
              activeTab === tab.key ? "text-[#93359a]" : "text-[#776c78]"
            }`}
            onClick={() => setActiveTab(tab.key as any)}
          >
            {tab.label}
          </button>
        ))}

        {/* Animated underline shows which tab is active */}
        <div
          className="absolute bottom-0 h-[2px] bg-[#93359a] transition-all duration-300"
          style={{
            width: activeTab === "students" ? "110px" : "120px",
            transform: `translateX(${
              activeTab === "students" ? "0px" : "140px"
            })`,
          }}
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left side: heading, description, CTA, image */}
        <div className="flex-1 max-w-md space-y-8">
          <h1
            className={`${domine.className} text-[30px] text-[#93359a] leading-snug`}
          >
            {activeTab === "students"
              ? "Kom i gang med dine profesjonelle prosjekter"
              : "Slik samarbeider du med studenter og prosjekter"}
          </h1>

          <p className="text-[16px] text-[#1d0b1f] leading-relaxed">
            {activeTab === "students"
              ? "Her finner du flere forskjellige guider på hvordan du utfører forskjellige prosjekter, og hvilke forventninger som stilles til deg samt forventninger du kan stille til profesjonelle aktører i arbeidslivet."
              : "Denne seksjonen er for bedrifter og organisasjoner som ønsker å forstå hvordan de kan samarbeide med studenter på profesjonelle prosjekter og bidra til utdanning."}
          </p>

          <button
            className="bg-[#93359a] hover:bg-[#7c2f85] text-white font-semibold px-5 py-2 rounded-full transition cursor-pointer"
            aria-label={
              activeTab === "students"
                ? "Start som student"
                : "Start som bedrift"
            }
          >
            {activeTab === "students" ? "Kom i gang" : "Les Guides"}
          </button>

          <Image
            src="/student.png"
            alt="Illustrasjon"
            width={370}
            height={340}
            className="w-full max-w-[370px] mt-8"
          />
        </div>

        {/* Right side: Feature highlights and navigation tiles */}
        <div className="flex-1 flex flex-col gap-10">
          <div className="flex flex-col sm:flex-row sm:gap-8 gap-4">
            <IntroBlock
              icon="/BookIcon.png"
              text="Finn den perfekte guiden for ditt prosjekt."
            />
            <IntroBlock
              icon="/search-iconPurple.png"
              text="Finn akkurat det du trenger til ditt neste prosjekt."
            />
          </div>

          {/* Grid of clickable content cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {getGridItems(activeTab).map((item, i) => (
              <Link
                key={i}
                href={item.link}
                className="border border-[#93359a] rounded-xl p-4 w-full max-w-[250px] h-[200px] flex flex-col justify-start transition hover:bg-[#93359a] hover:text-white group"
              >
                <img
                  src={item.icon}
                  alt=""
                  className="w-10 h-10 mb-3 transition group-hover:filter group-hover:brightness-0 group-hover:invert"
                />
                <h3 className="text-[#240943] text-[16px] font-medium group-hover:text-white">
                  {item.title}
                </h3>
                <p className="text-sm text-[#776c78] mt-1 leading-snug group-hover:text-white">
                  {item.desc}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Small content block for feature intros
const IntroBlock = ({ icon, text }: { icon: string; text: string }) => (
  <div className="flex items-start gap-3 max-w-xs">
    <img src={icon} alt="" className="w-10 h-10" />
    <p className="text-sm font-medium text-black">{text}</p>
  </div>
);

// Generate tab-specific content items dynamically
function getGridItems(type: "students" | "businesses") {
  const isStudent = type === "students";

  return [
    {
      title: "Utforsk Guides",
      desc: isStudent
        ? "Finn generelle guides som gir deg innsikt i profesjonalitet og arbeidsliv."
        : "Guider som hjelper bedrifter forstå studentprosjekter.",
      icon: "/GuideIcon.png",
      link: "/guides",
    },
    {
      title: "Prosjekter",
      desc: isStudent
        ? "Utforsk prosjektguides spesifikt til dine oppgaver i alle fagfelt."
        : "Hvordan veilede studentprosjekter effektivt.",
      icon: "/ProsjekterIcon.png",
      link: "/prosjekter",
    },
    {
      title: "Maler",
      desc: "Standardiserte maler som simplifiserer arbeidshverdagen.",
      icon: "/MalIcon.png",
      link: "/templates",
    },
    {
      title: "Ressurser",
      desc: "En oversikt over diverse ressurser du trenger i profesjonelle prosjekter.",
      icon: "/Resources.png",
      link: "/resources",
    },
  ];
}
