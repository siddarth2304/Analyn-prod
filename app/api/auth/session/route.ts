// File: app/api/auth/session/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();
    if (!idToken) {
      return NextResponse.json({ error: "No token provided" }, { status: 400 });
    }

    // Set session expiration to 5 days.
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    // Verify the ID token and create a session cookie.
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    // Set cookie policy for session cookie.
    cookies().set("__session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true, // Makes it secure
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error) {
    console.error("Session login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  // Clear the session cookie
  cookies().set("__session", "", { maxAge: -1, path: "/" });
  return NextResponse.json({ status: "success" }, { status: 200 });
}