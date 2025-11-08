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
    
    const idToken = authHeader.split(" ")[1];
    
    // Verify the Firebase token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const email = decodedToken.email;

    // --- DEBUGGING LOG ---
    console.log("Firebase token email:", email);
    // ---------------------

    if (!email) {
      return NextResponse.json({ error: "Email not found in token" }, { status: 400 });
    }

    // Call our updated case-insensitive function
    const userProfile = await getUserProfileByEmail(email);

    // --- DEBUGGING LOG ---
    console.log("NeonDB profile found:", userProfile);
    // ---------------------

    if (!userProfile) {
      return NextResponse.json({ error: "User profile not found in database" }, { status: 404 });
    }

    // Send back the full database profile (including the role)
    return NextResponse.json(userProfile);
    
  } catch (error: any) {
    console.error("Profile fetch error:", error);
    // Send back a more specific error message
    return NextResponse.json({ error: "Internal server error", detail: error.message }, { status: 500 });
  }
}