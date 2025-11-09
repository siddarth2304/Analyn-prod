// File: app/api/therapists/route.ts

import { type NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { Kysely } from 'kysely'
// FIX 1: Import the default export for the adapter
import VercelKysely from '@vercel/postgres-kysely' 

// Define the database structure for Kysely
interface Database {
  therapists: {
    id: string;
    user_id: string;
    is_verified: boolean;
    bio: string;
    specialties: string; // JSON string
    hourly_rate: number;
    experience_years: number;
    rating: number;
    total_reviews: number;
    location: string;
    profile_image: string;
  };
  users: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
}

// Create the Kysely database client
const db = new Kysely<Database>({
  // FIX 2: Correct constructor call using the default import and required object syntax
  dialect: new VercelKysely({ database: sql }), 
});

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

    // Start building the query using Kysely
    let query = db
      .selectFrom("therapists as t")
      .innerJoin("users as u", "t.user_id", "u.id")
      .selectAll("t")
      .select(["u.first_name", "u.last_name", "u.email", "u.phone"])
      .where("t.is_verified", "=", true);

    if (search) {
      const searchTerm = `%${search}%`;
      query = query.where((eb) =>
        eb.or([
          eb("u.first_name", "like", searchTerm),
          eb("u.last_name", "like", searchTerm),
          eb("t.bio", "like", searchTerm),
        ])
      );
    }
    
    if (minPrice > 0) {
      query = query.where("t.hourly_rate", ">=", minPrice);
    }
    if (maxPrice < 100000) {
      query = query.where("t.hourly_rate", "<=", maxPrice);
    }

    switch (sortBy) {
      case "price_low": query = query.orderBy("t.hourly_rate", "asc"); break;
      case "price_high": query = query.orderBy("t.hourly_rate", "desc"); break;
      case "experience": query = query.orderBy("t.experience_years", "desc"); break;
      case "reviews": query = query.orderBy("t.total_reviews", "desc"); break;
      default: query = query.orderBy("t.rating", "desc");
    }

    const therapists = await query.limit(limit).offset(offset).execute();

    // Get count
    let countQuery = db
        .selectFrom("therapists as t")
        .innerJoin("users as u", "t.user_id", "u.id")
        .select(db.fn.countAll<number>().as("total"))
        .where("t.is_verified", "=", true);
    
    // Replicate filters for counting
    if (search) {
        const searchTerm = `%${search}%`;
        countQuery = countQuery.where((eb) =>
            eb.or([
                eb("u.first_name", "like", searchTerm),
                eb("u.last_name", "like", searchTerm),
                eb("t.bio", "like", searchTerm),
            ])
        );
    }
    if (minPrice > 0) { countQuery = countQuery.where("t.hourly_rate", ">=", minPrice); }
    if (maxPrice < 100000) { countQuery = countQuery.where("t.hourly_rate", "<=", maxPrice); }


    const countResult = await countQuery.executeTakeFirst();
    const total = countResult?.total ?? 0;

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