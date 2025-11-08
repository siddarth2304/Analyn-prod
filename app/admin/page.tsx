"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X } from "lucide-react" // Import icons
import toast from "react-hot-toast" // For better notifications

type Therapist = {
  id: number
  user_id: number
  is_verified: boolean
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  specialties?: string // This will be a JSON string like '["Swedish", "Deep Tissue"]'
  experience_years?: number
  hourly_rate?: number
  location?: string
  created_at?: string
}

export default function AdminPage() {
  const [pending, setPending] = useState<Therapist[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Retrieve stored JWT from your auth flow
  function getToken() {
    if (typeof window === "undefined") return ""
    return localStorage.getItem("analyn:token") || ""
  }

  // Fetch pending therapists from the API route we created
  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/therapists/pending", {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      })
      if (!res.ok) {
        const msg = await res.json().catch(() => ({}))
        throw new Error(msg?.error || "Failed to load pending therapists")
      }
      const data = await res.json()
      setPending(data.therapists || [])
    } catch (e: any) {
      setError(e?.message || "Error")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  // Approve a therapist
  async function approve(id: number) {
    try {
      const res = await fetch(`/api/admin/therapists/${id}/approve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      })
      if (!res.ok) {
        const msg = await res.json().catch(() => ({}))
        throw new Error(msg?.error || "Approve failed")
      }
      toast.success("Therapist approved!")
      await load() // Refresh the list
    } catch (e: any) {
      toast.error(e?.message || "Approve failed")
    }
  }

  // Reject a therapist
  async function reject(id: number) {
    // Add a confirmation dialog for safety
    if (!window.confirm("Are you sure? This will permanently delete the user and their application.")) {
      return
    }

    try {
      const res = await fetch(`/api/admin/therapists/${id}/reject`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      })
      if (!res.ok) {
        const msg = await res.json().catch(() => ({}))
        throw new Error(msg?.error || "Reject failed")
      }
      toast.success("Therapist rejected and deleted.")
      await load() // Refresh the list
    } catch (e: any) {
      toast.error(e?.message || "Reject failed")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50 text-stone-700 py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-stone-800">Admin · Therapist Approvals</h1>

        <Card className="bg-white shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-stone-800">
              Pending Therapists
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">{pending.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading && <p>Loading...</p>}
            {error && <p className="text-red-600 font-medium p-4 bg-red-100 rounded-md">{error}</p>}
            {!loading && pending.length === 0 && <p className="text-stone-500">No pending therapists.</p>}
            
            <ul className="space-y-4">
              {pending.map((t) => {
                let specialties: string[] = []
                try {
                  // Parse the JSON string from the database
                  specialties = JSON.parse(t.specialties || "[]")
                } catch (e) { console.error("Failed to parse specialties", e) }

                return (
                  <li key={t.id} className="border rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between">
                    <div className="flex-1 mb-4 md:mb-0">
                      <div className="font-medium text-lg text-stone-800">
                        {t.first_name || ""} {t.last_name || ""}
                      </div>
                      <div className="text-sm text-stone-500">{t.email}</div>
                      {t.location && <div className="text-sm text-stone-600">{t.location} • ₹{t.hourly_rate}</div>}
                      
                      {specialties.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {specialties.map(spec => (
                            <Badge key={spec} className="bg-emerald-100 text-emerald-800">{spec}</Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      <Button 
                        onClick={() => approve(t.id)} 
                        className="flex-1 md:flex-none bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button onClick={() => reject(t.id)} variant="destructive" className="flex-1 md:flex-none">
                        <X className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>

        <p className="text-sm text-stone-500 mt-4">
          Tip: Log in as an admin user to get a valid token stored as {"analyn:token"} in localStorage. The page will then
          load pending therapists and allow actions.
        </p>
      </div>
    </div>
  )
}