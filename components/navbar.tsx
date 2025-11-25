// components/navbar.tsx
"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { User, Leaf, Home, LogIn } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const router = useRouter()
  const { user, logout, loading } = useAuth()

  const handleLogout = async () => {
    setDropdownOpen(false)
    await logout()
  }

  // --- FIXED NAME LOGIC ---
  const displayName =
    user?.firstName ||
    user?.lastName ||
    user?.displayName ||
    user?.email?.split("@")[0] ||
    "User"

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

      {/* Nav Links */}
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-stone-600 hover:text-teal-600 transition" aria-label="Home">
            <Home className="w-5 h-5" />
          </Link>
          <Link href="/book" className="text-stone-600 hover:text-teal-600 transition font-medium">
            Bookings
          </Link>
          <Link href="/therapists" className="text-stone-600 hover:text-teal-600 transition font-medium">
            Therapists
          </Link>
          <Link href="/services" className="text-stone-600 hover:text-teal-600 transition font-medium">
            Services
          </Link>
        </div>

        {/* Profile / Login */}
        <div className="relative ml-4">
          {loading ? (
            <div className="w-10 h-10 rounded-full bg-stone-100 animate-pulse" />
          ) : user ? (
            <>
              {/* Greeting Button */}
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="px-4 h-10 rounded-full bg-stone-100 flex items-center justify-center text-teal-600 hover:bg-stone-200 transition font-medium"
              >
                👋 Hello, {displayName}
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-stone-700 rounded-md shadow-lg py-2 z-50">
                  <Link
                    href="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 hover:bg-teal-50 hover:text-teal-700 transition"
                  >
                    Profile
                  </Link>

                  <Link
                    href="/bookings"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 hover:bg-teal-50 hover:text-teal-700 transition"
                  >
                    My Bookings
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
