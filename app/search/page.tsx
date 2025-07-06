import { db } from "../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { generateEmbedding } from "../../lib/embedding";
import { cosineSimilarity } from "../../lib/cosine";
import { notFound } from "next/navigation";

// Server component that handles semantic search results
export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q || "";

  // Return 404 if no search query is provided
  if (!query) return notFound();

  // Generate semantic vector for the user's query
  const userEmbedding = await generateEmbedding(query);

  // Fetch all guides from Firestore
  const snapshot = await getDocs(collection(db, "guides"));
  const guides: any[] = [];

  // Calculate similarity between each guide and the query
  snapshot.forEach((doc) => {
    const data = doc.data();
    if (data.embedding) {
      const similarity = cosineSimilarity(userEmbedding, data.embedding);
      guides.push({ ...data, similarity });
    }
  });

  // Sort guides by most relevant first
  guides.sort((a, b) => b.similarity - a.similarity);

  return (
    <main className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Søkeresultat for: “{query}”</h1>

      {/* No results */}
      {guides.length === 0 ? (
        <p>Fant ingen relevante guider.</p>
      ) : (
        <ul className="space-y-6">
          {guides.map((guide, i) => (
            <li key={i} className="border p-4 rounded-lg shadow bg-white">
              <a href={`/guide/${guide.slug}`}>
                <h2 className="font-semibold text-purple-900 text-lg">
                  {guide.title}
                </h2>
                <p className="text-sm text-gray-600">{guide.description}</p>
                <p className="text-xs mt-2 italic text-gray-400">
                  {guide.category}
                </p>
              </a>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
