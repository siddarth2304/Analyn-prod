"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";

export default function BookingsPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBookings = async () => {
    try {
      if (!user) return;

      // ✔️ Get Firebase ID token
      const idToken = await user.getIdToken();

      // ✔️ Send token in Authorization header
      const res = await fetch("/api/bookings", {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });

      if (!res.ok) {
        console.log(await res.json());
        throw new Error("Failed to load bookings");
      }

      const data = await res.json();
      setBookings(data.bookings || []);
    } catch (err) {
      console.error("BOOKING LOAD ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [user]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading bookings...
      </div>
    );

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Bookings</h1>

      {bookings.length === 0 ? (
        <p className="text-stone-600">No bookings found.</p>
      ) : (
        <div className="space-y-4">
          {bookings.map((b: any) => (
            <div
              key={b.id}
              className="p-4 border rounded-lg shadow-sm bg-white"
            >
              <h2 className="font-semibold text-lg">{b.service_name}</h2>
              <p className="text-sm text-stone-600">
                Therapist: {b.therapist_first_name} {b.therapist_last_name}
              </p>
              <p className="text-sm text-stone-600">
                Date: {b.booking_date}
              </p>
              <p className="text-sm text-stone-600">
                Time: {b.start_time} - {b.end_time}
              </p>
              <p className="text-sm font-medium mt-2">
                Status:{" "}
                <span className="text-teal-600">{b.status}</span>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
