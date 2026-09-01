"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Luggage, 
  Calendar, 
  CheckCircle2,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";

export default function FleetClient() {
  const fleet = [
    {
      name: "Executive Sedan",
      type: "Business Class",
      capacity: "3 Passengers",
      luggage: "2 Suitcases",
      rate: "From $120/hr",
      description: "The ultimate business-class experience. Our fleet of Mercedes-Benz S-Class and BMW 7-Series offers unparalleled acoustic comfort, active air suspension, and executive discretion for the modern professional.",
      features: ["Nappa Leather Seating", "Individual Climate Zones", "Complimentary High-Speed WiFi", "Rear Device Fast-Charging", "Acoustic Noise-Canceling Glass"],
      image: "/executive_sedan.png"
    },
    {
      name: "Luxury SUV",
      type: "First Class",
      capacity: "6 Passengers",
      luggage: "6 Suitcases",
      rate: "From $180/hr",
      description: "Commanding presence meets uncompromising luxury. The Cadillac Escalade and Lincoln Navigator define first-class group travel with expansive interior space, heated seats, and generous luggage volume.",
      features: ["Heated & Ventilated Seats", "Studio Surround Audio", "Full Privacy Tinting", "Tri-Zone Climate Control", "Extended Luggage Cargo Capacity"],
      image: "/luxury_suv.png"
    },
    {
      name: "Premium Electric",
      type: "Innovation Class",
      capacity: "3 Passengers",
      luggage: "2 Suitcases",
      rate: "From $140/hr",
      description: "The future of elite transit. Experience the silent, dual-motor performance of the Tesla Model S and Lucid Air, combining sustainable zero-emission innovation with futuristic luxury.",
      features: ["Panoramic Glass Roof", "Whisper-Quiet Dual Motor", "Zero Direct Tailpipe Emissions", "Active Cabin Air Filtration", "Executive Tech Interface"],
      image: "/premium_electric.png"
    },
    {
      name: "Executive Van",
      type: "Group Class",
      capacity: "14 Passengers",
      luggage: "14 Suitcases",
      rate: "From $220/hr",
      description: "Bespoke group logistics for the discerning traveler. Our custom Mercedes-Benz Sprinter vans are configured with personalized ambient lighting, captain's chairs, standing headroom, and dedicated luggage space.",
      features: ["Individual Captain Chairs", "High Standing Ceiling", "Dedicated Oversized Luggage Bay", "Bespoke Ambient Lighting", "Power Outlets at Every Seat"],
      image: "/executive_van.png"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden w-full transition-colors duration-200">
      <main>
        {/* Fleet Hero */}
        <section className="relative py-16 sm:py-24 px-4 sm:px-6 overflow-hidden bg-secondary/40 border-b border-border transition-colors">
          <div className="max-w-7xl mx-auto text-center relative z-20 space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-gold/10 border border-gold/30 rounded-none">
              <Sparkles className="h-3.5 w-3.5 text-gold" />
              <span className="text-gold text-[10px] font-black uppercase tracking-[0.3em]">The Luna Collection</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl md:text-7xl font-black italic uppercase text-foreground leading-tight tracking-tight">
              Executive <span className="text-gold">Fleet</span>
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground max-w-2xl mx-auto font-medium leading-relaxed">
              Every vehicle in the Luna Limoz fleet is meticulously maintained, commercially insured, and sanitized before every reservation to deliver the highest international standard of chauffeur service.
            </p>
          </div>
        </section>

        {/* Fleet Grid */}
        <section className="py-16 sm:py-24 bg-background transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12"
            >
              {fleet.map((vehicle, index) => (
                <motion.div 
                  key={index} 
                  variants={staggerItem}
                  className="group bg-card border border-border p-6 sm:p-8 flex flex-col justify-between shadow-sm hover:shadow-2xl hover:border-gold/50 transition-all duration-300 group-hover:-translate-y-1"
                >
                  <div className="space-y-6">
                    <div className="relative aspect-[16/10] bg-secondary border border-border/50 overflow-hidden">
                      <Image 
                        src={vehicle.image} 
                        alt={vehicle.name} 
                        fill 
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-contain p-4 transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="text-gold bg-card/90 text-[8px] font-black uppercase tracking-[0.25em] px-2.5 py-1 border border-gold/30">
                          {vehicle.type}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3">
                        <span className="text-foreground bg-card/90 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 border border-border">
                          {vehicle.rate}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-baseline gap-2">
                        <h2 className="font-serif text-2xl font-black italic uppercase text-foreground">{vehicle.name}</h2>
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground shrink-0">
                          <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-gold" /> {vehicle.capacity}</span>
                          <span className="flex items-center gap-1.5"><Luggage className="h-3.5 w-3.5 text-gold" /> {vehicle.luggage}</span>
                        </div>
                      </div>

                      <p className="text-muted-foreground text-xs font-medium leading-relaxed">
                        {vehicle.description}
                      </p>

                      <div className="space-y-2 pt-2 border-t border-border">
                        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-muted-foreground">
                          Standard Amenities
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {vehicle.features.map((feat, i) => (
                            <span key={i} className="text-[10px] font-bold text-foreground flex items-center gap-2">
                              <CheckCircle2 className="h-3.5 w-3.5 text-gold shrink-0" />
                              {feat}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-border">
                    <Link href={`/booking?car=${encodeURIComponent(vehicle.name)}`}>
                      <Button className="w-full bg-gold hover:bg-gold-dark text-primary-foreground rounded-none py-6 text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 shadow-md">
                        <Calendar className="h-4 w-4" />
                        <span>Reserve {vehicle.name}</span>
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  );
}
