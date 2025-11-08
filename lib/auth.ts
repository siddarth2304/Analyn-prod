// File: lib/auth.ts

import jwt from "jsonwebtoken"
import type { NextRequest } from "next/server"

// This interface must match your DB 'users' table
export interface User {
  id: number
  email: string
  firstName: string
  lastName: string
  role: "client" | "therapist" | "admin"
}

// Create a token (SERVER-SIDE ONLY)
export function createToken(user: User): string {
  const payload = {
    userId: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
  }
  
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "1d",
  })
}

// Verify a token (SERVER-SIDE ONLY)
export function verifyToken(token: string): User | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any
    return {
      id: decoded.userId,
      email: decoded.email,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      role: decoded.role,
    }
  } catch (error) {
    return null
  }
}

// Get user from request (SERVER-SIDE ONLY)
export function getAuthUser(request: NextRequest): User | null {
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  const token = authHeader.substring(7)
  return verifyToken(token)
}

// Require auth (SERVER-SIDE ONLY)
export function requireAuth(request: NextRequest, allowedRoles?: string[]) {
  const user = getAuthUser(request)

  if (!user) {
    throw new Error("Authentication required")
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new Error("Insufficient permissions")
  }

  return user
}