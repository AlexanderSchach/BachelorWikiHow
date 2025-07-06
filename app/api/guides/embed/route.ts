import { NextResponse } from "next/server";
import { generateEmbedding } from "../../../../lib/embedding";

// Handles embedding generation for guide content
export async function POST(req: Request) {
  const { text } = await req.json();

  // Ensure input text is provided
  if (!text) {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  try {
    // Generate vector embedding from input text for semantic search or AI
    const embedding = await generateEmbedding(text);
    return NextResponse.json({ embedding });
  } catch (err) {
    // Catch unexpected embedding service errors
    console.error("Embedding error:", err);
    return NextResponse.json(
      { error: "Failed to generate embedding" },
      { status: 500 }
    );
  }
}
