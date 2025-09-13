"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Navigation, Bluetooth, CheckCircle, Timer } from "lucide-react"

export default function TherapistCheckIn() {
  const [bookingId, setBookingId] = useState("")
  const [watching, setWatching] = useState(false)
  const watchId = useRef<number | null>(null)
  const [status, setStatus] = useState<string>("idle")
  const [bluetoothOK, setBluetoothOK] = useState(false)

  const sendEvent = async (type: string, payload?: any) => {
    if (!bookingId) return
    await fetch(`/api/bookings/${bookingId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ actor: "therapist", type, ...payload }),
    })
  }

  const startGPS = () => {
    if (!("geolocation" in navigator)) {
      alert("Geolocation not supported")
      return
    }
    setWatching(true)
    setStatus("tracking")
    watchId.current = navigator.geolocation.watchPosition((pos) => {
      const { latitude, longitude } = pos.coords
      sendEvent("location", { latitude, longitude })
    })
  }

  const stopGPS = () => {
    if (watchId.current != null) navigator.geolocation.clearWatch(watchId.current)
    setWatching(false)
    setStatus("stopped")
  }

  const checkIn = () => sendEvent("check-in")
  const startSession = () => sendEvent("start")
  const completeSession = () => sendEvent("complete")

  const verifyBluetooth = async () => {
    try {
      // @ts-ignore
      await navigator.bluetooth.requestDevice({ acceptAllDevices: true })
      setBluetoothOK(true)
      await sendEvent("bluetooth-verified")
    } catch {
      alert("Bluetooth verification failed or not supported")
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
            <CardTitle>Therapist Check-in & Tracking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Booking ID</label>
              <Input placeholder="Enter booking ID" value={bookingId} onChange={(e) => setBookingId(e.target.value)} />
            </div>

            <div className="flex items-center space-x-2">
              <Button onClick={checkIn} disabled={!bookingId}>
                <CheckCircle className="h-4 w-4 mr-2" /> Arrived
              </Button>
              <Button onClick={startSession} disabled={!bookingId} variant="outline">
                <Timer className="h-4 w-4 mr-2" /> Start
              </Button>
              <Button onClick={completeSession} disabled={!bookingId} variant="outline">
                Complete
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Button onClick={startGPS} disabled={!bookingId || watching} variant="outline">
                <Navigation className="h-4 w-4 mr-2" /> Start GPS
              </Button>
              <Button onClick={stopGPS} disabled={!watching} variant="outline">
                Stop
              </Button>
              <Badge variant="secondary">Status: {status}</Badge>
            </div>

            <div className="flex items-center space-x-2">
              <Button onClick={verifyBluetooth} disabled={!bookingId} variant={bluetoothOK ? "default" : "outline"}>
                <Bluetooth className="h-4 w-4 mr-2" /> {bluetoothOK ? "Bluetooth Verified" : "Verify Bluetooth"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
