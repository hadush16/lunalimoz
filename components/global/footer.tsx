"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const navItems = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "The Fleet", href: "/fleet" },
    { name: "Booking", href: "/reservations" },
    { name: "Concierge", href: "/contact" },
  ];

  return (
    <footer className="bg-slate-100 dark:bg-black border-t border-slate-200 dark:border-neutral-900 py-16 px-4 sm:px-6 transition-colors">
      <div className="max-w-7xl mx-auto text-center space-y-8">
        
        {/* Brand Circular Logo Header */}
        <div className="flex justify-center mb-6">
          <Link href="/" className="group flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-500/40 bg-neutral-900 flex items-center justify-center shadow-md shrink-0 group-hover:border-gold transition-all duration-300">
              <Image 
                src="/luna-logo.png" 
                alt="Luna Limo" 
                width={48}
                height={48}
                style={{ height: 'auto', width: 'auto' }}
                className="w-full h-full object-cover p-1 transition-transform duration-500 group-hover:scale-110" 
              />
            </div>
            <span className="font-serif text-xl font-black italic uppercase tracking-wider text-slate-900 dark:text-white">
              LUNA <span className="text-amber-600 dark:text-gold">LIMO</span>
            </span>
          </Link>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex flex-wrap justify-center gap-x-10 gap-y-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-neutral-400">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`hover:text-amber-600 dark:hover:text-gold transition-colors ${
                pathname === item.href ? "text-slate-900 dark:text-white font-bold" : ""
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Social & Contact Icons */}
        <div className="flex justify-center gap-6 text-slate-500 dark:text-neutral-500">
           <Link href="tel:+12063274411" className="p-2.5 rounded-full border border-slate-300 dark:border-neutral-800 hover:text-amber-600 dark:hover:text-gold hover:border-amber-500 transition-colors"><Phone className="h-4 w-4" /></Link>
           <Link href="mailto:info@lunalimoz.com" className="p-2.5 rounded-full border border-slate-300 dark:border-neutral-800 hover:text-amber-600 dark:hover:text-gold hover:border-amber-500 transition-colors"><Mail className="h-4 w-4" /></Link>
           <Link href="https://maps.google.com" target="_blank" className="p-2.5 rounded-full border border-slate-300 dark:border-neutral-800 hover:text-amber-600 dark:hover:text-gold hover:border-amber-500 transition-colors"><MapPin className="h-4 w-4" /></Link>
        </div>

        {/* Copyright Footer Notice */}
        <div className="pt-8 border-t border-slate-200 dark:border-neutral-900 max-w-xl mx-auto space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500 dark:text-neutral-500 px-4">
            Luna Limo Executive Chauffeur Services. Seattle, WA.
          </p>
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-neutral-600">
            Copyright © 2026 Luna Limo. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
