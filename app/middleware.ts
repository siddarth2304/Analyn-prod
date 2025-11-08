// File: middleware.ts

import { NextResponse, type NextRequest } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { getUserProfileByEmail } from "@/lib/database"; // Use your DB function

export async function middleware(request: NextRequest) {
  // Get the session cookie
  const sessionCookie = request.cookies.get("__session")?.value;
  if (!sessionCookie) {
    // Not logged in, redirect to login
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  try {
    // Verify the session cookie with Firebase Admin
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    
    if (!decodedToken.email) {
      throw new Error("No email in token.");
    }

    // Check the user's role in *your* database
    const userProfile = await getUserProfileByEmail(decodedToken.email);
    
    if (userProfile?.role !== "admin") {
      // Not an admin, throw an error
      throw new Error("Insufficient permissions.");
    }

    // User is an admin, allow the request to proceed
    return NextResponse.next();
    
  } catch (error) {
    // Cookie is invalid or user is not an admin
    console.error("Middleware Auth Error:", error);
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
}

// This configures the middleware to ONLY run on the /admin page
export const config = {
  matcher: "/admin/:path*", // Protects /admin and any sub-pages
};