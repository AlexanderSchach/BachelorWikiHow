"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useRouter } from "next/navigation";
import Image from "next/image";

const RegisterPage = () => {
  const router = useRouter();

  // Form state for user registration
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Handle registration form submit
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    try {
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update user profile with display name
      await updateProfile(userCredential.user, { displayName });

      // Redirect to profile page on success
      router.push("/profile");
    } catch (error: any) {
      console.error("Register error:", error);
      setErrorMsg("Noe gikk galt. Prøv igjen.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f3f7] px-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image src="/LogoPurple.png" alt="Logo" width={100} height={100} />
        </div>

        {/* Page title */}
        <h2 className="text-2xl font-semibold text-center text-purple-800 mb-4">
          Registrer deg
        </h2>

        {/* Registration form */}
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block mb-1 text-sm text-gray-700">Navn</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Email */}
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

          {/* Password */}
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
            Registrer deg
          </button>

          {/* Link to login */}
          <p className="text-sm text-center text-gray-600 mt-4">
            Har du allerede en konto?{" "}
            <a href="/login" className="text-purple-600 underline">
              Logg inn
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
