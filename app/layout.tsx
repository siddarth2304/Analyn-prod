import "./globals.css"
import type { ReactNode } from "react"
import { AuthProvider } from "@/components/auth-provider"
import Navbar from "@/components/navbar"

export const metadata = {
  title: "Analyn",
  description: "Therapist & Client Dashboard",
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <AuthProvider>
          {/* Single Navbar on all pages */}
          <Navbar />
          <main className="pt-20">{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}

