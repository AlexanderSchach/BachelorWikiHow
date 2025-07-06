"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import debounce from "lodash.debounce";
import { signOut } from "firebase/auth";
import { auth } from "../../../lib/firebase";

export default function NavBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [popular, setPopular] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | HTMLAnchorElement | null)[]>([]);

  const router = useRouter();

  useEffect(() => {
    // Preload popular guides to use as default suggestions
    fetch("/api/popular-guides")
      .then((res) => res.json())
      .then(setPopular)
      .catch((err) => console.error("Failed to fetch popular guides", err));
  }, []);

  useEffect(() => {
    // Dismiss search results if the user clicks outside the search area
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node) &&
        listRef.current &&
        !listRef.current.contains(e.target as Node)
      ) {
        setShowResults(false);
        setIsMobileSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // Support arrow keys and Enter for search result navigation
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!showResults) return;

      const items = query ? results : popular;
      const totalItems = items.length + (query ? 1 : 0);

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % totalItems);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + totalItems) % totalItems);
      } else if (e.key === "Enter" && selectedIndex >= 0) {
        itemRefs.current[selectedIndex]?.click();
      } else if (e.key === "Tab") {
        setShowResults(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showResults, results, popular, query, selectedIndex]);

  useEffect(() => {
    // Ensure selected search result stays in view
    const el = itemRefs.current[selectedIndex];
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  const debouncedSearch = useCallback(
    debounce(async (text: string) => {
      setLoading(true);
      try {
        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: text }),
        });
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setLoading(false);
      }
    }, 400),
    []
  );

  const handleSearch = (text: string) => {
    setQuery(text);
    setSelectedIndex(-1);

    // Don't run search API if input is less than 2 characters
    if (text.trim().length >= 2) {
      setShowResults(true);
      debouncedSearch(text);
    } else {
      setShowResults(false);
      setResults([]);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
    setSelectedIndex(-1);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (err) {
      console.error("Failed to logout:", err);
    }
  };

  const toggleSidebar = () => {
    const isSidebarOpen = document.body.classList.contains("sidebar-open");
    window.dispatchEvent(
      new CustomEvent("sidebarToggle", { detail: { open: !isSidebarOpen } })
    );
  };

  const highlightMatch = (text: string, term: string) => {
    if (!term) return text;
    const regex = new RegExp(`(${term})`, "gi");
    return text.split(regex).map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 text-black">
          {part}
        </mark>
      ) : (
        <span key={i}>{part}</span>
      )
    );
  };

  const renderSearchResults = () => {
    const items = query ? results : popular;
    const showAllIndex = items.length;
    itemRefs.current = [];

    return (
      <div
        className="absolute top-full left-0 bg-white text-black mt-1 rounded-md shadow-md z-50 p-2 w-full max-h-80 overflow-y-auto"
        ref={listRef}
        role="listbox"
        aria-label="Søkeresultater"
      >
        {loading && <p className="text-sm">🔍 Søker...</p>}
        {!loading && query && items.length === 0 && (
          <p className="text-sm">❌ Ingen relevante guider funnet.</p>
        )}
        {(items.length > 0 || (!query && popular.length > 0)) && (
          <>
            <ul>
              {items.map((guide, i) => (
                <li key={guide.slug}>
                  <Link
                    href={`/guide/${guide.slug}`}
                    ref={(el) => {
                      itemRefs.current[i] = el;
                    }}
                    onClick={() => {
                      // Let route change finish before hiding results
                      setTimeout(() => {
                        setShowResults(false);
                        setIsMobileSearchOpen(false);
                      }, 0);
                    }}
                    onMouseEnter={() => setSelectedIndex(i)}
                    className={`text-left w-full block px-2 py-2 hover:bg-purple-100 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      selectedIndex === i ? "bg-purple-100" : ""
                    }`}
                  >
                    <strong className="block text-base">
                      {highlightMatch(guide.title, query)}
                    </strong>
                    <p className="text-sm text-gray-600">
                      {highlightMatch(guide.description, query)}
                    </p>
                    {guide.category && (
                      <span className="text-xs mt-1 inline-block bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                        {guide.category}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
            {query && (
              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                ref={(el) => {
                  itemRefs.current[showAllIndex] = el;
                }}
                onClick={() => {
                  setShowResults(false);
                  setIsMobileSearchOpen(false);
                }}
                onMouseEnter={() => setSelectedIndex(showAllIndex)}
                className={`block text-sm mt-2 text-purple-700 hover:underline w-full text-left ${
                  selectedIndex === showAllIndex
                    ? "bg-purple-100 px-2 py-1 rounded"
                    : ""
                }`}
              >
                Se alle resultater →
              </Link>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <nav className="bg-[#240943] px-4 md:px-8 py-3 text-white w-full z-50 sticky top-0">
      <div className="max-w-screen-3xl mx-auto flex items-center justify-between relative">
        {/* Left: hamburger menu and logo */}
        <div className="flex items-center gap-4 md:gap-8">
          <button
            className="block md:hidden"
            onClick={toggleSidebar}
            aria-label="Åpne meny"
          >
            <Image src="/hamburgerW.png" alt="Meny" width={28} height={28} />
          </button>

          {/* Hide logo on mobile when search is active */}
          {!isMobileSearchOpen && (
            <div className="absolute left-1/2 transform -translate-x-1/2 md:static md:translate-x-1">
              <Link href="/" aria-label="Gå til forsiden" className="block">
                <Image src="/logo.png" alt="Logo" width={75} height={33} />
              </Link>
            </div>
          )}

          {/* Desktop search input */}
          <div className="hidden md:flex items-center gap-8" ref={wrapperRef}>
            <span className="text-lg font-semibold whitespace-nowrap">
              How-To-Wiki
            </span>
            <div className="relative" style={{ width: "500px" }}>
              <input
                type="text"
                placeholder="Søk..."
                value={query}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => setShowResults(true)}
                className="w-full rounded-full pl-10 pr-10 py-2 text-black bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                aria-label="Søk"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                <Image
                  src="/search-iconPurple.png"
                  alt=""
                  width={20}
                  height={20}
                />
              </div>
              {query.length > 0 && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:bg-gray-200 p-1 rounded-full"
                  aria-label="Fjern søk"
                >
                  <Image src="/close.png" alt="" width={18} height={18} />
                </button>
              )}
              {showResults && renderSearchResults()}
            </div>
          </div>
        </div>

        {/* Right: mobile search and nav links */}
        <div className="flex items-center gap-4">
          {/* Mobile search toggle/input */}
          <div className="flex items-center gap-2 md:hidden" ref={wrapperRef}>
            {!isMobileSearchOpen ? (
              <button
                onClick={() => {
                  setIsMobileSearchOpen(true);
                  setTimeout(() => {
                    document.getElementById("mobile-search-input")?.focus();
                  }, 100);
                }}
                aria-label="Åpne søk"
              >
                <Image
                  src="/search-iconPurple.png"
                  alt="Søk"
                  width={20}
                  height={20}
                />
              </button>
            ) : (
              <div className="relative w-[70vw] mx-auto">
                <input
                  id="mobile-search-input"
                  type="text"
                  placeholder="Søk..."
                  value={query}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => setShowResults(true)}
                  className="w-full rounded-full pl-8 pr-4 py-2 text-black bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  aria-label="Søk"
                />
                <div className="absolute left-2 top-1/2 transform -translate-y-1/2">
                  <Image
                    src="/search-iconPurple.png"
                    alt=""
                    width={18}
                    height={18}
                  />
                </div>
                {showResults && renderSearchResults()}
              </div>
            )}
          </div>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-6 max-[900px]:hidden">
            <Link href="#" className="hover:underline text-sm">
              Om oss
            </Link>
            <button
              onClick={handleLogout}
              className="hover:underline text-sm cursor-pointer"
              aria-label="Logg ut"
            >
              Logg ut
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
