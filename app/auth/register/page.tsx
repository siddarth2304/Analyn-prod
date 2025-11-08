// app/auth/register/page.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase"; // This import is now safe
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
import toast from "react-hot-toast";
import { Leaf, ArrowLeft } from "lucide-react"; // Import Leaf and ArrowLeft

export default function RegisterPage() {
  const [activeTab, setActiveTab] = useState("client");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // This function creates the user in your NeonDB
  const createUserInDatabase = async (user: any, role: string) => {
    try {
      const { uid, email } = user;
      // Extract names from form, or use defaults
      const firstName = (document.querySelector('input[name="firstName"]') as HTMLInputElement)?.value || "New";
      const lastName = (document.querySelector('input[name="lastName"]') as HTMLInputElement)?.value || "User";

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          firebaseUid: uid,
          firstName,
          lastName,
          role,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create user profile in database.");
      }
    } catch (dbError: any) {
      console.error("Database user creation failed:", dbError);
      toast.error("Error setting up your profile. Please contact support.");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const fd = new FormData(e.currentTarget as HTMLFormElement);
    const email = fd.get("email") as string;
    const password = fd.get("password") as string;
    const role = activeTab; // 'client' or 'therapist'

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      // Create user in NeonDB *after* successful Firebase creation
      if (cred.user) {
        await createUserInDatabase(cred.user, role);
        await sendEmailVerification(cred.user, {
          url: window.location.origin + "/auth/login",
        });
        toast.success(
          "Account created! Please verify your email before logging in."
        );
        router.push("/auth/login"); // Send to login page
      }
    } catch (err: any) {
      // This is the fix for "email-already-in-use"
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already in use. Please log in instead.");
      } else {
        setError(err.message || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    const role = activeTab; // 'client' or 'therapist'

    try {
      const result = await signInWithPopup(auth, googleProvider);
      
      // Create user in NeonDB after Google sign-in
      await createUserInDatabase(result.user, role);

      toast.success("Signed in with Google");
      router.push("/book");
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
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
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
              Create Account
            </CardTitle>
            <CardDescription>
              Register to start your wellness journey
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="mb-4"
            >
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="client">I'm a Client</TabsTrigger>
                <TabsTrigger value="therapist">I'm a Therapist</TabsTrigger>
              </TabsList>
            </Tabs>

            {error && (
              <div className="mb-4 text-red-600 bg-red-100 p-3 rounded-md">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input name="firstName" id="firstName" placeholder="First" required />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input name="lastName" id="lastName" placeholder="Last" required />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  name="email"
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  name="password"
                  id="password"
                  type="password"
                  placeholder="Choose a strong password"
                  required
                  minLength={6}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
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

            <div className="mt-3">
              <Button
                variant="outline"
                onClick={handleGoogle}
                className="w-full"
                disabled={loading}
              >
                Continue with Google
              </Button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-stone-600">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-teal-600 hover:text-teal-700">
                  Login
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}