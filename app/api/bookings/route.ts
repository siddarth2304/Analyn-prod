// File: app/api/bookings/route.ts

import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { adminAuth } from "@/lib/firebase-admin";

const sql = neon(process.env.DATABASE_URL!);

// -------------------------------
// CREATE BOOKING (POST)
// -------------------------------
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    // 🔥 FIX — verify Firebase ID token (NOT your JWT)
    const decoded = await adminAuth.verifyIdToken(token);

    const {
      therapistId,
      serviceId,
      bookingDate,
      startTime,
      endTime,
      clientAddress,
      clientLatitude,
      clientLongitude,
      totalAmount,
      platformFee,
      therapistPayout,
      notes,
    } = await request.json();

    const result = await sql`
      INSERT INTO bookings (
        client_id, therapist_id, service_id, booking_date, booking_time,
        duration, client_address, client_latitude, client_longitude,
        total_amount, platform_fee, therapist_payout, status, notes, payment_status
      )
      VALUES (
        ${decoded.user_id}, ${therapistId}, ${serviceId}, ${bookingDate},
        ${startTime}, 60,
        ${clientAddress ? JSON.stringify(clientAddress) : null},
        ${clientLatitude}, ${clientLongitude},
        ${totalAmount}, ${platformFee}, ${therapistPayout},
        'pending', ${notes}, 'unpaid'
      )
      RETURNING *
    `;

    return NextResponse.json(
      {
        message: "Booking created successfully",
        booking: result[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Booking creation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// -------------------------------
// GET BOOKINGS (GET)
// -------------------------------
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];

    // 🔥 FIX — verify Firebase ID token
    const decoded = await adminAuth.verifyIdToken(token);

    const userId = decoded.user_id;
    const role = decoded.role || "client"; // fallback
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status");

    let query;

    // ----------------------------------------------
    // ADMIN — can see all bookings
    // ----------------------------------------------
    if (role === "admin") {
      query = sql`
        SELECT 
          b.*,
          u1.first_name AS client_first_name, u1.last_name AS client_last_name,
          u2.first_name AS therapist_first_name, u2.last_name AS therapist_last_name,
          s.name AS service_name
        FROM bookings b
        JOIN users u1 ON b.client_id = u1.id
        JOIN therapists t ON b.therapist_id = t.id
        JOIN users u2 ON t.user_id = u2.id
        JOIN services s ON b.service_id = s.id
        ORDER BY b.created_at DESC
      `;
    }

    // ----------------------------------------------
    // THERAPIST — can see their own bookings
    // ----------------------------------------------
    else if (role === "therapist") {
      const therapist = await sql`
        SELECT id FROM therapists WHERE user_id = ${userId}
      `;

      if (therapist.length === 0) {
        return NextResponse.json(
          { error: "Therapist profile not found" },
          { status: 404 }
        );
      }

      const therapistId = therapist[0].id;

      query = sql`
        SELECT 
          b.*,
          u.first_name AS client_first_name,
          u.last_name AS client_last_name,
          s.name AS service_name
        FROM bookings b
        JOIN users u ON b.client_id = u.id
        JOIN services s ON b.service_id = s.id
        WHERE b.therapist_id = ${therapistId}
        ${statusFilter ? sql`AND b.status = ${statusFilter}` : sql``}
        ORDER BY b.booking_date DESC, b.booking_time DESC
      `;
    }

    // ----------------------------------------------
    // CLIENT — can see THEIR OWN bookings
    // ----------------------------------------------
    else {
      query = sql`
        SELECT 
          b.*,
          u.first_name AS therapist_first_name,
          u.last_name AS therapist_last_name,
          s.name AS service_name
        FROM bookings b
        JOIN therapists t ON b.therapist_id = t.id
        JOIN users u ON t.user_id = u.id
        JOIN services s ON b.service_id = s.id
        WHERE b.client_id = ${userId}
        ${statusFilter ? sql`AND b.status = ${statusFilter}` : sql``}
        ORDER BY b.booking_date DESC, b.booking_time DESC
      `;
    }

    const bookings = await query;

    return NextResponse.json({ bookings }, { status: 200 });
  } catch (error) {
    console.error("Fetch bookings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
