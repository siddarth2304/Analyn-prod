import jwt from "jsonwebtoken"
import type { NextRequest } from "next/server"

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: "client" | "therapist" | "admin"
}

export function verifyToken(token: string): User | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key-change-in-production") as any
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

export function getAuthUser(request: NextRequest): User | null {
  const authHeader = request.headers.get("authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }

  const token = authHeader.substring(7)
  return verifyToken(token)
}

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
