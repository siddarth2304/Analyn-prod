// File: app/api/admin/therapists/[id]/approve/route.ts

import { NextResponse, type NextRequest } from "next/server";
import { sql } from "@vercel/postgres";
import { adminAuth } from "@/lib/firebase-admin";
import { getUserProfileByEmail } from "@/lib/database";

// This function checks the cookie and ensures the user is an admin
async function verifyAdmin(request: NextRequest) {
  console.log("--- Verifying Admin for /approve route ---");
  
  const sessionCookie = request.cookies.get("__session")?.value;
  if (!sessionCookie) {
    console.error("verifyAdmin Failed: No __session cookie found.");
    throw new Error("Authentication required");
  }

  const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
  if (!decodedToken.email) {
    console.error("verifyAdmin Failed: Invalid token (no email).");
    throw new Error("Invalid token");
  }

  console.log("Token is valid, checking database for email:", decodedToken.email);
  const userProfile = await getUserProfileByEmail(decodedToken.email);

  // --- THIS IS THE MOST IMPORTANT LOG ---
  console.log("Database profile found:", userProfile);
  // ------------------------------------

  if (userProfile?.role !== "admin") {
    console.error(`verifyAdmin Failed: User role is '${userProfile?.role}', not 'admin'.`);
    throw new Error("Insufficient permissions");
  }

  console.log("--- Admin Verified ---");
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // 1. Verify the user is an admin
    await verifyAdmin(request);

    const id = Number(params.id);
    if (!id) {
      return NextResponse.json({ error: "Invalid therapist ID" }, { status: 400 });
    }

    console.log(`Admin approved. Updating therapist ID: ${id}`);

    // 2. Approve the therapist
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
    console.error("Approve API Error:", e); // Log the full error
    return NextResponse.json({ error: "Internal server error", detail: e?.message }, { status: 500 });
  }
}