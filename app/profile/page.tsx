"use client";

import Image from "next/image";
import Link from "next/link";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "../../lib/firebase";
import { useEffect, useRef, useState } from "react";

export default function ProfilePage() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null); // Reference for horizontal scrolling
  const [userName, setUserName] = useState<string | null>(null); // Stores the user's name or email

  // Fetch and display current user's display name or email on mount
  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUserName(user.displayName || user.email);
    }
  }, []);

  // Handles user logout and redirects to login page
  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Scrolls the recommendation card list horizontally
  const scrollByCard = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.firstChild
        ? (scrollRef.current.firstChild as HTMLElement).offsetWidth + 16
        : 300;
      scrollRef.current.scrollBy({
        left: direction === "right" ? cardWidth : -cardWidth,
        behavior: "smooth",
      });
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-6 py-10 bg-white rounded-xl shadow relative">
      {/* Profile header with avatar and user info */}
      <div className="flex flex-col items-center text-center mb-10">
        <Image
          src="/avatar.png"
          alt="Profilbilde"
          width={80}
          height={80}
          className="rounded-full mb-2"
        />
        <h1 className="text-2xl font-semibold text-[#240943]">Min Profil</h1>
        <p className="text-sm text-gray-600 mt-1">
          {userName || "Laster brukerinfo..."}
        </p>
      </div>

      {/* Saved resources section */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-[#240943] mb-3">Ressurser</h2>
        <div className="flex flex-col gap-3">
          {/* Link to saved guides */}
          <Link
            href="#"
            className="bg-[#93359A] text-white text-sm font-medium px-4 py-3 rounded-md hover:bg-[#7c2e87] flex items-center gap-2"
          >
            <Image
              src="/icons/GuideW.png"
              alt="Guides"
              width={20}
              height={20}
            />
            Mine lagrede Guides
          </Link>

          {/* Link to saved templates */}
          <Link
            href="#"
            className="bg-[#93359A] text-white text-sm font-medium px-4 py-3 rounded-md hover:bg-[#7c2e87] flex items-center gap-2"
          >
            <Image src="/MalIconW.png" alt="Maler" width={20} height={20} />
            Mine lagrede Maler
          </Link>
        </div>
      </section>

      {/* Recommendation cards section */}
      <section className="mb-12 relative">
        <h2 className="text-sm font-semibold text-[#240943] mb-3">
          Anbefalinger
        </h2>

        {/* Left scroll button */}
        <button
          onClick={() => scrollByCard("left")}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-300 shadow p-2 rounded-full hover:bg-gray-100"
        >
          <Image src="/icons/ArrowLeft.png" alt="Left" width={8} height={8} />
        </button>

        {/* Right scroll button */}
        <button
          onClick={() => scrollByCard("right")}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white border border-gray-300 shadow p-2 rounded-full hover:bg-gray-100"
        >
          <Image
            src="/icons/Arrow-Right.png"
            alt="Right"
            width={8}
            height={8}
          />
        </button>

        {/* Scrollable row of resource cards */}
        <div
          className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth px-10"
          ref={scrollRef}
        >
          {[
            {
              title: "Etikk og Personvern.",
              description:
                "En rask innføring i hvordan du håndterer etikk og personvern i studentprosjekter – fra innsamling av data til lagring og deling.",
              button: "Les guide",
              icon: "/icons/ArrowRightW.png",
            },
            {
              title: "SWOT-Analyse",
              description:
                "En rask innføring i hvordan du håndterer etikk og personvern i studentprosjekter – fra innsamling av data til lagring og deling.",
              button: "Last ned mal",
              icon: "/icons/Download.png",
            },
            {
              title: "Etikk og Personvern.",
              description:
                "En rask innføring i hvordan du håndterer etikk og personvern i studentprosjekter – fra innsamling av data til lagring og deling.",
              button: "Les guide",
              icon: "/icons/ArrowRightW.png",
            },
            {
              title: "Prosjektstruktur",
              description:
                "Hvordan du strukturerer et studentprosjekt effektivt fra start til slutt med tydelig mål og ansvar.",
              button: "Se eksempel",
              icon: "/icons/ArrowRightW.png",
            },
            {
              title: "Datainnsamling",
              description:
                "Tips og teknikker for å samle inn gyldig og pålitelig data i kvalitativ og kvantitativ forskning.",
              button: "Les mer",
              icon: "/icons/ArrowRightW.png",
            },
            {
              title: "Design Thinking",
              description:
                "Bruk Design Thinking for å forbedre idegenerering og problemløsning i prosjekter.",
              button: "Start nå",
              icon: "/icons/ArrowRightW.png",
            },
            {
              title: "Sprint Metode",
              description:
                "En praktisk guide til hvordan du gjennomfører en effektiv femdagers sprint i grupper.",
              button: "Last ned PDF",
              icon: "/icons/Download.png",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="w-[180px] h-[250px] bg-[#93359A] text-white p-4 rounded-xl flex-shrink-0 flex flex-col justify-between"
            >
              <div>
                <h3 className="text-sm font-semibold mb-2">{item.title}</h3>
                <p className="text-xs leading-snug line-clamp-5">
                  {item.description}
                </p>
              </div>
              <button className="flex items-center gap-2 bg-[#240943] text-white text-xs font-medium px-3 py-1.5 rounded-full hover:bg-[#1b0735] transition mt-4 self-start">
                {item.button}
                <Image src={item.icon} alt="icon" width={8} height={8} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* System-level links */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold text-[#240943] mb-3">System</h2>
        <div className="flex flex-col gap-3">
          <Link
            href="#"
            className="bg-[#93359A] text-white text-sm font-medium px-4 py-3 rounded-md hover:bg-[#7c2e87] flex items-center gap-2"
          >
            <Image src="/icons/GuideW.png" alt="Feil" width={20} height={20} />
            Rapportere Feil
          </Link>
          <Link
            href="#"
            className="bg-[#93359A] text-white text-sm font-medium px-4 py-3 rounded-md hover:bg-[#7c2e87] flex items-center gap-2"
          >
            <Image src="/MalIconW.png" alt="Om oss" width={20} height={20} />
            Om oss
          </Link>
          <Link
            href="#"
            className="bg-[#93359A] text-white text-sm font-medium px-4 py-3 rounded-md hover:bg-[#7c2e87] flex items-center gap-2"
          >
            <Image src="/MalIconW.png" alt="Kontakt" width={20} height={20} />
            Kom i Kontakt
          </Link>
          <Link
            href="#"
            className="bg-[#93359A] text-white text-sm font-medium px-4 py-3 rounded-md hover:bg-[#7c2e87] flex items-center gap-2"
          >
            <Image src="/MalIconW.png" alt="Hjelp" width={20} height={20} />
            Hjelp
          </Link>
        </div>
      </section>

      {/* Logout button */}
      <div className="flex justify-center">
        <button
          onClick={handleLogout}
          className="bg-[#93359A] text-white px-6 py-2 rounded-full text-sm font-medium hover:opacity-90 transition"
        >
          Logg ut →
        </button>
      </div>
    </main>
  );
}
