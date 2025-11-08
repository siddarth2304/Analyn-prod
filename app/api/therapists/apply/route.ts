// File: app/api/therapists/apply/route.ts

import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function POST(request: Request) {
  const {
    // Personal Info
    firstName,
    lastName,
    email,
    phone,
    address,
    city,
    country,

    // Professional Info
    bio,
    experienceYears,
    specialties, // This is the string[]
    hourlyRate,
    serviceRadius,
    
  } = await request.json();

  // Simple validation
  if (!firstName || !lastName || !email || !phone || !address) {
    return NextResponse.json(
      { error: "Missing required personal fields" },
      { status: 400 }
    );
  }
  if (!experienceYears || !hourlyRate || !specialties) {
    return NextResponse.json(
      { error: "Missing required professional fields" },
      { status: 400 }
    );
  }

  try {
    // 1. Create the new user
    const newUserResult = await sql`
      INSERT INTO users (first_name, last_name, email, phone, role, created_at, updated_at)
      VALUES (${firstName}, ${lastName}, ${email}, ${phone}, 'therapist', NOW(), NOW())
      RETURNING id;
    `;

    const newUserId = newUserResult.rows[0].id;
    if (!newUserId) {
      throw new Error("Failed to create user entry.");
    }

    // 2. Create the new therapist, linking the user_id
    const specialtiesString = JSON.stringify(specialties);

    const newTherapistResult = await sql`
      INSERT INTO therapists (
        user_id, bio, experience_years, specialties, hourly_rate, 
        location, service_radius, is_verified, created_at
      )
      VALUES (
        ${newUserId}, ${bio}, ${parseInt(experienceYears, 10)}, ${specialtiesString}, ${parseFloat(hourlyRate)},
        ${city}, ${parseInt(serviceRadius, 10)}, false, NOW()
      )
      RETURNING id;
    `;
    
    const newTherapistId = newTherapistResult.rows[0].id;

    return NextResponse.json({
      message: "Application submitted successfully!",
      userId: newUserId,
      therapistId: newTherapistId,
    });

  } catch (error: any) {
    // --- THIS IS THE IMPROVEMENT ---
    // This will now catch ALL errors, not just '23505'
    console.error("Application submission failed:", error);
    
    if (error.code === '23505') { // PostgreSQL unique violation
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 } // 409 Conflict
      );
    }
    // Return a generic error and the specific database error code
    return NextResponse.json(
      { error: "Internal server error", detail: error.message, code: error.code },
      { status: 500 }
    );
  }
}