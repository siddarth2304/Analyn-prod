"use client"

import { useState, useEffect, createContext, useContext } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: "client" | "therapist" | "admin"
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string, role?: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  isLoading: boolean
}

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  role: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for stored auth token on mount
    const token = localStorage.getItem("auth_token")
    if (token) {
      // Verify token is still valid
      try {
        const payload = JSON.parse(atob(token.split(".")[1]))
        if (payload.exp * 1000 > Date.now()) {
          setUser({
            id: payload.userId,
            email: payload.email,
            firstName: payload.firstName || "",
            lastName: payload.lastName || "",
            role: payload.role,
          })
        } else {
          localStorage.removeItem("auth_token")
          localStorage.removeItem("user_role")
        }
      } catch (error) {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user_role")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string, role?: string) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Login failed")
      }

      // Store auth token
      localStorage.setItem("auth_token", data.token)
      localStorage.setItem("user_role", data.user.role)

      setUser(data.user)

      // Redirect based on role
      switch (data.user.role) {
        case "admin":
          router.push("/admin")
          break
        case "therapist":
          router.push("/therapist/dashboard")
          break
        default:
          router.push("/client/dashboard")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: RegisterData) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Registration failed")
      }

      // Auto-login after successful registration
      await login(userData.email, userData.password, userData.role)
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_role")
    setUser(null)
    router.push("/")
  }

  return {
    user,
    login,
    register,
    logout,
    isLoading,
  }
}
