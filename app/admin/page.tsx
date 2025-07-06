"use client";

import Link from "next/link";

export default function AdminPage() {
  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      {/* Page title and intro */}
      <h1 className="text-3xl font-bold text-purple-900 mb-6">
        Admin Dashboard
      </h1>
      <p className="text-gray-700 mb-10">
        Her kan du administrere innholdet på plattformen.
      </p>

      {/* Admin cards for quick access */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Link to guide management */}
        <Link
          href="/admin/guides"
          className="block p-6 bg-white shadow-md rounded-lg hover:shadow-lg transition"
        >
          <h2 className="text-xl font-semibold text-purple-700 mb-2">
            📘 Guider
          </h2>
          <p className="text-gray-600">Opprett, rediger eller slett guider.</p>
        </Link>

        {/* Link to project management */}
        <Link
          href="/admin/projects"
          className="block p-6 bg-white shadow-md rounded-lg hover:shadow-lg transition"
        >
          <h2 className="text-xl font-semibold text-purple-700 mb-2">
            📂 Prosjekter
          </h2>
          <p className="text-gray-600">
            Opprett, rediger eller slett prosjekter.
          </p>
        </Link>

        {/* Link to view user feedback */}
        <Link
          href="/admin/feedback"
          className="block p-6 bg-white shadow-md rounded-lg hover:shadow-lg transition"
        >
          <h2 className="text-xl font-semibold text-purple-700 mb-2">
            💬 Tilbakemeldinger
          </h2>
          <p className="text-gray-600">
            Se hva brukerne mener om guider og prosjekter.
          </p>
        </Link>
      </div>
    </main>
  );
}
