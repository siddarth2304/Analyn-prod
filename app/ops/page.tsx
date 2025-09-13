"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, MapPin, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"

type ActiveBooking = {
  id: number
  booking_date: string
  start_time: string
  status: string
  service_name: string
  client_first_name: string
  client_last_name: string
  therapist_first_name: string
  therapist_last_name: string
  last_client_latitude: number | null
  last_client_longitude: number | null
  last_therapist_latitude: number | null
  last_therapist_longitude: number | null
}

const MapView = dynamic(() => import("./parts/map-view"), { ssr: false })

export default function OpsDashboard() {
  const [bookings, setBookings] = useState<ActiveBooking[]>([])
  const [loading, setLoading] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/ops/active-bookings")
      const data = await res.json()
      setBookings(data.bookings || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const t = setInterval(fetchData, 5000)
    return () => clearInterval(t)
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Operations Dashboard</h1>
          <Button onClick={fetchData} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Live Map</CardTitle>
            </CardHeader>
            <CardContent className="h-[480px]">
              <MapView bookings={bookings} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Bookings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[480px] overflow-y-auto">
              {bookings.map((b) => (
                <div key={b.id} className="p-3 border rounded-lg bg-white">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">
                      #{b.id} {b.service_name}
                    </div>
                    <Badge
                      className={
                        b.status === "in_progress" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                      }
                    >
                      {b.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {b.client_first_name} {b.client_last_name} → {b.therapist_first_name} {b.therapist_last_name}
                  </div>
                  <div className="text-xs text-gray-500 mt-2 flex items-center">
                    <MapPin className="h-3 w-3 mr-1" /> Client:{" "}
                    {b.last_client_latitude
                      ? `${b.last_client_latitude.toFixed(4)}, ${b.last_client_longitude?.toFixed(4)}`
                      : "—"}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 flex items-center">
                    <Navigation className="h-3 w-3 mr-1" /> Therapist:{" "}
                    {b.last_therapist_latitude
                      ? `${b.last_therapist_latitude.toFixed(4)}, ${b.last_therapist_longitude?.toFixed(4)}`
                      : "—"}
                  </div>
                </div>
              ))}
              {bookings.length === 0 && <div className="text-sm text-gray-600">No active bookings.</div>}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
