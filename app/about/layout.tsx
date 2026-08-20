import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Luna Limo | Seattle's Trusted Luxury Chauffeur",
  description: "Learn about Luna Limo's commitment to excellence. Seattle's premier luxury chauffeur service with professional drivers and premium vehicles.",
  alternates: {
    canonical: "https://lunalimoz.com/about"
  }
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
