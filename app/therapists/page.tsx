"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Star, MapPin, Clock, Filter, Search, Heart, Calendar } from "lucide-react"
import Link from "next/link"

interface Therapist {
  id: string
  name: string
  avatar: string
  rating: number
  reviewCount: number
  specialties: string[]
  experience: number
  hourlyRate: number // Now in INR
  distance: number
  location: string
  bio: string
  availability: string
  verified: boolean
  responseTime: string
}

export default function TherapistsPage() {
  const [therapists, setTherapists] = useState<Therapist[]>([])
  const [filteredTherapists, setFilteredTherapists] = useState<Therapist[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSpecialty, setSelectedSpecialty] = useState("all")
  // Updated price range for INR
  const [priceRange, setPriceRange] = useState<[number, number]>([3000, 10000])
  const [sortBy, setSortBy] = useState("rating")
  const [favorites, setFavorites] = useState<string[]>([])

  // Mock data - updated with INR rates
  useEffect(() => {
    const mockTherapists: Therapist[] = [
      {
        id: "1",
        name: "Maria Santos",
        avatar: "/professional-female-therapist.png",
        rating: 4.9,
        reviewCount: 127,
        specialties: ["Swedish Therapeutic", "Deep Tissue", "Aromatherapy"],
        experience: 5,
        hourlyRate: 7000, // Updated to INR
        distance: 2.3,
        location: "Makati, Manila",
        bio: "Certified massage therapist with 5 years of experience specializing in therapeutic massage for stress relief and pain management.",
        availability: "Available today",
        verified: true,
        responseTime: "Usually responds within 1 hour",
      },
      {
        id: "2",
        name: "Anna Rodriguez",
        avatar: "/asian-female-therapist.png",
        rating: 4.8,
        reviewCount: 89,
        specialties: ["Shiatsu", "Hot Stone", "Prenatal"],
        experience: 7,
        hourlyRate: 7800, // Updated to INR
        distance: 3.1,
        location: "BGC, Taguig",
        bio: "Expert in Japanese Shiatsu massage and prenatal care. Helping clients achieve wellness through traditional healing techniques.",
        availability: "Available tomorrow",
        verified: true,
        responseTime: "Usually responds within 30 minutes",
      },
      {
        id: "3",
        name: "Carlos Mendoza",
        avatar: "/male-therapist.png",
        rating: 4.7,
        reviewCount: 156,
        specialties: ["Sports Massage", "Deep Tissue", "Office Syndrome"],
        experience: 8,
        hourlyRate: 8500, // Updated to INR
        distance: 4.2,
        location: "Ortigas, Pasig",
        bio: "Sports massage specialist working with athletes and office workers. Expert in treating repetitive strain injuries.",
        availability: "Available this week",
        verified: true,
        responseTime: "Usually responds within 2 hours",
      },
      {
        id: "4",
        name: "Isabella Cruz",
        avatar: "/professional-female-therapist.png",
        rating: 4.9,
        reviewCount: 203,
        specialties: ["Swedish Aromatherapy", "Reflexology", "Reiki"],
        experience: 6,
        hourlyRate: 6800, // Updated to INR
        distance: 1.8,
        location: "Quezon City",
        bio: "Holistic wellness practitioner combining massage therapy with energy healing for complete mind-body wellness.",
        availability: "Available today",
        verified: true,
        responseTime: "Usually responds within 15 minutes",
      },
      {
        id: "5",
        name: "Miguel Torres",
        avatar: "/male-therapist.png",
        rating: 4.6,
        reviewCount: 74,
        specialties: ["Thai Massage", "Stretching", "Sports Recovery"],
        experience: 4,
        hourlyRate: 6400, // Updated to INR
        distance: 5.1,
        location: "Alabang, Muntinlupa",
        bio: "Traditional Thai massage practitioner focused on flexibility and sports recovery for active individuals.",
        availability: "Available this weekend",
        verified: true,
        responseTime: "Usually responds within 1 hour",
      },
    ]

    setTimeout(() => {
      setTherapists(mockTherapists)
      setFilteredTherapists(mockTherapists)
      setLoading(false)
    }, 1000)
  }, [])

  // Filter and sort therapists (logic unchanged)
  useEffect(() => {
    const filtered = therapists.filter((therapist) => {
      const matchesSearch =
        therapist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        therapist.specialties.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesSpecialty =
        selectedSpecialty === "all" ||
        therapist.specialties.some((s) => s.toLowerCase() === selectedSpecialty.toLowerCase())

      const matchesPrice = therapist.hourlyRate >= priceRange[0] && therapist.hourlyRate <= priceRange[1]

      return matchesSearch && matchesSpecialty && matchesPrice
    })

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating
        case "price-low":
          return a.hourlyRate - b.hourlyRate
        case "price-high":
          return b.hourlyRate - a.hourlyRate
        case "distance":
          return a.distance - b.distance
        case "experience":
          return b.experience - a.experience
        default:
          return 0
      }
    })

    setFilteredTherapists(filtered)
  }, [therapists, searchQuery, selectedSpecialty, priceRange, sortBy])

  const toggleFavorite = (therapistId: string) => {
    setFavorites((prev) =>
      prev.includes(therapistId) ? prev.filter((id) => id !== therapistId) : [...prev, therapistId],
    )
  }

  const specialties = [
    "Swedish Therapeutic",
    "Shiatsu",
    "Swedish Aromatherapy",
    "Office Syndrome Therapy",
    "Deep Tissue",
    "Hot Stone",
    "Sports Massage",
    "Prenatal",
    "Reflexology",
    "Reiki",
  ]

  if (loading) {
    return (
      // Updated loading screen background
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50 flex items-center justify-center">
        <div className="animate-pulse space-y-6 w-full max-w-6xl">
          <div className="h-8 bg-stone-200 rounded w-1/4"></div>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-stone-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    // Updated main background
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50 text-stone-700">
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4 text-stone-800">Find Your Perfect Therapist</h1>
          <p className="text-stone-600 text-lg">
            Browse our network of verified wellness professionals
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 w-4 h-4" />
              <Input
                placeholder="Search therapists or specialties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger>
                <SelectValue placeholder="All Specialties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Specialties</SelectItem>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty.toLowerCase()}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="distance">Nearest First</SelectItem>
                <SelectItem value="experience">Most Experienced</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
              <Filter className="w-4 h-4" />
              <span>More Filters</span>
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {/* Updated currency and range */}
              Price Range: ₹{priceRange[0]} - ₹{priceRange[1]} per hour
            </label>
            {/* Updated slider values */}
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              max={10000}
              min={3000}
              step={100}
              className="w-full"
            />
          </div>
        </div>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-stone-600">
            Showing {filteredTherapists.length} of {therapists.length} therapists
          </p>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-stone-600">View:</span>
            <Button variant="outline" size="sm">
              Grid
            </Button>
            <Button variant="ghost" size="sm">
              List
            </Button>
          </div>
        </div>

        {/* Therapists Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredTherapists.map((therapist) => (
            <Card key={therapist.id} className="hover:shadow-lg transition-all duration-300 group bg-white">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={therapist.avatar || "/placeholder.svg"} alt={therapist.name} />
                      <AvatarFallback>
                        {therapist.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg text-stone-800">{therapist.name}</h3>
                      <div className="flex items-center space-x-1 mb-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="font-medium">{therapist.rating}</span>
                        <span className="text-stone-500 text-sm">({therapist.reviewCount})</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-3 h-3 text-stone-400" />
                        <span className="text-sm text-stone-600">
                          {therapist.distance}km • {therapist.location}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleFavorite(therapist.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Heart
                      className={`w-4 h-4 ${favorites.includes(therapist.id) ? "fill-red-500 text-red-500" : "text-stone-400"}`}
                    />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-1">
                  {therapist.specialties.slice(0, 3).map((specialty) => (
                    <Badge
                      key={specialty}
                      variant="secondary"
                      className="text-xs bg-emerald-100 text-emerald-800" // Themed badge
                    >
                      {specialty}
                    </Badge>
                  ))}
                  {therapist.specialties.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{therapist.specialties.length - 3} more
                    </Badge>
                  )}
                </div>

                <p className="text-sm text-stone-600 line-clamp-2">{therapist.bio}</p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-stone-500">Experience:</span>
                    <span className="font-medium ml-1">{therapist.experience} years</span>
                  </div>
                  <div>
                    <span className="text-stone-500">Rate:</span>
                    {/* Updated currency */}
                    <span className="font-medium ml-1">₹{therapist.hourlyRate}/hr</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-teal-600" />
                  <span className="text-sm text-teal-700 font-medium">{therapist.availability}</span>
                </div>

                <p className="text-xs text-stone-500">{therapist.responseTime}</p>

                <div className="flex space-x-2 pt-2">
                  <Link href={`/therapists/${therapist.id}`} className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full bg-transparent text-teal-700 border-teal-700 hover:bg-teal-700 hover:text-white" // Themed outline button
                    >
                      View Profile
                    </Button>
                  </Link>
                  <Link href={`/book?therapist=${therapist.id}`} className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700">
                      <Calendar className="w-4 h-4 mr-2" />
                      Book Now
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTherapists.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-stone-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-stone-800">No therapists found</h3>
            <p className="text-stone-600 mb-4">Try adjusting your filters or search terms</p>
            <Button
              onClick={() => {
                setSearchQuery("")
                setSelectedSpecialty("all")
                setPriceRange([3000, 10000]) // Reset to INR default
              }}
              className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700"
            >
              Clear Filters
            </Button>
          </div>
        )}

        {filteredTherapists.length > 0 && (
          <div className="text-center">
            <Button
              variant="outline"
              size="lg"
              className="bg-transparent text-teal-700 border-teal-700 hover:bg-teal-700 hover:text-white"
            >
              Load More Therapists
            </Button>
          </div>
        )}
      </div>

      {/* CTA Section - Themed to match homepage */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-stone-800">Are You a Wellness Professional?</h2>
          <p className="text-xl mb-8 text-stone-600">
            Join our platform and connect with clients who need your expertise
          </p>
          <Link href="/therapists/apply">
            <Button
              size="lg"
              className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700"
            >
              Apply as Therapist
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}