// File: app/api/admin/therapists/[id]/reject/route.ts

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

    // 2. Find the user_id associated with this therapist
    const therapist = await sql`SELECT user_id FROM therapists WHERE id = ${id}`;
    if (therapist.rowCount === 0) {
      return NextResponse.json({ error: "Therapist not found" }, { status: 404 })
    }
    const userId = therapist.rows[0].user_id;

    // 3. Delete the user (this will cascade-delete the therapist)
    // Your DB schema: "therapists_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    // This means deleting the user will automatically delete their therapist profile.
    await sql`DELETE FROM users WHERE id = ${userId}`;

    return NextResponse.json({ message: "Therapist rejected and user deleted" }, { status: 200 })
  } catch (e: any) {
    if (e.message === "Authentication required" || e.message === "Insufficient permissions") {
      return NextResponse.json({ error: e.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal server error", detail: e?.message }, { status: 500 })
  }
}