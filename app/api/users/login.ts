// /api/users/login.ts
import { sql } from "@/lib/database"
import bcrypt from "bcrypt"

export async function POST(req: Request) {
  const { email, password } = await req.json()
  const user = await sql`SELECT * FROM users WHERE email = ${email}`

  if (!user || user.length === 0)
    return new Response(JSON.stringify({ message: "User not found" }), { status: 404 })

  if (!user[0].verified)
    return new Response(JSON.stringify({ message: "Account not verified" }), { status: 403 })

  const match = await bcrypt.compare(password, user[0].password)
  if (!match) return new Response(JSON.stringify({ message: "Incorrect password" }), { status: 401 })

  // Generate JWT or session
  return new Response(JSON.stringify({ message: "Login successful" }), { status: 200 })
}
