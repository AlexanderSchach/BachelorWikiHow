"use client";

import { useState } from "react";
import { db } from "../../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface FeedbackBoxProps {
  pageType: "guide" | "project";
  slug: string;
}

export default function FeedbackBox({ pageType, slug }: FeedbackBoxProps) {
  const [showModal, setShowModal] = useState(false);
  const [liked, setLiked] = useState<boolean | null>(null);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // When a user votes (like/dislike), open the feedback modal
  const handleVote = (vote: boolean) => {
    setLiked(vote);
    setShowModal(true);
  };

  // Submit feedback to Firestore and reset state
  const handleSubmit = async () => {
    if (liked === null) return;

    await addDoc(collection(db, "feedback"), {
      pageType,
      pageSlug: slug,
      liked,
      message,
      createdAt: serverTimestamp(),
    });

    setSubmitted(true);
    setShowModal(false);
    setMessage("");
    setLiked(null);
  };

  return (
    <div className="mt-16 bg-purple-50 p-6 rounded-xl text-center max-w-2xl mx-auto">
      <p className="text-purple-700 font-medium text-lg mb-4">
        Var denne {pageType === "guide" ? "guiden" : "prosjektet"} nyttig? Gi
        oss en vurdering!
      </p>

      {/* Voting buttons */}
      <div className="flex justify-center gap-8 text-3xl mb-2">
        <button
          onClick={() => handleVote(true)}
          aria-label="Lik dette"
          className="hover:scale-110 transition"
        >
          👍
        </button>
        <button
          onClick={() => handleVote(false)}
          aria-label="Ikke nyttig"
          className="hover:scale-110 transition"
        >
          👎
        </button>
      </div>

      {/* Show confirmation after successful submission */}
      {submitted && (
        <p className="text-sm text-green-600 mt-2">
          ✅ Takk for tilbakemeldingen!
        </p>
      )}

      {/* Feedback modal for optional comment input */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg relative">
            <h2 className="text-lg font-semibold mb-4 text-purple-900">
              Takk! Har du noen kommentarer?
            </h2>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Valgfritt: Hva likte du / hva kunne vært bedre?"
              className="w-full border rounded-md p-3 min-h-[100px] text-sm"
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-600 text-sm hover:underline"
              >
                Lukk
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-2 text-sm bg-purple-700 text-white rounded-md hover:bg-purple-800 transition"
              >
                Send inn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
