import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Services | Luxury Transportation Options - Luna Limo Seattle",
  description: "Discover Luna Limo's comprehensive luxury transportation services. Airport transfers, executive chauffeur, wedding limos, and city tours in Seattle.",
  alternates: {
    canonical: "https://lunalimoz.com/services"
  }
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
