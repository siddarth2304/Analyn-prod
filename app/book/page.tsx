// File: app/book/page.tsx

"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar } from "@/components/ui/calendar"
import {
  MapPin,
  Clock,
  Star,
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Shield,
  CheckCircle,
  CalendarIcon,
  User,
  Phone,
  Percent,
} from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/components/auth-provider" // <-- 1. IMPORT AUTH

type Service = {
  id: string | number
  name: string
  description?: string
  duration?: number
  base_price?: number
  price?: number
  duration_minutes?: number
  category?: string
}
type Therapist = {
  id: string | number
  name?: string
  first_name?: string
  last_name?: string
  avatar?: string
  profile_image?: string
  rating?: number
  total_reviews?: number
  specialties?: string | string[]
  distance?: number
  location?: string
}

const PLATFORM_FEE = 150

function inr(n: number) {
  return `₹${(Math.round(n * 100) / 100).toLocaleString("en-IN", { minimumFractionDigits: 0 })}`
}

function evaluateCouponClient(code: string, total: number) {
  const normalized = code.trim().toLowerCase()
  
  // List of valid 100% off codes
  const flashSaleCodes = ["ajilamam100", "aswathymam100"]

  if (!normalized) return { valid: false, free: false, discount: 0, message: "" }

  // Check if the input code exists in our list
  if (flashSaleCodes.includes(normalized)) {
    return { valid: true, free: true, discount: total, message: "Flash sale applied: 100% off" }
  }

  return { valid: false, free: false, discount: 0, message: "Invalid coupon code" }
}

export default function BookingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // --- 2. PROTECT THE PAGE ---
  const { user, loading: authLoading } = useAuth();
  useEffect(() => {
    if (!authLoading && !user) {
      // User is not logged in, redirect them
      router.push("/auth/login?redirect=/book");
    }
  }, [authLoading, user, router]);
  // --- END PROTECTION ---

  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [services, setServices] = useState<Service[]>([])
  const [therapists, setTherapists] = useState<Therapist[]>([])

  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState("")
  const [clientInfo, setClientInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  })
  const [paymentMethod, setPaymentMethod] = useState<"card" | "wallet">("card")
  const [couponCode, setCouponCode] = useState("")
  const [couponMessage, setCouponMessage] = useState<string>("")
  const [couponApplied, setCouponApplied] = useState(false)

  // Card fields
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("") // MM/YY
  const [cardCvc, setCardCvc] = useState("")
  const [cardName, setCardName] = useState("")

  // Load from APIs (fallback to local mock)
  useEffect(() => {
    async function load() {
      try {
        const [sRes, tRes] = await Promise.allSettled([fetch("/api/services"), fetch("/api/therapists")])
        if (sRes.status === "fulfilled" && sRes.value.ok) {
          const data = await sRes.value.json()
          setServices((data?.services || data || []) as Service[])
        } else {
          setServices([
            {
              id: 1,
              name: "Swedish Therapeutic",
              description: "Deep massage...",
              duration: 60,
              price: 1399,
              category: "massage",
            },
            {
              id: 2,
              name: "Shiatsu",
              description: "Japanese therapy...",
              duration: 60,
              price: 1299,
              category: "massage",
            },
            {
              id: 3,
              name: "Swedish Aromatherapy", 
              description: "Long gliding strokes",
              duration: 60,
              price: 999,
              category: "massage",
            },
            {
              id: 4,
              name: "Office Syndrome Therapy", 
              description: "Intense session for postural stress",
              duration: 60,
              price: 2999,
              category: "massage",
            },
            {
              id: 5,
              name: "Deep Tissue Massage", 
              description: "Targets deep muscle layers",
              duration: 90,
              price: 1599,
              category: "massage",
            },
            {
              id: 6,
              name: "Hot Stone Massage", 
              description: "Heated stones for relaxation",
              duration: 75,
              price: 1499,
              category: "massage",
            },
          ] as any)
        }

        // --- REMOVED HARDCODE FIX ---
        // This will now fetch real, approved therapists
        if (tRes.status === "fulfilled" && tRes.value.ok) {
          const data = await tRes.value.json()
          setTherapists((data?.therapists || data || []) as Therapist[])
        } else {
          // Hardcoded list as a fallback in case API fails
          setTherapists([
            {
              id: 1,
              first_name: "Maria",
              last_name: "Santos",
              profile_image: "/professional-female-therapist.png",
              rating: 4.9,
              total_reviews: 127,
              specialties: ["Swedish", "Deep Tissue"],
              distance: 2.3,
              location: "Makati",
            },
            {
              id: 2,
              first_name: "Anna",
              last_name: "Rodriguez",
              profile_image: "/asian-female-therapist.png",
              rating: 4.8,
              total_reviews: 89,
              specialties: ["Shiatsu", "Prenatal"],
              distance: 3.1,
              location: "BGC",
            },
          ] as any)
        }
      } catch {
        /* ignore */
      }
    }
    // Only load data if the user is logged in
    if (!authLoading && user) {
      load()
    }
  }, [authLoading, user]) // Re-run when auth is ready

  // Preselect via query params
  useEffect(() => {
    if (!services.length && !therapists.length) return
    const sId = searchParams.get("service")
    const tId = searchParams.get("therapist")
    if (sId) {
      const s = services.find((x) => String(x.id) === String(sId))
      if (s) {
        setSelectedService(s)
        setCurrentStep(2)
      }
    }
    if (tId) {
      const t = therapists.find((x) => String(x.id) === String(tId))
      if (t) {
        setSelectedTherapist(t)
        if (sId) setCurrentStep(3)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [services, therapists, searchParams])

  const timeSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
    "17:30",
    "18:00",
    "18:30",
    "19:00",
    "19:30",
  ]

  const servicePrice = useMemo(() => {
    if (!selectedService) return 0
    const p = (selectedService.base_price ?? selectedService.price ?? 0) as number
    return Number(p)
  }, [selectedService])
  const totalBefore = servicePrice + (selectedService ? PLATFORM_FEE : 0)
  const couponEval = useMemo(() => evaluateCouponClient(couponCode, totalBefore), [couponCode, totalBefore])
  const discount = couponApplied && couponEval.valid ? couponEval.discount : 0
  const finalAmount = Math.max(0, totalBefore - discount)

  const canProceedToPay =
    !!selectedService &&
    !!selectedTherapist &&
    !!selectedDate &&
    !!selectedTime &&
    !!clientInfo.firstName &&
    !!clientInfo.email &&
    !!clientInfo.address?.trim()

  function handleApplyCoupon() {
    if (!couponCode.trim()) {
      setCouponMessage("Enter a coupon code")
      setCouponApplied(false)
      return
    }
    if (couponEval.valid) {
      setCouponApplied(true)
      setCouponMessage(couponEval.message || "Coupon applied")
    } else {
      setCouponApplied(false)
      setCouponMessage(couponEval.message || "Invalid coupon")
    }
  }

  function parseExpiry(exp: string) {
    const m = exp.match(/^\s*(\d{2})\s*\/\s*(\d{2})\s*$/)
    if (!m) return { month: null as number | null, year: null as number | null }
    return { month: Number(m[1]), year: 2000 + Number(m[2]) }
  }

  async function handleBooking() {
    setLoading(true)
    try {
      if (!selectedService || !selectedTherapist || !selectedDate || !selectedTime) return
      if (!clientInfo.address || !clientInfo.address.trim()) {
        alert("Please provide the service address before continuing.")
        setLoading(false)
        return
      }

      const { month: cardExpMonth, year: cardExpYear } = parseExpiry(cardExpiry)
      const payload: any = {
        therapistId: selectedTherapist.id,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        servicePrice: servicePrice,
        serviceDuration: selectedService.duration ?? selectedService.duration_minutes ?? 60,
        serviceCategory: selectedService.category ?? "massage",
        bookingDate: selectedDate.toISOString().slice(0, 10),
        startTime: selectedTime,
        endTime: selectedTime,
        clientAddress: clientInfo.address,
        clientLatitude: null,
        clientLongitude: null,
        notes: clientInfo.notes,
        currency: "inr",
        couponCode: couponApplied ? couponCode : undefined,
        clientEmail: clientInfo.email,
        clientFirstName: clientInfo.firstName,
        clientLastName: clientInfo.lastName,
        clientPhone: clientInfo.phone,
      }

      if (finalAmount > 0 && paymentMethod === "card") {
        if (!cardNumber || !cardExpMonth || !cardExpYear || !cardCvc || !cardName) {
          alert("Please enter complete card details or apply a valid free coupon.")
          setLoading(false)
          return
        }
        payload.cardNumber = cardNumber.replace(/\s|-/g, "")
        payload.cardExpMonth = cardExpMonth
        payload.cardExpYear = cardExpYear
        payload.cardCvc = cardCvc
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        let errMsg = "Payment/Booking failed"
        try {
          const ct = res.headers.get("content-type") || ""
          if (ct.includes("application/json")) {
            const err = await res.json()
            errMsg = err?.message || err?.error || errMsg
          } else {
            const text = await res.text()
            if (text) errMsg = text
          }
        } catch {}
        throw new Error(errMsg)
      }

      const data = await res.json()
      if (typeof window !== "undefined") {
        const snapshot = {
          booking: data.booking,
          coupon: data.coupon,
          client: clientInfo,
          service: selectedService,
          therapist: selectedTherapist,
          date: selectedDate,
          time: selectedTime,
          amounts: { servicePrice, platformFee: selectedService ? PLATFORM_FEE : 0, discount, finalAmount },
        }
        sessionStorage.setItem("analyn:lastBooking", JSON.stringify(snapshot))
      }

      router.push("/booking/confirmation")
    } catch (error: any) {
      console.error("Booking failed:", error)
      alert(error?.message || "Booking failed")
    } finally {
      setLoading(false)
    }
  }

  // --- 3. SHOW LOADING OR REDIRECT ---
  // If auth is loading, or if user is not logged in, show a loading screen
  if (authLoading || !user) {
    return (
       <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50 flex items-center justify-center">
         <p className="text-stone-700">Loading booking page...</p>
       </div>
    );
  }
  
  // --- 4. USER IS LOGGED IN, SHOW THE PAGE ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-8">
        {/* Steps */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step <= currentStep
                      ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white"
                      : "bg-stone-200 text-stone-600"
                  }`}
                >
                  {step < currentStep ? <CheckCircle className="w-5 h-5" /> : step}
                </div>
                {step < 4 && (
                  <div
                    className={`w-24 h-1 mx-4 ${
                      step < currentStep ? "bg-gradient-to-r from-teal-600 to-emerald-600" : "bg-stone-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm text-stone-600">
            <span>Select Service</span>
            <span>Choose Therapist</span>
            <span>Date & Time</span>
            <span>Payment</span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
          {/* Main */}
          <div className="lg:col-span-2">
            {/* Step 1 */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CalendarIcon className="w-5 h-5 mr-2" />
                    Select Your Service
                  </CardTitle>
                  <CardDescription>Choose the wellness service you'd like to book</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {services.map((service) => {
                    const duration = (service.duration ?? service.duration_minutes ?? 60) as number
                    const price = (service.base_price ?? service.price ?? 0) as number
                    const selected = selectedService?.id === service.id
                    return (
                      <button
                        key={service.id}
                        type="button"
                        className={`w-full text-left p-4 border rounded-lg cursor-pointer transition-all ${
                          selected
                            ? "border-teal-500 bg-teal-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedService(service)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{service.name}</h3>
                            {service.description && (
                              <p className="text-stone-600 text-sm mt-1">{service.description}</p>
                            )}
                            <div className="flex items-center space-x-4 mt-3">
                              <div className="flex items-center text-sm text-stone-600">
                                <Clock className="w-4 h-4 mr-1" />
                                {duration} minutes
                              </div>
                              {service.category && (
                                <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                                  {service.category}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-teal-700">{inr(price)}</div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </CardContent>
              </Card>
            )}

            {/* Step 2 */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="w-5 h-5 mr-2" />
                    Choose Your Therapist
                  </CardTitle>
                  <CardDescription>
                    Select a verified therapist for your {selectedService?.name} session
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {therapists.map((t) => {
                    const name = t.name || [t.first_name, t.last_name].filter(Boolean).join(" ") || "Therapist"
                    const img = t.profile_image || t.avatar || "/placeholder.svg"
                    const rating = t.rating ?? 4.8
                    const reviews = t.total_reviews ?? 0
                    const specialties = Array.isArray(t.specialties)
                      ? t.specialties
                      : t.specialties
                        ? String(t.specialties)
                            .split(",")
                            .map((s) => s.trim())
                        : []
                    const selected = selectedTherapist?.id === t.id
                    return (
                      <button
                        key={t.id}
                        type="button"
                        className={`w-full text-left p-4 border rounded-lg cursor-pointer transition-all ${
                          selected
                            ? "border-teal-500 bg-teal-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedTherapist(t)}
                      >
                        <div className="flex items-start gap-4">
                          <Avatar className="w-16 h-16">
                            <AvatarImage src={img || "/placeholder.svg"} alt={name} />
                            <AvatarFallback>
                              {name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{name}</h3>
                            <div className="flex items-center gap-2 mb-2">
                              <div className="flex items-center">
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="font-medium ml-1">{rating.toFixed(1)}</span>
                                <span className="text-stone-500 text-sm ml-1">({reviews})</span>
                              </div>
                              {typeof t.distance === "number" && (
                                <div className="flex items-center text-sm text-stone-600">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {t.distance}km away
                                </div>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {specialties.slice(0, 3).map((s) => (
                                <Badge key={s} variant="outline" className="text-xs">
                                  {s}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </CardContent>
              </Card>
            )}

            {/* Step 3 */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CalendarIcon className="w-5 h-5 mr-2" />
                      Select Date & Time
                    </CardTitle>
                    <CardDescription>Choose when you'd like your session</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label className="text-base font-medium mb-3 block">Select Date</Label>
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          className="rounded-md border"
                        />
                      </div>
                      <div>
                        <Label className="text-base font-medium mb-3 block">Available Times</Label>
                        <div className="grid grid-cols-3 gap-2 max-h-80 overflow-y-auto">
                          {timeSlots.map((time) => (
                            <Button
                              key={time}
                              variant={selectedTime === time ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedTime(time)}
                              className={`text-sm ${
                                selectedTime === time
                                  ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700"
                                  : "bg-transparent text-teal-700 border-teal-700 hover:bg-teal-700 hover:text-white"
                              }`}
                            >
                              {time}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Your Information</CardTitle>
                    <CardDescription>Please provide your contact details and service location</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">
                          First Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="firstName"
                          value={clientInfo.firstName}
                          onChange={(e) => setClientInfo({ ...clientInfo, firstName: e.target.value })}
                          placeholder="John"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={clientInfo.lastName}
                          onChange={(e) => setClientInfo({ ...clientInfo, lastName: e.target.value })}
                          placeholder="Doe"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">
                          Email <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={clientInfo.email}
                          onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                          placeholder="john@example.com"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          value={clientInfo.phone}
                          onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                          placeholder="+91 912 345 6789"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="address">
                        Service Address <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="address"
                        value={clientInfo.address}
                        onChange={(e) => setClientInfo({ ...clientInfo, address: e.target.value })}
                        placeholder="Complete service address"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="notes">Special Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        value={clientInfo.notes}
                        onChange={(e) => setClientInfo({ ...clientInfo, notes: e.target.value })}
                        placeholder="Any special requests or health conditions"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 4 */}
            {currentStep === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Payment & Coupons
                  </CardTitle>
                  <CardDescription>Secure payment processing and promotional codes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-base font-medium mb-3 block">Have a Coupon?</Label>
                    <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
                      <div className="flex items-center gap-2">
                        <Percent className="w-4 h-4 text-foreground/70" />
                        <Input
                          placeholder="Enter coupon (e.g., flash100)"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                        />
                      </div>
                      <Button type="button" variant="secondary" onClick={handleApplyCoupon}>
                        Apply
                      </Button>
                    </div>
                    {couponMessage && (
                      <p className={`mt-2 text-sm ${couponApplied ? "text-teal-700" : "text-red-600"}`}>
                        {couponMessage}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-base font-medium mb-3 block">Payment Method</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        className={`p-4 border rounded-lg cursor-pointer transition-all text-left ${
                          paymentMethod === "card"
                            ? "border-teal-500 bg-teal-50"
                            : "border-gray-200"
                        }`}
                        onClick={() => setPaymentMethod("card")}
                      >
                        <div className="flex items-center space-x-3">
                          <CreditCard className="w-5 h-5" />
                          <span className="font-medium">Credit/Debit Card</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        className={`p-4 border rounded-lg cursor-pointer transition-all text-left ${
                          paymentMethod === "wallet"
                            ? "border-teal-500 bg-teal-50"
                            : "border-gray-200"
                        }`}
                        onClick={() => setPaymentMethod("wallet")}
                        disabled
                        title="Coming soon"
                      >
                        <div className="flex items-center space-x-3">
                          <Phone className="w-5 h-5" />
                          <span className="font-medium">Digital Wallet (soon)</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {paymentMethod === "card" && (
                    <div className={`space-y-4 ${finalAmount === 0 ? "opacity-60 pointer-events-none" : ""}`}>
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          placeholder="4242 4242 4242 4242"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          inputMode="numeric"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiry">Expiry Date</Label>
                          <Input
                            id="expiry"
                            placeholder="MM/YY"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            inputMode="numeric"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            value={cardCvc}
                            onChange={(e) => setCardCvc(e.target.value)}
                            inputMode="numeric"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="cardName">Cardholder Name</Label>
                        <Input
                          id="cardName"
                          placeholder="John Doe"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 p-4 bg-teal-50 rounded-lg">
                    <Shield className="w-5 h-5 text-teal-700" />
                    <span className="text-sm text-teal-800">
                      Your payment information is encrypted and secure
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
                disabled={currentStep === 1}
                className="bg-transparent"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              {currentStep < 4 ? (
                <Button
                  onClick={() => setCurrentStep((s) => Math.min(4, s + 1))}
                  disabled={
                    (currentStep === 1 && !selectedService) ||
                    (currentStep === 2 && !selectedTherapist) ||
                    (currentStep === 3 && !canProceedToPay)
                  }
                  className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  onClick={handleBooking}
                  disabled={
                    loading ||
                    !canProceedToPay ||
                    (finalAmount > 0 &&
                      paymentMethod === "card" &&
                      (!cardNumber || !cardExpiry || !cardCvc || !cardName))
                  }
                  className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700"
                >
                  {loading
                    ? "Processing..."
                    : finalAmount === 0
                      ? "Book for Free"
                      : `Pay ${inr(finalAmount)}`}
                </Button>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedService && (
                  <div className="p-4 bg-stone-50 rounded-lg">
                    <h4 className="font-medium">{selectedService.name}</h4>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-stone-600">
                        {(selectedService.duration ?? selectedService.duration_minutes ?? 60) as number} minutes
                      </span>
                      <span className="font-semibold">{inr(servicePrice)}</span>
                    </div>
                  </div>
                )}

                {selectedTherapist && (
                  <div className="p-4 bg-stone-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage
                          src={selectedTherapist.profile_image || selectedTepist.avatar || "/placeholder.svg"}
                          alt={
                            selectedTherapist.name ||
                            `${selectedTherapist.first_name || ""} ${selectedTherapist.last_name || ""}`.trim()
                          }
                        />
                        <AvatarFallback>
                          {(
                            selectedTherapist.name ||
                            `${selectedTherapist.first_name || ""} ${selectedTherapist.last_name || ""}` ||
                            "T"
                          )
                            .trim()
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">
                          {selectedTherapist.name ||
                            `${selectedTherapist.first_name || ""} ${selectedTherapist.last_name || ""}`.trim()}
                        </h4>
                        <div className="flex items-center text-sm text-stone-600">
                          <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
                          {(selectedTherapist.rating ?? 4.8).toFixed(1)} ({selectedTherapist.total_reviews ?? 0})
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {selectedDate && selectedTime && (
                  <div className="p-4 bg-stone-50 rounded-lg">
                    <h4 className="font-medium mb-2">Date & Time</h4>
                    <div className="text-sm text-stone-600">
                      <div>
                        {selectedDate.toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                      <div>{selectedTime}</div>
                    </div>
                  </div>
                )}

                {selectedService && (
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span>Service Fee</span>
                      <span>{inr(servicePrice)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-stone-600">
                      <span>Platform Fee</span>
                      <span>{inr(PLATFORM_FEE)}</span>
                    </div>
                    {couponApplied && (
                      <div className="flex justify-between text-sm text-teal-700">
                        <span>Coupon Discount ({couponCode.trim().toLowerCase() || "code"})</span>
                        <span>-{inr(discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span>Total</span>
                      <span className="text-teal-700">{inr(finalAmount)}</span>
                    </div>
                  </div>
                )}

                <div className="text-xs text-stone-500 space-y-1">
                  <p>• Free cancellation up to 24 hours before</p>
                  <p>• All therapists are verified and insured</p>
                  <p>• 100% satisfaction guarantee</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}