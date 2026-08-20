"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { 
  History, 
  MapPin, 
  Award, 
  Clock, 
  Calendar,
  ArrowRight,
  Shield,
  Star,
  Users
} from "lucide-react";

export default function AboutClient() {
  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden w-full">
      <main>
        {/* About Hero Section */}
        <section className="relative py-24 sm:py-32 px-4 sm:px-6 overflow-hidden bg-black text-white border-b border-neutral-900">
          <div className="max-w-7xl mx-auto text-center relative z-20">
             <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold/10 border border-gold/20 rounded-none mb-8">
              <History className="h-4 w-4 text-gold" />
              <span className="text-gold text-[10px] font-black uppercase tracking-[0.3em]">Our Legacy</span>
            </div>
            
            <h1 className="font-serif text-3xl sm:text-5xl md:text-8xl font-black italic uppercase text-white leading-[0.9] tracking-tight mb-8">
              Professional <br /> 
              <span className="text-gold">Excellence</span>
            </h1>
            
            <p className="text-sm sm:text-lg text-neutral-400 max-w-3xl mx-auto font-medium leading-relaxed uppercase tracking-wider px-2">
              LUNA LIMO IS A PREMIER CHAUFFEUR SERVICE DEDICATED TO REDEFINING THE ART OF TRAVEL. 
              WE PROVIDE BEYOND TRANSPORT; WE DELIVER AN EXPERIENCE.
            </p>
          </div>

          {/* Background Branding Elements */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gold/5 rounded-full blur-[150px]" />
          </div>
        </section>

        {/* The Foundation Section */}
        <section className="py-20 sm:py-32 bg-neutral-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
              <div className="space-y-10 order-2 lg:order-1">
                 <div className="space-y-4">
                  <h3 className="text-gold text-[11px] font-black uppercase tracking-[0.5em]">The Foundation</h3>
                  <h2 className="font-serif text-2xl sm:text-4xl md:text-6xl font-black italic uppercase text-white">
                    Est <span className="text-gold">02.20.2023</span>
                  </h2>
                 </div>

                <div className="space-y-6">
                  <p className="text-neutral-400 text-sm sm:text-base leading-relaxed font-medium uppercase tracking-[0.05em]">
                    Founded in early 2023, Luna Limo was established with a singular vision: to bring a concierge-level of service to the professional transit industry. In a world of automated transport, we choose the personal touch.
                  </p>
                  <p className="text-neutral-500 text-xs sm:text-sm font-medium uppercase tracking-widest leading-loose">
                    Since our inception in Seattle, we have grown from a boutique luxury service into a premier regional provider, while maintaining the same commitment to punctuality, privacy, and precision that defined our very first journey.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-4">
                  <div className="p-6 bg-black border border-neutral-900 group hover:border-gold transition-colors duration-500">
                    <MapPin className="h-8 w-8 text-gold mb-4" />
                    <h4 className="text-white font-serif text-lg font-black italic uppercase">Headquarters</h4>
                    <span className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest">Seattle, Washington</span>
                  </div>
                  <div className="p-6 bg-black border border-neutral-900 group hover:border-gold transition-colors duration-500">
                    <Clock className="h-8 w-8 text-gold mb-4" />
                    <h4 className="text-white font-serif text-lg font-black italic uppercase">Operations</h4>
                    <span className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest">24/7 Global Availability</span>
                  </div>
                </div>
              </div>

              <div className="relative aspect-square order-1 lg:order-2">
                 <div className="absolute inset-4 bg-gold opacity-10 blur-3xl animate-pulse" />
                 <div className="relative w-full h-full bg-neutral-900 border border-neutral-800 p-2 overflow-hidden">
                    <Image 
                      src="/luxury_suv.png" 
                      alt="The Luna Standard" 
                      fill 
                      className="object-contain grayscale hover:grayscale-0 transition-all duration-1000 scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex flex-col justify-end p-8">
                       <span className="text-white font-serif text-4xl font-black italic leading-none opacity-20 uppercase">Luna Prestige</span>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pillars of Excellence */}
        <section className="py-24 sm:py-32 bg-black border-y border-neutral-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-20 space-y-4">
              <h3 className="text-gold text-[10px] font-black uppercase tracking-[0.5em]">The Pillars</h3>
              <h2 className="font-serif text-2xl sm:text-6xl font-black italic uppercase text-white">Our Core <span className="text-gold">Values</span></h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { 
                  title: "Elite Chauffeurs", 
                  desc: "Every driver is a professional concierge, trained in defensive driving and discreet service protocol.", 
                  icon: <Users className="h-10 w-10" /> 
                },
                { 
                  title: "Pristine Fleet", 
                  desc: "Our vehicles undergo hospital-grade sanitization and a 50-point mechanical inspection daily.", 
                  icon: <Star className="h-10 w-10" /> 
                },
                { 
                  title: "Secure Transit", 
                  desc: "Safety and security are integrated into every mile, with 24/7 monitoring and route optimization.", 
                  icon: <Shield className="h-10 w-10" /> 
                }
              ].map((pillar, pidx) => (
                <div key={pidx} className="p-10 bg-neutral-950 border border-neutral-800 hover:border-gold transition-all duration-700 space-y-6 flex flex-col items-center text-center group">
                   <div className="text-gold group-hover:scale-110 transition-transform duration-500">{pillar.icon}</div>
                   <h3 className="font-serif text-2xl font-black italic uppercase text-white">{pillar.title}</h3>
                   <p className="text-neutral-500 text-xs sm:text-sm font-medium uppercase tracking-[0.1em] leading-relaxed">
                     {pillar.desc}
                   </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline / CTA Section */}
        <section className="py-24 sm:py-40 bg-neutral-950 relative overflow-hidden">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
              <div className="mb-12">
                 <h2 className="font-serif text-3xl sm:text-7xl font-black italic uppercase text-white leading-tight">
                   The Future Of <br />
                   <span className="text-gold">Elite Transport</span>
                 </h2>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10">
                <Link href="/reservations" className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto bg-gold hover:bg-gold-dark text-white rounded-none px-12 py-8 text-[12px] font-black uppercase tracking-widest border-b-4 border-gold-dark flex items-center justify-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Experience Excellence
                    </Button>
                </Link>
                <Link href="/contact" className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-black rounded-none px-12 py-8 text-[12px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                      <ArrowRight className="h-5 w-5" />
                      Our Standards
                    </Button>
                </Link>
              </div>
           </div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center opacity-5 select-none pointer-events-none">
              <span className="font-serif text-[15vw] font-black italic uppercase text-white">LUNA PRESTIGE</span>
           </div>
        </section>
      </main>
    </div>
  );
}
