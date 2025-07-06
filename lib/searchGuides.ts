import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";
import { generateEmbedding } from "./embedding";

// Calculates cosine similarity between two numeric vectors
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// Searches Firestore collection for entries similar to the query
export async function searchGuides(query: string) {
  const userEmbedding = await generateEmbedding(query);

  const snapshot = await getDocs(collection(db, "guides"));
  const guides: any[] = [];

  // Compare each guide's embedding to the query embedding
  snapshot.forEach((doc) => {
    const data = doc.data();
    if (data.embedding) {
      const similarity = cosineSimilarity(userEmbedding, data.embedding);
      guides.push({ ...data, similarity });
    }
  });

  // Sort by similarity descending and return top 5
  guides.sort((a, b) => b.similarity - a.similarity);
  return guides.slice(0, 5);
}
