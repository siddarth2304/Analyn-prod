import { NextRequest, NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const services = await sql`
      SELECT * FROM services 
      WHERE is_active = true 
      ORDER BY category, name
    `

    return NextResponse.json({ services })

  } catch (error) {
    console.error('Fetch services error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, duration_minutes, base_price, category } = await request.json()

    // Validate input
    if (!name || !duration_minutes || !base_price || !category) {
      return NextResponse.json(
        { error: 'Name, duration, price, and category are required' },
        { status: 400 }
      )
    }

    const services = await sql`
      INSERT INTO services (name, description, duration_minutes, base_price, category)
      VALUES (${name}, ${description}, ${duration_minutes}, ${base_price}, ${category})
      RETURNING *
    `

    return NextResponse.json({
      message: 'Service created successfully',
      service: services[0]
    })

  } catch (error) {
    console.error('Create service error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
