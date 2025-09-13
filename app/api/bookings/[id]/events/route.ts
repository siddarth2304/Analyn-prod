import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"
import jwt from "jsonwebtoken"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id)
  const events = await sql`
    SELECT * FROM booking_events WHERE booking_id = ${id} ORDER BY created_at DESC LIMIT 100
  `
  return NextResponse.json({ events })
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id)
    const {
      actor, // 'client' | 'therapist' | 'ops'
      type, // 'location','check-in','start','complete','bluetooth-verified'
      latitude,
      longitude,
      meta,
    } = await req.json()

    // optional auth
    const authHeader = req.headers.get("authorization")
    if (authHeader) {
      try {
        const token = authHeader.split(" ")[1]
        jwt.verify(token, process.env.JWT_SECRET || "your-secret-key")
      } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
    }

    const inserted = await sql`
      INSERT INTO booking_events (booking_id, actor, type, latitude, longitude, meta)
      VALUES (${id}, ${actor}, ${type}, ${latitude}, ${longitude}, ${JSON.stringify(meta || {})})
      RETURNING *
    `
    // Update denormalized fields for quick ops view
    if (type === "location") {
      if (actor === "client") {
        await sql`
          UPDATE bookings SET last_client_latitude = ${latitude}, last_client_longitude = ${longitude}
          WHERE id = ${id}
        `
      } else if (actor === "therapist") {
        await sql`
          UPDATE bookings SET last_therapist_latitude = ${latitude}, last_therapist_longitude = ${longitude}
          WHERE id = ${id}
        `
      }
    } else if (type === "check-in") {
      if (actor === "client") {
        await sql`UPDATE bookings SET client_checked_in_at = CURRENT_TIMESTAMP WHERE id = ${id}`
      } else if (actor === "therapist") {
        await sql`UPDATE bookings SET therapist_checked_in_at = CURRENT_TIMESTAMP WHERE id = ${id}`
      }
    } else if (type === "start") {
      await sql`UPDATE bookings SET status = 'in_progress', session_started_at = CURRENT_TIMESTAMP WHERE id = ${id}`
    } else if (type === "complete") {
      await sql`UPDATE bookings SET status = 'completed', session_completed_at = CURRENT_TIMESTAMP WHERE id = ${id}`
    } else if (type === "bluetooth-verified") {
      await sql`UPDATE bookings SET bluetooth_verified = true WHERE id = ${id}`
    }

    return NextResponse.json({ event: inserted[0] })
  } catch (err) {
    console.error("Booking event error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
