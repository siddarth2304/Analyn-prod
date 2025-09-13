"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Star,
  MapPin,
  Clock,
  Calendar,
  Heart,
  Share2,
  ArrowLeft,
  CheckCircle,
  Award,
  MessageCircle,
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

interface TherapistProfile {
  id: string
  name: string
  avatar: string
  rating: number
  reviewCount: number
  specialties: string[]
  experience: number
  hourlyRate: number
  location: string
  bio: string
  availability: string[]
  verified: boolean
  responseTime: string
  languages: string[]
  certifications: string[]
  services: Array<{
    name: string
    duration: number
    price: number
    description: string
  }>
  reviews: Array<{
    id: string
    clientName: string
    rating: number
    comment: string
    date: string
    service: string
  }>
  gallery: string[]
}

export default function TherapistProfilePage() {
  const params = useParams()
  const [therapist, setTherapist] = useState<TherapistProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    // Mock data - replace with API call
    const mockTherapist: TherapistProfile = {
      id: params.id as string,
      name: "Maria Santos",
      avatar: "/professional-female-therapist.png",
      rating: 4.9,
      reviewCount: 127,
      specialties: ["Swedish Therapeutic", "Deep Tissue", "Aromatherapy", "Hot Stone"],
      experience: 5,
      hourlyRate: 85,
      location: "Makati, Manila",
      bio: "I'm a certified massage therapist with over 5 years of experience helping clients achieve wellness through therapeutic massage. I specialize in Swedish therapeutic massage, deep tissue work, and aromatherapy treatments. My approach combines traditional techniques with modern wellness practices to provide personalized care for each client. I believe in the healing power of touch and am passionate about helping people reduce stress, manage pain, and improve their overall well-being.",
      availability: [
        "Monday 9:00 AM - 8:00 PM",
        "Tuesday 9:00 AM - 8:00 PM",
        "Wednesday 9:00 AM - 8:00 PM",
        "Thursday 9:00 AM - 8:00 PM",
        "Friday 9:00 AM - 8:00 PM",
        "Saturday 10:00 AM - 6:00 PM",
      ],
      verified: true,
      responseTime: "Usually responds within 1 hour",
      languages: ["English", "Filipino", "Spanish"],
      certifications: ["Licensed Massage Therapist", "Aromatherapy Certification", "Deep Tissue Specialist"],
      services: [
        {
          name: "Swedish Therapeutic",
          duration: 60,
          price: 750,
          description: "Deep massage using signature balm and Swedish movements to release tight muscle groups",
        },
        {
          name: "Deep Tissue Massage",
          duration: 60,
          price: 850,
          description: "Intensive massage targeting deep muscle layers for chronic pain relief",
        },
        {
          name: "Aromatherapy Massage",
          duration: 60,
          price: 675,
          description: "Relaxing massage with essential oils for stress relief and mood enhancement",
        },
        {
          name: "Hot Stone Massage",
          duration: 90,
          price: 1200,
          description: "Therapeutic massage using heated stones for deep relaxation",
        },
      ],
      reviews: [
        {
          id: "1",
          clientName: "Sarah J.",
          rating: 5,
          comment:
            "Maria is absolutely amazing! Her Swedish therapeutic massage helped relieve my chronic back pain. Very professional and skilled.",
          date: "2024-01-10",
          service: "Swedish Therapeutic",
        },
        {
          id: "2",
          clientName: "John D.",
          rating: 5,
          comment:
            "Best massage I've ever had. Maria's technique is perfect and she really knows how to target problem areas. Highly recommend!",
          date: "2024-01-08",
          service: "Deep Tissue Massage",
        },
        {
          id: "3",
          clientName: "Lisa M.",
          rating: 4,
          comment:
            "Very relaxing aromatherapy session. Maria created a peaceful environment and the essential oils were perfect. Will book again!",
          date: "2024-01-05",
          service: "Aromatherapy Massage",
        },
      ],
      gallery: ["/wellness-massage-therapy.png", "/relaxing-swedish-massage.png", "/aromatherapy-massage-oils.png"],
    }

    setTimeout(() => {
      setTherapist(mockTherapist)
      setLoading(false)
    }, 1000)
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!therapist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Therapist Not Found</h1>
          <Link href="/therapists">
            <Button>Browse All Therapists</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/therapists" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Therapists
            </Link>
          </div>
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ANALYN
            </span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
              <Avatar className="w-32 h-32 mx-auto md:mx-0">
                <AvatarImage src={therapist.avatar || "/placeholder.svg"} alt={therapist.name} />
                <AvatarFallback className="text-2xl">
                  {therapist.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{therapist.name}</h1>
                    <div className="flex items-center justify-center md:justify-start space-x-4 mb-2">
                      <div className="flex items-center space-x-1">
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                        <span className="font-semibold text-lg">{therapist.rating}</span>
                        <span className="text-gray-600">({therapist.reviewCount} reviews)</span>
                      </div>
                      {therapist.verified && (
                        <div className="flex items-center space-x-1 text-green-600">
                          <CheckCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">Verified</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-center md:justify-start space-x-2 text-gray-600 mb-4">
                      <MapPin className="w-4 h-4" />
                      <span>{therapist.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setIsFavorite(!isFavorite)}>
                      <Heart className={`w-4 h-4 mr-2 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                      {isFavorite ? "Saved" : "Save"}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </div>

                {/* Specialties */}
                <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                  {therapist.specialties.map((specialty) => (
                    <Badge key={specialty} variant="secondary">
                      {specialty}
                    </Badge>
                  ))}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center md:text-left">
                  <div>
                    <p className="text-sm text-gray-600">Experience</p>
                    <p className="font-semibold">{therapist.experience} years</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Starting Rate</p>
                    <p className="font-semibold">₱{Math.min(...therapist.services.map((s) => s.price))}/session</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Response Time</p>
                    <p className="font-semibold text-green-600">Within 1 hour</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Languages</p>
                    <p className="font-semibold">{therapist.languages.join(", ")}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="about" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="availability">Availability</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About {therapist.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed mb-6">{therapist.bio}</p>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center">
                          <Award className="w-4 h-4 mr-2 text-blue-600" />
                          Certifications
                        </h4>
                        <ul className="space-y-1">
                          {therapist.certifications.map((cert, index) => (
                            <li key={index} className="text-gray-600 flex items-center">
                              <CheckCircle className="w-3 h-3 mr-2 text-green-500" />
                              {cert}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="services" className="space-y-6">
                <div className="grid gap-4">
                  {therapist.services.map((service, index) => (
                    <Card key={index}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{service.name}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                              <span className="flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {service.duration} minutes
                              </span>
                              <span className="font-semibold text-green-600">₱{service.price}</span>
                            </div>
                          </div>
                          <Link href={`/book?therapist=${therapist.id}&service=${service.name}`}>
                            <Button size="sm">Book Now</Button>
                          </Link>
                        </div>
                        <p className="text-gray-600">{service.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="space-y-6">
                <div className="space-y-4">
                  {therapist.reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium">{review.clientName}</span>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">
                              {review.service} • {new Date(review.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="availability" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Schedule</CardTitle>
                    <CardDescription>Current availability for bookings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {therapist.availability.map((schedule, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium">{schedule.split(" ")[0]}</span>
                          <span className="text-gray-600">{schedule.split(" ").slice(1).join(" ")}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-2 text-green-700">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Available for same-day bookings</span>
                      </div>
                      <p className="text-sm text-green-600 mt-1">Usually responds within 1 hour</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Book a Session</CardTitle>
                <CardDescription>Choose your preferred service and time</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600 mb-2">Starting from</p>
                  <p className="text-2xl font-bold text-blue-700">
                    ₱{Math.min(...therapist.services.map((s) => s.price))}
                  </p>
                  <p className="text-sm text-blue-600">per session</p>
                </div>

                <Link href={`/book?therapist=${therapist.id}`}>
                  <Button className="w-full" size="lg">
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Now
                  </Button>
                </Link>

                <Button variant="outline" className="w-full bg-transparent">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send Message
                </Button>

                <div className="text-center text-sm text-gray-600">
                  <p>Free cancellation up to 24 hours before</p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{therapist.responseTime}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{therapist.location}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
