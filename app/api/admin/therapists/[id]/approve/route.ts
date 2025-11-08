// File: app/api/admin/therapists/[id]/approve/route.ts

import { NextResponse, type NextRequest } from "next/server"; // <-- Make sure NextRequest is imported
import { cookies } from "next/headers";
import { sql } from "@vercel/postgres";
import { adminAuth } from "@/lib/firebase-admin";
import { getUserProfileByEmail } from "@/lib/database";

async function verifyAdmin(request: NextRequest) {
  const sessionCookie = cookies().get("__session")?.value;
  if (!sessionCookie) throw new Error("Authentication required");

  const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
  if (!decodedToken.email) throw new Error("Invalid token");

  const userProfile = await getUserProfileByEmail(decodedToken.email);
  if (userProfile?.role !== "admin") throw new Error("Insufficient permissions");
}

// This is the function signature that must be exact
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await verifyAdmin(request); // Verify user is an admin
    const id = Number(params.id);
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