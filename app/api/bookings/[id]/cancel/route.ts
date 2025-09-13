import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

async function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  const { default: Stripe } = await import("stripe")
  return new Stripe(key, { apiVersion: "2024-06-20" })
}

export async function POST(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id)
    const rows = await sql`SELECT id, payment_intent_id, status FROM bookings WHERE id = ${id}`
    if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const booking = rows[0]
    if (booking.status === "cancelled") {
      return NextResponse.json({ message: "Already cancelled" })
    }

    const stripe = await getStripe()
    if (stripe && booking.payment_intent_id) {
      try {
        await stripe.paymentIntents.cancel(booking.payment_intent_id)
      } catch (e) {
        // If already canceled or cannot cancel, proceed to mark cancelled
      }
    }

    const updated = await sql`
      UPDATE bookings SET status = 'cancelled', payment_status = 'failed', updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id} RETURNING *
    `
    // Log system event
    await sql`
      INSERT INTO booking_events (booking_id, actor, type, meta)
      VALUES (${id}, 'system', 'cancelled', ${JSON.stringify({ reason: "manual_or_auto_cancel" })})
    `
    return NextResponse.json({ booking: updated[0] })
  } catch (err) {
    console.error("Cancel booking error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
