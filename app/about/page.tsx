import { Metadata } from "next";
import AboutClient from "./about-client";

export const metadata: Metadata = {
  title: "About Luna Limo | Professional Excellence Since 2023",
  description: "Learn about the history and mission of Luna Limo. Established in 2023, we provide elite luxury transport and concierge services in Seattle and beyond.",
  keywords: ["Luna Limo History", "Seattle Luxury Transport", "Professional Chauffeur Service", "Luxury Car Rental Seattle"],
};

export default function Page() {
  return <AboutClient />;
}
