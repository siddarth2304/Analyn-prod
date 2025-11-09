// File: app/api/admin/therapists/[id]/approve/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { sql } from "@vercel/postgres";
import { adminAuth } from "@/lib/firebase-admin";
import { getUserProfileByEmail } from "@/lib/database";

// Helper function to verify admin
async function verifyAdmin() {
  const sessionCookie = cookies().get("__session")?.value;
  if (!sessionCookie) throw new Error("Authentication required");
  const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
  if (!decodedToken.email) throw new Error("Invalid token");
  const userProfile = await getUserProfileByEmail(decodedToken.email);
  if (userProfile?.role !== "admin") throw new Error("Insufficient permissions");
}

// FIX: The signature must use Request and context to be build-stable.
export async function POST(
  request: Request, // Use standard Request type
  context: { params: { id: string } } // Access params via context
) {
  try {
    await verifyAdmin(); // Verify user is an admin
    
    // Access ID safely
    const id = Number(context.params.id);
    
    if (!id) {
      return NextResponse.json({ error: "Invalid therapist ID" }, { status: 400 });
    }

    const result = await sql`
      UPDATE therapists 
      SET is_verified = true 
      WHERE id = ${id} 
      RETURNING *
    `;

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Therapist not found" }, { status: 404 });
    }

    return NextResponse.json({ therapist: result.rows[0] }, { status: 200 });
  } catch (e: any) {
    if (e.message === "Authentication required" || e.message === "Insufficient permissions") {
      return NextResponse.json({ error: e.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal server error", detail: e?.message }, { status: 500 });
  }
}