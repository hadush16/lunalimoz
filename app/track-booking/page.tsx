import { Metadata } from "next";
import TrackClient from "./track-client";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Track Reservation & Payment",
  description: "Track your Luna Limo luxury car service reservation status and complete payment upon admin approval.",
};

export default function TrackBookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-gold" />
      </div>
    }>
      <TrackClient />
    </Suspense>
  );
}
