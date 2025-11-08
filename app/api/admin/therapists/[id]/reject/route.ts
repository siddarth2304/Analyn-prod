import { NextResponse } from "next/server";
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

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdmin();

    const { id } = await context.params;
    const therapistId = Number(id);

    if (!therapistId) {
      return NextResponse.json({ error: "Invalid therapist ID" }, { status: 400 });
    }

    const therapist = await sql`SELECT user_id FROM therapists WHERE id = ${therapistId}`;
    if (therapist.rowCount === 0) {
      return NextResponse.json({ error: "Therapist not found" }, { status: 404 });
    }

    const userId = therapist.rows[0].user_id;
    await sql`DELETE FROM users WHERE id = ${userId}`;

    return NextResponse.json(
      { message: "Therapist rejected and user deleted" },
      { status: 200 }
    );
  } catch (e: any) {
    console.error("Error rejecting therapist:", e);
    if (
      e.message === "Authentication required" ||
      e.message === "Insufficient permissions"
    ) {
      return NextResponse.json({ error: e.message }, { status: 403 });
    }
    return NextResponse.json(
      { error: "Internal server error", detail: e?.message },
      { status: 500 }
    );
  }
}
