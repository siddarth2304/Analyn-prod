// lib/database.ts

import { sql } from "@vercel/postgres"

// Helper to map database row to user object
function mapUser(row: any) {
  return {
    id: Number(row.id), // Ensure this is a number
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    role: row.role,
    firebaseUid: row.firebase_uid,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

// Create a new user profile
export async function createUserProfile(userData: {
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: "client" | "therapist"
  firebaseUid: string
}) {
  const result = await sql`
    INSERT INTO users (email, first_name, last_name, phone, role, firebase_uid, created_at, updated_at)
    VALUES (${userData.email}, ${userData.firstName}, ${userData.lastName}, ${userData.phone || null}, ${userData.role}, ${userData.firebaseUid}, NOW(), NOW())
    RETURNING *
  `
  // Use .rows[0] for @vercel/postgres
  return mapUser(result.rows[0])
}

// Get a user by email (CASE-INSENSITIVE)
export async function getUserProfileByEmail(email: string) {
  // Add a safety check
  if (!email) return null;

  // Use LOWER() to make the search case-insensitive
  const result = await sql`
    SELECT * FROM users WHERE LOWER(email) = LOWER(${email})
  `
  
  // Use .rowCount and .rows[0] for @vercel/postgres
  return result.rowCount > 0 ? mapUser(result.rows[0]) : null
}

// Update booking status
export async function updateBookingStatus(bookingId: string, status: string) {
  const result = await sql`
    UPDATE bookings
    SET status = ${status}, updated_at = NOW()
    WHERE id = ${bookingId}
    RETURNING *
  `
  // Use .rows[0]
  return result.rows[0]
}

// Expose database client
export const getDatabase = () => sql

// === ALIASES TO SATISFY VERCEL BUILD ===
export const getUserByEmail = getUserProfileByEmail
export const createUser = createUserProfile