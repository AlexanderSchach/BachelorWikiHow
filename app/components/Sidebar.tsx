"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth, db } from "../../lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, getDocs } from "firebase/firestore";
import { Work_Sans } from "next/font/google";

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

interface SidebarProps {
  isOpen: boolean;
}

interface Item {
  title: string;
  slug: string;
  category: string;
  mainCategory?: string;
  subCategory?: string;
}

// Define the static top-level navigation structure
const menuItems = [
  { label: "Hjem", href: "/", icon: "/Home.png", type: "link" },
  { label: "Guides", href: "/guides", icon: "/WhiteBook.png", type: "menu" },
  {
    label: "Prosjekter",
    href: "/prosjekter",
    icon: "/ProsjekterIconW.png",
    type: "menu",
  },
  { label: "Maler", href: "/templates", icon: "/MalIconW.png", type: "link" },
  {
    label: "Ressurser",
    href: "/resources",
    icon: "/ResourcesW.png",
    type: "link",
  },
];

// Converts readable text to a slug for routing
const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");

export default function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeMainCategory, setActiveMainCategory] = useState<string | null>(
    null
  );
  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(
    null
  );
  const [guides, setGuides] = useState<Item[]>([]);
  const [projects, setProjects] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);

  // Fetch guides and projects from Firestore on mount
  useEffect(() => {
    const fetchAll = async () => {
      const guideSnap = await getDocs(collection(db, "guides"));
      const projectSnap = await getDocs(collection(db, "projects"));
      setGuides(guideSnap.docs.map((d) => d.data() as Item));
      setProjects(projectSnap.docs.map((d) => d.data() as Item));
      setLoading(false);
    };
    fetchAll();
  }, []);

  // Automatically close the submenu when clicking outside (desktop only)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (window.innerWidth < 768) return;
      const sidebarWrapper = document.querySelector(".sidebar-wrapper");
      const subpanel = document.querySelector(".sidebar-subpanel");

      if (
        !sidebarWrapper?.contains(event.target as Node) &&
        !subpanel?.contains(event.target as Node)
      ) {
        closeSidebar();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Allow closing the sidebar via Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") dispatchSidebarToggle(false);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const dispatchSidebarToggle = (open: boolean) => {
    window.dispatchEvent(
      new CustomEvent("sidebarToggle", { detail: { open } })
    );
  };

  const toggleMenu = (label: string) => {
    const isClosing = activeMenu === label;
    setActiveMenu(isClosing ? null : label);
    setActiveMainCategory(null);
    setActiveSubCategory(null);
    dispatchSidebarToggle(!isClosing);
  };

  const toggleMainCategory = (mainCat: string) => {
    setActiveMainCategory((prev) => (prev === mainCat ? null : mainCat));
    setActiveSubCategory(null);
  };

  const toggleSubCategory = (subCat: string) => {
    setActiveSubCategory((prev) => (prev === subCat ? null : subCat));
  };

  const closeSidebar = () => {
    setActiveMenu(null);
    setActiveMainCategory(null);
    setActiveSubCategory(null);
    dispatchSidebarToggle(false);
  };

  const guideCategories = Array.from(new Set(guides.map((g) => g.category)));
  const projectMainCategories = Array.from(
    new Set(projects.map((p) => p.mainCategory))
  );

  const getGuideItemsByCategory = (cat: string) =>
    guides.filter((g) => g.category === cat);

  const getProjectSubCategories = (mainCat: string) =>
    Array.from(
      new Set(
        projects
          .filter((p) => p.mainCategory === mainCat)
          .map((p) => p.subCategory)
      )
    );

  const getProjectsBySubCategory = (mainCat: string, subCat: string) =>
    projects.filter(
      (p) => p.mainCategory === mainCat && p.subCategory === subCat
    );

  return (
    <div className={workSans.className}>
      <>
        {/* Semi-transparent backdrop for submenus (desktop) */}
        {activeMenu && (
          <div
            className="fixed top-0 right-0 bottom-0 left-[80px] bg-black/30 z-30 hidden md:block"
            onClick={closeSidebar}
            aria-hidden="true"
          />
        )}

        {/* Screen overlay for mobile */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/80 z-30 md:hidden"
            onClick={() => dispatchSidebarToggle(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar container */}
        <div
          className={`sidebar-wrapper z-40 md:static ${
            isOpen ? "open" : "hidden"
          } md:block`}
        >
          <aside
            className={`sidebar ${
              isOpen ? "translate-x-0" : "-translate-x-full"
            } md:translate-x-0 transition-transform duration-300 ease-in-out`}
            role="navigation"
            aria-label="Sidebar Menu"
          >
            {/* Profile section */}
            <Link
              href="/profile"
              className="sidebar-profile hover:opacity-80 transition"
            >
              <Image
                src="/avatar.png"
                alt="User Profile"
                width={40}
                height={40}
                className="sidebar-avatar"
              />
              <span>{user?.displayName || user?.email || "Din Konto"}</span>
            </Link>

            {/* Top-level nav items */}
            <nav className="sidebar-nav">
              {menuItems.map((item) => {
                const isActive = item.label === activeMenu;
                return (
                  <div key={item.label} className="w-full">
                    {item.type === "link" ? (
                      <Link
                        href={item.href}
                        className="sidebar-link w-full text-left"
                        onClick={closeSidebar}
                      >
                        <Image
                          src={item.icon}
                          alt={item.label}
                          width={24}
                          height={24}
                          className="sidebar-icon"
                        />
                        {item.label}
                      </Link>
                    ) : (
                      <button
                        onClick={() => toggleMenu(item.label)}
                        className={`sidebar-link w-full text-left cursor-pointer ${
                          isActive ? "active" : ""
                        }`}
                        aria-expanded={isActive}
                      >
                        <Image
                          src={item.icon}
                          alt={item.label}
                          width={24}
                          height={24}
                          className="sidebar-icon"
                        />
                        {item.label}
                      </button>
                    )}
                  </div>
                );
              })}
            </nav>
          </aside>

          {/* Submenu panel for nested navigation */}
          <aside className={`sidebar-subpanel ${activeMenu ? "show" : ""}`}>
            {activeMenu === "Guides" && (
              <>
                <div className="submenu-header">
                  <div className="submenu-title">
                    <h3>Guider</h3>
                    <p className="submenu-sub">Velg en kategori</p>
                  </div>
                  <button className="submenu-close" onClick={closeSidebar}>
                    &larr;
                  </button>
                </div>

                {loading ? (
                  <p className="submenu-sub">Laster guider...</p>
                ) : (
                  <ul>
                    {guideCategories.map((cat) => (
                      <li key={cat}>
                        <button
                          onClick={() => toggleMainCategory(cat)}
                          className={`submenu-link ${
                            activeMainCategory === cat ? "active" : ""
                          }`}
                        >
                          <span className="submenu-arrow">
                            {activeMainCategory === cat ? "▼" : "›"}
                          </span>{" "}
                          {cat}
                        </button>
                        {activeMainCategory === cat && (
                          <ul className="nested-guide-list">
                            {getGuideItemsByCategory(cat).map((guide) => (
                              <li key={guide.slug}>
                                <Link
                                  href={`/guide/${guide.slug}`}
                                  onClick={closeSidebar}
                                  className="guide-link"
                                >
                                  {guide.title}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}

            {activeMenu === "Prosjekter" && (
              <>
                <div className="submenu-header">
                  <div className="submenu-title">
                    <h3>Prosjekter</h3>
                    <p className="submenu-sub">Velg en hovedkategori</p>
                  </div>
                  <button className="submenu-close" onClick={closeSidebar}>
                    &larr;
                  </button>
                </div>

                {loading ? (
                  <p className="submenu-sub">Laster prosjekter...</p>
                ) : (
                  <ul>
                    {projectMainCategories.map((mainCat) => (
                      <li key={mainCat}>
                        <button
                          onClick={() => toggleMainCategory(mainCat!)}
                          className={`submenu-link ${
                            activeMainCategory === mainCat ? "active" : ""
                          }`}
                        >
                          <span className="submenu-arrow">
                            {activeMainCategory === mainCat ? "▼" : "›"}
                          </span>{" "}
                          {mainCat}
                        </button>

                        {activeMainCategory === mainCat &&
                          getProjectSubCategories(mainCat).map((subCat) => (
                            <div key={subCat} className="pl-4">
                              <button
                                onClick={() => toggleSubCategory(subCat!)}
                                className={`submenu-link ${
                                  activeSubCategory === subCat ? "active" : ""
                                }`}
                              >
                                <span className="submenu-arrow">
                                  {activeSubCategory === subCat ? "▼" : "›"}
                                </span>{" "}
                                {subCat}
                              </button>

                              {activeSubCategory === subCat && (
                                <ul className="nested-guide-list">
                                  {getProjectsBySubCategory(
                                    mainCat,
                                    subCat!
                                  ).map((proj) => (
                                    <li key={proj.slug}>
                                      <Link
                                        href={`/prosjekter/${slugify(
                                          mainCat!
                                        )}/${slugify(subCat!)}/${proj.slug}`}
                                        onClick={closeSidebar}
                                        className="guide-link"
                                      >
                                        {proj.title}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </aside>
        </div>
      </>
    </div>
  );
}
