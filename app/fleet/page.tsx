import { Metadata } from "next";
import FleetClient from "./fleet-client";

export const metadata: Metadata = {
  title: "Our Elite Fleet",
  description: "Browse the Luna Limo collection. Featuring luxury sedans, premium electric vehicles, and executive transport SUVs for every occasion.",
  keywords: ["Luna Limoz", "Luna Limo", "Luxury Fleet", "Mercedes S-Class Seattle", "Cadillac Escalade Limo", "Tesla Limo Service"],
};

export default function Page() {
  return <FleetClient />;
}
