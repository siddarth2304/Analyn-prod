import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";
import { sql } from "@vercel/postgres";

export async function GET() {
  try {
    const cookieStore = cookies(); // FIX: no await
    const sessionCookie = cookieStore.get("__session")?.value;

    if (!sessionCookie) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    } catch (err) {
      console.error("Session cookie verify failed:", err);
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const uid = decoded?.uid;

    const result = await sql`
      SELECT id, first_name, last_name, email, role
      FROM users
      WHERE firebase_uid = ${uid}
      LIMIT 1
    `;

    const dbUser = result.rows?.[0];

    if (dbUser) {
      return NextResponse.json({
        id: Number(dbUser.id),
        firstName: dbUser.first_name || "",
        lastName: dbUser.last_name || "",
        email: dbUser.email || "",
        role: dbUser.role || "client",
      });
    }

    const name = decoded?.name || "";
    const parts = name.split(" ");

    return NextResponse.json({
      id: null,
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" "),
      email: decoded?.email || "",
      role: "client",
    });
  } catch (err) {
    console.error("GET /api/auth/me error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
