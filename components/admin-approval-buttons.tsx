// File: components/admin-approval-buttons.tsx

"use client";

import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useState } from "react"; // Import useState for loading state

export function AdminApprovalButtons({ therapistId }: { therapistId: number }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  // Approve a therapist
  async function approve() {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/therapists/${therapistId}/approve`, {
        method: "POST",
        credentials: "same-origin", // Fixes the 403 error
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Approve failed");
      }
      toast.success("Therapist approved!"); // <-- SUCCESS MESSAGE
      router.refresh(); // This reloads the Server Component data
    } catch (e: any) {
      toast.error(e?.message || "Approve failed"); // <-- ERROR MESSAGE
    } finally {
      setIsLoading(false);
    }
  }

  // Reject a therapist
  async function reject() {
    if (!window.confirm("Are you sure? This will permanently delete the user and their application.")) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/therapists/${therapistId}/reject`, {
        method: "POST",
        credentials: "same-origin", // Fixes the 403 error
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Reject failed");
      }
      toast.success("Therapist rejected and deleted."); // <-- SUCCESS MESSAGE
      router.refresh(); // This reloads the Server Component data
    } catch (e: any) {
      toast.error(e?.message || "Reject failed"); // <-- ERROR MESSAGE
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex gap-2 w-full md:w-auto">
      <Button
        onClick={approve}
        disabled={isLoading} // Disable button while loading
        className="flex-1 md:flex-none bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700"
      >
        <Check className="w-4 h-4 mr-2" />
        {isLoading ? "Processing..." : "Approve"} {/* <-- LOADING MESSAGE */}
      </Button>
      <Button
        onClick={reject}
        disabled={isLoading} // Disable button while loading
        variant="destructive"
        className="flex-1 md:flex-none"
      >
        <X className="w-4 h-4 mr-2" />
        {isLoading ? "Processing..." : "Reject"} {/* <-- LOADING MESSAGE */}
      </Button>
    </div>
  );
}