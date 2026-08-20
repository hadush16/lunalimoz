"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Bell, Check, CheckCheck, CalendarDays, AlertTriangle, Info, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// ─── Shared Notification Bell (used in both desktop header & mobile header) ───
export function NotificationBell({ align = "right" }: { align?: "right" | "left" }) {
  const pathname = usePathname();
  const unreadCount = useQuery(api.notifications.unreadCount) ?? 0;
  const notifications = useQuery(api.notifications.list, { limit: 15 });
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Close popup on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const getNotifIcon = (type: string) => {
    switch (type) {
      case "new_booking":
        return <CalendarDays className="h-4 w-4 text-emerald-400" />;
      case "cancellation":
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case "status_update":
        return <Check className="h-4 w-4 text-blue-400" />;
      default:
        return <Info className="h-4 w-4 text-gold" />;
    }
  };

  const getTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const handleNotifClick = async (id: string, isRead: boolean) => {
    if (!isRead) {
      await markAsRead({ id: id as any });
    }
  };

  return (
    <div className="relative" ref={popupRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-none border border-neutral-800 bg-black hover:border-gold/40 transition-all duration-300 group"
        aria-label="Notifications"
      >
        <Bell className={`h-4 w-4 transition-colors ${isOpen ? "text-gold" : "text-neutral-400 group-hover:text-gold"}`} />
        
        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center bg-gold text-black text-[9px] font-black rounded-full animate-in zoom-in duration-300">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Popup */}
      {isOpen && (
        <div className={`absolute ${align === "right" ? "right-0" : "left-0"} top-full mt-2 w-[min(380px,calc(100vw-2rem))] bg-neutral-900 border border-neutral-800 shadow-2xl shadow-black/50 z-50 animate-in slide-in-from-top-2 fade-in duration-200`}>
          {/* Popup Header */}
          <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-neutral-800">
            <div className="flex items-center gap-3">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-gold/10 text-gold text-[9px] font-black px-2 py-0.5 border border-gold/20">
                  {unreadCount} NEW
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead({})}
                  className="text-[9px] font-black uppercase tracking-widest text-neutral-500 hover:text-gold transition-colors flex items-center gap-1.5"
                >
                  <CheckCheck className="h-3 w-3" />
                  <span className="hidden sm:inline">Read All</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-neutral-500 hover:text-white transition-colors ml-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="max-h-[60vh] sm:max-h-[400px] overflow-y-auto overscroll-contain">
            {!notifications || notifications.length === 0 ? (
              <div className="py-16 text-center">
                <Bell className="h-8 w-8 text-neutral-700 mx-auto mb-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600">
                  No notifications yet
                </p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  onClick={() => handleNotifClick(notif._id, notif.isRead)}
                  className="relative"
                >
                  {notif.link ? (
                    <Link href={notif.link} className="block" onClick={() => setIsOpen(false)}>
                      <NotifItem notif={notif} getNotifIcon={getNotifIcon} getTimeAgo={getTimeAgo} />
                    </Link>
                  ) : (
                    <NotifItem notif={notif} getNotifIcon={getNotifIcon} getTimeAgo={getTimeAgo} />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Popup Footer */}
          {notifications && notifications.length > 0 && (
            <div className="border-t border-neutral-800 px-5 py-3">
              <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-600 text-center">
                Showing latest {notifications.length} notifications
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Desktop Admin Header Bar ─────────────────────────────────────────────────
export default function AdminHeader() {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === "/admin") return "Dashboard";
    if (pathname === "/admin/bookings") return "Reservations";
    if (pathname === "/admin/customers") return "Client Roster";
    if (pathname === "/admin/vehicles") return "Fleet Config";
    if (pathname === "/admin/reviews") return "Feedback";
    if (pathname === "/admin/contact") return "Contact Inquiries";
    if (pathname === "/admin/settings") return "Settings";
    return "Admin";
  };

  return (
    <div className="hidden md:flex items-center justify-between px-8 py-4 border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-sm sticky top-0 z-30">
      {/* Left: Page Title */}
      <div className="flex items-center gap-4">
        <h1 className="text-[11px] font-black uppercase tracking-[0.3em] text-neutral-400">
          {getPageTitle()}
        </h1>
      </div>

      {/* Right: Notification Bell */}
      <NotificationBell align="right" />
    </div>
  );
}

// ─── Notification Item ────────────────────────────────────────────────────────
function NotifItem({
  notif,
  getNotifIcon,
  getTimeAgo,
}: {
  notif: {
    _id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: number;
  };
  getNotifIcon: (type: string) => React.ReactNode;
  getTimeAgo: (timestamp: number) => string;
}) {
  return (
    <div
      className={`flex items-start gap-3 sm:gap-3.5 px-4 sm:px-5 py-3.5 sm:py-4 border-b border-neutral-800/50 transition-all cursor-pointer hover:bg-neutral-800/30 ${
        !notif.isRead ? "bg-gold/[0.03]" : ""
      }`}
    >
      {/* Unread dot */}
      <div className="mt-1 flex-shrink-0">
        {!notif.isRead ? (
          <div className="w-2 h-2 rounded-full bg-gold shadow-[0_0_6px_theme(colors.gold)]" />
        ) : (
          <div className="w-2 h-2 rounded-full bg-neutral-800" />
        )}
      </div>

      {/* Icon */}
      <div className="mt-0.5 flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-neutral-800/50 border border-neutral-700/50">
        {getNotifIcon(notif.type)}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-bold truncate ${!notif.isRead ? "text-white" : "text-neutral-400"}`}>
          {notif.title}
        </p>
        <p className="text-[10px] text-neutral-500 mt-0.5 line-clamp-2 leading-relaxed">
          {notif.message}
        </p>
        <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-600 mt-1.5">
          {getTimeAgo(notif.createdAt)}
        </p>
      </div>
    </div>
  );
}
