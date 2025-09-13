import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'
import jwt from 'jsonwebtoken'

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any

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
      notes
    } = await request.json()

    // Create booking
    const bookings = await sql`
      INSERT INTO bookings (
        client_id, therapist_id, service_id, booking_date, start_time, end_time,
        client_address, client_latitude, client_longitude, total_amount,
        platform_fee, therapist_payout, status, notes
      )
      VALUES (
        ${decoded.userId}, ${therapistId}, ${serviceId}, ${bookingDate}, 
        ${startTime}, ${endTime}, ${JSON.stringify(clientAddress)}, 
        ${clientLatitude}, ${clientLongitude}, ${totalAmount},
        ${platformFee}, ${therapistPayout}, 'pending', ${notes}
      )
      RETURNING *
    `

    return NextResponse.json({
      message: 'Booking created successfully',
      booking: bookings[0]
    })

  } catch (error) {
    console.error('Booking creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const role = decoded.role

    let bookings

    if (role === 'admin') {
      // Admin can see all bookings
      bookings = await sql`
        SELECT b.*, u1.first_name as client_first_name, u1.last_name as client_last_name,
               u2.first_name as therapist_first_name, u2.last_name as therapist_last_name,
               s.name as service_name
        FROM bookings b
        JOIN users u1 ON b.client_id = u1.id
        JOIN therapist_profiles tp ON b.therapist_id = tp.id
        JOIN users u2 ON tp.user_id = u2.id
        JOIN services s ON b.service_id = s.id
        ORDER BY b.created_at DESC
      `
    } else if (role === 'therapist') {
      // Therapist can see their own bookings
      const therapistProfile = await sql`
        SELECT id FROM therapist_profiles WHERE user_id = ${decoded.userId}
      `
      
      if (therapistProfile.length === 0) {
        return NextResponse.json({ error: 'Therapist profile not found' }, { status: 404 })
      }

      bookings = await sql`
        SELECT b.*, u.first_name as client_first_name, u.last_name as client_last_name,
               s.name as service_name
        FROM bookings b
        JOIN users u ON b.client_id = u.id
        JOIN services s ON b.service_id = s.id
        WHERE b.therapist_id = ${therapistProfile[0].id}
        ${status ? sql`AND b.status = ${status}` : sql``}
        ORDER BY b.booking_date DESC, b.start_time DESC
      `
    } else {
      // Client can see their own bookings
      bookings = await sql`
        SELECT b.*, tp.user_id, u.first_name as therapist_first_name, u.last_name as therapist_last_name,
               s.name as service_name
        FROM bookings b
        JOIN therapist_profiles tp ON b.therapist_id = tp.id
        JOIN users u ON tp.user_id = u.id
        JOIN services s ON b.service_id = s.id
        WHERE b.client_id = ${decoded.userId}
        ${status ? sql`AND b.status = ${status}` : sql``}
        ORDER BY b.booking_date DESC, b.start_time DESC
      `
    }

    return NextResponse.json({ bookings })

  } catch (error) {
    console.error('Fetch bookings error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
