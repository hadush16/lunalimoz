import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Luna Limo | Get in Touch for Luxury Transportation",
  description: "Contact Luna Limo for luxury transportation inquiries. Call +1-206-327-4411 or book online for Seattle's premier chauffeur service.",
  alternates: {
    canonical: "https://lunalimoz.com/contact"
  }
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
