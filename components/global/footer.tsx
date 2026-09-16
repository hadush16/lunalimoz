"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Mail, MapPin, Phone, Shield, Clock } from "lucide-react";

export function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const navItems = [
    { name: "Home", href: "/" },
    { name: "The Fleet", href: "/fleet" },
    { name: "Services", href: "/services" },
    { name: "About Us", href: "/about" },
    { name: "Track Ride", href: "/track-booking" },
    { name: "Private Concierge", href: "/contact" },
  ];

  const services = [
    { name: "Sea-Tac Airport Transfers", href: "/services/seattle-airport-limo" },
    { name: "Corporate Executive Chauffeur", href: "/services/executive-chauffeur-seattle" },
    { name: "Wedding & Special Events", href: "/services/seattle-wedding-limo" },
    { name: "Seattle City Tours & Hourly", href: "/services/seattle-city-tour-limo" },
  ];

  return (
    <footer className="bg-secondary/50 border-t border-border pt-16 pb-24 lg:pb-16 px-4 sm:px-6 transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="group inline-flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gold/40 bg-surface flex items-center justify-center shadow-md shrink-0 group-hover:border-gold transition-all duration-300">
                <Image 
                  src="/luna-logo.png" 
                  alt="Luna Limo" 
                  width={40}
                  height={40}
                  className="w-full h-full object-cover p-0.5" 
                />
              </div>
              <span className="font-serif text-lg font-black italic uppercase tracking-wider text-foreground">
                LUNA <span className="text-gold">LIMO</span>
              </span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              Seattle&apos;s premier chauffeur and executive black car service. Dedicated to punctuality, privacy, and refined comfort for corporate and airport travel.
            </p>
            <div className="flex items-center gap-3 pt-1 text-[10px] font-bold text-gold">
              <Shield className="h-3.5 w-3.5" />
              <span>Licensed & Insured Commercial Carrier</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-foreground border-l-2 border-gold pl-2">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link 
                    href={item.href} 
                    className="hover:text-gold transition-colors inline-block py-0.5"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Featured Services */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-foreground border-l-2 border-gold pl-2">
              Executive Services
            </h4>
            <ul className="space-y-2 text-xs font-semibold text-muted-foreground">
              {services.map((svc) => (
                <li key={svc.href}>
                  <Link 
                    href={svc.href} 
                    className="hover:text-gold transition-colors inline-block py-0.5"
                  >
                    {svc.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Direct */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-foreground border-l-2 border-gold pl-2">
              Concierge Contact
            </h4>
            <div className="space-y-2.5 text-xs text-muted-foreground">
              <Link href="tel:+12063274411" className="flex items-center gap-2.5 hover:text-gold transition-colors text-foreground">
                <Phone className="h-4 w-4 text-gold shrink-0" />
                <span className="font-bold">(206) 327-4411</span>
              </Link>
              <Link href="mailto:info@lunalimoz.com" className="flex items-center gap-2.5 hover:text-gold transition-colors text-foreground">
                <Mail className="h-4 w-4 text-gold shrink-0" />
                <span>info@lunalimoz.com</span>
              </Link>
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                <span>1902 E Yesler Way, Seattle, WA 98122</span>
              </div>
              <div className="flex items-center gap-2.5 pt-1 text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                <Clock className="h-3.5 w-3.5" />
                <span>24/7 Dispatch Available</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <p>© 2026 Luna Limo. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            <Link href="/cancellation-policy" className="hover:text-gold transition-colors">
              Cancellation Policy
            </Link>
            <Link href="/terms" className="hover:text-gold transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-gold transition-colors">
              Privacy
            </Link>
            <span>Seattle, WA</span>
            <span>Sea-Tac Transfers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
