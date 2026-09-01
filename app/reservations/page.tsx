"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  MapPin, 
  CreditCard, 
  ShieldCheck, 
  Smartphone,
  Phone,
  MessageSquare,
  ArrowRight
} from "lucide-react";

export default function ReservationsLandingPage() {
  const steps = [
    {
      title: "Select Your Journey",
      desc: "Choose from our elite fleet and specify your pickup and destination with absolute precision.",
      icon: <MapPin className="h-7 w-7 text-gold" />
    },
    {
      title: "Customize Experience",
      desc: "Tailor your transit with specific amenities, passenger counts, and luggage requirements.",
      icon: <Calendar className="h-7 w-7 text-gold" />
    },
    {
      title: "Instant Confirmation",
      desc: "Receive instant electronic confirmation and real-time concierge updates for your booking.",
      icon: <ShieldCheck className="h-7 w-7 text-gold" />
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden w-full transition-colors duration-200">
      <main>
        {/* Reservations Hero */}
        <section className="relative py-16 sm:py-24 px-4 sm:px-6 overflow-hidden bg-secondary/40 border-b border-border transition-colors">
          <div className="max-w-7xl mx-auto text-center relative z-20 space-y-4">
            <span className="text-gold text-[10px] font-black uppercase tracking-[0.4em]">Concierge Access</span>
            <h1 className="font-serif text-3xl sm:text-5xl md:text-7xl font-black italic uppercase text-foreground leading-tight tracking-tight">
              Bespoke <span className="text-gold">Reservations</span>
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
              Luna Limo offers a seamless reservation experience tailored for executive travelers and special occasions. Secured, swift, and transparent.
            </p>
          </div>
        </section>

        {/* Booking Methods */}
        <section className="py-16 sm:py-24 bg-background transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
               {/* Method 1: Instant Online */}
               <div className="bg-card border border-border p-8 sm:p-10 space-y-6 relative group shadow-sm">
                  <div className="space-y-3">
                     <Smartphone className="h-8 w-8 text-gold" />
                     <h2 className="font-serif text-2xl font-black italic uppercase text-foreground">Instant Online Booking</h2>
                     <p className="text-muted-foreground text-xs sm:text-sm font-medium leading-relaxed">
                        Calculate exact upfront fares and secure your luxury transit in under 60 seconds with our real-time availability engine.
                     </p>
                  </div>
                  <ul className="space-y-2.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                     <li className="flex items-center gap-2.5"><span className="w-1.5 h-1.5 bg-gold rounded-full" /> Real-time pricing &amp; route preview</li>
                     <li className="flex items-center gap-2.5"><span className="w-1.5 h-1.5 bg-gold rounded-full" /> Vehicle class selection</li>
                     <li className="flex items-center gap-2.5"><span className="w-1.5 h-1.5 bg-gold rounded-full" /> Instant email confirmations</li>
                  </ul>
                  <div className="pt-2">
                    <Link href="/booking">
                      <Button className="w-full bg-gold hover:bg-gold-dark text-primary-foreground rounded-none py-6 text-xs font-black uppercase tracking-[0.2em] shadow-md flex items-center justify-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Start Online Booking
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
               </div>

               {/* Method 2: Concierge Line */}
               <div className="bg-card border border-border p-8 sm:p-10 space-y-6 relative group shadow-sm">
                  <div className="space-y-3">
                     <Phone className="h-8 w-8 text-gold" />
                     <h2 className="font-serif text-2xl font-black italic uppercase text-foreground">Direct Concierge Line</h2>
                     <p className="text-muted-foreground text-xs sm:text-sm font-medium leading-relaxed">
                        For complex multi-vehicle itineraries, VIP arrangements, or last-minute airport transfers, speak directly with our Seattle dispatch team.
                     </p>
                  </div>
                  <ul className="space-y-2.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                     <li className="flex items-center gap-2.5"><span className="w-1.5 h-1.5 bg-foreground rounded-full" /> 24/7 Seattle dispatch team</li>
                     <li className="flex items-center gap-2.5"><span className="w-1.5 h-1.5 bg-foreground rounded-full" /> Large event &amp; wedding logistics</li>
                     <li className="flex items-center gap-2.5"><span className="w-1.5 h-1.5 bg-foreground rounded-full" /> Customized billing solutions</li>
                  </ul>
                  <div className="pt-2">
                    <Link href="tel:+12063274411">
                      <Button variant="outline" className="w-full border-border text-foreground hover:bg-secondary rounded-none py-6 text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                        <Phone className="h-4 w-4" />
                        Call (206) 327-4411
                      </Button>
                    </Link>
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* The Process */}
        <section className="py-16 sm:py-24 bg-secondary/30 border-t border-border transition-colors">
           <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="text-center mb-12 sm:mb-16 space-y-3">
                 <span className="text-gold text-[10px] font-black uppercase tracking-[0.4em]">The Luna Protocol</span>
                 <h2 className="font-serif text-2xl sm:text-4xl font-black italic uppercase text-foreground">Booking Simplified</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                 {steps.map((step, i) => (
                   <div key={i} className="bg-card border border-border p-8 text-center space-y-4 shadow-sm">
                      <div className="inline-flex items-center justify-center w-14 h-14 bg-gold/10 border border-gold/30 rounded-full mx-auto">
                        {step.icon}
                      </div>
                      <h3 className="font-serif text-lg font-black italic uppercase text-foreground">{step.title}</h3>
                      <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                        {step.desc}
                      </p>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* Trust Factors */}
        <section className="py-16 sm:py-24 bg-background border-t border-border transition-colors">
           <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {[
                { title: "No Hidden Fees", desc: "Transparent upfront pricing with zero surprises.", icon: <CreditCard className="h-5 w-5 text-gold" /> },
                { title: "Secured Data", desc: "256-bit SSL encrypted reservation data.", icon: <ShieldCheck className="h-5 w-5 text-gold" /> },
                { title: "Instant Alerts", desc: "SMS and Email driver status notifications.", icon: <Smartphone className="h-5 w-5 text-gold" /> },
                { title: "24/7 Support", desc: "Always available for route and time adjustments.", icon: <MessageSquare className="h-5 w-5 text-gold" /> },
              ].map((item, i) => (
                <div key={i} className="space-y-2 p-4">
                   <div className="mx-auto flex items-center justify-center w-10 h-10 bg-gold/10 border border-gold/30 rounded-full">
                    {item.icon}
                   </div>
                   <h4 className="font-serif text-base font-black italic uppercase text-foreground">{item.title}</h4>
                   <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
           </div>
        </section>
      </main>
    </div>
  );
}
