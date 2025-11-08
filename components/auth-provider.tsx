// File: components/auth-provider.tsx

"use client"

import { useEffect, useState, createContext, useContext } from "react"
import { 
  onAuthStateChanged, 
  User,
  signInWithEmailAndPassword,
  signOut 
} from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { createToken } from "@/lib/auth" // Import the createToken function

// Define the User type from your DB
// This is different from Firebase's User type
interface DbUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "client" | "therapist" | "admin";
}

interface AuthContextType {
  user: User | null // This is the Firebase user
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true,
  login: async () => {},
  logout: async () => {}
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
      if (user) {
        // User is logged in, get their custom token
        fetchAndSetToken(user);
      } else {
        // User is logged out, clear the custom token
        if (typeof window !== "undefined") {
          localStorage.removeItem("analyn:token");
        }
      }
    })
    return () => unsubscribe()
  }, [])

  // This function gets the custom JWT
  const fetchAndSetToken = async (firebaseUser: User) => {
    try {
      // 1. Get the Firebase token
      const idToken = await firebaseUser.getIdToken();

      // 2. Call our API to get the database profile
      const res = await fetch("/api/auth/profile", {
        headers: { Authorization: `Bearer ${idToken}` }
      });
      
      if (!res.ok) throw new Error("Failed to fetch user profile");
      
      const dbUser: DbUser = await res.json(); // This is the user from NeonDB
      
      // 3. Create the custom JWT (analyn:token)
      const customToken = createToken(dbUser);
      
      // 4. Save it to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("analyn:token", customToken);
      }
    } catch (error) {
      console.error("Failed to fetch/set custom token:", error);
    }
  }

  const login = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase not initialized");

    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    if (!userCredential.user.emailVerified) {
      await signOut(auth);
      throw new Error("Email not verified. Please check your inbox.");
    }
    
    setUser(userCredential.user);
    // Manually trigger token fetch on login
    await fetchAndSetToken(userCredential.user);
  }

  const logout = async () => {
    if (!auth) throw new Error("Firebase not initialized");
    await signOut(auth);
    setUser(null);
    // Clear token on logout
    if (typeof window !== "undefined") {
      localStorage.removeItem("analyn:token");
    }
    router.push("/auth/login");
  }

  const value = {
    user,
    loading,
    login,
    logout
  }

  // Show a loading screen while auth state is being determined
  if (loading) {
     return (
       <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50 flex items-center justify-center">
         <p className="text-stone-700">Loading...</p>
       </div>
     );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)