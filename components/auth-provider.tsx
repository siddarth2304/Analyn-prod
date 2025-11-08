// File: components/auth-provider.tsx

"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { onAuthStateChanged, User, signInWithEmailAndPassword, signOut } from "firebase/auth";
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

  // This effect just handles the client-side state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      
      // When auth state changes, call our session API
      if (user) {
        // User logged in, create the server session
        user.getIdToken().then(async (idToken) => {
          await fetch("/api/auth/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
          });
        });
      } else {
        // User logged out, destroy the server session
        fetch("/api/auth/session", { method: "DELETE" });
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase not initialized");
    setLoading(true); // Show loading on login attempt
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    if (!userCredential.user.emailVerified) {
      await signOut(auth); // This will trigger the onAuthStateChanged
      setLoading(false);
      throw new Error("Email not verified. Please check your inbox.");
    }
    // onAuthStateChanged will handle the rest
  };

  const logout = async () => {
    if (!auth) throw new Error("Firebase not initialized");
    setLoading(true);
    await signOut(auth);
    // onAuthStateChanged will handle the rest
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