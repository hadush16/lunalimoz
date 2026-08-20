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

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { signOut } = useAuthActions();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // If we are on the login page, don't show the dashboard shell
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleSignOut = async () => {
    await signOut();
    router.push("/admin/login");
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
    <div className="h-screen overflow-hidden bg-black text-white font-sans flex flex-col md:flex-row relative">
      
      {/* Mobile Header */}
      <header className="md:hidden bg-neutral-900 border-b border-neutral-800 p-4 flex items-center justify-between z-40">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-gold" />
          <h2 className="font-serif text-sm font-black italic uppercase text-white tracking-widest">Admin</h2>
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell align="right" />
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setIsSidebarOpen(true)}
            className="text-gold"
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
        fixed inset-y-0 left-0 w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col z-[60] transition-transform duration-300 md:relative md:translate-x-0
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        
        {/* Brand */}
        <div className="p-8 border-b border-neutral-800 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <ShieldCheck className="h-6 w-6 text-gold" />
              <div>
                <h2 className="font-serif text-lg font-black italic uppercase text-white tracking-wider">Admin</h2>
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-500">Luna Limo</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={closeSidebar}
              className="md:hidden text-neutral-500 hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
        </div>

        {/* Links */}
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            
            return (
              <Link 
                key={link.href} 
                href={link.href}
                onClick={closeSidebar}
                className={`flex items-center gap-4 px-4 py-4 transition-all border-l-2 ${
                  isActive 
                    ? "bg-black border-gold text-white shadow-[inset_4px_0_0_0_theme(colors.gold)]" 
                    : "border-transparent text-neutral-400 hover:bg-neutral-800/50 hover:text-white"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-gold" : "text-neutral-500"}`} />
                <span className="text-[10px] uppercase font-black tracking-[0.2em]">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer / Actions */}
        <div className="p-6 border-t border-neutral-800">
           <Button 
            onClick={handleSignOut}
            variant="ghost" 
            className="w-full justify-start rounded-none px-4 py-6 text-neutral-400 hover:text-white hover:bg-neutral-800"
           >
              <LogOut className="h-4 w-4 mr-4 text-neutral-500" />
              <span className="text-[10px] uppercase font-black tracking-[0.2em]">End Session</span>
           </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Professional Top Header Bar */}
        <AdminHeader />
        
        {/* Page Content */}
        <main className="flex-1 bg-black overflow-y-auto relative">
          <RouteProgressBar />
          <div className="absolute top-0 left-0 w-1 h-full bg-neutral-900/50 hidden md:block" />
          {children}
          <PushAlertManager />
        </main>
      </div>
    </div>
  );
}
