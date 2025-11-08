// components/navbar.tsx
"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { User, Leaf, Home, LogIn } from "lucide-react" // Import LogIn
import { useAuth } from "@/components/auth-provider" // 1. Import useAuth
import { Button } from "@/components/ui/button" // Import Button

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const router = useRouter()
  const { user, logout, loading } = useAuth() // 2. Use the hook

  // 3. Update the handleLogout function
  const handleLogout = async () => {
    setDropdownOpen(false) // Close dropdown on click
    await logout() // This now handles everything
  }

  return (
    <nav className="bg-white text-stone-700 px-6 py-4 flex justify-between items-center font-sans shadow-md">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-600 to-emerald-600 flex items-center justify-center">
          <Leaf className="w-6 h-6 text-white" />
        </div>
        <span className="text-2xl font-extrabold tracking-wide bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
          ANALYN
        </span>
      </Link>

      {/* Nav Links + Profile */}
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-stone-600 hover:text-teal-600 transition"
            aria-label="Home"
          >
            <Home className="w-5 h-5" />
          </Link>
          <Link
            href="/book"
            className="text-stone-600 hover:text-teal-600 transition font-medium"
          >
            Bookings
          </Link>
          <Link
            href="/therapists"
            className="text-stone-600 hover:text-teal-600 transition font-medium"
          >
            Therapists
          </Link>
          <Link
            href="/services"
            className="text-stone-600 hover:text-teal-600 transition font-medium"
          >
            Services
          </Link>
        </div>

        {/* 4. Conditional Profile Icon or Login Button */}
        <div className="relative ml-4">
          {loading ? (
            <div className="w-10 h-10 rounded-full bg-stone-100 animate-pulse" />
          ) : user ? (
            // Show Profile Dropdown if user is logged in
            <>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-teal-600 hover:bg-stone-200 transition"
              >
                <User className="w-5 h-5" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-stone-700 rounded-md shadow-lg py-2 z-50">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-left hover:bg-teal-50 hover:text-teal-700 transition"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-teal-50 hover:text-teal-700 transition"
                  >
                    Logout
                  </button>
                </div>
              )}
            </>
          ) : (
            // Show Login Button if user is logged out
            <Link href="/auth/login">
              <Button className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700">
                <LogIn className="w-4 h-4 mr-2" />
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}