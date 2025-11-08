"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MapPin, Clock, Shield, Heart, ArrowRight, Search, Calendar, Globe } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  const [searchLocation, setSearchLocation] = useState("")

  const services = [
    {
      id: 1,
      name: "Swedish Therapeutic",
      description: "Deep massage using signature balm and Swedish movements to release tight muscle groups",
      price: 750,
      duration: 60,
      image: "/relaxing-swedish-massage.png",
      benefits: ["Stress Relief", "Chronic Pain", "Hard Massage"],
      popular: true,
    },
    {
      id: 2,
      name: "Shiatsu",
      description:
        "A manipulative therapy developed in Japan incorporating techniques of anma, acupressure, stretching, and Western massage",
      price: 850,
      duration: 60,
      image: "/deep-tissue-massage.png",
      benefits: ["Chronic Pain", "Joint Problems", "Headaches"],
    },
    {
      id: 3,
      name: "Swedish Aromatherapy",
      description: "Medium pressure massage using long gliding strokes with organic essential oil aromatherapy",
      price: 675,
      duration: 60,
      image: "/aromatherapy-massage-oils.png",
      benefits: ["Stress Relief", "Improve Mood", "Relaxation"],
    },
    {
      id: 4,
      name: "Office Syndrome Therapy",
      description:
        "An intense therapeutic session to treat repetitive postural stress using multiple advanced massage modalities",
      price: 950,
      duration: 60,
      image: "/wellness-massage-therapy.png",
      benefits: ["Carpal Tunnel", "Migraine", "Posture"],
    },
  ]

  const features = [
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "Verified Therapists",
      description: "All therapists are background-checked and certified professionals",
    },
    {
      icon: <Clock className="w-8 h-8 text-green-600" />,
      title: "On-Demand Booking",
      description: "Book sessions instantly or schedule for later - available 24/7",
    },
    {
      icon: <MapPin className="w-8 h-8 text-purple-600" />,
      title: "At Your Location",
      description: "Services delivered to your home, office, or preferred location",
    },
    {
      icon: <Heart className="w-8 h-8 text-red-600" />,
      title: "Personalized Care",
      description: "Customized treatments based on your specific needs and preferences",
    },
  ]

  const stats = [
    { number: "10K+", label: "Happy Clients" },
    { number: "500+", label: "Verified Therapists" },
    { number: "50+", label: "Cities Covered" },
    { number: "4.9", label: "Average Rating" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Wellness Services
              <br />
              Delivered to You
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Book verified therapists for massage, wellness, and therapeutic services. Professional care delivered to
              your doorstep, anywhere in the world.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="flex flex-col sm:flex-row gap-4 p-2 bg-white rounded-2xl shadow-lg border">
                <div className="flex-1 relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    placeholder="Enter your location..."
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="pl-12 border-0 focus:ring-0 text-lg h-14"
                  />
                </div>
                <Link href="/book">
                  <Button
                    size="lg"
                    className="h-14 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Find Therapists
                  </Button>
                </Link>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Popular Wellness Services</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose from our most requested therapeutic and wellness services
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service) => (
              <Card
                key={service.id}
                className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden flex flex-col h-full"
              >
                {/* "Most Popular" Badge Removed From Here */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={service.image || "/placeholder.svg"}
                    alt={service.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
                <CardContent className="p-6 flex flex-col flex-1">
                  <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{service.description}</p>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {service.benefits.map((benefit) => (
                      <Badge key={benefit} variant="secondary" className="text-xs">
                        {benefit}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{service.duration} min</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">₱{service.price}</div>
                  </div>

                  <Link href={`/book?service=${service.id}`} className="mt-auto">
                    <Button className="w-full group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all">
                      Book Now
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link href="/services">
              <Button variant="outline" size="lg" className="bg-transparent">
                View All Services
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose ANALYN?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're revolutionizing wellness services with technology, safety, and convenience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="text-center p-8 border-0 shadow-lg hover:shadow-xl transition-shadow h-full"
              >
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Simple steps to book your wellness session</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">1. Choose Service</h3>
              <p className="text-gray-600">Browse our services and select the perfect treatment for your needs</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">2. Book & Pay</h3>
              <p className="text-gray-600">Select your preferred time and therapist, then pay securely online</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">3. Relax & Enjoy</h3>
              <p className="text-gray-600">Your therapist arrives at your location ready to provide exceptional care</p>
            </div>
          </div>
        </div>
      </section>

      {/* Therapist CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Are You a Wellness Professional?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join our global network of therapists and grow your practice with ANALYN's platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/therapists/apply">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
                Apply as Therapist
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/therapists">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
              >
                Browse Therapists
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <span className="text-2xl font-bold">ANALYN</span>
              </div>
              <p className="text-gray-400 mb-4">
                Global wellness services delivered to your doorstep. Professional care, anywhere, anytime.
              </p>
              <div className="flex items-center space-x-2 text-sm text-gray-400">
                <Globe className="w-4 h-4" />
                <span>Available worldwide</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/services" className="hover:text-white transition-colors">
                    Massage Therapy
                  </Link>
                </li>
                <li>
                  <Link href="/services" className="hover:text-white transition-colors">
                    Wellness Services
                  </Link>
                </li>
                <li>
                  <Link href="/services" className="hover:text-white transition-colors">
                    Corporate Wellness
                  </Link>
                </li>
                <li>
                  <Link href="/services" className="hover:text-white transition-colors">
                    Special Events
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/therapists" className="hover:text-white transition-colors">
                    Find Therapists
                  </Link>
                </li>
                <li>
                  <Link href="/therapists/apply" className="hover:text-white transition-colors">
                    Become a Therapist
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/help" className="hover:text-white transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/safety" className="hover:text-white transition-colors">
                    Safety
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ANALYN. All rights reserved. Made with ❤️ for global wellness.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}