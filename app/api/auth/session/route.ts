import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();
    if (!idToken) {
      return NextResponse.json({ error: "No token provided" }, { status: 400 });
    }

    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const cookieStore = await cookies(); // MUST be awaited in your Next.js version

    cookieStore.set("__session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return NextResponse.json({ status: "success" }, { status: 200 });
  } catch (error: any) {
    console.error("Session login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE() {
  const cookieStore = await cookies(); // MUST be awaited

  cookieStore.set("__session", "", {
    maxAge: -1,
    path: "/",
  });

  return NextResponse.json({ status: "success" }, { status: 200 });
}
