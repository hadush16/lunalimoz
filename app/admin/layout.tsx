"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Car, CalendarDays, LogOut, ShieldCheck, Menu, X, Star, Users, Settings, BarChart3, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PushAlertManager } from "@/components/global/push-alert-manager";
import { useState } from "react";
import AdminHeader, { NotificationBell } from "@/components/admin/admin-header";
import { RouteProgressBar } from "@/components/admin/route-progress-bar";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { signOut } = useAuthActions();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleSignOut = async () => {
    document.cookie = "lunalimoz_admin_session=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      // ignore
    }
    try {
      await signOut();
    } catch {
      // ignore
    }
    window.location.href = "/admin/login";
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  const navLinks = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/bookings", label: "Reservations", icon: CalendarDays },
    { href: "/admin/customers", label: "Client Roster", icon: Users },
    { href: "/admin/users", label: "User Management", icon: ShieldCheck },
    { href: "/admin/reports", label: "Revenue Reports", icon: BarChart3 },
    { href: "/admin/vehicles", label: "Our Fleet", icon: Car },
    { href: "/admin/reviews", label: "Client Feedback", icon: Star },
    { href: "/admin/contact", label: "Contact Inquiries", icon: Mail },
    { href: "/admin/settings", label: "System Config", icon: Settings },
  ];

  return (
    <div className="h-screen overflow-hidden bg-slate-50 dark:bg-black text-slate-900 dark:text-white font-sans flex flex-col md:flex-row relative transition-colors duration-200">
      
      {/* Mobile Header */}
      <header className="md:hidden bg-slate-100 dark:bg-neutral-900 border-b border-slate-200 dark:border-neutral-800 p-4 flex items-center justify-between z-40">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-gold" />
          <h2 className="font-serif text-sm font-black italic uppercase text-slate-900 dark:text-white tracking-widest">Admin</h2>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <NotificationBell align="right" />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSidebarOpen(true)}
            className="text-amber-600 dark:text-gold"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-slate-100 dark:bg-neutral-900 border-r border-slate-200 dark:border-neutral-800 flex flex-col z-[60] transition-transform duration-300 md:relative md:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-200 dark:border-neutral-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-6 w-6 text-amber-600 dark:text-gold" />
              <div>
                <h2 className="font-serif text-lg font-black italic uppercase text-slate-900 dark:text-white tracking-wider">Admin Portal</h2>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-neutral-500">Luna Limo</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={closeSidebar}
              className="md:hidden text-slate-500 dark:text-neutral-500 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
        </div>

        {/* Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            
            return (
              <Link 
                key={link.href} 
                href={link.href}
                onClick={closeSidebar}
                className={`flex items-center gap-3.5 px-4 py-3.5 transition-all border-l-2 ${
                  isActive 
                    ? "bg-white dark:bg-black border-amber-500 dark:border-gold text-slate-900 dark:text-white font-bold shadow-sm" 
                    : "border-transparent text-slate-600 dark:text-neutral-400 hover:bg-slate-200/60 dark:hover:bg-neutral-800/50 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-amber-600 dark:text-gold" : "text-slate-400 dark:text-neutral-500"}`} />
                <span className="text-[10px] uppercase font-black tracking-[0.2em]">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer / Theme Toggle & Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-neutral-800 space-y-2">
           <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-black border border-slate-200 dark:border-neutral-800">
             <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-neutral-400">Theme</span>
             <ThemeToggle />
           </div>

           <Button 
            onClick={handleSignOut}
            variant="ghost" 
            className="w-full justify-start rounded-none px-4 py-3.5 text-slate-600 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-neutral-800"
           >
              <LogOut className="h-4 w-4 mr-3 text-slate-400 dark:text-neutral-500" />
              <span className="text-[10px] uppercase font-black tracking-[0.2em]">End Session</span>
           </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader />
        
        <main className="flex-1 bg-slate-50 dark:bg-black overflow-y-auto relative transition-colors">
          <RouteProgressBar />
          <div className="absolute top-0 left-0 w-1 h-full bg-slate-200 dark:bg-neutral-900/50 hidden md:block" />
          {children}
          <PushAlertManager />
        </main>
      </div>
    </div>
  );
}
