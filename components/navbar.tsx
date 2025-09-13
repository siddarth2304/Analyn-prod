// components/navbar.tsx
"use client"

import Link from "next/link"
import { useState } from "react"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { User } from "lucide-react"

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
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex justify-between items-center font-sans shadow-md">
      
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 flex items-center justify-center">
          <span className="text-white font-extrabold text-lg">A</span>
        </div>
        <span className="text-2xl font-extrabold tracking-wide bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
          ANALYN
        </span>
      </Link>

      {/* Nav Links + Profile */}
      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-6">
          <Link href="/book" className="hover:underline hover:opacity-90 transition font-medium">
            Bookings
          </Link>
          <Link href="/therapists" className="hover:underline hover:opacity-90 transition font-medium">
            Therapists
          </Link>
          <Link href="/services" className="hover:underline hover:opacity-90 transition font-medium">
            Services
          </Link>
        </div>

        {/* Profile Dropdown */}
        <div className="relative ml-4">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-600 hover:ring-2 hover:ring-white transition"
          >
            <User className="w-5 h-5" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-md shadow-lg py-2 z-50">
              <Link
                href="/profile"
                className="block px-4 py-2 text-left hover:bg-blue-100 hover:text-blue-600 transition"
                onClick={() => setDropdownOpen(false)}
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 hover:bg-blue-100 hover:text-blue-600 transition"
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

