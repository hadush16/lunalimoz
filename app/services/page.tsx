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
  Star,
  Sparkles
} from "lucide-react";

export default function ServicesPage() {
  const services = [
    {
      title: "Airport Transfers",
      subtitle: "Sea-Tac International (SEA) & Regional FBOs",
      description: "Experience the pinnacle of punctuality with our executive airport service. We monitor your flight in real-time to ensure your driver is waiting exactly when you land. Includes baggage assistance and baggage claim meet-and-greet.",
      icon: <Globe className="h-8 w-8 text-gold" />,
      image: "/fleet_black_bg.png",
      href: "/services/seattle-airport-limo"
    },
    {
      title: "Corporate Transportation",
      subtitle: "Bespoke Solutions for Executive Travel",
      description: "Unparalleled professionalism for your business needs. Our fleet serves as a quiet mobile office where discretion and reliability are guaranteed. Ideal for high-stakes meetings, corporate events, and client hospitality.",
      icon: <Briefcase className="h-8 w-8 text-gold" />,
      image: "/fleet_black_bg.png",
      href: "/services/executive-chauffeur-seattle"
    },
    {
      title: "Special Occasions & Weddings",
      subtitle: "Elegant Travel for Life's Milestones",
      description: "From grand weddings to intimate anniversaries, we add a touch of sophistication to your most cherished moments. Our immaculately maintained fleet ensures you arrive in style and absolute comfort.",
      icon: <Trophy className="h-8 w-8 text-gold" />,
      image: "/fleet_black_bg.png",
      href: "/services/seattle-wedding-limo"
    },
    {
      title: "City Charters & Tours",
      subtitle: "Custom Hourly Disposal & Wine Country Tours",
      description: "The ultimate flexibility for your Seattle experience. Book a vehicle and driver for a dedicated block of time, perfect for city tours, Woodinville wine excursions, or dinner engagements with multiple stops.",
      icon: <Compass className="h-8 w-8 text-gold" />,
      image: "/fleet_black_bg.png",
      href: "/services/seattle-city-tour-limo"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden w-full transition-colors duration-200">
      <main>
        {/* Services Hero */}
        <section className="relative py-16 sm:py-24 px-4 sm:px-6 overflow-hidden bg-secondary/40 border-b border-border transition-colors">
          <div className="max-w-7xl mx-auto text-center relative z-20 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gold/10 border border-gold/30 rounded-none">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              <span className="text-gold text-[10px] font-black uppercase tracking-[0.3em]">Our Offerings</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl md:text-7xl font-black italic uppercase text-foreground leading-tight tracking-tight">
              Concierge <span className="text-gold">Services</span>
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
              At Luna Limo, we believe that every journey should be as seamless as the destination. Discover our suite of premium executive travel solutions across Seattle, Bellevue, and the Pacific Northwest.
            </p>
          </div>
        </section>

        {/* Services Detail List */}
        <section className="py-16 sm:py-24 bg-background transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="space-y-20 lg:space-y-28">
              {services.map((service, index) => (
                <div key={index} className={`flex flex-col ${index % 2 !== 0 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-20`}>
                  <div className="flex-1 space-y-6">
                    <div className="inline-flex p-3.5 bg-card border border-border">
                      {service.icon}
                    </div>
                    <div className="space-y-3">
                      <span className="text-gold text-[10px] font-black uppercase tracking-[0.25em]">{service.subtitle}</span>
                      <h2 className="font-serif text-2xl sm:text-4xl font-black italic uppercase text-foreground leading-tight">
                        {service.title}
                      </h2>
                      <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed font-medium">
                        {service.description}
                      </p>
                    </div>
                    <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
                      <Link href={service.href} className="w-full sm:w-auto">
                        <Button className="w-full sm:w-auto bg-gold hover:bg-gold-dark text-primary-foreground rounded-none px-8 py-6 text-xs font-black uppercase tracking-[0.2em] transition-all shadow-md">
                          Service Details
                        </Button>
                      </Link>
                      <Link href="/booking" className="w-full sm:w-auto">
                        <Button variant="outline" className="w-full sm:w-auto border-border text-foreground hover:bg-secondary rounded-none px-8 py-6 text-xs font-black uppercase tracking-[0.2em]">
                          Book Ride
                        </Button>
                      </Link>
                    </div>
                  </div>
                  <div className="flex-1 relative group w-full max-w-xl">
                    <div className="relative aspect-[4/3] bg-secondary border border-border overflow-hidden">
                      <Image 
                        src={service.image} 
                        alt={service.title} 
                        fill 
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-contain grayscale group-hover:grayscale-0 transition-all duration-700 p-6"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* The Luna Difference */}
        <section className="py-16 sm:py-24 bg-secondary/30 border-t border-border transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12 sm:mb-16 space-y-3">
              <span className="text-gold text-[10px] font-black uppercase tracking-[0.4em]">The Luna Difference</span>
              <h2 className="font-serif text-2xl sm:text-3xl md:text-5xl font-black italic uppercase text-foreground leading-tight">
                Why Select Our Chauffeur Service?
              </h2>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Absolute Precision",
                  desc: "In executive travel, every second counts. Our proactive flight-tracking and arrival buffer ensure you never wait.",
                  icon: <Clock className="h-6 w-6 text-gold" />
                },
                {
                  title: "Elite Discretion",
                  desc: "Professionalism and NDA confidentiality are foundational. Your itineraries, calls, and guests remain private.",
                  icon: <Shield className="h-6 w-6 text-gold" />
                },
                {
                  title: "Superior Fleet",
                  desc: "Only pristine late-model vehicles passing rigorous daily detailing and mechanical inspections enter our fleet.",
                  icon: <Star className="h-6 w-6 text-gold" />
                }
              ].map((item, i) => (
                <div key={i} className="bg-card border border-border p-8 text-center space-y-4 shadow-sm">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gold/10 border border-gold/30 rounded-full mx-auto">
                    {item.icon}
                  </div>
                  <h3 className="font-serif text-lg font-black italic uppercase text-foreground">{item.title}</h3>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 sm:py-24 bg-secondary text-foreground relative flex items-center justify-center overflow-hidden border-t border-border">
          <div className="max-w-4xl mx-auto text-center relative z-10 px-4 sm:px-6 space-y-6">
            <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl font-black italic uppercase text-foreground leading-tight">
              Ready To Experience <span className="text-gradient-gold">First-Class</span> Luxury?
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto uppercase tracking-widest font-medium">
              Reserve your private chauffeur or talk directly with our 24/7 Seattle concierge desk.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link href="/booking" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-gold hover:bg-gold-dark text-primary-foreground rounded-none px-8 py-6 text-xs font-black uppercase tracking-widest shadow-xl">
                  Reserve Online
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
