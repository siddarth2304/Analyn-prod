"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type Therapist = {
  id: number
  user_id: number
  is_verified: boolean
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  specialties?: string
  experience_years?: number
  hourly_rate?: number
  location?: string
  created_at?: string
}

export default function AdminPage() {
  const [pending, setPending] = useState<Therapist[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Retrieve stored JWT from your auth flow (e.g., after logging in as admin)
  // For demo, we read from localStorage "analyn:token"
  function getToken() {
    if (typeof window === "undefined") return ""
    return localStorage.getItem("analyn:token") || ""
  }

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
      await load()
    } catch (e: any) {
      alert(e?.message || "Approve failed")
    }
  }

  async function reject(id: number) {
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
      await load()
    } catch (e: any) {
      alert(e?.message || "Reject failed")
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Admin · Therapist Approvals</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Pending Therapists
            <Badge variant="secondary">{pending.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && <p>Loading...</p>}
          {error && <p className="text-red-600">{error}</p>}
          {!loading && pending.length === 0 && <p className="text-muted-foreground">No pending therapists.</p>}
          <ul className="space-y-4">
            {pending.map((t) => (
              <li key={t.id} className="border rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    {t.first_name || ""} {t.last_name || ""}
                  </div>
                  <div className="text-sm text-muted-foreground">{t.email}</div>
                  {t.location && <div className="text-sm">{t.location}</div>}
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => approve(t.id)} className="bg-green-600 hover:bg-green-700">
                    Approve
                  </Button>
                  <Button onClick={() => reject(t.id)} variant="destructive">
                    Reject
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground mt-4">
        Tip: Log in as an admin user to get a valid token stored as {"analyn:token"} in localStorage. The page will then
        load pending therapists and allow actions.
      </p>
    </div>
  )
}
