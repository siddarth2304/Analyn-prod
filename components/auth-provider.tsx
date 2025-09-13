// components/auth-provider.tsx
"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { auth, googleProvider } from "@/lib/firebase"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendEmailVerification,
  signOut,
  User,
} from "firebase/auth"

type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  googleSignIn: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setIsLoading(false)
    })
    return () => unsub()
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      // enforce email verification for password accounts
      if (!cred.user.emailVerified) {
        await signOut(auth)
        throw new Error("Please verify your email address before logging in. Check your inbox.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      // send verification email (standard email verification)
      if (cred.user) {
        await sendEmailVerification(cred.user, {
          url: typeof window !== "undefined" ? window.location.origin + "/auth/login" : "/auth/login",
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const googleSignIn = async () => {
    setIsLoading(true)
    try {
      await signInWithPopup(auth, googleProvider)
      // google accounts are already considered verified
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await signOut(auth)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, googleSignIn, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

