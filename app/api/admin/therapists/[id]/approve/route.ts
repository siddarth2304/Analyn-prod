// File: app/api/admin/therapists/[id]/approve/route.ts

import { NextResponse, type NextRequest } from "next/server"
import { sql } from "@vercel/postgres"
import { requireAuth } from "@/lib/auth"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 1. Check if user is an admin
    requireAuth(request, ["admin"]);

    const id = Number(params.id)
    if (!id) {
      return NextResponse.json({ error: "Invalid therapist ID" }, { status: 400 })
    }

    // 2. Approve the therapist
    const result = await sql`
      UPDATE therapists 
      SET is_verified = true 
      WHERE id = ${id} 
      RETURNING *
    `;

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Therapist not found" }, { status: 404 })
    }

    return NextResponse.json({ therapist: result.rows[0] }, { status: 200 })
  } catch (e: any) {
    if (e.message === "Authentication required" || e.message === "Insufficient permissions") {
      return NextResponse.json({ error: e.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal server error", detail: e?.message }, { status: 500 })
  }
}