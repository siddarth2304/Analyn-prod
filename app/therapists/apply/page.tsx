"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, CheckCircle, FileText, Award, MapPin } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function TherapistApplication() {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null) // To show errors
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",

    // Professional Information
    bio: "",
    experienceYears: "",
    hourlyRate: "",
    serviceRadius: "10",

    // Agreements
    termsAccepted: false,
    backgroundCheckConsent: false,
  })
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([])
  const router = useRouter()

  const specialtyOptions = [
    "Swedish Massage",
    "Deep Tissue Massage",
    "Hot Stone Massage",
    "Aromatherapy Massage",
    "Sports Massage",
    "Prenatal Massage",
    "Reflexology",
    "Reiki Healing",
    "Thai Massage",
    "Shiatsu Massage",
  ]

  const handleSpecialtyToggle = (specialty: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(specialty) ? prev.filter((s) => s !== specialty) : [...prev, specialty],
    )
  }

  // --- THIS IS THE UPDATED FUNCTION ---
  const handleSubmit = async () => {
    setIsLoading(true)
    setFormError(null) // Clear any old errors

    // 1. Prepare all the data to send
    const applicationData = {
      ...formData,
      specialties: selectedSpecialties, // Add the selected specialties array
    }

    try {
      // 2. Send the data to our new API route
      const response = await fetch("/api/therapists/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(applicationData),
      })

      if (!response.ok) {
        // Handle errors from the server (like "email already exists")
        const errorData = await response.json()
        throw new Error(errorData.error || "Submission failed")
      }

      // 3. If successful, redirect
      setIsLoading(false)
      // Redirect to a "success" page or back to the therapist list
      router.push("/therapists")
      
    } catch (error: any) {
      console.error("Failed to submit application:", error)
      setIsLoading(false)
      // Show the error message to the user
      setFormError(error.message)
    }
  }

  const nextStep = () => {
    // Updated to 3 steps
    if (step < 3) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50 text-stone-700">
      {/* Header removed, main navbar from layout will be used */}

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Progress Steps - Updated to 3 steps */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepNum ? "bg-teal-600 text-white" : "bg-stone-200 text-stone-600"
                  }`}
                >
                  {step > stepNum ? <CheckCircle className="w-5 h-5" /> : stepNum}
                </div>
                {stepNum < 3 && (
                  <div
                    className={`w-20 h-1 mx-2 ${
                      step > stepNum ? "bg-teal-600" : "bg-stone-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 text-stone-800">Join ANALYN as a Therapist</h1>
            <p className="text-stone-600">Complete your application to start offering wellness services</p>
          </div>

          {/* Step 1: Personal Information */}
          {step === 1 && (
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                    <span className="text-teal-600 font-bold text-sm">1</span>
                  </div>
                  <span className="text-stone-800">Personal Information</span>
                </CardTitle>
                <CardDescription>Tell us about yourself</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Full Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Street address, city, postal code"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country *</Label>
                    <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="IN">India</SelectItem>
                        <SelectItem value="PH">Philippines</SelectItem>
                        <SelectItem value="US">United States</SelectItem>
                        <SelectItem value="CA">Canada</SelectItem>
                        <SelectItem value="AU">Australia</SelectItem>
                        <SelectItem value="UK">United Kingdom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  onClick={nextStep}
                  className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700"
                >
                  Continue to Professional Information
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Professional Information */}
          {step === 2 && (
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                    <Award className="w-4 h-4 text-teal-600" />
                  </div>
                  <span className="text-stone-800">Professional Information</span>
                </CardTitle>
                <CardDescription>Share your expertise and experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="bio">Professional Bio *</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Tell clients about your background, training, and approach to wellness..."
                    rows={4}
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="experienceYears">Years of Experience *</Label>
                    <Select
                      value={formData.experienceYears}
                      onValueChange={(value) => setFormData({ ...formData, experienceYears: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 year</SelectItem>
                        <SelectItem value="2">2 years</SelectItem>
                        <SelectItem value="3">3 years</SelectItem>
                        <SelectItem value="4">4 years</SelectItem>
                        <SelectItem value="5">5+ years</SelectItem>
                        <SelectItem value="10">10+ years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="hourlyRate">Hourly Rate (INR) *</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      value={formData.hourlyRate}
                      onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                      placeholder="e.g., 3000"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>Service Specialties *</Label>
                  <p className="text-sm text-stone-600 mb-3">Select all services you're qualified to provide</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {specialtyOptions.map((specialty) => (
                      <div key={specialty} className="flex items-center space-x-2">
                        <Checkbox
                          id={specialty}
                          checked={selectedSpecialties.includes(specialty)}
                          onCheckedChange={() => handleSpecialtyToggle(specialty)}
                        />
                        <Label htmlFor={specialty} className="text-sm">
                          {specialty}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {selectedSpecialties.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {selectedSpecialties.map((specialty) => (
                        <Badge key={specialty} variant="secondary" className="bg-emerald-100 text-emerald-800">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="serviceRadius">Service Radius (km) *</Label>
                  <Select
                    value={formData.serviceRadius}
                    onValueChange={(value) => setFormData({ ...formData, serviceRadius: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 km</SelectItem>
                      <SelectItem value="10">10 km</SelectItem>
                      <SelectItem value="15">15 km</SelectItem>
                      <SelectItem value="20">20 km</SelectItem>
                      <SelectItem value="25">25 km</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-stone-600 mt-1">How far are you willing to travel for appointments?</p>
                </div>

                <div className="flex space-x-4">
                  <Button variant="outline" onClick={prevStep} className="flex-1">
                    Back
                  </Button>
                  <Button
                    onClick={nextStep}
                    className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700"
                  >
                    Continue to Review
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Review & Submit (Was Step 4) */}
          {step === 3 && (
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-teal-600" />
                  </div>
                  <span className="text-stone-800">Review & Submit</span>
                </CardTitle>
                <CardDescription>Review your application before submitting</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 bg-stone-50 rounded-lg">
                    <h4 className="font-medium mb-2">Personal Information</h4>
                    <p className="text-sm text-stone-600">
                      {formData.firstName} {formData.lastName} • {formData.email} • {formData.phone}
                    </p>
                    <p className="text-sm text-stone-600">
                      {formData.address}, {formData.city}
                    </p>
                  </div>

                  <div className="p-4 bg-stone-50 rounded-lg">
                    <h4 className="font-medium mb-2">Professional Details</h4>
                    <p className="text-sm text-stone-600 mb-2">
                      {formData.experienceYears} years experience • ₹{formData.hourlyRate}/hour
                    </p>
                    <p className="text-sm text-stone-600 mb-2">Service radius: {formData.serviceRadius} km</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedSpecialties.map((specialty) => (
                        <Badge key={specialty} variant="secondary" className="text-xs bg-emerald-100 text-emerald-800">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formData.termsAccepted}
                      onCheckedChange={(checked) => setFormData({ ...formData, termsAccepted: checked as boolean })}
                    />
                    <Label htmlFor="terms" className="text-sm">
                      I agree to the{" "}
                      <Link href="/terms" className="text-teal-600 hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-teal-600 hover:underline">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="background"
                      checked={formData.backgroundCheckConsent}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, backgroundCheckConsent: checked as boolean })
                      }
                    />
                    <Label htmlFor="background" className="text-sm">
                      I consent to a background check as part of the verification process
                    </Label>
                  </div>
                </div>

                {/* Show error message here if submission fails */}
                {formError && (
                  <Alert variant="destructive">
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                )}

                <Alert className="bg-teal-50 border-teal-200">
                  <CheckCircle className="h-4 w-4 text-teal-700" />
                  <AlertDescription className="text-teal-800">
                    <strong>What happens next?</strong>
                    <br />
                    After submission, our team will review your application. You'll receive an email within 2-3
                    business days with the status of your application.
                  </AlertDescription>
                </Alert>

                <div className="flex space-x-4">
                  <Button variant="outline" onClick={prevStep} className="flex-1">
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    className="flex-1 bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700"
                    disabled={!formData.termsAccepted || !formData.backgroundCheckConsent || isLoading}
                  >
                    {isLoading ? "Submitting Application..." : "Submit Application"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}