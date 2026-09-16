import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | Luna Limo Seattle",
  description: "Terms and conditions of service for Luna Limo luxury chauffeur reservations in Seattle and Washington State.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-200 pt-28 pb-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl space-y-8">
        <header className="space-y-4 text-center">
          <span className="text-gold text-[11px] font-black tracking-[0.3em] uppercase bg-gold/10 px-4 py-1.5 rounded-full border border-gold/30 inline-block">
            Legal Terms
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-black italic tracking-tight text-foreground uppercase">
            Terms of <span className="text-gold">Service</span>
          </h1>
          <p className="text-muted-foreground text-xs uppercase tracking-widest">
            Last Updated: January 2026
          </p>
        </header>

        <div className="bg-card border border-border p-6 sm:p-10 space-y-6 text-sm text-muted-foreground leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-serif text-xl font-bold text-foreground">1. Agreement to Terms</h2>
            <p>
              By accessing our website or placing a reservation with Luna Limo, you agree to be bound by these Terms of Service, our <Link href="/cancellation-policy" className="text-gold underline">Cancellation & No-Show Policy</Link>, and all applicable laws and regulations.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-xl font-bold text-foreground">2. Reservations and Payment</h2>
            <p>
              All reservations require valid payment authorization. For advance bookings, authorization holds or off-session payment credentials will be collected to secure vehicle availability. All rates, surcharges, and gratuity are calculated pursuant to our active rate cards.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-xl font-bold text-foreground">3. Vehicle Conduct & Safety</h2>
            <p>
              Smoking, vaping, and illegal substances are strictly prohibited in all fleet vehicles. Passengers are responsible for any vehicle damage or excessive cleaning requirements caused during the trip.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-xl font-bold text-foreground">4. Governing Law</h2>
            <p>
              These terms are governed by and construed in accordance with the laws of the State of Washington and King County.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
