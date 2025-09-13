"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function BookingConfirmationPage() {
  const [data, setData] = useState<any>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    const raw = sessionStorage.getItem("analyn:lastBooking")
    if (raw) {
      try {
        setData(JSON.parse(raw))
      } catch {
        setData(null)
      }
    }
  }, [])

  if (!data) {
    return (
      <div className="max-w-xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Booking Confirmation</CardTitle>
          </CardHeader>
          <CardContent>
            <p>We could not find booking details. Please make a new booking.</p>
            <div className="mt-4">
              <Button asChild>
                <Link href="/book">Book another session</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { booking, service, therapist, date, time, amounts, coupon } = data

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Thank you! Your booking is confirmed.</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <div className="text-sm text-muted-foreground">Booking ID</div>
            <div className="font-mono">{booking?.id || "—"}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Service</div>
            <div className="font-medium">{service?.name}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Therapist</div>
            <div className="font-medium">
              {therapist?.name || [therapist?.first_name, therapist?.last_name].filter(Boolean).join(" ")}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-sm text-muted-foreground">Date</div>
              <div className="font-medium">
                {date ? new Date(date).toLocaleDateString() : booking?.booking_date || "—"}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Time</div>
              <div className="font-medium">{time || booking?.booking_time || "—"}</div>
            </div>
          </div>
          <div className="border-t pt-3 space-y-1">
            <div className="flex justify-between">
              <span>Service Fee</span>
              <span>₱{amounts?.servicePrice ?? "—"}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Platform Fee</span>
              <span>₱{amounts?.platformFee ?? "—"}</span>
            </div>
            {coupon?.applied && (
              <div className="flex justify-between text-sm text-green-700">
                <span>Coupon Discount ({coupon?.code || "code"})</span>
                <span>-₱{(coupon?.discountMinor || 0) / 100}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-lg border-t pt-2">
              <span>Total</span>
              <span>₱{amounts?.finalAmount ?? booking?.total_amount ?? "—"}</span>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button asChild>
              <Link href="/book">Book another session</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/">Go home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
