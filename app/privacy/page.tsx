import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Luna Limo Seattle",
  description: "Privacy and data protection policy for Luna Limo clients and passengers.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-200 pt-28 pb-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl space-y-8">
        <header className="space-y-4 text-center">
          <span className="text-gold text-[11px] font-black tracking-[0.3em] uppercase bg-gold/10 px-4 py-1.5 rounded-full border border-gold/30 inline-block">
            Data & Privacy
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-black italic tracking-tight text-foreground uppercase">
            Privacy <span className="text-gold">Policy</span>
          </h1>
          <p className="text-muted-foreground text-xs uppercase tracking-widest">
            Last Updated: January 2026
          </p>
        </header>

        <div className="bg-card border border-border p-6 sm:p-10 space-y-6 text-sm text-muted-foreground leading-relaxed">
          <section className="space-y-2">
            <h2 className="font-serif text-xl font-bold text-foreground">1. Information We Collect</h2>
            <p>
              We collect passenger contact details, pickup/dropoff addresses, and flight information strictly for itinerary fulfillment, route navigation, and customer communications. Payment information is securely processed via Stripe Elements (PCI SAQ-A compliant) and never stored on our application servers.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-xl font-bold text-foreground">2. Use of Information</h2>
            <p>
              Your data is utilized solely for dispatching chauffeurs, processing transactions, transmitting trip confirmations, and dispatch status alerts. We never sell or distribute passenger data to third parties.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-serif text-xl font-bold text-foreground">3. Security</h2>
            <p>
              We employ strict industry-standard encryption, SSL protocols, and access controls to safeguard your personal information.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
