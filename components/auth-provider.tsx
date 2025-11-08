// File: components/auth-provider.tsx

"use client";

import { useEffect, useState, createContext, useContext } from "react";
import {
  onAuthStateChanged,
  User,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      // --- THIS IS THE FIX ---
      if (user) {
        // User is logged in, DO NOT stop loading yet.
        // Wait for the session cookie to be created.
        await fetchAndSetToken(user);
        setLoading(false); // NOW we are done loading.
      } else {
        // User is logged out, clear the server session and stop loading.
        await fetch("/api/auth/session", { method: "DELETE" });
        setLoading(false); // We are done loading.
      }
      // --- END OF FIX ---
    });

    return () => unsubscribe();
  }, []);

  // This function tells the server to create the session cookie
  const fetchAndSetToken = async (firebaseUser: User) => {
    try {
      const idToken = await firebaseUser.getIdToken();
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      if (!res.ok) throw new Error("Failed to create session");
    } catch (error) {
      console.error("Failed to fetch/set session cookie:", error);
    }
  };

  const login = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase not initialized");
    setLoading(true);

    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    if (!userCredential.user.emailVerified) {
      await signOut(auth); // This will trigger onAuthStateChanged
      setLoading(false);
      throw new Error("Email not verified. Please check your inbox.");
    }
    // onAuthStateChanged will handle setting user and calling fetchAndSetToken
  };

  const logout = async () => {
    if (!auth) throw new Error("Firebase not initialized");
    setLoading(true);
    await signOut(auth);
    // onAuthStateChanged will clear the session and set user=null
    router.push("/auth/login");
  };

  const value = { user, loading, login, logout };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50 flex items-center justify-center">
        <p className="text-stone-700">Loading...</p>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);