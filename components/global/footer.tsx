"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Globe, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  const pathname = usePathname();

  // Do not render the public footer on admin routes
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
    <footer className="bg-black border-t border-neutral-900 py-16 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto text-center space-y-10">
        <div className="flex justify-center mb-8">
          <Link href="/">
            <Image 
              src="/luna-logo.png" 
              alt="Luna Limo" 
              width={180}
              height={64}
              className="h-16 w-auto grayscale transition-all hover:grayscale-0 duration-500" 
            />
          </Link>
        </div>
        
        <nav className="flex flex-wrap justify-center gap-x-12 gap-y-4 text-[10px] font-black uppercase tracking-widest text-neutral-500">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`hover:text-gold transition-colors ${
                pathname === item.href ? "text-white" : ""
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex justify-center gap-8 text-neutral-600">
           <Link href="tel:+12063274411" className="hover:text-gold transition-colors"><Phone className="h-4 w-4" /></Link>
           <Link href="mailto:info@lunalimoz.com" className="hover:text-gold transition-colors"><Mail className="h-4 w-4" /></Link>
           <Link href="https://maps.google.com" target="_blank" className="hover:text-gold transition-colors"><MapPin className="h-4 w-4" /></Link>
        </div>

        <div className="pt-8 border-t border-neutral-900 max-w-xl mx-auto">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-600 mb-4 px-4">
            Luna Limo Professional Chauffeur Services. Seattle, WA.
          </p>
          <p className="text-[8px] font-bold uppercase tracking-[0.3em] text-neutral-800">
            Copyright © 2026 Luna Limo. Established February 20, 2023.
          </p>
        </div>
      </div>
    </footer>
  );
}
