// app/auth/login/page.tsx
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Eye, EyeOff, ArrowLeft } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { auth } from "@/lib/firebase"
import { isSignInWithEmailLink, signInWithEmailLink, signInWithEmailAndPassword } from "firebase/auth"
import { googleProvider } from "@/lib/firebase"
import { signInWithPopup } from "firebase/auth"
import toast from "react-hot-toast"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [activeTab, setActiveTab] = useState("client")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { login } = useAuth()

  useEffect(() => {
    // handle magic-link sign-in (if used)
    if (typeof window !== "undefined" && isSignInWithEmailLink(auth, window.location.href)) {
      const storedEmail = window.localStorage.getItem("emailForSignIn")
      const emailPrompt = storedEmail || window.prompt("Please provide your email for confirmation")
      if (!emailPrompt) return
      setLoading(true)
      signInWithEmailLink(auth, emailPrompt, window.location.href)
        .then(() => {
          window.localStorage.removeItem("emailForSignIn")
          toast.success("Signed in!")
          router.push("/book")
        })
        .catch((err) => {
          setError(err.message || "Magic link sign-in failed")
        })
        .finally(() => setLoading(false))
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    const fd = new FormData(e.currentTarget)
    const email = fd.get("email") as string
    const password = fd.get("password") as string

    try {
      // login via AuthProvider (it enforces email verification)
      await login(email, password)
      toast.success("Welcome back!")
      router.push("/book")
    } catch (err: any) {
      setError(err.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setLoading(true)
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
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
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
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Sign in to your account</CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="client">Client</TabsTrigger>
                <TabsTrigger value="therapist">Therapist</TabsTrigger>
              </TabsList>
            </Tabs>

            {error && <div className="mb-4 text-red-600">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Email</Label>
                <Input name="email" type="email" placeholder="you@example.com" required />
              </div>

              <div>
                <Label>Password</Label>
                <div className="relative">
                  <Input name="password" type={showPassword ? "text" : "password"} placeholder="Your password" required />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 px-2 py-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                Sign in
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">or continue with</div>

            <div className="mt-3 grid gap-3">
              <Button variant="outline" onClick={handleGoogle} disabled={loading}>
                Continue with Google
              </Button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account? <Link href="/auth/register" className="text-purple-600">Register</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

