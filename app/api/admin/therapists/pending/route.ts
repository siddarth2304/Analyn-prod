// File: app/api/admin/therapists/pending/route.ts

import { NextResponse, type NextRequest } from "next/server"
import { sql } from "@vercel/postgres"
import { requireAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // 1. Check if user is an admin
    // This uses your existing lib/auth.ts file
    requireAuth(request, ["admin"]);

    // 2. Fetch pending therapists
    const result = await sql`
      SELECT t.id, t.user_id, t.is_verified, t.experience_years, t.hourly_rate, t.location, t.created_at,
             u.first_name, u.last_name, u.email, u.phone, t.specialties
      FROM therapists t
      JOIN users u ON t.user_id = u.id
      WHERE t.is_verified = false
      ORDER BY t.created_at DESC NULLS LAST
    `
    
    return NextResponse.json({ therapists: result.rows }, { status: 200 })
    
  } catch (e: any) {
    if (e.message === "Authentication required" || e.message === "Insufficient permissions") {
      return NextResponse.json({ error: e.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal server error", detail: e?.message }, { status: 500 })
  }
}