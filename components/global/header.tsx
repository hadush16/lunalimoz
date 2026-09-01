"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Phone, Menu, X, Calendar, Mail, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Fleet", href: "/fleet" },
    { name: "Services", href: "/services" },
    { name: "About", href: "/about" },
    { name: "Track Ride", href: "/track-booking" },
    { name: "Contact", href: "/contact" },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Top Micro Utility Bar (Desktop only, collapses on scroll) */}
      <div className={cn(
        "bg-secondary/70 py-1.5 hidden md:block border-b border-border transition-all duration-300",
        isScrolled ? "h-0 py-0 opacity-0 overflow-hidden border-none" : "opacity-100"
      )}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-[10px] font-black tracking-[0.2em] uppercase text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-foreground/90">24/7 Seattle Chauffeur & Airport Dispatch</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="tel:+12063274411" className="flex items-center gap-1.5 hover:text-gold transition-colors text-foreground/80">
              <Phone className="h-3 w-3 text-gold" />
              (206) 327-4411
            </Link>
            <div className="h-3 w-[1px] bg-border" />
            <Link href="mailto:info@lunalimoz.com" className="flex items-center gap-1.5 hover:text-gold transition-colors text-foreground/80">
              <Mail className="h-3 w-3 text-gold" />
              info@lunalimoz.com
            </Link>
          </div>
        </div>
      </div>

      {/* Main Luxury Header */}
      <header className={cn(
        "sticky top-0 z-50 transition-all duration-300 border-b border-border",
        isScrolled
          ? "bg-background/90 backdrop-blur-xl shadow-md py-2.5"
          : "bg-background/95 backdrop-blur-md py-3.5"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          
          {/* Circular Badge Logo & Brand Name */}
          <Link href="/" className="group flex items-center gap-3 focus:outline-none">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-gold/40 bg-surface flex items-center justify-center shadow-md shrink-0 group-hover:border-gold transition-all duration-300">
              <Image 
                src="/luna-logo.png" 
                alt="Luna Limo Logo" 
                width={40}
                height={40}
                priority
                className="w-full h-full object-cover p-0.5 transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-base sm:text-lg font-black italic uppercase tracking-wider text-foreground leading-tight">
                LUNA <span className="text-gold">LIMO</span>
              </span>
              <span className="text-[7.5px] font-black uppercase tracking-[0.25em] text-muted-foreground">
                Seattle Luxury
              </span>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-7">
            {navItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href} 
                className={cn(
                  "text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:text-gold py-1 relative",
                  isActive(item.href) 
                    ? "text-gold font-bold" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.name}
                {isActive(item.href) && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold rounded-full shadow-[0_0_8px_var(--gold)]" />
                )}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            <Link href="/booking" className="hidden sm:block">
              <Button className="bg-gold hover:bg-gold-dark text-primary-foreground rounded-none px-5 py-2.5 text-[10px] font-black uppercase tracking-widest border-b-2 border-gold-dark flex items-center gap-2 shadow-md hover:shadow-gold/20 hover:shadow-lg transition-all active:scale-95">
                <Calendar className="h-3.5 w-3.5" />
                Book Ride
              </Button>
            </Link>

            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden text-foreground hover:bg-secondary"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMenuOpen && (
          <div className="lg:hidden bg-card/98 backdrop-blur-2xl border-b border-border animate-fade-in transition-all">
            <div className="flex flex-col p-6 gap-4 text-center">
              {navItems.map((item) => (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className={cn(
                    "text-xs font-black uppercase tracking-[0.25em] transition-all py-2 border-b border-border/50",
                    isActive(item.href) 
                      ? "text-gold font-bold" 
                      : "text-foreground hover:text-gold"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="pt-3 flex flex-col gap-4 items-center">
                <div className="flex items-center justify-between w-full px-4 py-2 bg-secondary rounded-none border border-border">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Theme</span>
                  <ThemeToggle />
                </div>

                <Link 
                  href="/booking" 
                  className="w-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Button className="w-full bg-gold hover:bg-gold-dark text-primary-foreground rounded-none py-6 text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg">
                    <Calendar className="h-4 w-4" />
                    Reserve Now
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>

                <div className="flex flex-col gap-2 pt-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  <Link href="tel:+12063274411" className="inline-flex items-center justify-center gap-2 text-gold font-bold">
                    <Phone className="h-3.5 w-3.5" />
                    (206) 327-4411
                  </Link>
                  <Link href="mailto:info@lunalimoz.com" className="inline-flex items-center justify-center gap-2 text-muted-foreground hover:text-gold">
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
