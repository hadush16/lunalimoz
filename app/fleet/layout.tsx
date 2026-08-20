import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Luxury Fleet | Premium Vehicles - Luna Limo Seattle",
  description: "Explore Luna Limo's premium fleet of luxury vehicles. From executive sedans to stretch limousines, find the perfect ride for your Seattle journey.",
  alternates: {
    canonical: "https://lunalimoz.com/fleet"
  }
};

export default function FleetLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
