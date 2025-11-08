// app/auth/login/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, ArrowLeft, Leaf } from "lucide-react"; // Import Leaf
import { useAuth } from "@/components/auth-provider";
import { auth, googleProvider } from "@/lib/firebase"; // This import is now safe
import {
  isSignInWithEmailLink,
  signInWithEmailLink,
  signInWithPopup,
} from "firebase/auth";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("client");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useAuth(); // Assuming useAuth is correctly configured

  // This effect handles the magic link sign-in
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      isSignInWithEmailLink(auth, window.location.href)
    ) {
      const storedEmail = window.localStorage.getItem("emailForSignIn");
      const emailPrompt =
        storedEmail || window.prompt("Please provide your email for confirmation");
      
      if (!emailPrompt) {
        toast.error("Email not found for sign-in link.");
        return;
      }

      setLoading(true);
      signInWithEmailLink(auth, emailPrompt, window.location.href)
        .then(() => {
          window.localStorage.removeItem("emailForSignIn");
          toast.success("Signed in!");
          router.push("/book");
        })
        .catch((err) => {
          setError(err.message || "Magic link sign-in failed");
        })
        .finally(() => setLoading(false));
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const email = fd.get("email") as string;
    const password = fd.get("password") as string;

    try {
      // login via AuthProvider
      await login(email, password);
      toast.success("Welcome back!");
      router.push("/book");
    } catch (err: any) {
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("Signed in with Google");
      router.push("/book"); // Redirect to booking or dashboard
    } catch (err: any) {
      setError(err.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50 text-stone-700 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-stone-600 hover:text-stone-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Link>
        </div>

        <Card className="bg-white shadow-lg border-0">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-600 to-emerald-600 flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-extrabold tracking-wide bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                ANALYN
              </span>
            </div>
            <CardTitle className="text-2xl text-stone-800">
              Welcome Back
            </CardTitle>
            <CardDescription>Sign in to your account</CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="mb-4"
            >
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="client">Client</TabsTrigger>
                <TabsTrigger value="therapist">Therapist</TabsTrigger>
              </TabsList>
            </Tabs>

            {error && (
              <div className="mb-4 text-red-600 bg-red-100 p-3 rounded-md">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-stone-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-3 grid gap-3">
              <Button
                variant="outline"
                onClick={handleGoogle}
                disabled={loading}
              >
                Continue with Google
              </Button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-stone-600">
                Don&apos;t have an account?{" "}
                <Link
                  href="/auth/register"
                  className="text-teal-600 hover:text-teal-700"
                >
                  Register
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}