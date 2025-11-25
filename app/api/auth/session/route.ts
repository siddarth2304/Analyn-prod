// app/api/auth/session/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: "Missing token" },
        { status: 400 }
      );
    }

    // 5 days
    const expiresIn = 60 * 60 * 24 * 5 * 1000;

    // Create secure session cookie
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn,
    });

    const cookieStore = await cookies();

    cookieStore.set({
      name: "__session",
      value: sessionCookie,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: expiresIn / 1000,
      path: "/",
      sameSite: "lax",
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("SESSION ERROR:", err);
    return NextResponse.json(
      { error: "Session creation failed" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const cookieStore = await cookies();

  cookieStore.set({
    name: "__session",
    value: "",
    maxAge: -1,
    path: "/",
  });

  return NextResponse.json({ success: true });
}
