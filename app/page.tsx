import { Metadata } from "next";
import HomeClient from "./home-client";

export const metadata: Metadata = {
  title: "Luna Limo | Seattle's Premier Luxury Chauffeur & Black Car Service",
  description: "Experience Seattle's finest luxury chauffeur service. Professional airport transfers, executive transportation, and wedding limo rentals. Book your premium ride with Luna Limo today.",
  keywords: ["Luna Limo", "Seattle limo service", "luxury car service Seattle", "airport transfer Seattle", "black car service Seattle", "executive chauffeur Seattle", "Sea-Tac limo"],
  alternates: {
    canonical: "https://lunalimoz.com"
  }
};

export default function Page() {
  return <HomeClient />;
}
