// lib/database.ts
import { sql } from "@vercel/postgres"

// Helper to map database row to user object
function mapUser(row: any) {
  return {
    id: row.id,
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
  return mapUser(result[0])
}

// Get a user by email
export async function getUserProfileByEmail(email: string) {
  const result = await sql`SELECT * FROM users WHERE email = ${email}`
  return result.length > 0 ? mapUser(result[0]) : null
}

// Update booking status
export async function updateBookingStatus(bookingId: string, status: string) {
  const result = await sql`
    UPDATE bookings
    SET status = ${status}, updated_at = NOW()
    WHERE id = ${bookingId}
    RETURNING *
  `
  return result[0]
}

// Expose database client
export const getDatabase = () => sql

// === ALIASES TO SATISFY VERCEL BUILD ===
export const getUserByEmail = getUserProfileByEmail
export const createUser = createUserProfile

