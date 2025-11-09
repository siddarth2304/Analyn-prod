import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { sql } from "@vercel/postgres";
import { adminAuth } from "@/lib/firebase-admin";
import { getUserProfileByEmail } from "@/lib/database";

// Session helper (unchanged)
function getSessionCookie() {
  return cookies().get("__session")?.value;
}

async function verifyAdmin() {
  const sessionCookie = getSessionCookie();
  if (!sessionCookie) throw new Error("Authentication required");
  const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
  if (!decodedToken.email) throw new Error("Invalid token");
  const userProfile = await getUserProfileByEmail(decodedToken.email);
  if (userProfile?.role !== "admin") throw new Error("Insufficient permissions");
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await verifyAdmin();

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
    if (e.message.includes("Auth") || e.message.includes("permissions")) {
      return NextResponse.json({ error: e.message }, { status: 403 });
    }
    return NextResponse.json({ error: "Internal server error", detail: e?.message }, { status: 500 });
  }
}
