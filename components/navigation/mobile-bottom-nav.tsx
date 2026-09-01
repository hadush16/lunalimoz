"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Car, Briefcase, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileBottomNav() {
  const pathname = usePathname();

  // Do not show on admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Fleet", href: "/fleet", icon: Car },
    { name: "Book", href: "/booking", icon: Calendar, highlight: true },
    { name: "Services", href: "/services", icon: Briefcase },
    { name: "Track", href: "/track-booking", icon: Search },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/90 backdrop-blur-2xl border-t border-border shadow-[0_-4px_25px_rgba(0,0,0,0.06)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.7)] transition-colors duration-200 pb-[env(safe-area-inset-bottom,0px)]">
      <nav aria-label="Mobile Navigation" className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
          const Icon = item.icon;

          if (item.highlight) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative -top-3.5 flex flex-col items-center group focus:outline-none"
              >
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 group-active:scale-90 border-2",
                  isActive
                    ? "bg-gold text-primary-foreground border-gold-light shadow-gold/40 ring-4 ring-gold/20"
                    : "bg-gold hover:bg-gold-dark text-primary-foreground border-white/20 shadow-gold/20"
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className={cn(
                  "text-[8.5px] font-black uppercase tracking-widest mt-0.5",
                  isActive ? "text-gold" : "text-muted-foreground"
                )}>
                  {item.name}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center h-full py-1 text-center group transition-all duration-200 focus:outline-none active:scale-95",
                isActive
                  ? "text-gold font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon className={cn("h-5 w-5 transition-transform duration-200 group-active:scale-90", isActive ? "stroke-[2.5]" : "stroke-2")} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_6px_var(--gold)]" />
                )}
              </div>
              <span className="text-[8.5px] font-bold uppercase tracking-wider mt-1">
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
