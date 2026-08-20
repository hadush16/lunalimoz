import { Metadata } from "next";
import BookingClient from "./booking-client";

export const metadata: Metadata = {
  title: "Book Your Journey",
  description: "Secure and real-time luxury transportation booking. Calculate your fare, choose your vehicle class, and reserve your professional chauffeur in Seattle.",
  keywords: ["Luna Limoz", "Luna Limo", "Book Limo Online", "Seattle Chauffeur Booking", "Airport Taxi Seattle Reservation", "Executive Car Booking"],
};

import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingClient />
    </Suspense>
  );
}
