import { NextResponse } from "next/server";
import { db } from "../../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";

// API endpoint for fetching "popular" guides
export async function GET() {
  // Fetch all guides from Firestore
  const snapshot = await getDocs(collection(db, "guides"));

  const guides: any[] = [];
  snapshot.forEach((doc) => {
    const data = doc.data();
    guides.push(data);
  });

  // Currently, "popular" is simulated by returning the first 5 entries.
  return NextResponse.json(guides.slice(0, 5));
}
