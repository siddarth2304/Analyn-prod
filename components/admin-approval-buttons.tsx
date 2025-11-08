// File: components/admin-approval-buttons.tsx

"use client";

import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation"; // Import useRouter

export function AdminApprovalButtons({ therapistId }: { therapistId: number }) {
  const router = useRouter(); // Get the router

  // We still need the token for API security, so we get it from local storage
  function getToken() {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("analyn:token") || "";
  }

  // Approve a therapist
  async function approve() {
    try {
      const res = await fetch(`/api/admin/therapists/${therapistId}/approve`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` }, 
      });
      if (!res.ok) throw new Error("Approve failed");
      toast.success("Therapist approved!");
      router.refresh(); // This reloads the Server Component data
    } catch (e: any) {
      toast.error(e?.message || "Approve failed");
    }
  }

  // Reject a therapist
  async function reject() {
    if (!window.confirm("Are you sure? This will permanently delete the user and their application.")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/therapists/${therapistId}/reject`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("Reject failed");
      toast.success("Therapist rejected and deleted.");
      router.refresh(); // This reloads the Server Component data
    } catch (e: any) {
      toast.error(e?.message || "Reject failed");
    }
  }

  return (
    <div className="flex gap-2 w-full md:w-auto">
      <Button
        onClick={approve}
        className="flex-1 md:flex-none bg-gradient-to-r from-teal-600 to-emerald-600 text-white hover:from-teal-700 hover:to-emerald-700"
      >
        <Check className="w-4 h-4 mr-2" />
        Approve
      </Button>
      <Button onClick={reject} variant="destructive" className="flex-1 md:flex-none">
        <X className="w-4 h-4 mr-2" />
        Reject
      </Button>
    </div>
  );
}