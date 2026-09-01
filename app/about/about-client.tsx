"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Clock, 
  Shield, 
  Star, 
  Users, 
  Sparkles 
} from "lucide-react";

export default function AboutClient() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden w-full transition-colors duration-200">
      <main>
        {/* About Hero Section */}
        <section className="relative py-16 sm:py-24 px-4 sm:px-6 overflow-hidden bg-secondary/40 border-b border-border transition-colors">
          <div className="max-w-7xl mx-auto text-center relative z-20 space-y-4">
             <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gold/10 border border-gold/30 rounded-none">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              <span className="text-gold text-[10px] font-black uppercase tracking-[0.3em]">Our Legacy</span>
            </div>
            
            <h1 className="font-serif text-3xl sm:text-5xl md:text-7xl font-black italic uppercase text-foreground leading-tight tracking-tight">
              Executive <br /> 
              <span className="text-gold">Excellence</span>
            </h1>
            
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
              Luna Limo is a premier chauffeur and luxury black car service dedicated to redefining private transit across the Seattle metropolitan region. Beyond simple transport, we deliver peace of mind.
            </p>
          </div>
        </section>

        {/* The Foundation Section */}
        <section className="py-16 sm:py-24 bg-background transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className="space-y-6 order-2 lg:order-1">
                 <div className="space-y-2">
                  <span className="text-gold text-[10px] font-black uppercase tracking-[0.4em]">The Foundation</span>
                  <h2 className="font-serif text-2xl sm:text-4xl font-black italic uppercase text-foreground">
                    Est. <span className="text-gold">Seattle, WA</span>
                  </h2>
                 </div>

                <div className="space-y-4 text-muted-foreground text-xs sm:text-sm leading-relaxed font-medium">
                  <p>
                    Established with a singular commitment: to bring an uncompromising standard of punctuality, privacy, and vehicle presentation to regional executive transportation. In an era of automated ridesharing, Luna Limo offers the irreplaceable reliability of seasoned, dedicated chauffeurs.
                  </p>
                  <p>
                    From corporate executives visiting South Lake Union and the Redmond Microsoft campus to wedding parties and Sea-Tac international travelers, our dispatch team operates 24 hours a day, 365 days a year to manage every detail.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="p-5 bg-card border border-border shadow-sm">
                    <MapPin className="h-6 w-6 text-gold mb-2" />
                    <h3 className="text-foreground font-serif text-base font-black italic uppercase">Headquarters</h3>
                    <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider mt-0.5">Seattle, Washington</p>
                  </div>
                  <div className="p-5 bg-card border border-border shadow-sm">
                    <Clock className="h-6 w-6 text-gold mb-2" />
                    <h3 className="text-foreground font-serif text-base font-black italic uppercase">Operations</h3>
                    <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider mt-0.5">24/7 Dispatch</p>
                  </div>
                </div>
              </div>

              <div className="relative aspect-[4/3] bg-secondary border border-border overflow-hidden order-1 lg:order-2 shadow-sm">
                <Image 
                  src="/luxury_suv.png" 
                  alt="Luna Limo Executive Chauffeur SUV" 
                  fill 
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain p-6 grayscale hover:grayscale-0 transition-all duration-700"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Pillars of Excellence */}
        <section className="py-16 sm:py-24 bg-secondary/30 border-t border-border transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-16 space-y-3">
              <span className="text-gold text-[10px] font-black uppercase tracking-[0.4em]">The Pillars</span>
              <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-black italic uppercase text-foreground">Our Core <span className="text-gold">Values</span></h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { 
                  title: "Elite Chauffeurs", 
                  desc: "Every driver is professionally trained in executive etiquette, defensive driving, and strict confidentiality protocols.", 
                  icon: <Users className="h-7 w-7 text-gold" /> 
                },
                { 
                  title: "Pristine Fleet", 
                  desc: "Our late-model vehicles undergo complete sanitization and a multi-point mechanical inspection before every reservation.", 
                  icon: <Star className="h-7 w-7 text-gold" /> 
                },
                { 
                  title: "Guaranteed Punctuality", 
                  desc: "Time is your most valuable asset. Our flight-tracking technology ensures your driver is waiting before you touch down.", 
                  icon: <Shield className="h-7 w-7 text-gold" /> 
                }
              ].map((pillar, pidx) => (
                <div key={pidx} className="p-8 bg-card border border-border space-y-4 text-center shadow-sm">
                   <div className="inline-flex items-center justify-center w-12 h-12 bg-gold/10 border border-gold/30 rounded-full mx-auto">
                     {pillar.icon}
                   </div>
                   <h3 className="font-serif text-xl font-black italic uppercase text-foreground">{pillar.title}</h3>
                   <p className="text-muted-foreground text-xs sm:text-sm font-medium leading-relaxed">
                     {pillar.desc}
                   </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-24 bg-secondary text-foreground relative overflow-hidden border-t border-border">
           <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6">
              <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-black italic uppercase leading-tight text-foreground">
                Experience The <span className="text-gradient-gold">Luna Standard</span>
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto uppercase tracking-widest font-medium">
                Reserve online or speak with our executive dispatch team.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <Link href="/booking" className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto bg-gold hover:bg-gold-dark text-primary-foreground rounded-none px-8 py-6 text-xs font-black uppercase tracking-widest shadow-xl">
                      Book Reservation
                    </Button>
                </Link>
                <Link href="/contact" className="w-full sm:w-auto">
                    <Button variant="outline" className="w-full sm:w-auto border-border text-foreground hover:bg-card rounded-none px-8 py-6 text-xs font-black uppercase tracking-widest">
                      Contact Concierge
                    </Button>
                </Link>
              </div>
           </div>
        </section>
      </main>
    </div>
  );
}
