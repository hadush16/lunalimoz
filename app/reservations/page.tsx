"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CreditCard, 
  ShieldCheck, 
  Smartphone,
  Phone,
  MessageSquare,
  ChevronRight,
  ArrowRight
} from "lucide-react";

export default function ReservationsLandingPage() {
  const steps = [
    {
      title: "Select Your Journey",
      desc: "Choose from our elite fleet and specify your pickup and destination with absolute precision.",
      icon: <MapPin className="h-8 w-8 text-gold" />
    },
    {
      title: "Customize Experience",
      desc: "Tailor your transit with specific amenities, passenger counts, and luggage requirements.",
      icon: <Calendar className="h-8 w-8 text-gold" />
    },
    {
      title: "Absolute Confirmation",
      desc: "Receive instant electronic confirmation and real-time concierge updates for your booking.",
      icon: <ShieldCheck className="h-8 w-8 text-gold" />
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden w-full">
      <main>
        {/* Reservations Hero */}
        <section className="relative py-16 sm:py-32 px-4 sm:px-6 overflow-hidden bg-black text-white border-b border-neutral-900">
          <div className="max-w-7xl mx-auto text-center relative z-20">
            <h3 className="text-gold text-[10px] font-black uppercase tracking-[0.5em] mb-4 sm:mb-6 animate-fade-in">Concierge Access</h3>
            <h2 className="font-serif text-2xl sm:text-4xl md:text-7xl font-black italic uppercase text-white leading-tight tracking-tight">
              Bespoke <span className="text-gold">Reservations</span>
              <br className="hidden md:block" />
              <span className="block sm:inline sm:ml-2">Tailored For You</span>
            </h2>
            <p className="text-xs sm:text-sm md:text-lg text-neutral-400 mt-6 sm:mt-8 max-w-2xl mx-auto font-medium leading-relaxed px-2 sm:px-0">
              Luna Limo offers a seamless, high-tech reservation experience designed for the modern elite traveler. Secured, swift, and sophisticated.
            </p>
          </div>
          
          {/* Subtle Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0 opacity-20">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold/5 rounded-full blur-[120px]" />
          </div>
        </section>

        {/* Booking Methods */}
        <section className="py-16 sm:py-24 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-12">
               {/* Method 1: Instant Online */}
               <div className="bg-neutral-900 border border-neutral-800 p-8 sm:p-12 space-y-6 sm:space-y-8 relative group overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-gold transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                  <div className="space-y-4">
                     <Smartphone className="h-8 sm:h-10 w-8 sm:w-10 text-gold" />
                     <h3 className="font-serif text-2xl sm:text-3xl font-black italic uppercase text-white">Instant Online Booking</h3>
                     <p className="text-neutral-400 text-sm font-medium uppercase tracking-widest leading-relaxed">
                        Secure your luxury transit in under 60 seconds with our real-time availability engine.
                     </p>
                  </div>
                  <ul className="space-y-4 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
                     <li className="flex items-center gap-3"><div className="w-1 h-1 bg-gold rounded-full" /> Real-time Pricing</li>
                     <li className="flex items-center gap-3"><div className="w-1 h-1 bg-gold rounded-full" /> Vehicle Preferences</li>
                     <li className="flex items-center gap-3"><div className="w-1 h-1 bg-gold rounded-full" /> Digital Receipts</li>
                  </ul>
                  <Link href="/booking">
                    <Button className="w-full bg-gold hover:bg-gold-dark text-white rounded-none py-8 text-[12px] font-black uppercase tracking-widest border-b-4 border-gold-dark shadow-gold/20 shadow-2xl transition-all flex items-center justify-center gap-3">
                      <Calendar className="h-5 w-5" />
                      Start Online Reservation
                    </Button>
                  </Link>
               </div>

               {/* Method 2: Concierge Line */}
               <div className="bg-neutral-900 border border-neutral-800 p-8 sm:p-12 space-y-6 sm:space-y-8 relative group overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-white transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                  <div className="space-y-4">
                     <Phone className="h-8 sm:h-10 w-8 sm:w-10 text-white" />
                     <h3 className="font-serif text-2xl sm:text-3xl font-black italic uppercase text-white">Direct Concierge Line</h3>
                     <p className="text-neutral-400 text-sm font-medium uppercase tracking-widest leading-relaxed">
                        For complex itineraries, multi-vehicle logistics, or personalized requests, speak with our elite team.
                     </p>
                  </div>
                  <ul className="space-y-4 text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">
                     <li className="flex items-center gap-3"><div className="w-1 h-1 bg-white rounded-full" /> 24/7 Human Response</li>
                     <li className="flex items-center gap-3"><div className="w-1 h-1 bg-white rounded-full" /> Large Event Logistics</li>
                     <li className="flex items-center gap-3"><div className="w-1 h-1 bg-white rounded-full" /> Special Requests</li>
                  </ul>
                  <Link href="tel:+12063274411">
                    <Button variant="outline" className="w-full border-white text-white hover:bg-white hover:text-black rounded-none py-8 text-[12px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3">
                      <Phone className="h-5 w-5" />
                      Call (206) 327-4411
                    </Button>
                  </Link>
               </div>
            </div>
          </div>
        </section>

        {/* The Process */}
        <section className="py-16 sm:py-24 bg-neutral-900 border-t border-neutral-800">
           <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="text-center mb-12 sm:mb-16">
                 <h3 className="text-gold text-[10px] font-black uppercase tracking-[0.4em] mb-4">The Luna Protocol</h3>
                 <h2 className="font-serif text-2xl sm:text-5xl font-black italic uppercase text-white">Booking Simplified</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-12">
                 {steps.map((step, i) => (
                   <div key={i} className="text-center space-y-6 relative">
                      {i < 2 && <div className="hidden lg:block absolute top-10 -right-6 w-12 h-[1px] bg-neutral-800" />}
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-black border border-neutral-800 rotate-45 group hover:bg-gold transition-all duration-500">
                        <div className="-rotate-45 text-gold group-hover:text-black transition-colors duration-500">
                          {step.icon}
                        </div>
                      </div>
                      <h4 className="font-serif text-xl font-black italic uppercase text-white pt-6">{step.title}</h4>
                      <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-[0.2em] leading-relaxed max-w-xs mx-auto">
                        {step.desc}
                      </p>
                   </div>
                 ))}
              </div>
           </div>
        </section>

        {/* Trust Factors */}
        <section className="py-32 bg-black border-t border-neutral-900">
           <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 lg:grid-cols-4 gap-12 text-center">
              {[
                { title: "No Hidden Fees", desc: "Transparent all-inclusive pricing.", icon: <CreditCard className="h-5 w-5 text-gold" /> },
                { title: "Secured Data", desc: "256-bit SSL encrypted transit.", icon: <ShieldCheck className="h-5 w-5 text-gold" /> },
                { title: "Instant Alerts", desc: "SMS and Email driver updates.", icon: <Smartphone className="h-5 w-5 text-gold" /> },
                { title: "24/7 Support", desc: "Always here for itinerary changes.", icon: <MessageSquare className="h-5 w-5 text-gold" /> },
              ].map((item, i) => (
                <div key={i} className="space-y-4">
                   <div className="mx-auto flex items-center justify-center w-12 h-12 bg-neutral-900 border border-neutral-800 rounded-2xl">
                    {item.icon}
                   </div>
                   <h5 className="font-serif text-lg font-black italic uppercase text-white">{item.title}</h5>
                   <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">{item.desc}</p>
                </div>
              ))}
           </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-neutral-900 border-t border-neutral-800 py-12 sm:py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center space-y-8">
          <h2 className="font-serif text-2xl font-black italic uppercase text-gold">Luna Limo</h2>
          <nav className="flex flex-wrap justify-center gap-x-12 gap-y-4 text-[10px] font-black uppercase tracking-widest text-neutral-400">
            <Link href="/" className="hover:text-gold transition-colors">Home</Link>
            <Link href="/services" className="hover:text-gold transition-colors">Services</Link>
            <Link href="/fleet" className="hover:text-gold transition-colors">Our Fleet</Link>
            <Link href="/reservations" className="hover:text-gold transition-colors text-white">Reservations</Link>
            <Link href="/contact" className="hover:text-gold transition-colors">Support</Link>
          </nav>
          <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-neutral-600">
            © 2026 Luna Limo. Professional Excellence Dedicated To Your Journey.
          </p>
        </div>
      </footer>
    </div>
  );
}
