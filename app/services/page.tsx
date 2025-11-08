"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// Define the services available
const allServices = [
  {
    id: 1,
    name: "Swedish Therapeutic",
    description: "Deep massage using signature balm and Swedish movements to release tight muscle groups",
    price: 7000, // Price in INR
    duration: 60,
    image: "/relaxing-swedish-massage.png",
    benefits: ["Stress Relief", "Chronic Pain", "Hard Massage"],
  },
  {
    id: 2,
    name: "Shiatsu",
    description: "A manipulative therapy developed in Japan incorporating techniques of anma, acupressure, stretching, and Western massage",
    price: 7800, // Price in INR
    duration: 60,
    image: "/deep-tissue-massage.png",
    benefits: ["Chronic Pain", "Joint Problems", "Headaches"],
  },
  {
    id: 3,
    name: "Swedish Aromatherapy",
    description: "Medium pressure massage using long gliding strokes with organic essential oil aromatherapy",
    price: 6800, // Price in INR
    duration: 60,
    image: "/aromatherapy-massage-oils.png",
    benefits: ["Stress Relief", "Improve Mood", "Relaxation"],
  },
  {
    id: 4,
    name: "Office Syndrome Therapy",
    description: "An intense therapeutic session to treat repetitive postural stress using multiple advanced massage modalities",
    price: 8500, // Price in INR
    duration: 60,
    image: "/wellness-massage-therapy.png",
    benefits: ["Carpal Tunnel", "Migraine", "Posture"],
  },
  {
    id: 5,
    name: "Hot Stone Massage",
    description: "Uses smooth, heated stones to warm and relax muscles, allowing for deeper pressure.",
    price: 7500, // Price in INR
    duration: 75,
    image: "/deep-tissue-massage.png", // Use a relevant placeholder
    benefits: ["Muscle Tension", "Blood Circulation", "Deep Relaxation"],
  },
  {
    id: 6,
    name: "Sports Massage",
    description: "Focuses on preventing and treating injuries to muscles and tendons, ideal for athletes.",
    price: 8000, // Price in INR
    duration: 60,
    image: "/wellness-massage-therapy.png", // Use a relevant placeholder
    benefits: ["Injury Prevention", "Flexibility", "Performance"],
  },
]

// This is the default export that was missing
export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50 text-stone-700">
      <div className="container mx-auto px-4 py-16">
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
            Our Wellness Services
          </h1>
          <p className="text-xl text-stone-600 max-w-2xl mx-auto">
            Find the perfect treatment designed for your specific needs. Each service is provided by a certified
            professional.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allServices.map((service) => (
            <Card
              key={service.id}
              className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden flex flex-col h-full bg-white"
            >
              <div className="relative h-52 overflow-hidden">
                <Image
                  src={service.image || "/placeholder.svg"}
                  alt={service.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
              <CardContent className="p-6 flex flex-col flex-1">
                <h3 className="text-2xl font-semibold mb-2 text-stone-800">{service.name}</h3>
                <p className="text-stone-600 text-sm mb-4 line-clamp-2">{service.description}</p>

                <div className="flex flex-wrap gap-2 mb-5">
                  {service.benefits.map((benefit) => (
                    <Badge
                      key={benefit}
                      variant="secondary"
                      className="text-xs bg-emerald-100 text-emerald-800"
                    >
                      {benefit}
                    </Badge>
                  ))}
                </div>

                {/* Pushes content below to the bottom */}
                <div className="mt-auto">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center space-x-2 text-sm text-stone-600">
                      <Clock className="w-4 h-4" />
                      <span>{service.duration} min</span>
                    </div>
                    <div className="text-2xl font-bold text-teal-700">₹{service.price}</div>
                  </div>

                  <Link href={`/book?service=${service.id}`} className="mt-auto">
                    <Button className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700">
                      Book Now
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4 text-stone-800">Ready to Feel Your Best?</h2>
          <p className="text-xl mb-8 text-stone-600 max-w-2xl mx-auto">
            Book your preferred service today and let our verified therapists take care of you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book">
              <Button
                size="lg"
                className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700"
              >
                Book a Session
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/therapists">
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent text-teal-700 border-teal-700 hover:bg-teal-700 hover:text-white"
              >
                Find a Therapist
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}