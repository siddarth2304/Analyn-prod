import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Smartphone, Stethoscope, Activity } from "lucide-react"

export default function AppsHub() {
  const apps = [
    {
      title: "Client App",
      description: "Book services, manage appointments, and check in with GPS/Bluetooth.",
      href: "/client/dashboard",
      icon: Smartphone,
    },
    {
      title: "Therapist App",
      description: "Accept jobs, navigate to clients, and verify onsite proximity.",
      href: "/therapist/dashboard",
      icon: Stethoscope,
    },
    {
      title: "Operations App",
      description: "Live monitoring of active bookings with GPS trails and status.",
      href: "/ops",
      icon: Activity,
    },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">ANALYN Apps</h1>
        <p className="text-gray-600 mb-8">Choose an app to open</p>

        <div className="grid md:grid-cols-3 gap-6">
          {apps.map((a) => (
            <Card key={a.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <a.icon className="h-5 w-5 text-blue-600" />
                  <span>{a.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{a.description}</p>
                <Button asChild>
                  <Link href={a.href}>Open {a.title}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-10">
          <Button variant="outline" asChild>
            <Link href="/book">Quick Book</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
