"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const LoginPage = () => {
  const router = useRouter();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Handle login form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/"); // Redirect to homepage on success
    } catch (err: any) {
      setErrorMsg("Feil e-post eller passord.");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f3f7] px-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        {/* Logo at top */}
        <div className="flex justify-center mb-6">
          <Image src="/LogoPurple.png" alt="Logo" width={100} height={100} />
        </div>

        {/* Page title */}
        <h2 className="text-2xl font-semibold text-center text-purple-800 mb-4">
          Logg inn
        </h2>

        {/* Login form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email field */}
          <div>
            <label className="block mb-1 text-sm text-gray-700">E-post</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Password field */}
          <div>
            <label className="block mb-1 text-sm text-gray-700">Passord</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Error message */}
          {errorMsg && (
            <p className="text-sm text-red-600 text-center">{errorMsg}</p>
          )}

          {/* Submit button */}
          <button
            type="submit"
            className="w-full bg-purple-700 text-white py-2 rounded hover:bg-purple-800 transition"
          >
            Logg inn
          </button>

          {/* Link to registration */}
          <p className="text-sm text-center text-gray-600 mt-4">
            Ikke registrert ennå?{" "}
            <Link href="/register" className="text-purple-600 underline">
              Registrer deg
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
