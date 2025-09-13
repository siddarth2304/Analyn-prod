import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const rows = await sql`
      SELECT 
        b.*,
        u1.first_name as client_first_name, u1.last_name as client_last_name,
        u2.first_name as therapist_first_name, u2.last_name as therapist_last_name,
        s.name as service_name
      FROM bookings b
      JOIN users u1 ON b.client_id = u1.id
      JOIN therapist_profiles tp ON b.therapist_id = tp.id
      JOIN users u2 ON tp.user_id = u2.id
      JOIN services s ON b.service_id = s.id
      WHERE b.status IN ('confirmed','in_progress')
      ORDER BY b.booking_date DESC, b.start_time DESC
    `
    return NextResponse.json({ bookings: rows })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
