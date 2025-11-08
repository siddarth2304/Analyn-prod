"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getAuth, isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth"
import { app } from "@/lib/firebase" // <-- THIS IS THE FIX
import { Button } from "@/components/ui/button"
import { toast } from "react-hot-toast"

export default function VerifyPage() {
  const [verified, setVerified] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const auth = getAuth(app)
    const link = window.location.href
    if (isSignInWithEmailLink(auth, link)) {
      const email = window.localStorage.getItem("emailForSignIn")
      if (!email) return toast.error("Email not found")

      signInWithEmailLink(auth, email, link)
        .then(async (res) => {
          // Call backend to set verified: true
          await fetch("/api/users/activate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          })
          setVerified(true)
          toast.success("Account activated! You can now login.")
        })
        .catch((err) => toast.error(err.message))
    }
  }, [])

  if (!verified)
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50 text-stone-700 pt-20">
        <p className="text-center">Verifying your account...</p>
      </div>
    )

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50 text-stone-700 pt-20">
      <div className="max-w-md mx-auto text-center space-y-4">
        <h2 className="text-2xl font-bold text-stone-800">Account Activated!</h2>
        <p className="text-stone-700">
          You can now{" "}
          <a href="/auth/login" className="text-teal-600 hover:text-teal-700 underline">
            login
          </a>
          .
        </p>
        <Button
          onClick={() => router.push("/auth/login")}
          className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700"
        >
          Go to Login
        </Button>
      </div>
    </div>
  )
}