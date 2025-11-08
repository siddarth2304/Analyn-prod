// components/navbar.tsx
"use client"

import Link from "next/link"
import { useState } from "react"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { User, Leaf, Home } from "lucide-react" // 1. Import Home icon

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/auth/login")
    } catch (err) {
      console.error("Logout error:", err)
    }
  }

  return (
    // Changed background to white with a shadow for a clean, "spa-like" feel
    <nav className="bg-white text-stone-700 px-6 py-4 flex justify-between items-center font-sans shadow-md">
      {/* Logo - updated to match footer logo and page.tsx theme */}
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
          {/* 2. Add Home Icon Link Here */}
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

        {/* Profile Dropdown - updated to match theme */}
        <div className="relative ml-4">
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
        </div>
      </div>
    </nav>
  )
}