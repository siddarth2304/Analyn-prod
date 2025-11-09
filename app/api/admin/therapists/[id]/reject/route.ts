// File: app/api/admin/therapists/[id]/reject/route.ts

import { NextResponse, type NextRequest } from "next/server"; 
import { cookies } from "next/headers";
import { sql } from "@vercel/postgres";
import { adminAuth } from "@/lib/firebase-admin";
import { getUserProfileByEmail } from "@/lib/database";

async function verifyAdmin() {
  const sessionCookie = cookies().get("__session")?.value;
  if (!sessionCookie) throw new Error("Authentication required");
  const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
  if (!decodedToken.email) throw new Error("Invalid token");
  const userProfile = await getUserProfileByEmail(decodedToken.email);
  if (userProfile?.role !== "admin") throw new Error("Insufficient permissions");
}

// FIX: This signature is stable and prevents the build error
export async function POST(
  request: NextRequest, 
  context: { params: { id: string } } 
) {
  try {
    await verifyAdmin(); // Verify user is an admin
    
    const id = Number(context.params.id); 

    if (!id) {
      return NextResponse.json({ error: "Invalid therapist ID" }, { status: 400 });
    }

    const therapist = await sql`SELECT user_id FROM therapists WHERE id = ${id}`;
    if (therapist.rowCount === 0) {
      return NextResponse.json({ error: "Therapist not found" }, { status: 404 });
    }
    const userId = therapist.rows[0].user_id;

    await sql`DELETE FROM users WHERE id = ${userId}`; // Cascade delete

    return NextResponse.json({ message: "Therapist rejected and user deleted" }, { status: 200 });
  } catch (e: any) {
    if (e.message.includes("Auth") || e.message.includes("permissions")) {
      return NextResponse.json({ error: e.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal server error", detail: e?.message }, { status: 500 });
  }
}