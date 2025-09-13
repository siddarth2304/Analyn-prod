import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)
const PLATFORM_FEE = 75

type CheckoutBody = {
  therapistId: number | string
  serviceId?: number | string
  serviceName?: string
  servicePrice?: number
  serviceDuration?: number
  serviceCategory?: string
  bookingDate: string // YYYY-MM-DD
  startTime: string // HH:mm
  endTime?: string
  clientAddress?: string
  clientLatitude?: number | null
  clientLongitude?: number | null
  notes?: string
  currency?: string
  couponCode?: string

  // client identity (no login required)
  clientEmail?: string
  clientFirstName?: string
  clientLastName?: string
  clientPhone?: string

  // simulated card data (NOT sent to Stripe)
  cardNumber?: string
  cardExpMonth?: number | null
  cardExpYear?: number | null
  cardCvc?: string
}

// Optional Stripe, only used if configured and amount > 0.
// Keep import inside the handler to avoid top-level errors.
async function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  const { default: Stripe } = await import("stripe")
  return new Stripe(key, { apiVersion: "2024-06-20" })
}

// Coupon: flash100 => 100% off
function evaluateCoupon(code?: string | null, amountMinor = 0) {
  const normalized = (code || "").trim().toLowerCase()
  if (normalized === "flash100") {
    return {
      valid: true,
      code: "flash100",
      free: true,
      discountMinor: amountMinor,
      message: "Flash sale applied: 100% off",
    }
  }
  if (!normalized) return { valid: false, code: null as string | null, free: false, discountMinor: 0, message: "" }
  return { valid: false, code: normalized, free: false, discountMinor: 0, message: "Invalid coupon code" }
}

// Simulate card outcomes with Stripe test numbers
function simulateCardCharge(cardNumber: string) {
  const n = (cardNumber || "").replace(/\s|-/g, "")
  if (n === "4000000000009995")
    return { ok: false, code: "insufficient_funds", message: "Your card has insufficient funds." }
  if (n === "4000000000000002") return { ok: false, code: "card_declined", message: "Your card was declined." }
  if (n === "4000000000000069") return { ok: false, code: "expired_card", message: "Your card has expired." }
  return { ok: true }
}

// Resolve or create a service row using columns compatible with your schema.
async function resolveService(opts: {
  serviceId?: number
  fallback?: { name?: string; price?: number; duration?: number; category?: string }
}) {
  // Try to load by id first
  if (opts.serviceId) {
    try {
      const found =
        await sql`SELECT id, name, duration, base_price, category FROM services WHERE id = ${opts.serviceId}`
      if (found.length > 0) return found[0]
    } catch (e: any) {
      throw new Error("Services table not found or DB error. Please run migrations.")
    }
  }

  const { name, price, duration, category } = opts.fallback || {}
  if (!name || typeof price !== "number") {
    throw new Error("Service not found and insufficient data to create one.")
  }

  // Try an insert with common columns
  try {
    const created = await sql`
      INSERT INTO services (name, description, duration, base_price, category, is_active, created_at)
      VALUES (${name}, ${"Created from checkout"}, ${duration ?? 60}, ${price}, ${category ?? "massage"}, ${true}, NOW())
      RETURNING id, name, duration, base_price, category
    `
    return created[0]
  } catch {
    // Fallback insert with minimal columns
    const created = await sql`
      INSERT INTO services (name, duration, base_price)
      VALUES (${name}, ${duration ?? 60}, ${price})
      RETURNING id, name, duration, base_price
    `
    return created[0]
  }
}

async function getUserByEmail(email: string) {
  try {
    const found = await sql`SELECT id, email, first_name, last_name, phone, role FROM users WHERE email = ${email}`
    if (found.length > 0) return found[0]
    return null
  } catch (e: any) {
    throw new Error("Users table not found or DB error. Please run migrations.")
  }
}

async function createUser(user: {
  email: string
  password: string
  first_name: string
  last_name: string
  phone: string
  role: string
}) {
  try {
    const created = await sql`
      INSERT INTO users (email, password, first_name, last_name, phone, role, created_at)
      VALUES (${user.email}, ${user.password}, ${user.first_name}, ${user.last_name}, ${user.phone}, ${user.role}, NOW())
      RETURNING id, email, first_name, last_name, phone, role
    `
    return created[0]
  } catch (e: any) {
    throw new Error("Failed to create user. Please check the user data.")
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      therapistId,
      serviceId,
      serviceName,
      servicePrice,
      serviceDuration,
      serviceCategory,

      bookingDate, // YYYY-MM-DD
      startTime, // HH:mm
      endTime, // optional

      clientAddress,
      clientLatitude,
      clientLongitude,
      notes,

      // client identity (optional; booking works without login)
      clientEmail,
      clientFirstName,
      clientLastName,
      clientPhone,

      // payment
      currency = "php",
      cardNumber,
      cardExpMonth,
      cardExpYear,
      cardCvc,

      // coupon
      couponCode,
    } = body

    // Basic validation
    if (!therapistId) return NextResponse.json({ error: "Missing therapistId" }, { status: 400 })
    if (!bookingDate || !startTime) return NextResponse.json({ error: "Missing booking date/time" }, { status: 400 })
    // Address is not strictly required in schema; but front-end enforces it.
    // Service is required; we resolve it or create a minimal row.
    const service = await resolveService({
      serviceId: serviceId ? Number(serviceId) : undefined,
      fallback: {
        name: serviceName,
        price: typeof servicePrice === "number" ? servicePrice : undefined,
        duration: typeof serviceDuration === "number" ? serviceDuration : undefined,
        category: serviceCategory,
      },
    })

    const basePrice = Number(service.base_price ?? servicePrice ?? 0)
    const duration = Number(service.duration ?? serviceDuration ?? 60)
    const platformFee = 75
    const totalBefore = basePrice + platformFee
    const totalMinor = Math.max(0, Math.round(totalBefore * 100))

    // Coupon
    const coupon = evaluateCoupon(couponCode, totalMinor)
    const discountedMinor = Math.max(0, totalMinor - (coupon.valid ? coupon.discountMinor : 0))
    const finalAmount = discountedMinor / 100

    // Optional auth: get clientId from Authorization token if present
    let clientId: number | null = null
    const authHeader = req.headers.get("authorization")
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const token = authHeader.split(" ")[1]
        const jwt = await import("jsonwebtoken")
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-secret") as any
        if (decoded?.userId) clientId = Number(decoded.userId)
      } catch {
        // ignore token issues; booking still proceeds without login
      }
    }

    // Resolve or create client user (no auth required to book)
    let clientUser: { id: number } | null = null
    if (clientEmail) {
      clientUser = await getUserByEmail(clientEmail)
      if (!clientUser) {
        const randomPass = Math.random().toString(36).slice(2)
        const hashed = await bcrypt.hash(randomPass, 10)
        clientUser = await createUser({
          email: clientEmail,
          password: hashed,
          first_name: clientFirstName || "",
          last_name: clientLastName || "",
          phone: clientPhone || "",
          role: "client",
        })
      }
    } else {
      return NextResponse.json({ error: "Missing clientEmail" }, { status: 400 })
    }

    // Payment
    let paymentStatus: "paid" | "pending" | "failed" = "pending"
    let paymentIntentId: string | null = null

    if (discountedMinor === 0 || coupon.free) {
      paymentStatus = "paid"
      paymentIntentId = coupon.valid ? `coupon_${coupon.code}_${Date.now()}` : `free_${Date.now()}`
    } else {
      const stripe = await getStripe()
      if (stripe) {
        try {
          const pi = await stripe.paymentIntents.create({
            amount: discountedMinor,
            currency,
            confirm: true,
            automatic_payment_methods: { enabled: true },
            payment_method_data: {
              type: "card",
              card:
                cardNumber && cardExpMonth && cardExpYear && cardCvc
                  ? {
                      number: String(cardNumber),
                      exp_month: Number(cardExpMonth),
                      exp_year: Number(cardExpYear),
                      cvc: String(cardCvc),
                    }
                  : undefined,
            },
            metadata: {
              service_id: String(service.id),
              therapist_id: String(therapistId),
              coupon_code: coupon.valid ? coupon.code! : "",
            },
          })
          paymentIntentId = pi.id
          if (pi.status === "succeeded") paymentStatus = "paid"
          else if (pi.status === "requires_action") paymentStatus = "pending"
          else if (pi.status === "requires_payment_method") paymentStatus = "failed"
        } catch (e: any) {
          return NextResponse.json(
            { error: "Payment failed", code: e?.code || "payment_failed", message: e?.message || "Card declined" },
            { status: 402 },
          )
        }
      } else {
        // Simulate success in local/dev
        const result = simulateCardCharge(cardNumber || "")
        if (!result.ok) {
          return NextResponse.json({ error: "Payment failed", ...result }, { status: 402 })
        }
        paymentStatus = "paid"
        paymentIntentId = `pi_mock_${Date.now()}`
      }
    }

    if (paymentStatus !== "paid" && paymentStatus !== "pending") {
      return NextResponse.json({ error: "Payment not completed", status: paymentStatus }, { status: 402 })
    }

    // Insert booking using the minimal schema used elsewhere in your project:
    // bookings(client_id, therapist_id, service_id, booking_date, booking_time, duration, total_amount, status, payment_status, notes)
    const combinedNotes = [
      notes?.toString().trim() || "",
      clientFirstName || clientLastName || clientEmail || clientPhone ? "[Client Info in booking]" : "",
      coupon.valid ? `[Coupon: ${coupon.code} applied]` : "",
      clientFirstName ? `First: ${clientFirstName}` : "",
      clientLastName ? `Last: ${clientLastName}` : "",
      clientEmail ? `Email: ${clientEmail}` : "",
      clientPhone ? `Phone: ${clientPhone}` : "",
      clientAddress ? `Address: ${clientAddress}` : "",
      clientLatitude && clientLongitude ? `LatLng: ${clientLatitude},${clientLongitude}` : "",
    ]
      .filter(Boolean)
      .join(" | ")

    let booking
    try {
      const inserted = await sql`
        INSERT INTO bookings (
          client_id, therapist_id, service_id, booking_date, booking_time, duration,
          total_amount, status, payment_status, notes
        )
        VALUES (
          ${clientId}, ${Number(therapistId)}, ${Number(service.id)}, ${bookingDate}, ${startTime}, ${duration},
          ${finalAmount}, ${paymentStatus === "paid" ? "confirmed" : "pending"}, ${paymentStatus}, ${combinedNotes}
        )
        RETURNING *
      `
      booking = inserted[0]
    } catch (e: any) {
      // If minimal insert fails (schema mismatch), respond clearly
      return NextResponse.json(
        { error: "Database insert failed", detail: e?.message || e?.detail || "Unknown DB error" },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        message: coupon.free ? "Booking created (free via coupon)" : "Booking created",
        coupon: coupon.valid
          ? { applied: true, code: coupon.code, free: coupon.free, discountMinor: coupon.discountMinor }
          : { applied: false },
        payment: { status: paymentStatus, intentId: paymentIntentId },
        booking,
      },
      { status: 200 },
    )
  } catch (err: any) {
    // Always return JSON to avoid Response.json() parse errors on the client
    return NextResponse.json(
      { error: "Internal server error", detail: err?.message || "Unknown error" },
      { status: 500 },
    )
  }
}
