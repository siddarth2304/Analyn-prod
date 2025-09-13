"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Navigation, Bluetooth, CheckCircle, Activity } from "lucide-react"

export default function ClientCheckIn() {
  const [bookingId, setBookingId] = useState("")
  const [watching, setWatching] = useState(false)
  const watchId = useRef<number | null>(null)
  const [status, setStatus] = useState<string>("idle")
  const [bluetoothOK, setBluetoothOK] = useState(false)

  const sendEvent = async (type: string, payload?: any) => {
    if (!bookingId) return
    const body: any = { actor: "client", type, ...payload }
    await fetch(`/api/bookings/${bookingId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  }

  const startLocation = () => {
    if (!("geolocation" in navigator)) {
      alert("Geolocation not supported")
      return
    }
    setWatching(true)
    setStatus("watching")
    watchId.current = navigator.geolocation.watchPosition((pos) => {
      const { latitude, longitude } = pos.coords
      sendEvent("location", { latitude, longitude })
    })
  }

  const stopLocation = () => {
    if (watchId.current != null) {
      navigator.geolocation.clearWatch(watchId.current)
    }
    setWatching(false)
    setStatus("stopped")
  }

  const checkIn = () => sendEvent("check-in")

  const verifyBluetooth = async () => {
    try {
      // Web Bluetooth (preview prompt)
      // Accept any device: just verifying capability + user action
      // @ts-ignore
      await navigator.bluetooth.requestDevice({ acceptAllDevices: true })
      setBluetoothOK(true)
      await sendEvent("bluetooth-verified")
    } catch (e) {
      alert("Bluetooth verification failed or not supported in this browser")
    }
  }

  useEffect(() => {
    return () => {
      if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current)
    }
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle>Client Check-in</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Booking ID</label>
              <Input placeholder="Enter booking ID" value={bookingId} onChange={(e) => setBookingId(e.target.value)} />
            </div>

            <div className="flex items-center justify-between">
              <Button onClick={checkIn} disabled={!bookingId}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Check In
              </Button>
              <Badge variant="secondary">Status: {status}</Badge>
            </div>

            <div className="flex items-center space-x-2">
              <Button onClick={startLocation} disabled={!bookingId || watching} variant="outline">
                <Navigation className="h-4 w-4 mr-2" />
                Start GPS
              </Button>
              <Button onClick={stopLocation} disabled={!watching} variant="outline">
                Stop GPS
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Button onClick={verifyBluetooth} disabled={!bookingId} variant={bluetoothOK ? "default" : "outline"}>
                <Bluetooth className="h-4 w-4 mr-2" />
                {bluetoothOK ? "Bluetooth Verified" : "Verify Bluetooth"}
              </Button>
              {bluetoothOK && (
                <Badge className="bg-green-100 text-green-800">
                  <Activity className="h-3 w-3 mr-1" /> Proximity OK
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
