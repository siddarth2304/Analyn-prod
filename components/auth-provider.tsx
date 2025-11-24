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

      if (user) {
        // user logged in → create backend session
        await fetchAndSetToken(user);
        setLoading(false);
      } else {
        // user logged out → clear backend session
        await fetch("/api/auth/session", { method: "DELETE" });
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Create session cookie on backend
  const fetchAndSetToken = async (firebaseUser: User) => {
    try {
      const idToken = await firebaseUser.getIdToken(true); // force refresh
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

  // FIXED LOGIN FUNCTION — prevents infinite loading on wrong password
  const login = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase not initialized");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // If user did not verify email
      if (!userCredential.user.emailVerified) {
        await signOut(auth);
        throw new Error("Email not verified. Please check your inbox.");
      }

      // onAuthStateChanged will finish login
    } catch (err) {
      setLoading(false); // 🔥 CRITICAL FIX — prevent infinite loading
      throw err;         // pass error to UI
    }
  };

  const logout = async () => {
    if (!auth) throw new Error("Firebase not initialized");
    setLoading(true);
    await signOut(auth);
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
