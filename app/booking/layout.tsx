import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Book Your Luxury Ride | Online Reservation - Luna Limo",
  description: "Book your luxury chauffeur service online with Luna Limo. Easy reservation for airport transfers, corporate travel, and special events in Seattle.",
  alternates: {
    canonical: "https://lunalimoz.com/booking"
  }
};

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
