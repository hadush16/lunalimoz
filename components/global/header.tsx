"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Phone, Menu, X, Calendar, Mail } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

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
      {/* Top Utility Bar */}
      <div className="bg-slate-100 dark:bg-neutral-900 py-2 hidden md:block border-b border-slate-200 dark:border-neutral-800 transition-colors">
        <div className="max-w-7xl mx-auto px-6 flex justify-end items-center gap-6 text-[10px] font-black tracking-[0.2em] uppercase text-slate-600 dark:text-neutral-400">
          <Link href="tel:+12063274411" className="flex items-center gap-2 hover:text-amber-600 dark:hover:text-gold transition-colors">
            <Phone className="h-3 w-3 text-amber-600 dark:text-gold" />
            (206) 327-4411
          </Link>
          <div className="h-3 w-[1px] bg-slate-300 dark:bg-neutral-800" />
          <Link href="mailto:info@lunalimoz.com" className="flex items-center gap-2 hover:text-amber-600 dark:hover:text-gold transition-colors">
            <Mail className="h-3 w-3 text-amber-600 dark:text-gold" />
            info@lunalimoz.com
          </Link>
          <div className="h-3 w-[1px] bg-slate-300 dark:bg-neutral-800" />
          <p>24/7 Executive Service</p>
        </div>
      </div>

      {/* Main Responsive Header */}
      <header className="bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-slate-200 dark:border-neutral-800 sticky top-0 z-50 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          
          {/* Circular Badge Logo & Brand Name */}
          <Link href="/" className="group flex items-center gap-3">
            <div className="w-11 h-11 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-amber-500/40 bg-neutral-900 flex items-center justify-center shadow-md shrink-0 group-hover:border-gold transition-all duration-300">
              <Image 
                src="/luna-logo.png" 
                alt="Luna Limo Logo" 
                width={48}
                height={48}
                priority
                className="w-full h-full object-cover p-1 transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg md:text-xl font-black italic uppercase tracking-wider text-slate-900 dark:text-white leading-tight">
                LUNA <span className="text-amber-600 dark:text-gold">LIMO</span>
              </span>
              <span className="text-[8px] font-black uppercase tracking-[0.25em] text-neutral-500 dark:text-neutral-400">
                Executive Chauffeur
              </span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href} 
                className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:text-amber-600 dark:hover:text-gold ${
                  isActive(item.href) ? "text-amber-600 dark:text-gold font-bold" : "text-slate-600 dark:text-neutral-300"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            <Link href="/booking" className="hidden sm:block">
              <Button className="bg-gold hover:bg-gold-dark text-white rounded-none px-5 py-2.5 text-[10px] font-black uppercase tracking-widest border-b-2 border-gold-dark flex items-center gap-2 shadow-md hover:shadow-lg transition-all">
                <Calendar className="h-3.5 w-3.5" />
                Book Now
              </Button>
            </Link>

            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden text-amber-600 dark:text-gold hover:bg-slate-100 dark:hover:bg-neutral-800"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMenuOpen && (
          <div className="lg:hidden bg-slate-50 dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800 animate-fade-in transition-all">
            <div className="flex flex-col p-6 gap-5 text-center">
              {navItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className={`text-[11px] font-black uppercase tracking-[0.25em] transition-all py-1 ${
                    isActive(item.href) ? "text-amber-600 dark:text-gold" : "text-slate-700 dark:text-neutral-300"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="pt-4 border-t border-slate-200 dark:border-neutral-800 flex flex-col gap-4 items-center">
                <div className="flex items-center justify-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">Appearance Mode</span>
                  <ThemeToggle />
                </div>

                <Link 
                  href="/booking" 
                  className="w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button className="w-full bg-gold hover:bg-gold-dark text-white rounded-none py-3 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Book Now
                  </Button>
                </Link>

                <div className="flex flex-col gap-2 pt-2 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-neutral-400">
                  <Link href="tel:+12063274411" className="inline-flex items-center justify-center gap-2 text-amber-600 dark:text-gold">
                    <Phone className="h-3.5 w-3.5" />
                    (206) 327-4411
                  </Link>
                  <Link href="mailto:info@lunalimoz.com" className="inline-flex items-center justify-center gap-2 text-amber-600 dark:text-gold">
                    <Mail className="h-3.5 w-3.5" />
                    info@lunalimoz.com
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
