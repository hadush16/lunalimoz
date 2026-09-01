"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function FloatingBookCTA() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      // Reveal floating CTA once user has scrolled past hero (> 300px)
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Do not show on booking, success, or admin pages
  if (pathname === "/booking" || pathname?.startsWith("/booking/") || pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <aside aria-label="Quick Booking Action" className={cn(
      "fixed z-40 transition-all duration-500 ease-out pointer-events-none",
      "bottom-20 lg:bottom-8 left-4 sm:left-6 lg:left-8",
      isVisible ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-6 pointer-events-none"
    )}>
      <Link
        href="/booking"
        className="group flex items-center gap-2.5 bg-card/90 backdrop-blur-xl border border-gold/40 hover:border-gold px-4 py-2.5 sm:px-5 sm:py-3 shadow-[0_8px_30px_rgb(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.6)] transition-all duration-300 active:scale-95"
      >
        <div className="w-7 h-7 rounded-full bg-gold flex items-center justify-center text-primary-foreground shadow-sm shrink-0 group-hover:scale-110 transition-transform">
          <Calendar className="h-3.5 w-3.5" />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-foreground leading-tight">
            Book a Ride
          </span>
          <span className="text-[7.5px] font-bold uppercase tracking-widest text-gold">
            Instant Quote
          </span>
        </div>
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-gold group-hover:translate-x-1 transition-all ml-1" />
      </Link>
    </aside>
  );
}
