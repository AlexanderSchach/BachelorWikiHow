"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Domine, Work_Sans } from "next/font/google";

// Font setup
const domine = Domine({
  subsets: ["latin"],
  weight: "700",
});

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

interface Guide {
  id: string;
  title: string;
  slug: string;
  image?: string;
  updatedAt?: Timestamp;
  author?: string;
}

const getRandomItems = <T,>(arr: T[], count: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

export default function GuidesShowcase() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [recentUpdates, setRecentUpdates] = useState<Guide[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDocs(collection(db, "guides"));
      const all = snap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Guide[];

      const selected = all.length <= 3 ? all : getRandomItems(all, 3);
      setGuides(selected);

      const q = query(
        collection(db, "guides"),
        orderBy("updatedAt", "desc"),
        limit(5)
      );
      const updateSnap = await getDocs(q);
      const updates = updateSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Guide[];
      setRecentUpdates(updates);

      setLoading(false);
    };
    fetch();
  }, []);

  useEffect(() => {
    if (isHovered || guides.length < 2) return;

    const interval = setInterval(() => {
      setSelectedIndex((prev) => (prev + 1) % guides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [isHovered, guides]);

  const formatDate = (ts?: Timestamp) => {
    if (!ts) return "Ukjent dato";

    const date = ts.toDate();
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return "Nettopp nå";
    if (diff < 3600) return `${Math.floor(diff / 60)} min siden`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} timer siden`;
    if (diff < 30 * 86400) return `${Math.floor(diff / 86400)} dager siden`;

    return date.toLocaleDateString("no-NO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="text-center py-10 text-gray-500">Laster guider...</div>
    );
  }

  return (
    <section
      className={`${workSans.className} bg-[#e7dae9] px-4 py-10 sm:px-6 lg:px-16 rounded-xl`}
    >
      <div className="flex flex-col lg:flex-row max-w-7xl mx-auto gap-12">
        {/* Popular guides carousel */}
        <div className="w-full lg:w-3/5 flex flex-col items-center">
          <h2
            className={`text-[24px] font-bold ${domine.className} text-[#93359a] mb-6 text-center`}
          >
            Populære Guider
          </h2>

          <div
            className="relative w-full h-[390px] flex justify-center items-center mt-6"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {guides.map((guide, index) => {
              const card = (
                <div className="w-full h-full bg-white rounded-xl overflow-hidden flex flex-col shadow-md transition-all relative group">
                  <img
                    src={guide.image || "/guide-images/placeholder1.jpg"}
                    alt={guide.title}
                    className="w-full h-[300px] object-cover rounded-t-xl"
                  />
                  <div className="w-full bg-[#3c005a] p-2 text-center text-[#ebd7ff] font-semibold transition-all duration-300 h-[70px] overflow-hidden rounded-b-xl group-hover:h-[120px]">
                    <p className="text-[18px]">{guide.title}</p>
                    <p className="text-[14px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-2">
                      Klikk for å lese mer om denne guiden.
                    </p>
                  </div>
                </div>
              );

              const isActive = index === selectedIndex;
              const isLeft =
                index === (selectedIndex - 1 + guides.length) % guides.length;
              const isRight = index === (selectedIndex + 1) % guides.length;

              return (
                <div
                  key={guide.id}
                  className={`transition-all duration-500 w-full max-w-[320px]
                    ${
                      isActive
                        ? "relative z-10 scale-100 opacity-100"
                        : "hidden"
                    }
                    md:block md:absolute
                    ${
                      isLeft
                        ? "md:-translate-x-[55%] md:scale-90 md:opacity-50 md:blur-sm"
                        : isRight
                        ? "md:translate-x-[55%] md:scale-90 md:opacity-50 md:blur-sm"
                        : !isActive
                        ? "md:opacity-0"
                        : ""
                    }
                  `}
                  style={{
                    cursor: index !== selectedIndex ? "pointer" : "default",
                  }}
                  onClick={() => {
                    if (index !== selectedIndex) setSelectedIndex(index);
                  }}
                >
                  {isActive ? (
                    <Link href={`/guide/${guide.slug}`}>{card}</Link>
                  ) : (
                    card
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Recently Updated Guides List */}
        <div className="w-full lg:w-2/5 border-t lg:border-t-0 lg:border-l border-[#240943] pt-10 lg:pt-0 lg:pl-8">
          <h2
            className={`text-[24px] font-bold ${domine.className} text-[#93359a] mb-6 text-center lg:text-left`}
          >
            Sist oppdatert
          </h2>
          <ul className="space-y-6">
            {recentUpdates.map((guide) => (
              <li key={guide.id}>
                <Link
                  href={`/guide/${guide.slug}`}
                  className="flex items-center justify-between group hover:bg-purple-50 p-3 rounded-md transition-all"
                >
                  <div className="flex flex-col">
                    <p className="font-semibold text-md text-gray-900 truncate">
                      {guide.title}
                    </p>
                    <p className="text-sm text-gray-700">
                      Skrevet av{" "}
                      <span className="font-semibold text-gray-900">
                        {guide.author || "Yobr"}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(guide.updatedAt)}
                    </p>
                  </div>
                  <img
                    src="/arrow-icon.png"
                    alt="Arrow"
                    className="w-5 h-5 ml-4 transform transition-transform duration-300 group-hover:translate-x-2"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
