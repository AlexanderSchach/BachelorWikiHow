import { NextResponse } from "next/server";
import { generateEmbedding } from "../../../lib/embedding";
import { db } from "../../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

// Measures how similar two vectors are by angle — not magnitude
function cosineSimilarity(vecA: number[], vecB: number[]) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

export async function POST(req: Request) {
  const { query } = await req.json();

  // Ensure a search query was provided
  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  // Generate an embedding vector for the user's search input
  const userEmbedding = await generateEmbedding(query);

  // Fetch all guides from Firestore
  const snapshot = await getDocs(collection(db, "guides"));

  const guides: any[] = [];

  // Compare similarity between query embedding and each guide's embedding
  snapshot.forEach((doc) => {
    const data = doc.data();
    if (data.embedding) {
      const similarity = cosineSimilarity(userEmbedding, data.embedding);
      guides.push({ ...data, similarity });
    }
  });

  // Sort results by similarity score, descending
  guides.sort((a, b) => b.similarity - a.similarity);

  // Return top 5 most relevant guides
  return NextResponse.json(guides.slice(0, 5));
}
