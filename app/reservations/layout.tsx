import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reservations | Manage Your Booking - Luna Limo Seattle",
  description: "View and manage your Luna Limo reservations. Track your booking status, view ride details, and contact our concierge team for changes.",
  alternates: {
    canonical: "https://lunalimoz.com/reservations"
  }
};

export default function ReservationsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
