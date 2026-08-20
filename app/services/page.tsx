"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { 
  Globe, 
  Briefcase, 
  Trophy, 
  Compass, 
  Clock, 
  Shield, 
  ChevronRight,
  Star,
  Phone,
  Calendar,
  ArrowRight
} from "lucide-react";

export default function ServicesPage() {
  const services = [
    {
      title: "Airport Transfers",
      subtitle: "Seamless Sea-Tac Arrivals & Departures",
      description: "Experience the pinnacle of punctuality with our executive airport service. We monitor your flight in real-time to ensure your driver is waiting exactly when you land. Includes baggage assistance and baggage claim meet-and-greet.",
      icon: <Globe className="h-12 w-12 text-gold mb-6" />,
      image: "/fleet_black_bg.png"
    },
    {
      title: "Corporate Transportation",
      subtitle: "Bespoke Solutions for Executive Travel",
      description: "Unparalleled professionalism for your business needs. Our fleet serves as a mobile office where discretion and reliability are guaranteed. Ideal for high-stakes meetings, corporate events, and client hospitality.",
      icon: <Briefcase className="h-12 w-12 text-gold mb-6" />,
      image: "/fleet_black_bg.png"
    },
    {
      title: "Special Occasions",
      subtitle: "Elegant Travel for Life's Milestones",
      description: "From grand weddings to intimate anniversaries, we add a touch of sophistication to your most cherished moments. Our immaculately maintained fleet ensures you arrive in style and absolute comfort.",
      icon: <Trophy className="h-12 w-12 text-gold mb-6" />,
      image: "/fleet_black_bg.png"
    },
    {
      title: "City Charters",
      subtitle: "Custom Hourly Disposal & Tours",
      description: "The ultimate flexibility for your Seattle experience. Book a vehicle and driver for a dedicated block of time, perfect for city tours, shopping excursions, or dinner engagements with multiple stops.",
      icon: <Compass className="h-12 w-12 text-gold mb-6" />,
      image: "/fleet_black_bg.png"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden w-full">
      <main>
        {/* Services Hero */}
        <section className="relative py-16 sm:py-32 px-4 sm:px-6 overflow-hidden bg-black text-white border-b border-neutral-900">
          <div className="max-w-7xl mx-auto text-center relative z-20">
            <h3 className="text-gold text-[10px] font-black uppercase tracking-[0.5em] mb-4 sm:mb-6 animate-fade-in">Our Offerings</h3>
            <h2 className="font-serif text-2xl sm:text-4xl md:text-7xl font-black italic uppercase text-white leading-tight tracking-tight">
              Bespoke <span className="text-gold">Transportation</span>
              <br className="hidden md:block" />
              <span className="block sm:inline sm:ml-2">Tailored To Excellence</span>
            </h2>
            <p className="text-xs sm:text-sm md:text-lg text-neutral-400 mt-6 sm:mt-8 max-w-2xl mx-auto font-medium leading-relaxed px-2 sm:px-0">
              At Luna Limo, we believe that every journey should be as remarkable as the destination. Discover our suite of premium travel solutions designed for the discerning traveler.
            </p>
          </div>
          
          {/* Subtle Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0 opacity-20">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold/5 rounded-full blur-[120px]" />
          </div>
        </section>

        {/* Services Detail List */}
        <section className="py-16 sm:py-24 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="space-y-32">
              {services.map((service, index) => (
                <div key={index} className={`flex flex-col ${index % 2 !== 0 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-16 lg:gap-24`}>
                  <div className="flex-1 space-y-8">
                    <div className="inline-block p-4 bg-neutral-900 border border-neutral-800 rounded-2xl shadow-xl">
                      {service.icon}
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-gold text-[10px] font-black uppercase tracking-[0.3em]">{service.subtitle}</h3>
                      <h4 className="font-serif text-3xl md:text-5xl font-black italic uppercase text-white leading-tight">
                        {service.title}
                      </h4>
                      <p className="text-neutral-400 text-sm md:text-base leading-relaxed font-medium uppercase font-sans tracking-wide">
                        {service.description}
                      </p>
                    </div>
                    <div className="pt-4 flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
                      <Link 
                        href={
                          index === 0 ? "/services/seattle-airport-limo" : 
                          index === 1 ? "/services/executive-chauffeur-seattle" : 
                          index === 2 ? "/services/seattle-wedding-limo" : 
                          index === 3 ? "/services/seattle-city-tour-limo" :
                          "/booking"
                        } 
                        className="w-full sm:w-auto"
                      >
                        <Button className="w-full sm:w-auto bg-white hover:bg-neutral-200 text-black rounded-none px-10 py-6 sm:py-7 text-[10px] font-black uppercase tracking-[0.2em] transition-all">
                          {index < 4 ? "View Service Details" : "Book This Service"}
                        </Button>
                      </Link>
                      <Link href="tel:+12063274411" className="text-gold text-[10px] font-black uppercase tracking-[0.3em] hover:text-white transition-all flex items-center gap-2">
                        Inquire <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                  <div className="flex-1 relative group w-full max-w-2xl">
                    <div className="absolute -inset-4 bg-gold/10 blur-3xl rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-1000" />
                    <div className="relative aspect-[4/3] bg-neutral-900 border border-neutral-800 overflow-hidden">
                      <Image 
                        src={service.image} 
                        alt={service.title} 
                        fill 
                        sizes="(max-width: 768px) 100vw, 50vw"
                        loading="lazy"
                        className="object-contain grayscale hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-125"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-16 sm:py-32 bg-neutral-900 border-t border-neutral-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-24">
              <h3 className="text-gold text-[10px] font-black uppercase tracking-[0.4em] mb-4">The Luna Difference</h3>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-5xl font-black italic uppercase text-white leading-tight">
                Why Select Our Service?
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12">
              {[
                {
                  title: "Absolute Precision",
                  desc: "We understand that in executive travel, every second counts. Our punctuality record is the hallmark of our reliability.",
                  icon: <Clock className="h-8 w-8 text-gold" />
                },
                {
                  title: "Elite Discretion",
                  desc: "Professionalism and confidentiality are at the core of our training. Your privacy is our highest priority.",
                  icon: <Shield className="h-8 w-8 text-gold" />
                },
                {
                  title: "Superior Fleet",
                  desc: "Only late-model vehicles that pass rigorous daily inspections are permitted in our concierge-standard fleet.",
                  icon: <Star className="h-8 w-8 text-gold" />
                }
              ].map((item, i) => (
                <div key={i} className="text-center space-y-6 group">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-black border border-neutral-800 rotate-45 group-hover:bg-gold transition-all duration-500">
                    <div className="-rotate-45 text-gold group-hover:text-black transition-colors duration-500">
                      {item.icon}
                    </div>
                  </div>
                  <h4 className="font-serif text-xl font-black italic uppercase text-white pt-6">{item.title}</h4>
                  <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-[0.2em] leading-relaxed max-w-xs mx-auto">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 sm:py-32 bg-black relative flex items-center justify-center overflow-hidden">
          <div className="max-w-4xl mx-auto text-center relative z-10 px-4 sm:px-6">
            <h2 className="font-serif text-2xl sm:text-4xl md:text-6xl font-black italic uppercase text-white mb-8 sm:mb-12 leading-tight">
              Ready To Experience <span className="text-gold">Next Level</span> Luxury?
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              <Link href="/booking" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-gold hover:bg-gold-dark text-white rounded-none px-8 sm:px-12 py-6 sm:py-8 text-[10px] sm:text-[12px] font-black uppercase tracking-widest border-b-4 border-gold-dark shadow-gold/20 shadow-2xl flex items-center justify-center gap-3">
                  <Calendar className="h-5 w-5" />
                  Book Reservation In Seconds
                </Button>
              </Link>
              <Link href="/contact" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-black rounded-none px-8 sm:px-12 py-6 sm:py-8 text-[10px] sm:text-[12px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3">
                  <ArrowRight className="h-5 w-5" />
                  Contact Concierge
                </Button>
              </Link>
            </div>
          </div>
          <div className="absolute inset-0 z-0 opacity-10">
            <div className="absolute top-1/2 right-[10%] w-[500px] h-[500px] bg-gold/20 rounded-full blur-[150px]" />
          </div>
        </section>
      </main>

    </div>
  );
}
