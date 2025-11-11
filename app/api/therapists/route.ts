// File: app/api/therapists/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres"; // We will only use sql

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const specialty = searchParams.get("specialty") || "";
    const minPrice = Number.parseFloat(searchParams.get("minPrice") || "0");
    const maxPrice = Number.parseFloat(searchParams.get("maxPrice") || "100000");
    const sortBy = searchParams.get("sortBy") || "rating";
    const page = Number.parseInt(searchParams.get("page") || "1");
    const limit = Number.parseInt(searchParams.get("limit") || "12");
    const offset = (page - 1) * limit;

    // --- THIS IS THE FIX ---
    // We are building a raw SQL query string. This avoids all Kysely build errors.
    let query = `
      SELECT 
        t.*,
        u.first_name,
        u.last_name,
        u.email,
        u.phone
      FROM therapists t
      JOIN users u ON t.user_id = u.id
      WHERE t.is_verified = true
    `;
    
    const queryParams: any[] = [];

    if (search) {
      queryParams.push(`%${search}%`);
      query += ` AND (u.first_name ILIKE $${queryParams.length} OR u.last_name ILIKE $${queryParams.length} OR t.bio ILIKE $${queryParams.length})`;
    }

    if (specialty) {
      queryParams.push(`%${specialty}%`);
      query += ` AND t.specialties ILIKE $${queryParams.length}`;
    }

    if (minPrice > 0) {
      queryParams.push(minPrice);
      query += ` AND t.hourly_rate >= $${queryParams.length}`;
    }

    if (maxPrice < 100000) {
      queryParams.push(maxPrice);
      query += ` AND t.hourly_rate <= $${queryParams.length}`;
    }

    // Handle sorting
    let orderBy = "t.rating DESC";
    switch (sortBy) {
      case "price_low": orderBy = "t.hourly_rate ASC"; break;
      case "price_high": orderBy = "t.hourly_rate DESC"; break;
      case "experience": orderBy = "t.experience_years DESC"; break;
      case "reviews": orderBy = "t.total_reviews DESC"; break;
    }
    query += ` ORDER BY ${orderBy}`;

    // Add pagination
    queryParams.push(limit);
    query += ` LIMIT $${queryParams.length}`;
    queryParams.push(offset);
    query += ` OFFSET $${queryParams.length}`;
    
    // --- Execute the raw query ---
    const { rows: therapists } = await sql.query(query, queryParams);

    // --- Get total count for pagination ---
    // (This is a simplified count for now, we can make it more accurate later)
    const countResult = await sql`SELECT COUNT(*) FROM therapists WHERE is_verified = true`;
    const total = parseInt(countResult.rows[0].count, 10) || 0;

    // Format the response
    const formattedTherapists = therapists.map((therapist: any) => ({
      id: therapist.id,
      userId: therapist.user_id,
      firstName: therapist.first_name,
      lastName: therapist.last_name,
      email: therapist.email,
      phone: therapist.phone,
      specialties: (() => {
        try { return JSON.parse(therapist.specialties); } catch { return []; }
      })(),
      bio: therapist.bio,
      experienceYears: therapist.experience_years,
      hourlyRate: Number.parseFloat(therapist.hourly_rate || "0"),
      location: therapist.location,
      rating: Number.parseFloat(therapist.rating || "0"),
      totalReviews: therapist.total_reviews,
      profileImage: therapist.profile_image,
      isVerified: therapist.is_verified,
    }));

    return NextResponse.json({
      therapists: formattedTherapists,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching therapists:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}