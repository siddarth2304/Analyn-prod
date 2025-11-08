"use client"

import { useEffect, useState, createContext, useContext } from "react"
import { 
  onAuthStateChanged, 
  User,
  signInWithEmailAndPassword, // We need this
  signOut                    // We need this
} from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation" // To redirect on logout

// 1. Define the new shape of your Auth Context
interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

// 2. Create the context with the new default values
const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  loading: true,
  login: async () => {}, // Default empty function
  logout: async () => {}  // Default empty function
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // This effect correctly listens for any auth change (login, logout, refresh)
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return; // Firebase not initialized (shouldn't happen with your new firebase.ts)
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  // 3. Define the login function
  // This is the function your login page will now receive
  const login = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase not initialized");

    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // This is the check your login page comment wanted!
    if (!userCredential.user.emailVerified) {
      await signOut(auth); // Log them out immediately
      throw new Error("Email not verified. Please check your inbox for a verification link.");
    }
    
    // Auth state is now set, the useEffect will handle the rest
    setUser(userCredential.user);
  }

  // 4. Define the logout function
  // Your navbar will use this
  const logout = async () => {
    if (!auth) throw new Error("Firebase not initialized");
    await signOut(auth);
    setUser(null); // Set user to null immediately
    router.push("/auth/login"); // Redirect to login page
  }

  // 5. Provide all the values to the app
  const value = {
    user,
    loading,
    login,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// This hook is now correct
export const useAuth = () => useContext(AuthContext)