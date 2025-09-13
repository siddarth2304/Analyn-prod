import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function GET(req: Request) {
  const sql = neon(process.env.DATABASE_URL!)
  try {
    // Auth: admin-only via JWT in Authorization header
    const auth = req.headers.get("authorization")
    if (!auth?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const token = auth.split(" ")[1]
    const jwt = await import("jsonwebtoken")
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-secret") as any
    if (decoded?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const rows = await sql`
      SELECT t.*, u.first_name, u.last_name, u.email, u.phone
      FROM therapists t
      JOIN users u ON t.user_id = u.id
      WHERE t.is_verified = false
      ORDER BY t.created_at DESC NULLS LAST
    `
    return NextResponse.json({ therapists: rows }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: "Internal server error", detail: e?.message }, { status: 500 })
  }
}
