"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithPopup } from "firebase/auth"
import { auth, googleProvider } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import toast from "react-hot-toast"

export default function RegisterPage() {
  const [activeTab, setActiveTab] = useState("client")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!auth) return toast.error("Firebase not loaded yet")
    setError("")
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const email = fd.get("email") as string
    const password = fd.get("password") as string

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      if (cred.user) {
        await sendEmailVerification(cred.user, { url: window.location.origin + "/auth/login" })
        toast.success("Account created! Please verify your email before logging in.")
      }
    } catch (err: any) {
      setError(err.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    if (!auth) return toast.error("Firebase not loaded yet")
    setLoading(true)
    setError("")
    try {
      await signInWithPopup(auth, googleProvider)
      toast.success("Signed in with Google")
      router.push("/book")
    } catch (err: any) {
      setError(err.message || "Google sign-in failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
            Back to Home
          </Link>
        </div>

        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 flex items-center justify-center">
                <span className="text-white font-bold">A</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                ANALYN
              </span>
            </div>
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>Register to start booking</CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="client">Client</TabsTrigger>
                <TabsTrigger value="therapist">Therapist</TabsTrigger>
              </TabsList>
            </Tabs>

            {error && <div className="mb-4 text-red-600">{error}</div>}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input name="email" type="email" placeholder="you@example.com" required />
              </div>

              <div>
                <Label>Password</Label>
                <Input name="password" type="password" placeholder="Choose a strong password" required minLength={6} />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                Create account
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">or sign up with</div>

            <div className="mt-3">
              <Button variant="outline" onClick={handleGoogle} className="w-full" disabled={loading}>
                Continue with Google
              </Button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account? <Link href="/auth/login" className="text-purple-600">Login</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

