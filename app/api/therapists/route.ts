import { type NextRequest, NextResponse } from "next/server"
import { getDatabase } from "@/lib/database"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const specialty = searchParams.get("specialty") || ""
    const minPrice = Number.parseFloat(searchParams.get("minPrice") || "0")
    const maxPrice = Number.parseFloat(searchParams.get("maxPrice") || "1000")
    const sortBy = searchParams.get("sortBy") || "rating"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")
    const offset = (page - 1) * limit

    const db = getDatabase()

    // Build the query
    const whereConditions = ["t.is_verified = ? AND t.is_available = ?"]
    const queryParams: any[] = [true, true]

    if (search) {
      whereConditions.push("(u.first_name LIKE ? OR u.last_name LIKE ? OR t.bio LIKE ?)")
      const searchTerm = `%${search}%`
      queryParams.push(searchTerm, searchTerm, searchTerm)
    }

    if (specialty) {
      whereConditions.push("t.specialties LIKE ?")
      queryParams.push(`%${specialty}%`)
    }

    if (minPrice > 0) {
      whereConditions.push("t.hourly_rate >= ?")
      queryParams.push(minPrice)
    }

    if (maxPrice < 1000) {
      whereConditions.push("t.hourly_rate <= ?")
      queryParams.push(maxPrice)
    }

    // Determine sort order
    let orderBy = "t.rating DESC"
    switch (sortBy) {
      case "price_low":
        orderBy = "t.hourly_rate ASC"
        break
      case "price_high":
        orderBy = "t.hourly_rate DESC"
        break
      case "experience":
        orderBy = "t.experience_years DESC"
        break
      case "reviews":
        orderBy = "t.total_reviews DESC"
        break
      default:
        orderBy = "t.rating DESC"
    }

    const whereClause = whereConditions.join(" AND ")

    // Get therapists with user info
    const therapists = await db.query(
      `
      SELECT 
        t.*,
        u.first_name,
        u.last_name,
        u.email,
        u.phone
      FROM therapists t
      JOIN users u ON t.user_id = u.id
      WHERE ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `,
      [...queryParams, limit, offset],
    )

    // Get total count for pagination
    const countResult = await db.query(
      `
      SELECT COUNT(*) as total
      FROM therapists t
      JOIN users u ON t.user_id = u.id
      WHERE ${whereClause}
    `,
      queryParams,
    )

    const total = countResult[0]?.total || 0

    // Format the response
    const formattedTherapists = therapists.map((therapist) => ({
      id: therapist.id,
      userId: therapist.user_id,
      firstName: therapist.first_name,
      lastName: therapist.last_name,
      email: therapist.email,
      phone: therapist.phone,
      specialties: therapist.specialties ? JSON.parse(therapist.specialties) : [],
      bio: therapist.bio,
      experienceYears: therapist.experience_years,
      hourlyRate: Number.parseFloat(therapist.hourly_rate || "0"),
      location: therapist.location,
      latitude: therapist.latitude,
      longitude: therapist.longitude,
      availability: therapist.availability ? JSON.parse(therapist.availability) : {},
      rating: Number.parseFloat(therapist.rating || "0"),
      totalReviews: therapist.total_reviews,
      profileImage: therapist.profile_image,
      isVerified: therapist.is_verified,
      isAvailable: therapist.is_available,
      createdAt: therapist.created_at,
      updatedAt: therapist.updated_at,
    }))

    return NextResponse.json({
      therapists: formattedTherapists,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching therapists:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
