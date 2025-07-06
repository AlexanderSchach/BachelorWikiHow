import { NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI with API key from environment
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST handler for generating HTML-based content from title + description
export async function POST(req: Request) {
  const { title, description, context, length } = await req.json();

  // Ensure required fields are present
  if (!title || !description) {
    return NextResponse.json(
      { error: "Missing title or description" },
      { status: 400 }
    );
  }

  // Prompt instructs the AI to write HTML content in a structured format
  const prompt = `
Du er en erfaren fagperson som lager profesjonelle ${
    context?.includes("prosjekt") ? "prosjektbeskrivelser" : "guider"
  }.

Bruk HTML-tagger (<h2>, <p>, <ul>, <blockquote>) og følg en strukturert oppbygging.

Tittel: ${title}
Beskrivelse: ${description}

${
  length === "long"
    ? "Lag en grundig og omfattende guide med flere seksjoner og detaljerte forklaringer."
    : "Hold det kort og strukturert."
}
`;

  try {
    // Request AI-generated content from OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7, // Allows slight creative variation
    });

    // Extract and return the AI-generated content
    const generated = response.choices[0].message.content;
    return NextResponse.json({ content: generated });
  } catch (err: any) {
    // Log and return error if OpenAI request fails
    console.error("OpenAI error:", err.message || err);
    return NextResponse.json(
      { error: "OpenAI request failed." },
      { status: 500 }
    );
  }
}
