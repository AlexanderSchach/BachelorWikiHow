"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../../lib/firebase";

// Define the shape of authentication context
type AuthContextType = {
  user: User | null;
  loading: boolean;
};

// Provide a default context (user not known yet)
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

// Custom hook for easy access to auth context in components
export const useAuth = () => useContext(AuthContext);

// Provides Firebase auth state to the app through context
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
