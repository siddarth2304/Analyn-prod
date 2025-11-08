// File: app/api/auth/profile/route.ts

import { NextResponse } from "next/server";
import { getUserProfileByEmail } from "@/lib/database";
import { adminAuth } from "@/lib/firebase-admin";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Get the Firebase token from the request
    const idToken = authHeader.split(" ")[1];
    
    // Verify the Firebase token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const email = decodedToken.email;

    if (!email) {
      return NextResponse.json({ error: "Email not found in token" }, { status: 400 });
    }

    // Get the user's profile from your NeonDB
    const userProfile = await getUserProfileByEmail(email);
    if (!userProfile) {
      return NextResponse.json({ error: "User profile not found in database" }, { status: 404 });
    }

    // Send back the full database profile (including the role)
    return NextResponse.json(userProfile);
    
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}