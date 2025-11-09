// File: app/api/auth/session/route.ts

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";

// FIX: Change to a synchronous function that handles the cookies.set call directly.
// This resolves the "cookies() should be awaited" error/warning.
function setCookieSync(name: string, value: string, options: any) {
  const cookieStore = cookies();
  cookieStore.set(name, value, options);
}

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();
    if (!idToken) {
      return NextResponse.json({ error: "No token provided" }, { status: 400 });
    }

    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    // Use the fixed setter
    setCookieSync("__session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
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
  // Use the fixed setter
  setCookieSync("__session", "", { maxAge: -1, path: "/" });
  return NextResponse.json({ status: "success" }, { status: 200 });
}