// FINAL FIXED VERSION — matches your DB EXACTLY
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

// GET /api/therapists
export async function GET() {
  try {
    // Only fetch VERIFIED therapists
    const rows = await sql`
      SELECT 
        t.id,
        t.user_id,
        t.specialties,
        t.bio,
        t.experience_years,
        t.hourly_rate,
        t.rating,
        t.total_reviews,
        t.location,
        t.profile_image,
        u.first_name,
        u.last_name,
        u.email,
        u.phone
      FROM therapists t
      INNER JOIN users u ON t.user_id = u.id
      WHERE t.is_verified = true
      ORDER BY t.rating DESC NULLS LAST;
    `;

    const therapists = rows.map((t: any) => ({
      id: t.id,
      userId: t.user_id,
      first_name: t.first_name,
      last_name: t.last_name,
      email: t.email,
      phone: t.phone,
      bio: t.bio,
      experience_years: t.experience_years,
      hourly_rate: Number(t.hourly_rate || 0),
      rating: Number(t.rating || 0),
      total_reviews: t.total_reviews,
      location: t.location,
      profile_image: t.profile_image,
      specialties: (() => {
        try {
          return JSON.parse(t.specialties); // Stored as JSON string
        } catch {
          return t.specialties
            ? t.specialties.split(",").map((s: string) => s.trim())
            : [];
        }
      })(),
    }));

    return NextResponse.json({ therapists });
  } catch (error) {
    console.error("Therapist API error:", error);
    return NextResponse.json(
      { error: "Internal server error", detail: (error as any).message },
      { status: 500 }
    );
  }
}
