// Load environment variables from .env.local
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { OpenAI } from "openai";

// Initialize OpenAI client with API key from environment
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates an embedding vector for the given text using OpenAI's embedding model.
 *
 * @param text - The input text to embed
 * @returns A Promise that resolves to an array of numbers representing the text embedding
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text,
  });

  // Return the first embedding vector from the result
  return response.data[0].embedding;
}
