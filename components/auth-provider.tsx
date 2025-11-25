// components/auth-provider.tsx

"use client";

import { useEffect, useState, createContext, useContext } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

interface AppUser {
  id?: number | null;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: AppUser | null;
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
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch user from /api/auth/me
  const fetchBackendUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) return null;
      return await res.json();
    } catch (err) {
      return null;
    }
  };

  // Sync Firebase login with backend session
  const createBackendSession = async (firebaseUser: FirebaseUser) => {
    try {
      const idToken = await firebaseUser.getIdToken(true);
      await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      const profile = await fetchBackendUser();
      setUser(profile);
    } catch (err) {
      console.error("Session creation failed", err);
    }
  };

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await createBackendSession(firebaseUser);
        setLoading(false);
      } else {
        await fetch("/api/auth/session", { method: "DELETE" });
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);

      if (!cred.user.emailVerified) {
        await signOut(auth);
        throw new Error("Email not verified. Please verify first.");
      }

      // onAuthStateChanged will handle session + user fetch
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  // Logout
  const logout = async () => {
    setLoading(true);
    await signOut(auth);
    router.push("/auth/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center text-stone-600">
          Loading...
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
