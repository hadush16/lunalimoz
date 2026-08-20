"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Phone, Menu, X, Calendar, Mail } from "lucide-react";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const pathname = usePathname();

  // Do not render the public header on admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  // Navigation Items
  const navItems = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Services", href: "/services" },
    { name: "Our Fleet", href: "/fleet" },
    { name: "Reservations", href: "/reservations" },
    { name: "Contact Us", href: "/contact" },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Top Bar */}
      <div className="bg-neutral-900 py-2 hidden md:block border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 flex justify-end items-center gap-6 text-[10px] font-black tracking-[0.2em] uppercase text-neutral-400">
          <Link href="tel:+12063274411" className="flex items-center gap-2 hover:text-gold transition-colors">
            <Phone className="h-3 w-3 text-gold" />
            (206) 327-4411
          </Link>
          <div className="h-3 w-[1px] bg-neutral-800" />
          <Link href="mailto:info@lunalimoz.com" className="flex items-center gap-2 hover:text-gold transition-colors">
            <Mail className="h-3 w-3 text-gold" />
            info@lunalimoz.com
          </Link>
          <div className="h-3 w-[1px] bg-neutral-800" />
          <p>24/7 Professional Service</p>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-black/90 backdrop-blur-md border-b border-neutral-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="group flex items-center">
            <Image 
              src="/luna-logo.png" 
              alt="Luna Limo" 
              width={200}
              height={70}
              priority
              className="h-16 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
            />
          </Link>
          
          <nav className="hidden lg:flex items-center gap-10">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:text-gold ${
                  isActive(item.href) ? "text-gold" : "text-neutral-400"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/booking" className="hidden sm:block">
              <Button className="bg-gold hover:bg-gold-dark text-white rounded-none px-6 py-2 text-[10px] font-black uppercase tracking-widest border-b-2 border-gold-dark flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                Book Now
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden text-gold hover:bg-white/5"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden bg-neutral-900 border-b border-neutral-800 animate-fade-in transition-all">
            <div className="flex flex-col p-8 gap-6 text-center">
              {navItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className={`text-[12px] font-black uppercase tracking-[0.3em] transition-all ${
                    isActive(item.href) ? "text-gold" : "text-neutral-300"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-6 border-t border-neutral-800 mt-2">
                 <Link 
                  href="tel:+12063274411" 
                  className="inline-flex items-center gap-3 text-gold text-[10px] font-black uppercase tracking-[0.3em]"
                >
                  <Phone className="h-4 w-4" />
                  (206) 327-4411
                </Link>
                <Link 
                  href="mailto:info@lunalimoz.com" 
                  className="flex items-center justify-center gap-3 text-gold text-[10px] font-black uppercase tracking-[0.3em] mt-6 pt-6 border-t border-neutral-800"
                >
                  <Mail className="h-4 w-4" />
                  info@lunalimoz.com
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
