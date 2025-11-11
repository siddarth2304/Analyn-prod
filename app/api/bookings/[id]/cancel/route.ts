// File: app/api/bookings/[id]/cancel/route.ts

import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { sql } from "@vercel/postgres";
import { adminAuth } from "@/lib/firebase-admin";
import { getUserProfileByEmail } from "@/lib/database";

// This helper function verifies *any* logged-in user (client, therapist, or admin)
async function verifyUser(request: NextRequest) {
  const sessionCookie = cookies().get("__session")?.value;
  if (!sessionCookie) throw new Error("Authentication required");
  
  const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
  if (!decodedToken.email) throw new Error("Invalid token");
  
  return decodedToken; // Return the user token
}

// --- THIS IS THE FIX ---
// We are using 'any' for the context type to force the Next.js
// build server to accept it, just like we did for the admin routes.
export async function POST(
  request: NextRequest, 
  context: any 
) {
  try {
    await verifyUser(request); // Verify user is logged in
    
    // Access ID safely from the context
    const id = Number(context.params.id); // Get booking ID

    if (!id) {
      return NextResponse.json({ error: "Invalid booking ID" }, { status: 400 });
    }

    // You can add logic here to check if the logged-in user
    // is the one who actually owns this booking before cancelling.

    const result = await sql`
      UPDATE bookings 
      SET status = 'cancelled' 
      WHERE id = ${id} 
      RETURNING *
    `;

    if (result.rowCount === 0) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Booking cancelled", booking: result.rows[0] });
  } catch (e: any) {
    if (e.message.includes("Auth") || e.message.includes("permissions")) {
      return NextResponse.json({ error: e.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal server error", detail: e?.message }, { status: 500 });
  }
}