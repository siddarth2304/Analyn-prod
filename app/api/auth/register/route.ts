// File: app/api/auth/register/route.ts

import { NextResponse } from "next/server";
import { createUserProfile, getUserProfileByEmail } from "@/lib/database"; // Use your existing functions

export async function POST(request: Request) {
  try {
    const { email, firstName, lastName, phone, firebaseUid, role } = await request.json();

    if (!email || !firebaseUid || !role) {
      return NextResponse.json(
        { error: "Missing required fields: email, firebaseUid, and role" },
        { status: 400 }
      );
    }

    // Check if user already exists in our DB
    const existingUser = await getUserProfileByEmail(email);
    if (existingUser) {
      // This is fine, just return the existing user
      return NextResponse.json(existingUser, { status: 200 });
    }

    // Create the new user profile in NeonDB
    const newUser = await createUserProfile({
      email,
      firstName: firstName || "New", // Add default fallbacks
      lastName: lastName || "User",
      phone: phone || null,
      role: role === "therapist" ? "therapist" : "client",
      firebaseUid,
    });

    return NextResponse.json(newUser, { status: 201 });
    
  } catch (error: any) {
    console.error("API Register Error:", error);
    // Handle potential database errors
    if (error.code === '23505') { // Postgres unique violation
      return NextResponse.json({ error: "User profile already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}