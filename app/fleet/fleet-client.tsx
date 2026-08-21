"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Briefcase, 
  Calendar, 
  CheckCircle2
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
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white font-sans overflow-x-hidden w-full transition-colors duration-200">
      <main>
        {/* Fleet Hero */}
        <section className="relative py-16 sm:py-24 px-4 sm:px-6 overflow-hidden bg-white dark:bg-black border-b border-slate-200 dark:border-neutral-900">
          <div className="max-w-7xl mx-auto text-center relative z-20">
            <h3 className="text-amber-600 dark:text-gold text-[10px] font-black uppercase tracking-[0.5em] mb-4 sm:mb-6 animate-fade-in">The Luna Collection</h3>
            <h1 className="font-serif text-3xl sm:text-5xl md:text-7xl font-black italic uppercase text-slate-900 dark:text-white leading-tight tracking-tight">
              Elite <span className="text-amber-600 dark:text-gold">Fleet</span>
              <br className="hidden md:block" />
              <span className="block sm:inline sm:ml-2">Concierge Quality</span>
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-slate-600 dark:text-neutral-400 mt-6 sm:mt-8 max-w-2xl mx-auto font-medium leading-relaxed px-2 sm:px-0">
              Every vehicle in the Luna fleet is meticulously maintained and sanitised daily to meet the highest standards of luxury and safety. Experience excellence in every mile.
            </p>
          </div>
        </section>

        {/* Fleet Grid */}
        <section className="py-16 sm:py-24 bg-slate-50 dark:bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10 lg:gap-16">
              {fleet.map((vehicle, index) => (
                <div key={index} className="group bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 p-6 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-xl transition-all duration-300">
                  <div>
                    <div className="relative aspect-[16/9] bg-slate-100 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 overflow-hidden mb-6">
                      <Image 
                        src={vehicle.image} 
                        alt={vehicle.name} 
                        fill 
                        sizes="(max-width: 768px) 100vw, 50vw"
                        loading="lazy"
                        className="object-contain transition-all duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                         <span className="text-amber-400 dark:text-gold text-[9px] font-black uppercase tracking-[0.3em]">{vehicle.type}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
                        <h2 className="font-serif text-2xl font-black italic uppercase text-slate-900 dark:text-white">{vehicle.name}</h2>
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-neutral-400 shrink-0">
                          <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-amber-600 dark:text-gold" /> {vehicle.capacity}</span>
                          <span className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5 text-amber-600 dark:text-gold" /> {vehicle.luggage}</span>
                        </div>
                      </div>

                      <p className="text-slate-600 dark:text-neutral-400 text-xs font-medium leading-relaxed">
                        {vehicle.description}
                      </p>

                      <div className="grid grid-cols-2 gap-2 pt-2">
                        {vehicle.features.map((feat, i) => (
                          <span key={i} className="text-[10px] font-bold text-slate-700 dark:text-neutral-300 flex items-center gap-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-amber-600 dark:text-gold shrink-0" />
                            {feat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-200 dark:border-neutral-800">
                    <Link href={`/booking?car=${encodeURIComponent(vehicle.name)}`}>
                      <Button className="w-full bg-gold hover:bg-gold-dark text-white rounded-none py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Reserve This Vehicle
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
