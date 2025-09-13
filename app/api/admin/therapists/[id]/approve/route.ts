import { NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const sql = neon(process.env.DATABASE_URL!)
  try {
    const id = Number(params.id)
    if (!id) return NextResponse.json({ error: "Invalid id" }, { status: 400 })

    // Auth
    const auth = _req.headers.get("authorization")
    if (!auth?.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const token = auth.split(" ")[1]
    const jwt = await import("jsonwebtoken")
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-secret") as any
    if (decoded?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

    const result = await sql`UPDATE therapists SET is_verified = true WHERE id = ${id} RETURNING *`
    if (!result.length) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ therapist: result[0] }, { status: 200 })
  } catch (e: any) {
    return NextResponse.json({ error: "Internal server error", detail: e?.message }, { status: 500 })
  }
}
