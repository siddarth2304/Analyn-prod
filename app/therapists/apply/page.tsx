"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, CheckCircle, Award } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function TherapistApplication() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const router = useRouter();

  // FORM DATA
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",

    bio: "",
    experienceYears: "",
    hourlyRate: "",
    serviceRadius: "10",

    termsAccepted: false,
    backgroundCheckConsent: false,
  });

  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);

  // REAL-TIME ERROR STATE
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    bio: "",
    experienceYears: "",
    hourlyRate: "",
  });

  // VALIDATION RULES
  const validateField = (name: string, value: string) => {
    let error = "";

    switch (name) {
      case "firstName":
      case "lastName":
      case "city":
        if (!/^[A-Za-z\s]+$/.test(value)) error = "Only letters allowed";
        break;

      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          error = "Invalid email format";
        break;

      case "phone":
        if (!/^[0-9]{0,15}$/.test(value)) error = "Only digits allowed";
        break;

      case "bio":
        if (value.length < 10) error = "Bio must be at least 10 characters";
        break;

      case "experienceYears":
        if (isNaN(Number(value))) error = "Must be a valid number";
        break;

      case "hourlyRate":
        if (isNaN(Number(value))) error = "Must be a valid amount";
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

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
  ];

  const handleSpecialtyToggle = (specialty: string) => {
    setSelectedSpecialties((prev) =>
      prev.includes(specialty) ? prev.filter((s) => s !== specialty) : [...prev, specialty]
    );
  };

  // SUBMIT HANDLER
  const handleSubmit = async () => {
    setIsLoading(true);
    setFormError(null);

    const dataToSend = { ...formData, specialties: selectedSpecialties };

    try {
      const response = await fetch("/api/therapists/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Submission failed");
      }

      setIsLoading(false);
      router.push("/therapists");
    } catch (error: any) {
      setFormError(error.message);
      setIsLoading(false);
    }
  };

  const nextStep = () => setStep(step < 3 ? step + 1 : step);
  const prevStep = () => setStep(step > 1 ? step - 1 : step);

  const submitDisabled =
    isLoading ||
    !formData.termsAccepted ||
    !formData.backgroundCheckConsent ||
    Object.values(errors).some((e) => e !== "");

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50 text-stone-700">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* PROGRESS */}
          <div className="flex items-center justify-center mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= s ? "bg-teal-600 text-white" : "bg-stone-200 text-stone-600"
                  }`}
                >
                  {step > s ? <CheckCircle className="w-5 h-5" /> : s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-20 h-1 mx-2 ${
                      step > s ? "bg-teal-600" : "bg-stone-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* PAGE TITLE */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2 text-stone-800">
              Join ANALYN as a Therapist
            </h1>
            <p className="text-stone-600">
              Complete your application to start offering wellness services
            </p>
          </div>

          {/* STEP 1 — PERSONAL INFO */}
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
                {/* FIRST + LAST NAME */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>First Name *</Label>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => {
                        const v = e.target.value;
                        validateField("firstName", v);
                        setFormData({ ...formData, firstName: v });
                      }}
                    />
                    {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName}</p>}
                  </div>

                  <div>
                    <Label>Last Name *</Label>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => {
                        const v = e.target.value;
                        validateField("lastName", v);
                        setFormData({ ...formData, lastName: v });
                      }}
                    />
                    {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName}</p>}
                  </div>
                </div>

                {/* EMAIL + PHONE */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => {
                        const v = e.target.value;
                        validateField("email", v);
                        setFormData({ ...formData, email: v });
                      }}
                    />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                  </div>

                  <div>
                    <Label>Phone *</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => {
                        const v = e.target.value;
                        validateField("phone", v);
                        if (/^[0-9]*$/.test(v)) {
                          setFormData({ ...formData, phone: v });
                        }
                      }}
                      onKeyDown={(e) => {
                        if (
                          !/[0-9]/.test(e.key) &&
                          !["Backspace", "ArrowLeft", "ArrowRight", "Delete", "Tab"].includes(e.key)
                        ) {
                          e.preventDefault();
                        }
                      }}
                    />
                    {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
                  </div>
                </div>

                {/* ADDRESS */}
                <div>
                  <Label>Full Address *</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => {
                      setFormData({ ...formData, address: e.target.value });
                    }}
                  />
                </div>

                {/* CITY + COUNTRY */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>City *</Label>
                    <Input
                      value={formData.city}
                      onChange={(e) => {
                        const v = e.target.value;
                        validateField("city", v);
                        setFormData({ ...formData, city: v });
                      }}
                    />
                    {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
                  </div>

                  <div>
                    <Label>Country *</Label>
                    <Select
                      value={formData.country}
                      onValueChange={(value) => setFormData({ ...formData, country: value })}
                    >
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

                <Button className="w-full" onClick={nextStep}>
                  Continue
                </Button>
              </CardContent>
            </Card>
          )}

          {/* STEP 2 — PROFESSIONAL INFO */}
          {step === 2 && (
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-teal-600" />
                  <span>Professional Information</span>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* BIO */}
                <div>
                  <Label>Professional Bio *</Label>
                  <Textarea
                    rows={4}
                    value={formData.bio}
                    onChange={(e) => {
                      const v = e.target.value;
                      validateField("bio", v);
                      setFormData({ ...formData, bio: v });
                    }}
                  />
                  {errors.bio && <p className="text-red-500 text-sm">{errors.bio}</p>}
                </div>

                {/* EXPERIENCE + HOURLY RATE */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Years of Experience *</Label>
                    <Input
                      value={formData.experienceYears}
                      onChange={(e) => {
                        const v = e.target.value;
                        validateField("experienceYears", v);
                        if (/^[0-9]*$/.test(v)) setFormData({ ...formData, experienceYears: v });
                      }}
                    />
                    {errors.experienceYears && (
                      <p className="text-red-500 text-sm">{errors.experienceYears}</p>
                    )}
                  </div>

                  <div>
                    <Label>Hourly Rate (INR) *</Label>
                    <Input
                      value={formData.hourlyRate}
                      onChange={(e) => {
                        const v = e.target.value;
                        validateField("hourlyRate", v);
                        if (/^[0-9]*$/.test(v)) setFormData({ ...formData, hourlyRate: v });
                      }}
                    />
                    {errors.hourlyRate && (
                      <p className="text-red-500 text-sm">{errors.hourlyRate}</p>
                    )}
                  </div>
                </div>

                {/* SPECIALTIES */}
                <div>
                  <Label>Service Specialties *</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {specialtyOptions.map((spec) => (
                      <div key={spec} className="flex items-center space-x-2">
                        <Checkbox
                          checked={selectedSpecialties.includes(spec)}
                          onCheckedChange={() => handleSpecialtyToggle(spec)}
                        />
                        <span className="text-sm">{spec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SERVICE RADIUS */}
                <div>
                  <Label>Service Radius (km)</Label>
                  <Select
                    value={formData.serviceRadius}
                    onValueChange={(v) => setFormData({ ...formData, serviceRadius: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 km</SelectItem>
                      <SelectItem value="10">10 km</SelectItem>
                      <SelectItem value="15">15 km</SelectItem>
                      <SelectItem value="20">20 km</SelectItem>
                      <SelectItem value="25">25 km</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* NEXT/BACK */}
                <div className="flex space-x-4">
                  <Button variant="outline" className="flex-1" onClick={prevStep}>
                    Back
                  </Button>
                  <Button className="flex-1" onClick={nextStep}>
                    Continue
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* STEP 3 — REVIEW + SUBMIT */}
          {step === 3 && (
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-teal-600" />
                  <span>Review & Submit</span>
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* PERSONA + PROFESSIONAL INFO Summary */}
                <div className="p-4 bg-stone-50 rounded-lg">
                  <h4 className="font-medium mb-2">Personal Info</h4>
                  <p>{formData.firstName} {formData.lastName}</p>
                  <p>{formData.email}</p>
                  <p>{formData.phone}</p>
                  <p>{formData.address}, {formData.city}</p>
                </div>

                <div className="p-4 bg-stone-50 rounded-lg">
                  <h4 className="font-medium mb-2">Professional Details</h4>
                  <p>{formData.experienceYears} years • ₹{formData.hourlyRate}/hr</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedSpecialties.map((s) => (
                      <Badge key={s} variant="secondary">{s}</Badge>
                    ))}
                  </div>
                </div>

                {/* TERMS */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.termsAccepted}
                      onCheckedChange={(c) => setFormData({ ...formData, termsAccepted: c as boolean })}
                    />
                    <Label>I agree to the Terms & Privacy Policy</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.backgroundCheckConsent}
                      onCheckedChange={(c) =>
                        setFormData({ ...formData, backgroundCheckConsent: c as boolean })
                      }
                    />
                    <Label>I consent to background verification</Label>
                  </div>
                </div>

                {/* SERVER SIDE ERRORS */}
                {formError && (
                  <Alert variant="destructive">
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                )}

                {/* SUBMIT BUTTON */}
                <Button
                  className="w-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white"
                  disabled={submitDisabled}
                  onClick={handleSubmit}
                >
                  {isLoading ? "Submitting..." : "Submit Application"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
