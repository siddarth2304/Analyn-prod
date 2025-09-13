"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { getAuth, isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth"
import app from "@/lib/firebase"
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

  if (!verified) return <p className="text-center mt-20">Verifying your account...</p>

  return (
    <div className="max-w-md mx-auto mt-20 text-center space-y-4">
      <h2 className="text-2xl font-bold">Account Activated!</h2>
      <p>You can now <a href="/auth/login" className="text-blue-600 underline">login</a>.</p>
      <Button onClick={() => router.push("/auth/login")}>Go to Login</Button>
    </div>
  )
}
