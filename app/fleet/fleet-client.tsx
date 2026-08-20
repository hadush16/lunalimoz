"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Briefcase, 
  Wifi, 
  Coffee, 
  ShieldCheck, 
  Users2,
  ChevronRight,
  Star,
  Wind,
  Calendar,
  ArrowRight
} from "lucide-react";

export default function FleetClient() {
  const fleet = [
    {
      name: "Executive Sedan",
      type: "Business Class",
      capacity: "3 Passengers",
      luggage: "2 Suitcases",
      description: "The ultimate business-class experience. Our fleet of Mercedes-Benz S-Class and BMW 7-Series offers unparalleled comfort, noise isolation, and a smooth ride for the modern professional.",
      features: ["Leather Seating", "Climate Control", "WiFi Access", "USB Charging"],
      image: "/executive_sedan.png"
    },
    {
      name: "Luxury SUV",
      type: "First Class",
      capacity: "6 Passengers",
      luggage: "6 Suitcases",
      description: "Commanding presence meets uncompromising luxury. The Cadillac Escalade and Lincoln Navigator define first-class group travel with expansive interior space and state-of-the-art amenities.",
      features: ["Heated Seats", "Premium Audio", "Privacy Glass", "Extra Legroom"],
      image: "/luxury_suv.png"
    },
    {
      name: "Premium Electric",
      type: "Innovation Class",
      capacity: "3 Passengers",
      luggage: "2 Suitcases",
      description: "The future of elite transit. Experience the silent, dual-motor performance of the Tesla Model S and Lucid Air, combining sustainable innovation with futuristic luxury.",
      features: ["Glass Roof", "Silent Drive", "Zero Emissions", "Tech-Forward"],
      image: "/premium_electric.png"
    },
    {
      name: "Executive Van",
      type: "Group Class",
      capacity: "14 Passengers",
      luggage: "14 Suitcases",
      description: "Bespoke group logistics for the discerning traveler. Our custom Mercedes-Benz Sprinter vans are configured with personal lighting, captain's chairs, and dedicated luggage space.",
      features: ["Custom Lighting", "Easy Entry", "High Ceiling", "Ample Cargo"],
      image: "/executive_van.png"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden w-full">
      <main>
        {/* Fleet Hero */}
        <section className="relative py-16 sm:py-32 px-4 sm:px-6 overflow-hidden bg-black text-white border-b border-neutral-900">
          <div className="max-w-7xl mx-auto text-center relative z-20">
            <h3 className="text-gold text-[10px] font-black uppercase tracking-[0.5em] mb-4 sm:mb-6 animate-fade-in">The Luna Collection</h3>
            <h2 className="font-serif text-2xl sm:text-4xl md:text-7xl font-black italic uppercase text-white leading-tight tracking-tight">
              Elite <span className="text-gold">Fleet</span>
              <br className="hidden md:block" />
              <span className="block sm:inline sm:ml-2">Concierge Quality</span>
            </h2>
            <p className="text-xs sm:text-sm md:text-lg text-neutral-400 mt-6 sm:mt-8 max-w-2xl mx-auto font-medium leading-relaxed px-2 sm:px-0">
              Every vehicle in the Luna fleet is meticulously maintained and sanitised daily to meet the highest standards of luxury and safety. Experience excellence in every mile.
            </p>
          </div>
          
          {/* Subtle Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0 opacity-20">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold/5 rounded-full blur-[120px]" />
          </div>
        </section>

        {/* Fleet Grid */}
        <section className="py-16 sm:py-24 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
              {fleet.map((vehicle, index) => (
                <div key={index} className="group">
                  <div className="relative aspect-[16/9] bg-neutral-900 border border-neutral-800 overflow-hidden mb-8">
                    <Image 
                      src={vehicle.image} 
                      alt={vehicle.name} 
                      fill 
                      sizes="(max-width: 768px) 100vw, 50vw"
                      loading="lazy"
                      className="object-contain grayscale hover:grayscale-0 transition-all duration-1000 scale-110 group-hover:scale-125"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/90 to-transparent">
                       <span className="text-gold text-[9px] font-black uppercase tracking-[0.3em]">{vehicle.type}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                      <h3 className="font-serif text-xl sm:text-3xl font-black italic uppercase text-white">{vehicle.name}</h3>
                      <div className="flex gap-4 text-neutral-400">
                         <div className="flex items-center gap-1">
                            <Users2 className="h-4 w-4 text-gold/60" />
                            <span className="text-[10px] font-bold">{vehicle.capacity}</span>
                         </div>
                         <div className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4 text-gold/60" />
                            <span className="text-[10px] font-bold">{vehicle.luggage}</span>
                         </div>
                      </div>
                    </div>
                    
                    <p className="text-neutral-400 text-xs md:text-sm leading-relaxed font-medium uppercase tracking-wide">
                      {vehicle.description}
                    </p>

                    <div className="grid grid-cols-2 gap-y-3 pt-2">
                       {vehicle.features.map((feature, fidx) => (
                         <div key={fidx} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-neutral-500">
                            <div className="w-1 h-1 bg-gold rounded-full" />
                            {feature}
                         </div>
                       ))}
                    </div>

                    <div className="pt-6">
                      <Link href="/booking">
                        <Button className="w-full bg-transparent hover:bg-gold text-white border border-neutral-800 hover:border-gold rounded-none py-5 sm:py-6 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Reserve This Vehicle
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Fleet Standards */}
        <section className="py-16 sm:py-32 bg-neutral-900 border-t border-neutral-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
               <div className="space-y-8">
                  <h3 className="text-gold text-[10px] font-black uppercase tracking-[0.3em]">Luna Standards</h3>
                  <h2 className="font-serif text-2xl sm:text-5xl font-black italic uppercase text-white leading-tight">
                    Beyond Simple <span className="text-gold">Maintenance</span>
                  </h2>
                  <p className="text-neutral-400 text-sm md:text-base leading-relaxed font-medium uppercase tracking-[0.05em]">
                    Our commitment to excellence extends to the microscopic level. Every vehicle undergoes a rigorous 50-point inspection daily, ensuring mechanical perfection and aesthetic flawlessness.
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4">
                     {[
                       { title: "Daily Deep Clean", desc: "Hospital-grade sanitization after every journey.", icon: <Star className="h-6 w-6" /> },
                       { title: "Point To Point WiFi", desc: "Stay connected with high-speed 5G in every vehicle.", icon: <Wifi className="h-6 w-6" /> },
                       { title: "Climate Control", desc: "Private zones tailored to your exact preference.", icon: <Wind className="h-6 w-6" /> },
                       { title: "Discreet Transit", desc: "Privacy glass and acoustic insulation as standard.", icon: <ShieldCheck className="h-6 w-6" /> },
                     ].map((item, i) => (
                       <div key={i} className="space-y-3">
                          <div className="text-gold">{item.icon}</div>
                          <h4 className="font-serif text-lg font-black italic uppercase text-white">{item.title}</h4>
                          <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">{item.desc}</p>
                       </div>
                     ))}
                  </div>
               </div>
               <div className="relative aspect-square">
                  <div className="absolute inset-0 bg-gold/10 rotate-3 transform border border-gold/20" />
                  <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center border border-neutral-800 p-8">
                     <Image 
                      src="/fleet_black_bg.png" 
                      alt="Fleet Standard" 
                      width={500}
                      height={300}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      loading="lazy"
                      className="object-contain grayscale"
                    />
                  </div>
               </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 sm:py-32 bg-black relative flex items-center justify-center overflow-hidden">
          <div className="max-w-4xl mx-auto text-center relative z-10 px-4 sm:px-6">
            <h2 className="font-serif text-2xl sm:text-4xl md:text-6xl font-black italic uppercase text-white mb-8 sm:mb-12 leading-tight">
              Elegance In <span className="text-gold">Motion</span>
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
              <Link href="/booking" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-gold hover:bg-gold-dark text-white rounded-none px-8 sm:px-12 py-6 sm:py-8 text-[10px] sm:text-[12px] font-black uppercase tracking-widest border-b-4 border-gold-dark shadow-gold/20 shadow-2xl flex items-center justify-center gap-3">
                  <Calendar className="h-5 w-5" />
                  Book Reservation
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
        </section>
      </main>

    </div>
  );
}
