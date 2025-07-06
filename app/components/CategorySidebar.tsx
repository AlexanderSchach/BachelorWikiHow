"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type SidebarProps = {
  categories: string[];
  activeId?: string;
  scrollable?: boolean;
  baseHref?: string;
};

// Icons per category, fallback icon used if missing
const ICONS: Record<string, string> = {
  "Generell Info": "/icons/book.png",
  "Administrative Prosesser": "/icons/users.png",
  Rapportering: "/icons/notepad.png",
  "Presentasjon og profesjonalilsme": "/icons/briefcase.png",
  Etikk: "/icons/etikk.png",
};

const CategorySidebar = ({
  categories,
  activeId,
  scrollable = false,
  baseHref = "",
}: SidebarProps) => {
  const [isMainSidebarOpen, setIsMainSidebarOpen] = useState(false);

  useEffect(() => {
    const handler = (event: CustomEvent) => {
      setIsMainSidebarOpen(event.detail.open);
    };

    window.addEventListener("sidebarToggle", handler as EventListener);
    return () =>
      window.removeEventListener("sidebarToggle", handler as EventListener);
  }, []);

  const leftOffset = isMainSidebarOpen ? "left-[340px]" : "left-[64px]";

  return (
    <aside
      className={`hidden px-10 lg:block fixed top-0 ${leftOffset} w-[240px] h-screen bg-[#e2daea] pt-24 px-4 transition-all duration-300 z-10`}
    >
      <h2 className="text-md px-5 font-semibold text-black font-['Work_Sans'] mb-6">
        Temaer
      </h2>

      <nav className="flex flex-col gap-4">
        {categories.map((category) => {
          const id = category.toLowerCase().replace(/\s+/g, "-");
          const href = scrollable
            ? `#${id}`
            : `?category=${encodeURIComponent(category)}`;

          const isActive = activeId === category;
          const iconSrc = ICONS[category] || "/icons/etikk.png";

          return (
            <Link
              key={id}
              href={href}
              scroll={false}
              onClick={(e) => {
                if (scrollable) {
                  e.preventDefault();
                  const el = document.getElementById(id);
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                    window.history.pushState(null, "", `#${id}`);
                  }
                }
              }}
              className={`flex items-center gap-3 text-sm font-['Work_Sans'] py-2 rounded transition-colors ${
                isActive
                  ? "text-[#93359a] font-semibold bg-white shadow"
                  : "text-[#776c78] hover:text-[#93359a]"
              }`}
            >
              <Image
                src={iconSrc}
                alt=""
                width={20}
                height={20}
                className="flex-shrink-0"
              />
              <span className="whitespace-normal">{category}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default CategorySidebar;
