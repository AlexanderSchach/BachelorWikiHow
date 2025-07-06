"use client";

import { useEffect, useState } from "react";
import { db } from "../../../lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import Link from "next/link";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

type Feedback = {
  id: string;
  pageType: "guide" | "project";
  pageSlug: string;
  liked: boolean;
  message: string;
  createdAt: { seconds: number };
};

type TitleMap = Record<string, string>;

const COLORS = ["#4ade80", "#f87171"]; // Pie chart colors: green for positive, red for negative

export default function FeedbackAdminPage() {
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [titleMap, setTitleMap] = useState<TitleMap>({});
  const [loading, setLoading] = useState(true);

  // Fetch feedback + resolve titles for associated content
  useEffect(() => {
    const fetchFeedback = async () => {
      const fbSnap = await getDocs(query(collection(db, "feedback")));
      const feedback = fbSnap.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as Feedback))
        .sort(
          (a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)
        );

      setFeedbackList(feedback);

      // Create map of guide/project titles by slug
      const slugs = [
        ...new Set(feedback.map((f) => `${f.pageType}:${f.pageSlug}`)),
      ];

      const titleMap: TitleMap = {};

      for (const key of slugs) {
        const [type, slug] = key.split(":");
        const snap = await getDocs(
          query(
            collection(db, type === "guide" ? "guides" : "projects"),
            where("slug", "==", slug)
          )
        );

        if (!snap.empty) {
          titleMap[key] = snap.docs[0].data().title;
        }
      }

      setTitleMap(titleMap);
      setLoading(false);
    };

    fetchFeedback();
  }, []);

  // Remove feedback entry from Firestore + UI
  const handleDelete = async (id: string) => {
    if (confirm("Er du sikker på at du vil slette denne tilbakemeldingen?")) {
      await deleteDoc(doc(db, "feedback", id));
      setFeedbackList((prev) => prev.filter((f) => f.id !== id));
    }
  };

  // Calculate feedback stats
  const total = feedbackList.length;
  const up = feedbackList.filter((f) => f.liked).length;
  const down = total - up;

  const pieData = [
    { name: "Positiv", value: up },
    { name: "Negativ", value: down },
  ];

  // Group by slug to find most-reviewed content
  const grouped = feedbackList.reduce((acc, f) => {
    const key = `${f.pageType}:${f.pageSlug}`;
    acc[key] = acc[key] ? acc[key] + 1 : 1;
    return acc;
  }, {} as Record<string, number>);

  const topRated = Object.entries(grouped)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <main className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-purple-800">
          📬 Tilbakemeldinger
        </h1>
        <Link href="/admin" className="text-sm text-gray-500 hover:underline">
          ← Tilbake til admin
        </Link>
      </div>

      {/* Stats and pie chart */}
      <section className="mb-10 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex justify-center">
          <PieChart width={280} height={240}>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
            >
              {pieData.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-purple-50 rounded-lg text-center">
            <h2 className="text-2xl font-bold text-purple-800">{total}</h2>
            <p className="text-sm text-gray-600">Totalt antall</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg text-center">
            <h2 className="text-2xl font-bold text-green-800">{up}</h2>
            <p className="text-sm text-gray-600">👍 Positiv</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg text-center">
            <h2 className="text-2xl font-bold text-red-700">{down}</h2>
            <p className="text-sm text-gray-600">👎 Negativ</p>
          </div>
        </div>
      </section>

      {/* Top rated content */}
      {topRated.length > 0 && (
        <section className="mb-10">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            🏆 Mest vurderte sider
          </h3>
          <ul className="text-sm text-gray-700 space-y-2">
            {topRated.map(([key, count]) => {
              const [type, slug] = key.split(":");
              const title = titleMap[key] || slug;
              const href =
                type === "guide" ? `/guide/${slug}` : `/prosjekter/${slug}`;

              return (
                <li key={key}>
                  <Link
                    href={href}
                    className="font-medium text-purple-700 hover:underline"
                  >
                    {title}
                  </Link>{" "}
                  – {count} tilbakemeldinger ({type})
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* full feedback list */}
      <section>
        <h3 className="text-lg font-semibold text-purple-800 mb-4">
          💬 Alle tilbakemeldinger
        </h3>

        {loading ? (
          <p>Laster inn...</p>
        ) : feedbackList.length === 0 ? (
          <p>Ingen tilbakemeldinger ennå.</p>
        ) : (
          <ul className="space-y-4">
            {feedbackList.map((fb) => {
              const key = `${fb.pageType}:${fb.pageSlug}`;
              const title = titleMap[key] || fb.pageSlug;

              return (
                <li
                  key={fb.id}
                  className="border p-4 rounded-lg bg-white shadow-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="text-sm px-2 py-1 rounded-full bg-gray-100 text-gray-800 mr-2">
                        {fb.pageType}
                      </span>
                      <Link
                        href={
                          fb.pageType === "guide"
                            ? `/guide/${fb.pageSlug}`
                            : `/prosjekter/${fb.pageSlug}`
                        }
                        className="text-purple-700 hover:underline text-sm"
                      >
                        {title}
                      </Link>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xl">{fb.liked ? "👍" : "👎"}</span>
                      <button
                        onClick={() => handleDelete(fb.id)}
                        className="text-red-500 text-sm hover:underline"
                      >
                        🗑 Slett
                      </button>
                    </div>
                  </div>

                  {fb.message && (
                    <p className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">
                      {fb.message}
                    </p>
                  )}

                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(fb.createdAt.seconds * 1000).toLocaleString(
                      "no-NO"
                    )}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
