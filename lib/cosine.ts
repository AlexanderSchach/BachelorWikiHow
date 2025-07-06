/**
   Calculates cosine similarity between two vectors.
  
   @param vecA - First vector
   @param vecB - Second vector (must be same length as vecA)
   @returns A number between -1 and 1 indicating similarity
 */
export function cosineSimilarity(vecA: number[], vecB: number[]) {
  // Compute the dot product between A and B
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);

  // Compute the magnitude of each vector
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));

  // Return cosine similarity score
  return dotProduct / (magnitudeA * magnitudeB);
}
