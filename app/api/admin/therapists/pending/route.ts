// File: app/api/admin/therapists/pending/route.ts

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

export async function GET(request: NextRequest) {
  try {
    await verifyAdmin(); // Verify user is an admin
    const result = await sql`
      SELECT t.id, t.user_id, t.is_verified, t.experience_years, t.hourly_rate, t.location, t.created_at,
             u.first_name, u.last_name, u.email, u.phone, t.specialties
      FROM therapists t
      JOIN users u ON t.user_id = u.id
      WHERE t.is_verified = false
      ORDER BY t.created_at DESC NULLS LAST
    `;
    return NextResponse.json({ therapists: result.rows }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: e.message.includes("Auth") ? 403 : 500 });
  }
}