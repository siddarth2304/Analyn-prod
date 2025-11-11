"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MapPin, Clock, Shield, Heart, ArrowRight, Search, Calendar, Globe, Leaf, LocateFixed, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import toast from "react-hot-toast"

// OpenCage Geocoding API Key (Loaded from .env.local or Vercel Environment)
const OPENCAGE_API_KEY = process.env.NEXT_PUBLIC_OPENCAGE_API_KEY;

export default function HomePage() {
  const [searchLocation, setSearchLocation] = useState("")
  const [locationStatus, setLocationStatus] = useState("Enter your location...")
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  // --- Geocoding Function (Address to Coordinates) ---
  const handleGeocodeSearch = useCallback(async (query: string) => {
    setSuggestions([]);
    if (!query || query.length < 3) return;
    
    if (!OPENCAGE_API_KEY) {
        console.error("OpenCage API key is missing.");
        return;
    }

    try {
        const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${OPENCAGE_API_KEY}&limit=5`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            setSuggestions(data.results.map((r: any) => ({
                formatted: r.formatted,
                lat: r.geometry.lat,
                lng: r.geometry.lng,
            })));
        } else {
            setSuggestions([]);
        }
    } catch (error) {
        console.error("Geocoding fetch error:", error);
        toast.error("Error fetching location suggestions.");
    }
  }, []);

  // --- NEW: Reverse Geocoding Helper Function ---
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
      if (!OPENCAGE_API_KEY) {
          return "Coordinates determined";
      }
      try {
          const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${OPENCAGE_API_KEY}&pretty=1`;
          const response = await fetch(url);
          const data = await response.json();

          if (data.results && data.results.length > 0) {
              // Return the best, most general formatted address (e.g., city/state)
              return data.results[0].formatted || `Location near ${lat.toFixed(2)}, ${lng.toFixed(2)}`;
          }
          return `Location near ${lat.toFixed(2)}, ${lng.toFixed(2)}`;
      } catch (error) {
          console.error("Reverse Geocoding error:", error);
          return `Location near ${lat.toFixed(2)}, ${lng.toFixed(2)}`;
      }
  };

  // --- Select Location from Suggestions ---
  const handleSelectLocation = (suggestion: any) => {
    setSearchLocation(suggestion.formatted);
    setLocationStatus(suggestion.formatted);
    setCoords({ lat: suggestion.lat, lng: suggestion.lng });
    setSuggestions([]); // Clear suggestions after selection
    toast.success("Location set: " + suggestion.formatted.split(',')[0]);
  }

  // --- UPDATED: Geolocation Function (Browser Pin + Reverse Geocoding) ---
  const handleLocateUser = () => {
    setLocationStatus("Locating...")
    setSuggestions([]);

    if (!navigator.geolocation) {
      setLocationStatus("Geolocation not supported by this browser.")
      toast.error("Geolocation not supported.")
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => { // Made function async
        const { latitude, longitude } = position.coords
        
        // 1. Store Coordinates
        setCoords({ lat: latitude, lng: longitude }) 
        
        // 2. Perform Reverse Geocoding
        const locationName = await reverseGeocode(latitude, longitude);

        // 3. Update UI with friendly name
        setLocationStatus(`Current location set!`)
        setSearchLocation(locationName);
        toast.success(`Location set to ${locationName.split(',')[0]}!`)
      },
      (error) => {
        setLocationStatus("Could not determine your location.")
        setCoords(null)
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    )
  }

  // --- MOCK DATA (REMAINS THE SAME) ---
  const services = [
    { id: 1, name: "Swedish Therapeutic", description: "Deep massage using signature balm and Swedish movements to release tight muscle groups", price: 1399, duration: 60, image: "/relaxing-swedish-massage.png", benefits: ["Stress Relief", "Chronic Pain", "Hard Massage"], popular: true, },
    { id: 2, name: "Shiatsu", description: "A manipulative therapy developed in Japan incorporating techniques of anma, acupressure, stretching, and Western massage", price: 1299, duration: 60, image: "/deep-tissue-massage.png", benefits: ["Chronic Pain", "Joint Problems", "Headaches"], },
    { id: 3, name: "Swedish Aromatherapy", description: "Medium pressure massage using long gliding strokes with organic essential oil aromatherapy", price: 999, duration: 60, image: "/aromatherapy-massage-oils.png", benefits: ["Stress Relief", "Improve Mood", "Relaxation"], },
    { id: 4, name: "Office Syndrome Therapy", description: "An intense therapeutic session to treat repetitive postural stress using multiple advanced massage modalities", price: 2999, duration: 60, image: "/wellness-massage-therapy.png", benefits: ["Carpal Tunnel", "Migraine", "Posture"], },
  ]

  const features = [
    { icon: <Shield className="w-8 h-8 text-teal-600" />, title: "Verified Therapists", description: "All therapists are background-checked and certified professionals", },
    { icon: <Clock className="w-8 h-8 text-teal-600" />, title: "On-Demand Booking", description: "Book sessions instantly or schedule for later - available 24/7", },
    { icon: <MapPin className="w-8 h-8 text-teal-600" />, title: "At Your Location", description: "Services delivered to your home, office, or preferred location", },
    { icon: <Heart className="w-8 h-8 text-teal-600" />, title: "Personalized Care", description: "Customized treatments based on your specific needs and preferences", },
  ]

  const stats = [
    { number: "10K+", label: "Happy Clients" },
    { number: "500+", label: "Verified Therapists" },
    { number: "50+", label: "Cities Covered" },
    { number: "4.9", label: "Average Rating" },
  ]

  return ( // <-- The return statement that was likely broken
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50 text-stone-700">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              Wellness Services
              <br />
              Delivered to You
            </h1>
            <p className="text-xl text-stone-600 mb-8 max-w-2xl mx-auto">
              Book verified therapists for massage, wellness, and therapeutic services. Professional care delivered to
              your doorstep, anywhere in the world.
            </p>

            {/* Search Bar - UPDATED */}
            <div className="max-w-3xl mx-auto mb-8">
              <div className="flex flex-col sm:flex-row gap-4 p-2 bg-white rounded-2xl shadow-lg border">
                
                {/* Location Input Group */}
                <div className="flex-1 relative flex items-center">
                  <MapPin className="absolute left-4 text-stone-400 w-5 h-5 z-10" />
                  <Input
                    placeholder={locationStatus}
                    value={searchLocation}
                    onChange={(e) => {
                        setSearchLocation(e.target.value)
                        setLocationStatus(e.target.value || "Enter your location...")
                        setCoords(null);
                        handleGeocodeSearch(e.target.value); // Trigger API search
                    }}
                    className="pl-12 pr-24 border-0 focus:ring-0 text-lg h-14 font-medium"
                  />
                  
                  {/* Clear/LocateFixed Button */}
                  {searchLocation || coords ? (
                     <button 
                        onClick={() => {
                            setSearchLocation("");
                            setLocationStatus("Enter your location...");
                            setCoords(null);
                            setSuggestions([]);
                        }}
                        title="Clear location"
                        type="button"
                        className="absolute right-14 text-stone-500 hover:text-stone-700 transition z-10"
                    >
                        <X className="w-5 h-5" />
                    </button>
                  ) : null}

                  {/* Geolocation Button */}
                  <button 
                    onClick={handleLocateUser}
                    title="Use my current location"
                    type="button"
                    className="absolute right-4 text-teal-600 hover:text-emerald-700 transition z-10"
                  >
                    <LocateFixed className="w-6 h-6" />
                  </button>

                  {/* Suggestions Dropdown */}
                  {suggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-200 rounded-lg shadow-xl z-50 text-left">
                          {suggestions.map((suggestion, index) => (
                              <button
                                  key={index}
                                  onClick={() => handleSelectLocation(suggestion)}
                                  className="block w-full px-4 py-3 text-sm text-stone-700 hover:bg-teal-50 transition-colors border-b border-stone-100 last:border-b-0"
                              >
                                  {suggestion.formatted}
                              </button>
                          ))}
                      </div>
                  )}
                </div>
                
                <Link 
                    href={`/book${coords ? `?lat=${coords.lat}&lng=${coords.lng}` : searchLocation ? `?location=${encodeURIComponent(searchLocation)}` : ''}`}
                    onClick={(e) => {
                        if (!searchLocation && !coords) {
                            toast.error("Please enter or select a location first.");
                            e.preventDefault();
                        }
                    }}
                >
                  <Button
                    size="lg"
                    className="h-14 px-8 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700"
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
                  <div className="text-3xl font-bold text-teal-800 mb-1">{stat.number}</div>
                  <div className="text-stone-600">{stat.label}</div>
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
            <h2 className="text-4xl font-bold mb-4 text-stone-800">Popular Wellness Services</h2>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto">
              Choose from our most requested therapeutic and wellness services
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service) => (
              <Card
                key={service.id}
                className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden flex flex-col h-full bg-white"
              >
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
                  <h3 className="text-xl font-semibold mb-2 text-stone-800">{service.name}</h3>
                  <p className="text-stone-600 text-sm mb-4 line-clamp-2">{service.description}</p>

                  <div className="flex flex-wrap gap-1 mb-4">
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

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2 text-sm text-stone-600">
                      <Clock className="w-4 h-4" />
                      <span>{service.duration} min</span>
                    </div>
                    <div className="text-2xl font-bold text-teal-700">₹{service.price}</div>
                  </div>

                  <Link href={`/book?service=${service.id}`} className="mt-auto">
                    <Button className="w-full group-hover:bg-gradient-to-r group-hover:from-teal-600 group-hover:to-emerald-600 transition-all bg-stone-800 hover:bg-stone-900">
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
              <Button variant="outline" size="lg" className="bg-transparent text-teal-700 border-teal-700 hover:bg-teal-700 hover:text-white">
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
            <h2 className="text-4xl font-bold mb-4 text-stone-800">Why Choose ANALYN?</h2>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto">
              We're revolutionizing wellness services with technology, safety, and convenience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-8 border-0 shadow-lg hover:shadow-xl transition-shadow h-full bg-white">
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3 text-stone-800">{feature.title}</h3>
                <p className="text-stone-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-stone-800">How It Works</h2>
            <p className="text-xl text-stone-600">Simple steps to book your wellness session</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-teal-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-stone-800">1. Choose Service</h3>
              <p className="text-stone-600">Browse our services and select the perfect treatment for your needs</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-teal-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-stone-800">2. Book & Pay</h3>
              <p className="text-stone-600">Select your preferred time and therapist, then pay securely online</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-teal-600 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-stone-800">3. Relax & Enjoy</h3>
              <p className="text-stone-600">Your therapist arrives at your location ready to provide exceptional care</p>
            </div>
          </div>
        </div>
      </section>

      {/* Therapist CTA */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4 text-stone-800">Are You a Wellness Professional?</h2>
          <p className="text-xl mb-8 text-stone-600 max-w-2xl mx-auto">
            Join our global network of therapists and grow your practice with ANALYN's platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/therapists/apply">
              <Button
                size="lg"
                className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700"
              >
                Apply as Therapist
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/therapists">
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent text-teal-700 border-teal-700 hover:bg-teal-700 hover:text-white"
              >
                Browse Therapists
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-r from-teal-600 to-emerald-600 rounded-full flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">ANALYN</span>
              </div>
              <p className="text-stone-400 mb-4">
                Global wellness services delivered to your doorstep. Professional care, anywhere, anytime.
              </p>
              <div className="flex items-center space-x-2 text-sm text-stone-400">
                <Globe className="w-4 h-4" />
                <span>Available worldwide</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-white">Services</h4>
              <ul className="space-y-2 text-stone-400">
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
              <h4 className="font-semibold mb-4 text-white">Company</h4>
              <ul className="space-y-2 text-stone-400">
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
              <h4 className="font-semibold mb-4 text-white">Support</h4>
              <ul className="space-y-2 text-stone-400">
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

          <div className="border-t border-stone-800 mt-12 pt-8 text-center text-stone-400">
            <p>&copy; 2024 ANALYN. All rights reserved. Made with ❤️ for global wellness.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}