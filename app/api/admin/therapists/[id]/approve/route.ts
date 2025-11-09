import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { sql } from "@vercel/postgres";
import { adminAuth } from "@/lib/firebase-admin";
import { getUserProfileByEmail } from "@/lib/database";

// Helper to synchronously get session cookie
function getSessionCookie() {
  return cookies().get("__session")?.value;
}

// Verify if the user is admin
async function verifyAdmin() {
  const sessionCookie = getSessionCookie();
  if (!sessionCookie) throw new Error("Authentication required");

  const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
  if (!decodedToken.email) throw new Error("Invalid token");

  const userProfile = await getUserProfileByEmail(decodedToken.email);
  if (userProfile?.role !== "admin") throw new Error("Insufficient permissions");
}

// POST handler with context typed as any to fix build error in Next.js 15+
export async function POST(request: NextRequest, context: any) {
  try {
    await verifyAdmin();

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
    if (e.message.includes("Auth") || e.message.includes("permissions")) {
      return NextResponse.json({ error: e.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal server error", detail: e?.message }, { status: 500 });
  }
}
