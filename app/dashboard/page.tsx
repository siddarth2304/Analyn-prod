"use client"

import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const router = useRouter()

  // Redirect if not logged in
  useEffect(() => {
    if (!user) router.push("/auth/login")
  }, [user, router])

  if (!user) return null

  return (
    <div className="p-6 bg-gray-50 min-h-[80vh]">
      <h1 className="text-3xl font-bold text-blue-600 mb-4">
        Welcome back, {user.displayName || user.email}!
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Example Stats Cards */}
        <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
          <h2 className="text-gray-500 font-medium">Appointments</h2>
          <p className="text-2xl font-bold mt-2">12</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
          <h2 className="text-gray-500 font-medium">Messages</h2>
          <p className="text-2xl font-bold mt-2">5</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
          <h2 className="text-gray-500 font-medium">Earnings</h2>
          <p className="text-2xl font-bold mt-2">$1,250</p>
        </div>
      </div>

      {/* Example Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition">
            Book Appointment
          </button>
          <button className="bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition">
            Send Message
          </button>
          <button
            onClick={() => logout()}
            className="bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

